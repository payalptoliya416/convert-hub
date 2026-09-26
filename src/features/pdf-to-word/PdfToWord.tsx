import React, { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";
import {
  FileText,
  Upload,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Settings,
  Type,
  Layout,
  Copy,
  Check,
} from "lucide-react";

// Configure pdfjs worker locally
(
  pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string } }
).GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface ExtractedLineItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
}

interface PageData {
  pageNumber: number;
  text: string;
  dataUrl: string;
  hasText: boolean;
}

export default function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [conversionMode, setConversionMode] = useState<"editable" | "visual">("editable");
  const [pagesData, setPagesData] = useState<PageData[]>([]);
  const [copiedText, setCopiedText] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "text">("preview");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSuccess(false);
    setDocxBlob(null);
    setError(null);
    setPagesData([]);
    setProgress(0);
    setCopiedText(false);
  };

  const pickFile = (f: File) => {
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF file.");
      return;
    }
    setFile(f);
    resetState();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) pickFile(e.target.files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) pickFile(e.dataTransfer.files[0]);
  };

  const renderPageToPng = async (
    page: pdfjsLib.PDFPageProxy,
    scale = 2
  ): Promise<{
    bytes: Uint8Array;
    width: number;
    height: number;
    dataUrl: string;
  }> => {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not initialize canvas 2D context.");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

    const dataUrl = canvas.toDataURL("image/png");
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("Failed to export canvas to PNG blob."));
      }, "image/png");
    });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return { bytes, width: canvas.width, height: canvas.height, dataUrl };
  };

  const extractPageTextToParagraphs = async (
    page: pdfjsLib.PDFPageProxy,
    isFirstPage: boolean
  ): Promise<{ paragraphs: Paragraph[]; text: string; hasText: boolean }> => {
    const textContent = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = (textContent.items || []) as any[];

    if (!items || items.length === 0) {
      return { paragraphs: [], text: "", hasText: false };
    }

    const validItems: ExtractedLineItem[] = [];
    for (const item of items) {
      if (typeof item.str === "string" && item.str.length > 0) {
        const transform = item.transform || [1, 0, 0, 1, 0, 0];
        const fontSize = Math.round(
          Math.hypot(transform[0], transform[1]) || item.height || 12
        );
        validItems.push({
          str: item.str,
          x: transform[4] || 0,
          y: transform[5] || 0,
          width: item.width || 0,
          height: item.height || fontSize,
          fontSize: Math.max(8, fontSize),
          fontName: item.fontName || "",
        });
      }
    }

    if (validItems.length === 0) {
      return { paragraphs: [], text: "", hasText: false };
    }

    // Sort items top-to-bottom (Y descending in PDF coordinate space)
    validItems.sort((a, b) => b.y - a.y || a.x - b.x);

    // Group items into lines based on Y tolerance
    const lines: ExtractedLineItem[][] = [];
    let currentLine: ExtractedLineItem[] = [];
    let currentY: number | null = null;

    for (const item of validItems) {
      const yTol = Math.max(3.5, item.fontSize * 0.35);
      if (currentY === null || Math.abs(item.y - currentY) <= yTol) {
        currentLine.push(item);
        if (currentY === null) currentY = item.y;
      } else {
        if (currentLine.length > 0) {
          currentLine.sort((a, b) => a.x - b.x);
          lines.push(currentLine);
        }
        currentLine = [item];
        currentY = item.y;
      }
    }
    if (currentLine.length > 0) {
      currentLine.sort((a, b) => a.x - b.x);
      lines.push(currentLine);
    }

    const paragraphs: Paragraph[] = [];
    let fullPageText = "";

    lines.forEach((line, lineIdx) => {
      let lineText = "";
      const runs: TextRun[] = [];

      line.forEach((it, itIdx) => {
        if (itIdx > 0) {
          const prev = line[itIdx - 1];
          const gap = it.x - (prev.x + prev.width);
          if (gap > 2.5 && !prev.str.endsWith(" ") && !it.str.startsWith(" ")) {
            lineText += " ";
            runs.push(new TextRun({ text: " " }));
          }
        }

        lineText += it.str;
        const fontLower = it.fontName.toLowerCase();
        const isBold =
          fontLower.includes("bold") ||
          fontLower.includes("black") ||
          fontLower.includes("heavy") ||
          it.fontSize >= 15;
        const isItalic =
          fontLower.includes("italic") ||
          fontLower.includes("oblique");

        runs.push(
          new TextRun({
            text: it.str,
            bold: isBold,
            italics: isItalic,
            size: Math.min(72, Math.max(16, Math.round(it.fontSize * 2))), // Half-points (12pt = 24)
          })
        );
      });

      const trimmed = lineText.trim();
      if (trimmed.length > 0) {
        fullPageText += trimmed + "\n";

        const maxFontSize = Math.max(...line.map((it) => it.fontSize));
        const isHeading = maxFontSize >= 15;

        paragraphs.push(
          new Paragraph({
            children: runs,
            pageBreakBefore: !isFirstPage && lineIdx === 0,
            spacing: {
              before: isHeading ? 160 : 40,
              after: isHeading ? 120 : 80,
              line: 276,
            },
          })
        );
      }
    });

    return {
      paragraphs,
      text: fullPageText,
      hasText: paragraphs.length > 0,
    };
  };

  const convert = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setError(null);
    setSuccess(false);
    setDocxBlob(null);
    setPagesData([]);

    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const numPages = pdf.numPages;

      const docxParagraphs: Paragraph[] = [];
      const extractedPages: PageData[] = [];
      const maxContentPx = 595; // A4 printable width at standard margins

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);

        // Render page graphic preview
        const rendered = await renderPageToPng(page, 2);

        if (conversionMode === "editable") {
          // Extract text content and build editable Word paragraphs
          const extracted = await extractPageTextToParagraphs(page, i === 1);

          if (extracted.hasText) {
            docxParagraphs.push(...extracted.paragraphs);
            extractedPages.push({
              pageNumber: i,
              text: extracted.text,
              dataUrl: rendered.dataUrl,
              hasText: true,
            });
          } else {
            // Scanned / graphic page fallback: embed high-resolution image
            const displayScale = Math.min(1, maxContentPx / (rendered.width / 2));
            const displayWidth = Math.max(50, Math.round((rendered.width / 2) * displayScale));
            const displayHeight = Math.max(50, Math.round((rendered.height / 2) * displayScale));

            docxParagraphs.push(
              new Paragraph({
                alignment: AlignmentType.CENTER,
                pageBreakBefore: i > 1,
                children: [
                  new ImageRun({
                    type: "png",
                    data: rendered.bytes,
                    transformation: {
                      width: displayWidth,
                      height: displayHeight,
                    },
                  }),
                ],
              })
            );

            extractedPages.push({
              pageNumber: i,
              text: "[Scanned page / Graphics embedded]",
              dataUrl: rendered.dataUrl,
              hasText: false,
            });
          }
        } else {
          // Visual layout mode: embed high-resolution page snapshot
          const displayScale = Math.min(1, maxContentPx / (rendered.width / 2));
          const displayWidth = Math.max(50, Math.round((rendered.width / 2) * displayScale));
          const displayHeight = Math.max(50, Math.round((rendered.height / 2) * displayScale));

          docxParagraphs.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              pageBreakBefore: i > 1,
              children: [
                new ImageRun({
                  type: "png",
                  data: rendered.bytes,
                  transformation: {
                    width: displayWidth,
                    height: displayHeight,
                  },
                }),
              ],
            })
          );

          extractedPages.push({
            pageNumber: i,
            text: `[Page ${i} Visual Layout]`,
            dataUrl: rendered.dataUrl,
            hasText: false,
          });
        }

        setProgress(Math.round((i / numPages) * 100));
      }

      // If document is completely empty, insert a fallback text run
      if (docxParagraphs.length === 0) {
        docxParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "No text content could be extracted from this PDF.",
              }),
            ],
          })
        );
      }

      // Generate standard valid DOCX document
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: { width: 11906, height: 16838 }, // A4 dimensions in dxa
                margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 inch margins
              },
            },
            children: docxParagraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      setDocxBlob(blob);
      setPagesData(extractedPages);
      setSuccess(true);
    } catch (err) {
      console.error("PDF to Word conversion error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to convert PDF to Word document."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadDocx = () => {
    if (!docxBlob || !file) return;
    const cleanName = file.name.replace(/\.pdf$/i, "");
    saveAs(docxBlob, `${cleanName}.docx`);
  };

  const copyExtractedText = () => {
    const allText = pagesData
      .map((p) => `--- Page ${p.pageNumber} ---\n${p.text}`)
      .join("\n\n");
    navigator.clipboard.writeText(allText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const totalWords = pagesData.reduce((acc, p) => {
    if (!p.hasText) return acc;
    const words = p.text.trim().split(/\s+/).filter(Boolean);
    return acc + words.length;
  }, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-8 mb-7">
      {/* Header */}
      <div
        className="flex items-start sm:items-center gap-4 border-b pb-6"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="p-3 rounded-xl border text-[#8B5CF6]"
          style={{
            backgroundColor: "rgba(139, 92, 246, 0.10)",
            borderColor: "var(--border)",
          }}
        >
          <FileText className="w-8 h-8" />
        </div>

        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: "var(--text-heading)" }}
          >
            PDF to Word (.docx)
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            Convert PDF documents into 100% editable Microsoft Word (.docx) files with preserved text and formatting.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: Options */}
        <div className="md:col-span-1 space-y-6">
          <div
            className="rounded-2xl border p-6 space-y-6 shadow-xl"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border)",
            }}
          >
            <h2
              className="text-lg font-bold flex items-center gap-2"
              style={{ color: "var(--text-heading)" }}
            >
              <Settings className="w-5 h-5 text-violet-400" />
              Conversion Options
            </h2>

            <div className="space-y-3">
              <label
                className="text-xs font-semibold uppercase tracking-wider block"
                style={{ color: "var(--text-secondary)" }}
              >
                Output Mode
              </label>

              <button
                type="button"
                onClick={() => setConversionMode("editable")}
                className={`w-full p-3.5 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                  conversionMode === "editable"
                    ? "border-violet-500 bg-violet-600 text-white shadow-md shadow-violet-600/20"
                    : "border-[var(--border)] hover:border-violet-500/40 text-[var(--text-heading)]"
                }`}
                style={
                  conversionMode !== "editable"
                    ? { backgroundColor: "var(--bg-input)" }
                    : undefined
                }
              >
                <Type className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Editable Text</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        conversionMode === "editable"
                          ? "bg-white/20 text-white"
                          : "bg-violet-500/15 text-violet-400"
                      }`}
                    >
                      Recommended
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-1 ${
                      conversionMode === "editable"
                        ? "text-white/80"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    Extracts real text, headings, and formatting editable in Word.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConversionMode("visual")}
                className={`w-full p-3.5 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                  conversionMode === "visual"
                    ? "border-violet-500 bg-violet-600 text-white shadow-md shadow-violet-600/20"
                    : "border-[var(--border)] hover:border-violet-500/40 text-[var(--text-heading)]"
                }`}
                style={
                  conversionMode !== "visual"
                    ? { backgroundColor: "var(--bg-input)" }
                    : undefined
                }
              >
                <Layout className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-sm">Preserve Visual Layout</span>
                  <p
                    className={`text-xs mt-1 ${
                      conversionMode === "visual"
                        ? "text-white/80"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    Preserves exact pixel-perfect graphical layout into Word.
                  </p>
                </div>
              </button>
            </div>

            <button
              onClick={convert}
              disabled={!file || loading}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                !file
                  ? "cursor-not-allowed"
                  : loading
                  ? "bg-violet-700 text-white border border-violet-600 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-500 text-white border border-violet-500 shadow-violet-600/20 cursor-pointer"
              }`}
              style={
                !file
                  ? {
                      backgroundColor: "var(--bg-hover)",
                      color: "var(--text-muted)",
                      borderColor: "var(--border)",
                    }
                  : undefined
              }
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Converting PDF...
                </>
              ) : (
                <>
                  <FileCode className="w-5 h-5" />
                  Convert to Word (.docx)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right column: Upload & results */}
        <div className="md:col-span-2 space-y-6">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition group hover:border-violet-500/50"
              style={{ borderColor: "var(--border)" }}
            >
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              <div
                className="p-5 rounded-2xl border text-[var(--text-secondary)] group-hover:text-violet-400 group-hover:scale-110 transition duration-300"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border)",
                }}
              >
                <Upload className="w-10 h-10" />
              </div>

              <h3
                className="text-xl font-bold mt-6"
                style={{ color: "var(--text-heading)" }}
              >
                Drag and drop your PDF here
              </h3>

              <p
                className="text-sm mt-2 max-w-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                Or click to browse from device. Standard and scanned PDFs are both supported.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Info */}
              <div
                className="rounded-2xl border p-4 flex items-center justify-between"
                style={{
                  backgroundColor: "var(--bg-surface-60)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-500/15 rounded-xl border border-red-500/20 text-red-400">
                    <FileText className="w-6 h-6" />
                  </div>

                  <div>
                    <h4
                      className="font-semibold truncate max-w-sm sm:max-w-md"
                      style={{ color: "var(--text-heading)" }}
                    >
                      {file.name}
                    </h4>

                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFile(null);
                    resetState();
                  }}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {/* Progress Bar */}
              {loading && (
                <div
                  className="rounded-2xl border p-6 space-y-3"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--text-secondary)" }}>
                      Processing PDF pages & formatting...
                    </span>
                    <span className="font-semibold text-violet-400">
                      {progress}%
                    </span>
                  </div>

                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: "var(--bg-base)" }}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Conversion Failed</h4>
                    <p className="text-sm mt-1 text-red-400/90">{error}</p>
                  </div>
                </div>
              )}

              {/* Success & Download Box */}
              {success && docxBlob && (
                <div className="space-y-6">
                  <div
                    className="rounded-2xl border p-6 space-y-4 shadow-xl"
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div className="flex flex-wrap gap-4 justify-between items-center border-b pb-4" style={{ borderColor: "var(--border)" }}>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/15 rounded-xl border border-emerald-500/20 text-emerald-400">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h3
                            className="text-lg font-bold"
                            style={{ color: "var(--text-heading)" }}
                          >
                            Word Document Ready!
                          </h3>
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {pagesData.length} page(s) processed • {(docxBlob.size / 1024).toFixed(1)} KB DOCX
                            {totalWords > 0 && ` • ~${totalWords} words extracted`}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={downloadDocx}
                        className="py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-blue-600/20"
                      >
                        <Download className="w-4 h-4" />
                        Download Word (.docx)
                      </button>
                    </div>

                    {/* Preview Tabs */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--border)" }}>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setActiveTab("preview")}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                              activeTab === "preview"
                                ? "bg-violet-600 text-white"
                                : "text-[var(--text-secondary)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-hover)]"
                            }`}
                          >
                            Page Visuals ({pagesData.length})
                          </button>
                          {totalWords > 0 && (
                            <button
                              onClick={() => setActiveTab("text")}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                                activeTab === "text"
                                  ? "bg-violet-600 text-white"
                                  : "text-[var(--text-secondary)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-hover)]"
                              }`}
                            >
                              Extracted Text
                            </button>
                          )}
                        </div>

                        {activeTab === "text" && totalWords > 0 && (
                          <button
                            onClick={copyExtractedText}
                            className="text-xs flex items-center gap-1.5 font-semibold text-violet-400 hover:text-violet-300 transition cursor-pointer"
                          >
                            {copiedText ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy All Text
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {activeTab === "preview" ? (
                        <div
                          className="max-h-[30rem] overflow-y-auto rounded-xl p-4 space-y-4 border"
                          style={{
                            backgroundColor: "var(--bg-base)",
                            borderColor: "var(--border)",
                          }}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {pagesData.map((page) => (
                              <div
                                key={page.pageNumber}
                                className="rounded-xl border overflow-hidden"
                                style={{
                                  backgroundColor: "var(--bg-surface)",
                                  borderColor: "var(--border)",
                                }}
                              >
                                <div
                                  className="p-2 flex items-center justify-center"
                                  style={{ backgroundColor: "var(--bg-base)" }}
                                >
                                  <img
                                    src={page.dataUrl}
                                    alt={`Page ${page.pageNumber}`}
                                    className="max-h-64 object-contain rounded shadow"
                                  />
                                </div>
                                <div
                                  className="px-3 py-2 text-xs flex justify-between items-center border-t"
                                  style={{
                                    backgroundColor: "var(--bg-surface)",
                                    borderColor: "var(--border)",
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  <span>Page {page.pageNumber}</span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                                      page.hasText
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "bg-amber-500/10 text-amber-400"
                                    }`}
                                  >
                                    {page.hasText ? "Editable Text" : "Visual Scan"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div
                          className="max-h-[30rem] overflow-y-auto rounded-xl p-4 space-y-4 border font-mono text-xs leading-relaxed"
                          style={{
                            backgroundColor: "var(--bg-base)",
                            borderColor: "var(--border)",
                            color: "var(--text-heading)",
                          }}
                        >
                          {pagesData.map((page) => (
                            <div
                              key={page.pageNumber}
                              className="p-4 rounded-lg border space-y-2"
                              style={{
                                backgroundColor: "var(--bg-surface)",
                                borderColor: "var(--border)",
                              }}
                            >
                              <div
                                className="text-[11px] font-bold text-violet-400 border-b pb-1 flex justify-between"
                                style={{ borderColor: "var(--border)" }}
                              >
                                <span>Page {page.pageNumber}</span>
                                <span className="text-[var(--text-secondary)] font-normal">
                                  {page.text.split(/\s+/).filter(Boolean).length} words
                                </span>
                              </div>
                              <pre className="whitespace-pre-wrap font-sans text-xs text-[var(--text-secondary)]">
                                {page.text}
                              </pre>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
