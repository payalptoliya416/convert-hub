import React, { useState, useRef } from "react";
import {
  Table,
  Upload,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Settings,
  Eye,
} from "lucide-react";

export default function PdfToExcel() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<string[][]>([]);
  const [success, setSuccess] = useState(false);
  const [colGap, setColGap] = useState<number>(30);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF file.");
      return;
    }
    setFile(f);
    setExtractedData([]);
    setSuccess(false);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    pickFile(e.target.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    pickFile(e.dataTransfer.files?.[0]);
  };

  const convertPdfToExcel = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setError(null);
    setExtractedData([]);
    setSuccess(false);

    try {
      const pdfjsLib: any = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
      const numPages = pdf.numPages;
      const allRows: string[][] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const items = textContent.items as any[];

        if (items.length === 0) {
          setProgress(Math.round((i / numPages) * 100));
          continue;
        }

        const linesMap: Record<number, any[]> = {};
        const yTolerance = 6;
        items.forEach((item) => {
          const y = Math.round(item.transform[5]);
          const matchingY = Object.keys(linesMap).find(
            (existingY) => Math.abs(Number(existingY) - y) < yTolerance
          );
          if (matchingY) linesMap[Number(matchingY)].push(item);
          else linesMap[y] = [item];
        });

        const sortedYKeys = Object.keys(linesMap)
          .map(Number)
          .sort((a, b) => b - a);

        sortedYKeys.forEach((yKey) => {
          const lineItems = linesMap[yKey].sort(
            (a, b) => a.transform[4] - b.transform[4]
          );
          const rowCells: string[] = [];
          let currentCellText = "";
          let lastX = -1;
          let lastWidth = 0;

          lineItems.forEach((item) => {
            const currentX = item.transform[4];
            const itemText = item.str;
            if (lastX === -1) {
              currentCellText = itemText;
            } else {
              const gap = currentX - (lastX + lastWidth);
              if (gap > colGap) {
                rowCells.push(currentCellText.trim());
                currentCellText = itemText;
              } else {
                const needsSpace =
                  gap > 2 &&
                  !currentCellText.endsWith(" ") &&
                  !itemText.startsWith(" ");
                currentCellText += (needsSpace ? " " : "") + itemText;
              }
            }
            lastX = currentX;
            lastWidth =
              item.width || itemText.length * (item.transform[0] * 0.5);
          });

          if (currentCellText.trim()) rowCells.push(currentCellText.trim());
          if (rowCells.length > 0) allRows.push(rowCells);
        });

        if (i < numPages) allRows.push([]);
        setProgress(Math.round((i / numPages) * 100));
      }

      if (allRows.length === 0) {
        throw new Error(
          "No tables or text rows found in the PDF. Make sure it isn't an image-only scanned PDF."
        );
      }

      setExtractedData(allRows);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to parse PDF.");
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async () => {
    if (extractedData.length === 0 || !file) return;
    try {
      const XLSX: any = await import("xlsx");
      const ws = XLSX.utils.aoa_to_sheet(extractedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PDF Extracted Table");

      const wbout: ArrayBuffer = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const filename = `${file.name.replace(/\.pdf$/i, "")}_extracted.xlsx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to create Excel file.");
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
          <Table className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-heading)]">PDF to Excel</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Extract tables and structured coordinate grids from PDF to Excel spreadsheets (.xlsx).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-6 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-[var(--text-heading)] flex items-center gap-2">
              <Settings className="w-5 h-5 text-violet-400" /> Options
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Column Gap Sensitivity
              </label>
              <input
                type="range"
                min="10"
                max="80"
                value={colGap}
                onChange={(e) => setColGap(Number(e.target.value))}
                className="w-full h-2 bg-[var(--bg-base)] rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between text-xs text-[var(--text-muted)]">
                <span>Narrow Gaps ({colGap}px)</span>
                <span>Wide Gaps</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">
                Lower this if columns are merging together; raise it if words in cells are splitting into separate columns.
              </p>
            </div>

            <button
              onClick={convertPdfToExcel}
              disabled={!file || loading}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                !file
                  ? "bg-[var(--bg-hover)] text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed"
                  : loading
                    ? "bg-violet-700 text-white border border-violet-600 cursor-not-allowed"
                    : "bg-violet-600 hover:bg-violet-500 text-white border border-violet-500 shadow-violet-600/20"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> Extracting...
                </>
              ) : (
                <>
                  <Table className="w-5 h-5" /> Extract to Excel
                </>
              )}
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] hover:border-violet-500/50 hover:bg-[var(--bg-surface-60)] rounded-3xl p-16 text-center cursor-pointer transition group"
            >
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div className="p-5 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] text-[var(--text-secondary)] group-hover:text-violet-400 group-hover:scale-110 transition duration-300">
                <Upload className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-heading)] mt-6">Drag and drop your PDF here</h3>
              <p className="text-[var(--text-secondary)] text-sm mt-2 max-w-xs">
                Or click to browse. We will detect rows and column gaps based on coordinate spacing.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-[var(--bg-surface-60)] border border-[var(--border)] rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-500/15 rounded-xl border border-red-500/20 text-red-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--text-heading)] truncate max-w-sm sm:max-w-md">{file.name}</h4>
                    <p className="text-xs text-[var(--text-secondary)]">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setExtractedData([]);
                    setSuccess(false);
                    setError(null);
                  }}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {loading && (
                <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Reconstructing data tables...</span>
                    <span className="font-semibold text-violet-400">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--bg-base)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-400">Extraction Failed</h4>
                    <p className="text-sm mt-1 text-red-400/90">{error}</p>
                  </div>
                </div>
              )}

              {success && extractedData.length > 0 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
                    <h3 className="text-lg font-bold text-[var(--text-heading)] flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Excel Sheet Ready
                    </h3>
                    <button
                      onClick={downloadExcel}
                      className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/10"
                    >
                      <Download className="w-4 h-4" /> Download Excel (.xlsx)
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Extracted Grid Preview (First 15 Rows)
                    </label>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-base)] overflow-x-auto shadow-2xl">
                      <table className="w-full border-collapse text-left text-xs font-mono text-[var(--text-secondary)]">
                        <thead>
                          <tr className="bg-[var(--bg-surface)] border-b border-[var(--border)]">
                            <th className="p-3 font-semibold text-[var(--text-secondary)] border-r border-[var(--border)] w-10 text-center">#</th>
                            <th className="p-3 font-semibold text-[var(--text-secondary)] border-r border-[var(--border)]" colSpan={100}>
                              Extracted Columns
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {extractedData.slice(0, 15).map((row, idx) => (
                            <tr key={idx} className="border-b border-[var(--border)]/60 hover:bg-[var(--bg-surface-60)]">
                              <td className="p-3 text-[var(--text-muted)] border-r border-[var(--border)] text-center">{idx + 1}</td>
                              {row.length === 0 ? (
                                <td className="p-3 text-[var(--text-muted)] italic border-r border-[var(--border)] bg-[var(--bg-surface-60)]" colSpan={100}>
                                  [Page Boundary / Empty Line]
                                </td>
                              ) : (
                                row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className="p-3 border-r border-[var(--border-soft)] truncate max-w-[200px]"
                                    title={cell}
                                  >
                                    {cell}
                                  </td>
                                ))
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
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