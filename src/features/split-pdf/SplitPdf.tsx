import React, { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import * as pdfjsLib from "pdfjs-dist";
import {
  Upload,
  FileText,
  SlidersHorizontal,
  LayoutGrid,
  FileBox,
  Info,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// ─── Single page canvas thumbnail ────────────────────────────────────────────
function PageThumb({
  pdfRef,
  pageNum,
}: {
  pdfRef: pdfjsLib.PDFDocumentProxy;
  pageNum: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const page = await pdfRef.getPage(pageNum);
        // Fixed width: render to 80px wide
        const baseVp = page.getViewport({ scale: 1 });
        const scale = 80 / baseVp.width;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        const ctx = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      } catch (_) {}
    })();
    return () => { cancelled = true; };
  }, [pdfRef, pageNum]);

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="bg-white rounded-sm shadow overflow-hidden border border-slate-200" style={{ width: 80 }}>
        <canvas ref={canvasRef} style={{ display: "block", width: 80 }} />
      </div>
      <span className="text-[10px] text-[var(--text-muted)]">{pageNum}</span>
    </div>
  );
}

// ─── Range preview box (iLovePDF style) ──────────────────────────────────────
function RangeBox({
  pdfRef,
  label,
  pageNums,
}: {
  pdfRef: pdfjsLib.PDFDocumentProxy;
  label: string;
  pageNums: number[];
}) {
  const showPages = pageNums.slice(0, 2);
  const hasMore = pageNums.length > 2;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="text-xs text-[var(--text-secondary)] font-medium">{label}</p>
      <div className="border border-dashed border-slate-600 rounded-lg p-2.5 bg-[var(--bg-surface-60)] flex items-end justify-center gap-2 w-full">
        {showPages.map((n) => (
          <PageThumb key={n} pdfRef={pdfRef} pageNum={n} />
        ))}
      </div>
        {hasMore && (
          <div className="flex flex-col items-center justify-center self-center pb-4 gap-0.5">
            <span className="text-[9px] text-[var(--text-muted)] whitespace-nowrap">{pageNums.length} pages</span>
          </div>
        )}
    </div>
  );
}

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [activeTab, setActiveTab] = useState<"range" | "pages" | "size">(
    "range",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState<string>("");
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [_selectedPages, _setSelectedPages] = useState<Set<number>>(new Set());
  // --- Range Tab State ---
  const [rangeMode, setRangeMode] = useState<"custom" | "fixed">("custom");
  const [ranges, setRanges] = useState<Array<{ from: number; to: number }>>([
    { from: 1, to: 1 },
  ]);
  const [mergeRanges, setMergeRanges] = useState<boolean>(false);
  const [fixedSize, setFixedSize] = useState<number>(1);

  // --- Pages Tab State ---
  const [extractMode, setExtractMode] = useState<"all" | "select">("select");
  const [pagesInput, setPagesInput] = useState<string>("");
  const [mergeExtractedPages, setMergeExtractedPages] =
    useState<boolean>(false);

  // --- Size Tab State ---
  const [maxSize, setMaxSize] = useState<number>(1);
  const [sizeUnit, setSizeUnit] = useState<"KB" | "MB">("MB");
  const [allowCompression, setAllowCompression] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (selectedFile: File | null) => {
    if (!selectedFile) return;
    setRanges([{ from: 1, to: 1 }]);
    setMergeRanges(false);
    setFixedSize(1);

    setExtractMode("select");
    setPagesInput("");
    setMergeExtractedPages(false);

    setMaxSize(1);
    setSizeUnit("MB");
    setAllowCompression(true);

    setActiveTab("range");
    _setSelectedPages(new Set());
    if (selectedFile.type !== "application/pdf") {      setError("Please select a valid PDF file.");
      return;
    }

    setError(null);
    setLoading(false);
    setResultBlob(null);
    setResultName("");
    setResultMessage(null);
    setPdfDoc(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      // pdf-lib for page count
      const pdf = await PDFDocument.load(new Uint8Array(arrayBuffer));
      const count = pdf.getPageCount();
      setFile(selectedFile);
      setTotalPages(count);

      // pdfjs for thumbnails
      const pdfjs = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      setPdfDoc(pdfjs);
    } catch (err) {
      console.error(err);
      setError("Failed to read PDF file.");
      setFile(null);
      setTotalPages(0);
      setPdfDoc(null);
    }
  };

  // Meta info display helpers
  const originalSize = file ? (file.size / (1024 * 1024)).toFixed(2) : "0.00";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const parseRanges = (input: string, max: number) => {
    const parts = input
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const selected = new Set<number>();

    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map((value) => value.trim());
        const from = parseInt(start, 10);
        const to = parseInt(end, 10);
        if (Number.isNaN(from) || Number.isNaN(to)) continue;
        const lower = Math.max(1, Math.min(from, to));
        const upper = Math.min(max, Math.max(from, to));
        for (let page = lower; page <= upper; page += 1) {
          selected.add(page);
        }
      } else {
        const page = parseInt(part, 10);
        if (!Number.isNaN(page) && page >= 1 && page <= max) {
          selected.add(page);
        }
      }
    }

    return Array.from(selected).sort((a, b) => a - b);
  };

  const normalizeRanges = (
    input: Array<{ from: number; to: number }>,
    max: number,
  ) => {
    const normalized = input
      .map((range) => {
        const from = Math.max(1, Math.min(range.from, range.to));
        const to = Math.min(max, Math.max(range.from, range.to));
        return { from, to };
      })
      .filter(
        (range) => range.from <= range.to && range.from <= max && range.to >= 1,
      );

    return normalized.map((range) => ({
      from: Math.max(1, range.from),
      to: Math.min(max, range.to),
    }));
  };

  const createPdfBlob = async (
    srcPdf: PDFDocument,
    pageIndices: number[],
    useCompression: boolean,
  ) => {
    const newPdf = await PDFDocument.create();
    const copied = await newPdf.copyPages(srcPdf, pageIndices);
    copied.forEach((page) => newPdf.addPage(page));
    const saved = await newPdf.save({ useObjectStreams: useCompression });
    const buffer = saved.buffer.slice(
      saved.byteOffset,
      saved.byteOffset + saved.byteLength,
    ) as ArrayBuffer;
    return new Blob([buffer], { type: "application/pdf" });
  };

  const zipFiles = async (files: Array<{ name: string; blob: Blob }>) => {
    const zip = new JSZip();
    files.forEach((fileEntry) => zip.file(fileEntry.name, fileEntry.blob));
    return zip.generateAsync({ type: "blob" });
  };

  const resetAll = () => {
    setFile(null);
    setTotalPages(0);
    setPdfDoc(null);
    _setSelectedPages(new Set());

    setError(null);
    setLoading(false);

    setResultBlob(null);
    setResultName("");
    setResultMessage(null);

    // Range
    setRangeMode("custom");
    setRanges([{ from: 1, to: 1 }]);
    setMergeRanges(false);
    setFixedSize(1);

    // Pages
    setExtractMode("select");
    setPagesInput("");
    setMergeExtractedPages(false);

    // Size
    setMaxSize(1);
    setSizeUnit("MB");
    setAllowCompression(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadResult = () => {
    if (!resultBlob || !resultName || !file) return;

    saveAs(resultBlob, resultName);

    setTimeout(() => {
      resetAll();
    }, 500);
  };

  const handleSplit = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResultBlob(null);
    setResultName("");
    setResultMessage(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const fileBytes = new Uint8Array(arrayBuffer);
      const srcPdf = await PDFDocument.load(fileBytes);
      const pageCount = srcPdf.getPageCount();
      const baseName = file.name.replace(/\.pdf$/i, "");
      let files: Array<{ name: string; blob: Blob }> = [];

      if (activeTab === "range") {
        if (rangeMode === "custom") {
          const normalized = normalizeRanges(ranges, pageCount);

          if (normalized.length === 0) {
            throw new Error("Please add at least one valid range.");
          }

          if (mergeRanges) {
            const indices = normalized.flatMap((range) =>
              Array.from(
                { length: range.to - range.from + 1 },
                (_, index) => range.from + index - 1,
              ),
            );

            const blob = await createPdfBlob(srcPdf, indices, true);

            files = [
              {
                name: `${baseName}_ranges.pdf`,
                blob,
              },
            ];

            setResultMessage(
              `Created 1 merged PDF from ${normalized.length} range(s).`,
            );
          } else {
            files = await Promise.all(
              normalized.map(async (range, index) => {
                const indices = Array.from(
                  { length: range.to - range.from + 1 },
                  (_, idx) => range.from + idx - 1,
                );

                const blob = await createPdfBlob(srcPdf, indices, true);

                return {
                  name: `${baseName}_range_${index + 1}_${range.from}-${range.to}.pdf`,
                  blob,
                };
              }),
            );

            setResultMessage(
              `Created ${files.length} PDF file(s) from the selected range(s).`,
            );
          }
        } else if (rangeMode === "fixed") {
          if (fixedSize < 1) {
            throw new Error("Pages per file must be at least 1.");
          }

          const chunks = Math.ceil(pageCount / fixedSize);

          files = await Promise.all(
            Array.from({ length: chunks }, (_, chunkIndex) => {
              const startPage = chunkIndex * fixedSize + 1;

              const endPage = Math.min(pageCount, startPage + fixedSize - 1);

              const indices = Array.from(
                { length: endPage - startPage + 1 },
                (_, idx) => startPage + idx - 1,
              );

              return createPdfBlob(srcPdf, indices, true).then((blob) => ({
                name: `${baseName}_part_${chunkIndex + 1}_${startPage}-${endPage}.pdf`,
                blob,
              }));
            }),
          );

          setResultMessage(
            `Split into ${files.length} file(s) with ${fixedSize} page(s) each.`,
          );
        }
      } else if (activeTab === "pages") {
        const pageNumbers =
          extractMode === "all"
            ? Array.from({ length: pageCount }, (_, index) => index + 1)
            : parseRanges(pagesInput, pageCount);

        if (pageNumbers.length === 0) {
          throw new Error(
            extractMode === "all"
              ? "The PDF has no pages to extract."
              : "Please enter pages to extract (e.g. 1,5-8).",
          );
        }

        if (mergeExtractedPages) {
          const indices = pageNumbers.map((page) => page - 1);
          const blob = await createPdfBlob(srcPdf, indices, true);
          files = [{ name: `${baseName}_extracted.pdf`, blob }];
          setResultMessage(
            `Created 1 PDF containing ${pageNumbers.length} page(s).`,
          );
        } else {
          files = await Promise.all(
            pageNumbers.map(async (page) => {
              const blob = await createPdfBlob(srcPdf, [page - 1], true);
              return { name: `${baseName}_page_${page}.pdf`, blob };
            }),
          );
          setResultMessage(`Created ${files.length} separate PDF file(s).`);
        }
      } else if (activeTab === "size") {
        const maxBytes =
          sizeUnit === "MB" ? maxSize * 1024 * 1024 : maxSize * 1024;
        if (maxBytes <= 0)
          throw new Error("Maximum size must be greater than zero.");

        let currentPage = 0;
        const chunks: Array<{ name: string; blob: Blob }> = [];

        while (currentPage < pageCount) {
          let lastAcceptedBlob: Blob | null = null;
          let lastAcceptedPage = currentPage;
          let pageIndex = currentPage;

          while (pageIndex < pageCount) {
            const indices = Array.from(
              { length: pageIndex - currentPage + 1 },
              (_, idx) => currentPage + idx,
            );
            const blob = await createPdfBlob(srcPdf, indices, allowCompression);
            if (blob.size <= maxBytes) {
              lastAcceptedBlob = blob;
              lastAcceptedPage = pageIndex;
              pageIndex += 1;
              if (pageIndex === pageCount) break;
              continue;
            }
            if (pageIndex === currentPage) {
              lastAcceptedBlob = blob;
              lastAcceptedPage = pageIndex;
            }
            break;
          }

          if (!lastAcceptedBlob) {
            throw new Error(
              "Could not create a chunk within the requested size limit.",
            );
          }

          chunks.push({
            name: `${baseName}_part_${chunks.length + 1}_${currentPage + 1}-${lastAcceptedPage + 1}.pdf`,
            blob: lastAcceptedBlob,
          });
          currentPage = lastAcceptedPage + 1;
        }

        files = chunks;
        setResultMessage(
          `Created ${files.length} file(s) below ${maxSize} ${sizeUnit}.`,
        );
      }

      if (files.length === 0) {
        throw new Error("No output files were generated.");
      }

      if (files.length === 1) {
        setResultBlob(files[0].blob);
        setResultName(files[0].name);
      } else {
        const zipBlob = await zipFiles(files);
        setResultBlob(zipBlob);
        setResultName(`${baseName}_split_files.zip`);
      }
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to split PDF.");
    } finally {
      setLoading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Range Helpers
  const addRange = () => {
    const lastRange = ranges[ranges.length - 1];
    const nextVal = lastRange ? lastRange.to + 1 : 1;
    setRanges([...ranges, { from: nextVal, to: nextVal }]);
  };

  const updateRange = (index: number, field: "from" | "to", value: number) => {
    setRanges(
      ranges.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  };

  const removeRange = (index: number) => {
    if (ranges.length > 1) {
      setRanges(ranges.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 mb-7">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
        <div className="p-3 rounded-xl border text-[#8B5CF6]"
        style={{ backgroundColor: "rgba(139, 92, 246, 0.10)", borderColor: "var(--border)" }}>
          <FileBox className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-heading)]">Split PDF</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Extract, range-split or shrink PDF files based on custom
            requirements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Upload Zone / Preview Area */}
        <div className="lg:col-span-7 space-y-6">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] hover:border-violet-500/50 hover:bg-[var(--bg-surface-60)] rounded-3xl p-16 text-center cursor-pointer transition min-h-[440px] group"
            >
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div className="p-5 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] text-[var(--text-secondary)] group-hover:text-violet-400 group-hover:scale-110 transition duration-300 shadow-xl">
                <Upload className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-heading)] mt-6">
                Drag and drop your PDF here
              </h3>
              <p className="text-[var(--text-secondary)] text-sm mt-2 max-w-xs">
                Or click to browse from your computer.
              </p>
            </div>
          ) : (
            <div className="bg-[var(--bg-surface-60)] border border-[var(--border)] rounded-3xl p-5 space-y-4 min-h-[440px] flex flex-col">
              {/* File header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-[var(--text-heading)] truncate max-w-[180px] sm:max-w-xs text-sm">
                      {file.name}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {originalSize} MB · {totalPages} pages
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetAll}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20 transition cursor-pointer shrink-0"
                >
                  Change
                </button>
              </div>

              {/* iLovePDF-style range preview grid */}
              <div className="flex-1 overflow-y-auto rounded-2xl bg-[var(--bg-base)]/60 border border-[var(--border)] p-4">
                {pdfDoc ? (
                  (() => {
                    // Build preview groups based on active tab
                    let groups: { label: string; pages: number[] }[] = [];

                    if (activeTab === "range" && rangeMode === "custom") {
                      const normalized = normalizeRanges(ranges, totalPages);
                      if (normalized.length === 0) {
                        groups = [{ label: "Range 1", pages: [1] }];
                      } else {
                        groups = normalized.map((r, i) => ({
                          label: `Range ${i + 1}`,
                          pages: Array.from({ length: r.to - r.from + 1 }, (_, idx) => r.from + idx),
                        }));
                      }
                    } else if (activeTab === "range" && rangeMode === "fixed") {
                      const size = Math.max(1, fixedSize);
                      const chunks = Math.ceil(totalPages / size);
                      groups = Array.from({ length: Math.min(chunks, 8) }, (_, ci) => {
                        const from = ci * size + 1;
                        const to = Math.min(totalPages, from + size - 1);
                        return {
                          label: `Part ${ci + 1}`,
                          pages: Array.from({ length: to - from + 1 }, (_, idx) => from + idx),
                        };
                      });
                    } else if (activeTab === "pages") {
                      const nums = extractMode === "all"
                        ? Array.from({ length: totalPages }, (_, i) => i + 1)
                        : parseRanges(pagesInput, totalPages);
                      if (mergeExtractedPages) {
                        groups = [{ label: "Extracted", pages: nums.length ? nums : [1] }];
                      } else {
                        groups = nums.slice(0, 8).map((n) => ({ label: `Page ${n}`, pages: [n] }));
                      }
                    } else if (activeTab === "size") {
                      // Show all pages as one group
                      groups = [{ label: "Document", pages: Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1) }];
                    }

                    return (
                      <div className="grid grid-cols-2 gap-3">
                        {groups.map((g, i) => (
                          <RangeBox
                            key={i}
                            pdfRef={pdfDoc}
                            label={g.label}
                            pageNums={g.pages}
                          />
                        ))}
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex items-center justify-center h-32 text-[var(--text-muted)] text-sm">
                    Loading preview...
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Split Panel Design */}
        <div className="lg:col-span-5">
          <div className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border)] p-6 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Header Title */}
            <h2 className="text-2xl font-bold text-[var(--text-heading)] text-center pb-1">
              Split
            </h2>

            {/* Top Navigation Tabs */}
            <div className="grid grid-cols-3 border border-[var(--border)] rounded-2xl bg-[var(--bg-base)]/60 p-1.5 gap-8">
              {/* TAB 1: Range */}
              <button
                type="button"
                onClick={() => setActiveTab("range")}
                className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl text-xs font-medium transition cursor-pointer relative ${
                  activeTab === "range"
                    ? "bg-[var(--bg-hover)] text-[var(--text-heading)] border border-[var(--border)] shadow-md"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-60)]"
                }`}
              >
                {activeTab === "range" && (
                  <span className="absolute top-1.5 left-1.5 bg-emerald-500 text-slate-950 rounded-full p-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
                <SlidersHorizontal className="w-5 h-5 mb-1 text-[var(--text-secondary)]" />
                Range
              </button>

              {/* TAB 2: Pages */}
              <button
                type="button"
                onClick={() => setActiveTab("pages")}
                className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl text-xs font-medium transition cursor-pointer relative ${
                  activeTab === "pages"
                    ? "bg-[var(--bg-hover)] text-[var(--text-heading)] border border-[var(--border)] shadow-md"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-60)]"
                }`}
              >
                {activeTab === "pages" && (
                  <span className="absolute top-1.5 left-1.5 bg-emerald-500 text-slate-950 rounded-full p-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
                <LayoutGrid className="w-5 h-5 mb-1 text-[var(--text-secondary)]" />
                Pages
              </button>

              {/* TAB 3: Size */}
              <button
                type="button"
                onClick={() => setActiveTab("size")}
                className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl text-xs font-medium transition cursor-pointer relative ${
                  activeTab === "size"
                    ? "bg-[var(--bg-hover)] text-[var(--text-heading)] border border-[var(--border)] shadow-md"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-60)]"
                }`}
              >
                {activeTab === "size" && (
                  <span className="absolute top-1.5 left-1.5 bg-emerald-500 text-slate-950 rounded-full p-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
                <FileBox className="w-5 h-5 mb-1 text-[var(--text-secondary)]" />
                Size
              </button>
            </div>

            {/* TAB 1 CONTENT: RANGE */}
            {activeTab === "range" && (
              <div className="space-y-6 pt-1">
                {/* Range Mode Switcher */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block">
                    Range mode:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRangeMode("custom")}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        rangeMode === "custom"
                          ? "border-red-500 text-red-400 bg-red-500/10"
                          : "border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      Custom
                    </button>
                    <button
                      type="button"
                      onClick={() => setRangeMode("fixed")}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        rangeMode === "fixed"
                          ? "border-red-500 text-red-400 bg-red-500/10"
                          : "border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      Fixed
                    </button>
                  </div>
                </div>

                {/* Range Dynamic Forms */}
                {rangeMode === "custom" && (
                  <div className="space-y-4">
                    {ranges.map((r, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
                          <span>Range {idx + 1}</span>
                          {ranges.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRange(idx)}
                              className="text-red-400 hover:text-red-300 text-[11px] cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* From input */}
                          <div className="flex items-center bg-[var(--bg-base)] border border-[var(--border)] rounded-xl overflow-hidden focus-within:border-violet-500">
                            <span className="px-3 text-xs text-[var(--text-secondary)] bg-[var(--bg-surface-60)] py-2.5 border-r border-[var(--border)] shrink-0">
                              from page
                            </span>
                            <input
                              type="number"
                              min={1}
                              value={r.from}
                              onChange={(e) =>
                                updateRange(idx, "from", Number(e.target.value))
                              }
                              className="w-full bg-transparent px-3 text-center text-[var(--text-heading)] text-sm outline-none font-medium"
                            />
                          </div>

                          {/* To input */}
                          <div className="flex items-center bg-[var(--bg-base)] border border-[var(--border)] rounded-xl overflow-hidden focus-within:border-violet-500">
                            <span className="px-3 text-xs text-[var(--text-secondary)] bg-[var(--bg-surface-60)] py-2.5 border-r border-[var(--border)] shrink-0">
                              to
                            </span>
                            <input
                              type="number"
                              min={1}
                              value={r.to}
                              onChange={(e) =>
                                updateRange(idx, "to", Number(e.target.value))
                              }
                              className="w-full bg-transparent px-3 text-center text-[var(--text-heading)] text-sm outline-none font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Range Button */}
                    <div className="pt-1 flex justify-center">
                      <button
                        type="button"
                        onClick={addRange}
                        className="px-5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 border border-red-500/40 hover:border-red-500/80 bg-red-500/5 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Range
                      </button>
                    </div>
                  </div>
                )}

                {rangeMode === "fixed" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--text-secondary)] block">
                        Pages per file:
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={fixedSize}
                        onChange={(e) => setFixedSize(Number(e.target.value))}
                        className="w-full bg-[var(--bg-base)] border border-[var(--border)] focus:border-violet-500 text-[var(--text-heading)] text-sm rounded-xl px-3.5 py-2.5 outline-none transition"
                      />
                      <p className="text-xs text-[var(--text-muted)]">
                        File chunks will contain this many pages each.
                      </p>
                    </div>
                  </div>
                )}
                {/* Merge Ranges Checkbox */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setMergeRanges(!mergeRanges)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer ${
                      mergeRanges
                        ? "bg-emerald-500 border-emerald-500 text-slate-950"
                        : "border-[var(--border-hover)] bg-[var(--bg-base)]"
                    }`}
                  >
                    {mergeRanges && (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                  </button>
                  <span
                    onClick={() => setMergeRanges(!mergeRanges)}
                    className="text-xs text-[var(--text-secondary)] cursor-pointer select-none"
                  >
                    Merge all ranges in one PDF file.
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2 CONTENT: PAGES */}
            {activeTab === "pages" && (
              <div className="space-y-6 pt-1">
                {/* Extract Mode Switcher */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block">
                    Extract mode:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setExtractMode("all")}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        extractMode === "all"
                          ? "border-red-500 text-red-400 bg-red-500/10"
                          : "border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      Extract all pages
                    </button>
                    <button
                      type="button"
                      onClick={() => setExtractMode("select")}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        extractMode === "select"
                          ? "border-red-500 text-red-400 bg-red-500/10"
                          : "border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      Select pages
                    </button>
                  </div>
                </div>

                {/* Pages to extract input */}
                {extractMode === "select" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block">
                      Pages to extract:
                    </label>
                    <input
                      type="text"
                      placeholder="example: 1,5-8"
                      value={pagesInput}
                      onChange={(e) => setPagesInput(e.target.value)}
                      className="w-full bg-[var(--bg-base)] border border-[var(--border)] focus:border-violet-500 text-[var(--text-heading)] text-sm rounded-xl px-3.5 py-2.5 outline-none transition placeholder:text-[var(--text-muted)]"
                    />
                  </div>
                )}

                {/* Checkbox */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setMergeExtractedPages(!mergeExtractedPages)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer ${
                      mergeExtractedPages
                        ? "bg-emerald-500 border-emerald-500 text-slate-950"
                        : "border-[var(--border-hover)] bg-[var(--bg-base)]"
                    }`}
                  >
                    {mergeExtractedPages && (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                  </button>
                  <span
                    onClick={() => setMergeExtractedPages(!mergeExtractedPages)}
                    className="text-xs text-[var(--text-secondary)] cursor-pointer select-none"
                  >
                    Merge extracted pages into one PDF file.
                  </span>
                </div>

                {/* Blue Info Box */}
                <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-2 flex items-start gap-3 text-sky-400 text-xs leading-relaxed">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    Selected pages will be converted into separate PDF files.{" "}
                    <span className="font-bold text-sky-300">0 PDF</span> will
                    be created.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3 CONTENT: SIZE */}
            {activeTab === "size" && (
              <div className="space-y-6 pt-1">
                {/* Meta info */}
                <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                  <p>
                    <span className="text-[var(--text-secondary)] font-medium">
                      Original file size:
                    </span>{" "}
                    {originalSize} MB
                  </p>
                  <p>
                    <span className="text-[var(--text-secondary)] font-medium">
                      Total pages:
                    </span>{" "}
                    {totalPages}
                  </p>
                </div>

                {/* Size Controls */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--text-primary)] block">
                    Maximum size per file:
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={maxSize}
                      onChange={(e) => setMaxSize(Number(e.target.value))}
                      className="w-28 bg-[var(--bg-base)] border border-[var(--border)] focus:border-violet-500 text-[var(--text-heading)] font-medium text-center rounded-xl px-3 py-2 outline-none transition text-sm"
                    />

                    {/* Unit Toggle */}
                    <div className="flex items-center bg-[var(--bg-base)] border border-[var(--border)] rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => setSizeUnit("KB")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          sizeUnit === "KB"
                            ? "bg-[var(--bg-hover)] text-[var(--text-heading)] shadow-sm"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        KB
                      </button>
                      <button
                        type="button"
                        onClick={() => setSizeUnit("MB")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          sizeUnit === "MB"
                            ? "bg-[var(--bg-hover)] text-[var(--text-heading)] shadow-sm"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        MB
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-2 flex items-start gap-3 text-sky-400 text-xs leading-relaxed">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    This PDF will be split into files no larger than {maxSize}{" "}
                    {sizeUnit} each.
                  </p>
                </div>

                {/* Checkbox */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setAllowCompression(!allowCompression)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer ${
                      allowCompression
                        ? "bg-emerald-500 border-emerald-500 text-slate-950"
                        : "border-[var(--border-hover)] bg-[var(--bg-base)]"
                    }`}
                  >
                    {allowCompression && (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                  </button>
                  <span
                    onClick={() => setAllowCompression(!allowCompression)}
                    className="text-xs text-[var(--text-secondary)] cursor-pointer select-none"
                  >
                    Allow compression
                  </span>
                </div>
              </div>
            )}

            {/* Bottom Split Button */}
            <div className="space-y-4 pt-2">
              <button
                type="button"
                onClick={handleSplit}
                disabled={
                  !file ||
                  loading ||
                  (activeTab === "pages" &&
                    extractMode === "select" &&
                    !pagesInput.trim())
                }
                className={`w-full py-3 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition cursor-pointer shadow-xl ${
                  !file
                    ? "bg-red-600/50 text-white/70 border border-red-500/30 cursor-not-allowed opacity-80"
                    : loading
                      ? "bg-slate-700 text-[var(--text-heading)] border border-[var(--border-hover)] cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-500 text-white border border-red-500 shadow-red-600/20"
                }`}
              >
                <span>{loading ? "Processing..." : "Split PDF"}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {resultMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-emerald-300 text-sm">
                  {resultMessage}
                </div>
              )}

              {resultBlob && (
                <button
                  type="button"
                  onClick={downloadResult}
                  className="w-full p-3 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 shadow-emerald-600/20 cursor-pointer"
                >
                  Download {resultName}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
