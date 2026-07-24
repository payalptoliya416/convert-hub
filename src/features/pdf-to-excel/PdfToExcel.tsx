import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  Table, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Settings,
  Eye
} from 'lucide-react';

// Configure pdfjs worker locally
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function PdfToExcel() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<string[][]>([]);
  const [success, setSuccess] = useState(false);
  const [colGap, setColGap] = useState<number>(30); // X-gap threshold to split into new column
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a valid PDF file.');
        return;
      }
      setFile(selectedFile);
      setExtractedData([]);
      setSuccess(false);
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
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a valid PDF file.');
        return;
      }
      setFile(selectedFile);
      setExtractedData([]);
      setSuccess(false);
      setError(null);
    }
  };

  const convertPdfToExcel = async () => {
    if (!file) return;

    setLoading(true);
    setProgress(0);
    setError(null);
    setExtractedData([]);
    setSuccess(false);

    try {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
          const loadingTask = pdfjsLib.getDocument({ data: typedarray });
          const pdf = await loadingTask.promise;
          const numPages = pdf.numPages;

          let allRows: string[][] = [];

          for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const items = textContent.items as any[];

            if (items.length === 0) continue;

            // Group items by Y coordinate (using a tolerance of 5 points for rows)
            const linesMap: { [key: number]: any[] } = {};
            const yTolerance = 6;

            items.forEach((item) => {
              const y = Math.round(item.transform[5]);
              const matchingY = Object.keys(linesMap).find(
                (existingY) => Math.abs(Number(existingY) - y) < yTolerance
              );

              if (matchingY) {
                linesMap[Number(matchingY)].push(item);
              } else {
                linesMap[y] = [item];
              }
            });

            // Sort lines by Y descending (top-to-bottom)
            const sortedYKeys = Object.keys(linesMap)
              .map(Number)
              .sort((a, b) => b - a);

            // For each line, sort items by X ascending (left-to-right)
            // and group them into column cells based on distance
            sortedYKeys.forEach((yKey) => {
              const lineItems = linesMap[yKey].sort((a, b) => a.transform[4] - b.transform[4]);
              
              const rowCells: string[] = [];
              let currentCellText = '';
              let lastX = -1;
              let lastWidth = 0;

              lineItems.forEach((item) => {
                const currentX = item.transform[4];
                const itemText = item.str;

                // If this is the first item in the row
                if (lastX === -1) {
                  currentCellText = itemText;
                } else {
                  // Determine space / gap width
                  // transform[0] is roughly width/font scale
                  const gap = currentX - (lastX + lastWidth);

                  if (gap > colGap) {
                    // Large gap, push current cell and start a new cell
                    rowCells.push(currentCellText.trim());
                    currentCellText = itemText;
                  } else {
                    // Small gap, append to current cell
                    const needsSpace = gap > 2 && !currentCellText.endsWith(' ') && !itemText.startsWith(' ');
                    currentCellText += (needsSpace ? ' ' : '') + itemText;
                  }
                }

                lastX = currentX;
                // Rough estimate of item width based on text length and horizontal scale
                lastWidth = item.width || (itemText.length * (item.transform[0] * 0.5));
              });

              if (currentCellText.trim()) {
                rowCells.push(currentCellText.trim());
              }

              if (rowCells.length > 0) {
                allRows.push(rowCells);
              }
            });

            // Add an empty row between pages
            if (i < numPages) {
              allRows.push([]);
            }

            setProgress(Math.round((i / numPages) * 100));
          }

          if (allRows.length === 0) {
            throw new Error("No tables or text rows found in the PDF. Make sure it isn't an image-only scanned PDF.");
          }

          setExtractedData(allRows);
          setSuccess(true);
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'Failed to parse PDF tables.');
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

  const downloadExcel = () => {
    if (extractedData.length === 0) return;

    try {
      const ws = XLSX.utils.aoa_to_sheet(extractedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PDF Extracted Table");
      
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(blob, `${file?.name.replace(/\.pdf$/i, '')}_extracted.xlsx`);
    } catch (err: any) {
      console.error(err);
      setError('Failed to create Excel file.');
    }
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
          <h1 className="text-3xl font-bold text-white">PDF to Excel</h1>
          <p className="text-slate-400 text-sm mt-1">Extract tables and structured coordinate grids from PDF to Excel spreadsheets (.xlsx).</p>
        </div>
      </div>

      {/* Main Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Options */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-violet-400" /> Options
            </h2>

            {/* Column Gap threshold settings */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Column Gap Sensitivity</label>
              <input 
                type="range" 
                min="10" 
                max="80" 
                value={colGap} 
                onChange={(e) => setColGap(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Narrow Gaps ({colGap}px)</span>
                <span>Wide Gaps</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Lower this if columns are merging together; raise it if words in cells are splitting into separate columns.
              </p>
            </div>

            {/* Action button */}
            <button
              onClick={convertPdfToExcel}
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
                  <RefreshCw className="w-5 h-5 animate-spin" /> Extricating...
                </>
              ) : (
                <>
                  <Table className="w-5 h-5" /> Extract to Excel
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
                accept=".pdf" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 group-hover:text-violet-400 group-hover:scale-110 transition duration-300">
                <Upload className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white mt-6">Drag and drop your PDF here</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xs">
                Or click to browse. We will detect rows and column gaps based on coordinate spacing.
              </p>
            </div>
          ) : (
            /* Conversion Progress & Table Preview */
            <div className="space-y-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-500/15 rounded-xl border border-red-500/20 text-red-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white truncate max-w-sm sm:max-w-md">{file.name}</h4>
                    <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
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

              {/* Progress */}
              {loading && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Reconstructing data tables...</span>
                    <span className="font-semibold text-violet-400">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error messages */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-300">Extraction Failed</h4>
                    <p className="text-sm mt-1 text-red-400/90">{error}</p>
                  </div>
                </div>
              )}

              {/* Success output */}
              {success && extractedData.length > 0 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Excel Sheet Formulated
                    </h3>
                    <button
                      onClick={downloadExcel}
                      className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/10"
                    >
                      <Download className="w-4 h-4" /> Download Excel (.xlsx)
                    </button>
                  </div>

                  {/* Spreadsheet Preview Grid */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Extracted Grid Preview (First 15 Rows)
                    </label>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-x-auto shadow-2xl">
                      <table className="w-full border-collapse text-left text-xs font-mono text-slate-300">
                        <thead>
                          <tr className="bg-slate-900 border-b border-slate-800">
                            <th className="p-3 font-semibold text-slate-400 border-r border-slate-800 w-10 text-center">#</th>
                            <th className="p-3 font-semibold text-slate-400 border-r border-slate-800" colSpan={100}>Extracted Columns</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extractedData.slice(0, 15).map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-900/60 hover:bg-slate-900/20">
                              <td className="p-3 text-slate-500 border-r border-slate-800 text-center">{idx + 1}</td>
                              {row.length === 0 ? (
                                <td className="p-3 text-slate-600 italic border-r border-slate-800 bg-slate-900/10" colSpan={100}>
                                  [Page Boundary / Empty Line]
                                </td>
                              ) : (
                                row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-3 border-r border-slate-800/80 truncate max-w-[200px]" title={cell}>
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
