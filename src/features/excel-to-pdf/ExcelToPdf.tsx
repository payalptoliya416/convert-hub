import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { 
  Table, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Settings,
  Eye
} from 'lucide-react';

export default function ExcelToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [sheetData, setSheetData] = useState<any[][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext !== 'xlsx' && ext !== 'xls') {
        setError('Please select a valid Excel file (.xlsx or .xls).');
        return;
      }
      setFile(selectedFile);
      setSuccess(false);
      setPdfBlob(null);
      setSheetData([]);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext !== 'xlsx' && ext !== 'xls') {
        setError('Please select a valid Excel file (.xlsx or .xls).');
        return;
      }
      setFile(selectedFile);
      setSuccess(false);
      setPdfBlob(null);
      setSheetData([]);
      setError(null);
    }
  };

  const convertExcelToPdf = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert sheet to 2D Array
          const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          setSheetData(rows);

          if (rows.length === 0) {
            throw new Error('The spreadsheet is empty.');
          }

          // Build a landscape PDF for broad grid tables
          const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
          });

          const margins = 15;
          const pageHeight = doc.internal.pageSize.getHeight();
          
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(14);
          doc.text(`Sheet: ${firstSheetName}`, margins, margins + 5);

          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8);

          // Calculate column widths
          let colWidths: number[] = [];
          const defaultColWidth = 25; // mm
          
          // Determine the max columns in any row
          const maxCols = Math.max(...rows.map(r => r.length));

          for (let c = 0; c < maxCols; c++) {
            colWidths.push(defaultColWidth);
          }

          let currentY = margins + 15;
          const rowHeight = 7; // mm

          rows.forEach((row) => {
            // Check for page break
            if (currentY > pageHeight - margins) {
              doc.addPage();
              currentY = margins;
            }

            let currentX = margins;

            for (let cIdx = 0; cIdx < maxCols; cIdx++) {
              const cellValue = row[cIdx] !== undefined ? String(row[cIdx]) : '';
              const colWidth = colWidths[cIdx];

              // Draw border cell grid lines
              doc.rect(currentX, currentY, colWidth, rowHeight);
              
              // Draw cell text
              const truncatedText = cellValue.substring(0, 18);
              doc.text(truncatedText, currentX + 2, currentY + 4.5);

              currentX += colWidth;
            }

            currentY += rowHeight;
          });

          const generatedBlob = doc.output('blob');
          setPdfBlob(generatedBlob);
          setSuccess(true);
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'Failed to render sheet elements.');
        } finally {
          setLoading(false);
        }
      };

      fileReader.readAsArrayBuffer(file);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during file parsing.');
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    if (!pdfBlob) return;
    saveAs(pdfBlob, `${file?.name.replace(/\.xlsx$/i, '')}.pdf`);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
          <Table className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Excel to PDF</h1>
          <p className="text-slate-400 text-sm mt-1">Convert Microsoft Excel (.xlsx) spreadsheets to formatted PDF documents locally.</p>
        </div>
      </div>

      {/* Main Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Actions */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-violet-400" /> Actions
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export is rendered landscape on A4 pages. Designed to preserve structured tabular sheet cells.
            </p>

            {/* Action button */}
            <button
              onClick={convertExcelToPdf}
              disabled={!file || loading}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                !file 
                  ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                  : loading
                    ? 'bg-violet-700 text-white border border-violet-600 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-500 text-white border border-violet-500 shadow-violet-600/20'
              }`}
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

        {/* Right Column: Upload & Output */}
        <div className="md:col-span-2 space-y-6">
          {!file ? (
            /* Upload Zone */
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/10 rounded-3xl p-16 text-center cursor-pointer transition group"
            >
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 group-hover:text-violet-400 group-hover:scale-110 transition duration-300">
                <Upload className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white mt-6">Drag and drop your spreadsheet here</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xs">
                Or click to browse. We will render cells into a grid structured PDF file.
              </p>
            </div>
          ) : (
            /* Conversion Progress & Preview */
            <div className="space-y-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/15 rounded-xl border border-emerald-500/20 text-emerald-400">
                    <Table className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white truncate max-w-sm sm:max-w-md">{file.name}</h4>
                    <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
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

              {/* Progress */}
              {loading && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-sm text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-violet-400" />
                  <p>Reading sheets data layout...</p>
                </div>
              )}

              {/* Error messages */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-300">Conversion Failed</h4>
                    <p className="text-sm mt-1 text-red-400/90">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Result */}
              {success && pdfBlob && (
                <div className="space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-wrap gap-4 items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-500/15 rounded-xl border border-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">PDF Compiled Successfully!</h4>
                        <p className="text-xs text-slate-400">{(pdfBlob.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={downloadPdf}
                      className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/10"
                    >
                      <Download className="w-4 h-4" /> Download PDF Document
                    </button>
                  </div>

                  {/* Excel Sheet table preview */}
                  {sheetData.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Spreadsheet Cell Preview (First 10 Rows)
                      </label>
                      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-x-auto shadow-2xl">
                        <table className="w-full border-collapse text-left text-xs font-mono text-slate-300">
                          <tbody>
                            {sheetData.slice(0, 10).map((row, idx) => (
                              <tr key={idx} className="border-b border-slate-900/60 hover:bg-slate-900/20">
                                <td className="p-3 text-slate-500 border-r border-slate-800 text-center w-10">{idx + 1}</td>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-3 border-r border-slate-800/80 truncate max-w-[150px]">
                                    {cell !== undefined ? String(cell) : ''}
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
