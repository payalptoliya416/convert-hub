import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import {
  Table,
  Upload,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Settings,
  Eye,
} from "lucide-react";

export default function ExcelToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [sheetData, setSheetData] = useState<any[][]>([]);
  const [sheetName, setSheetName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptFile = (selectedFile: File) => {
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx" && ext !== "xls") {
      setError("Please select a valid Excel file (.xlsx or .xls).");
      return;
    }
    setFile(selectedFile);
    setSuccess(false);
    setPdfBlob(null);
    setSheetData([]);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) acceptFile(e.target.files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      acceptFile(e.dataTransfer.files[0]);
  };

  const convertExcelToPdf = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const buf = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(buf), { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
        blankrows: false,
      });

      setSheetName(firstSheetName);
      setSheetData(rows);

      if (rows.length === 0) throw new Error("The spreadsheet is empty.");

      const maxCols = Math.max(...rows.map((r) => r.length));
      const normalized = rows.map((r) => {
        const out: string[] = [];
        for (let i = 0; i < maxCols; i++)
          out.push(r[i] !== undefined && r[i] !== null ? String(r[i]) : "");
        return out;
      });

      const head = [normalized[0]];
      const body = normalized.slice(1);

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`Sheet: ${firstSheetName}`, 15, 12);

      autoTable(doc, {
        head,
        body,
        startY: 18,
        margin: { left: 10, right: 10, top: 15, bottom: 15 },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
          valign: "middle",
          lineWidth: 0.1,
          lineColor: [180, 180, 180],
        },
        headStyles: {
          fillColor: [124, 58, 237],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [245, 245, 250] },
        tableWidth: "auto",
        horizontalPageBreak: true,
        horizontalPageBreakRepeat: 0,
      });

      const generatedBlob = doc.output("blob");
      setPdfBlob(generatedBlob);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to convert file.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    if (!pdfBlob || !file) return;
    saveAs(pdfBlob, `${file.name.replace(/\.(xlsx|xls)$/i, "")}.pdf`);
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
          <Table className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-heading)' }}>Excel to PDF</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Convert Microsoft Excel (.xlsx) spreadsheets to formatted PDF documents locally.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-2xl border p-6 space-y-6 shadow-xl" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <Settings className="w-5 h-5 text-violet-400" /> Actions
            </h2>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Exported in landscape A4 with auto-sized columns, word wrap and
              automatic page breaks so cells never overlap.
            </p>

            <button
              onClick={convertExcelToPdf}
              disabled={!file || loading}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                !file
                  ? "border border-[var(--border)] cursor-not-allowed"
                  : loading
                    ? "bg-violet-700 text-[var(--text-heading)] border border-violet-600 cursor-not-allowed"
                    : "bg-violet-600 hover:bg-violet-500 text-[var(--text-heading)] border border-violet-500 shadow-violet-600/20"
              }`}
              style={!file ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)' } : undefined}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> Structuring...
                </>
              ) : (
                <>
                  <Table className="w-5 h-5" /> Convert to PDF
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
              className="flex flex-col items-center justify-center border-2 border-dashed hover:border-violet-500/50 rounded-3xl p-16 text-center cursor-pointer transition group"
              style={{ borderColor: 'var(--border)' }}
            >
              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div className="p-5 rounded-2xl border text-[var(--text-secondary)] group-hover:text-violet-400 group-hover:scale-110 transition duration-300" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                <Upload className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mt-6" style={{ color: 'var(--text-heading)' }}>
                Drag and drop your spreadsheet here
              </h3>
              <p className="text-sm mt-2 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Or click to browse. We will render cells into a grid structured PDF file.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border rounded-2xl p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--bg-surface-60)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/15 rounded-xl border border-emerald-500/20 text-emerald-400">
                    <Table className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold truncate max-w-sm sm:max-w-md" style={{ color: 'var(--text-heading)' }}>
                      {file.name}
                    </h4>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setSuccess(false);
                    setPdfBlob(null);
                    setSheetData([]);
                    setError(null);
                  }}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {loading && (
                <div className="border rounded-2xl p-6 text-center text-sm space-y-2" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-violet-400" />
                  <p>Reading sheets data layout...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-300">Conversion Failed</h4>
                    <p className="text-sm mt-1 text-red-400/90">{error}</p>
                  </div>
                </div>
              )}

              {success && pdfBlob && (
                <div className="space-y-6">
                  <div className="border rounded-2xl p-6 flex flex-wrap gap-4 items-center justify-between shadow-2xl" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-500/15 rounded-xl border border-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold" style={{ color: 'var(--text-heading)' }}>
                          PDF Compiled Successfully!
                        </h4>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Sheet: {sheetName} · {(pdfBlob.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={downloadPdf}
                      className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-[var(--text-heading)] rounded-lg text-sm font-semibold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/10"
                    >
                      <Download className="w-4 h-4" /> Download PDF Document
                    </button>
                  </div>

                  {sheetData.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <Eye className="w-3.5 h-3.5" /> Spreadsheet Cell Preview (First 10 Rows)
                      </label>
                      <div className="rounded-xl border overflow-x-auto shadow-2xl" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-base)' }}>
                        <table className="w-full border-collapse text-left text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                          <tbody>
                            {sheetData.slice(0, 10).map((row, idx) => (
                              <tr
                                key={idx}
                                className="border-b hover:bg-[var(--bg-surface-60)]"
                                style={{ borderColor: 'var(--bg-surface-60)' }}
                              >
                                <td className="p-3 border-r text-center w-10" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                                  {idx + 1}
                                </td>
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className="p-3 border-r truncate max-w-[150px]"
                                    style={{ borderColor: 'var(--border-soft)' }}
                                  >
                                    {cell !== undefined ? String(cell) : ""}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
