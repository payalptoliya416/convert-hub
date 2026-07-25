import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { 
  Copy,
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Settings
} from 'lucide-react';

// Configure pdfjs worker locally
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [ranges, setRanges] = useState<Array<{from: number; to: number}>>([{ from: 1, to: 1 }]);
  const [mode, setMode] = useState<'custom' | 'fixed' | 'smart'>('custom');
  const [fixedSize, setFixedSize] = useState<number>(1);
  const [mergeRanges, setMergeRanges] = useState<boolean>(true);
  const [splitBlob, setSplitBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a valid PDF file.');
        return;
      }
      setFile(selectedFile);
      setSuccess(false);
      setSplitBlob(null);
      setError(null);
      getTotalPages(selectedFile);
    }
  };

  const getTotalPages = async (pdfFile: File) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setTotalPages(pdf.numPages);
    } catch (err) {
      console.error('Could not read PDF pages:', err);
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
      setSuccess(false);
      setSplitBlob(null);
      setError(null);
      getTotalPages(selectedFile);
    }
  };

  const splitPdf = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Build ranges based on mode
      let activeRanges: Array<{from: number; to: number}> = [];

      if (mode === 'custom') {
        // use `ranges` state
        activeRanges = ranges.map(r => ({ from: Math.max(1, Math.floor(r.from)), to: Math.max(1, Math.floor(r.to)) }));
      } else if (mode === 'fixed') {
        // split into chunks of `fixedSize`
        const size = Math.max(1, Math.floor(fixedSize));
        if (totalPages <= 0) throw new Error('Upload a PDF to use Fixed mode.');
        for (let i = 1; i <= totalPages; i += size) {
          activeRanges.push({ from: i, to: Math.min(i + size - 1, totalPages) });
        }
      } else {
        // smart - fallback to single full range for now
        activeRanges = [{ from: 1, to: totalPages }];
      }

       const arrayBuffer = await file.arrayBuffer();
       let srcPdf;

        try {
        srcPdf = await PDFDocument.load(arrayBuffer);
        } catch {
        throw new Error(
            "This PDF is password protected. Please upload an unlocked PDF."
        );
        }
      // Validate and normalize ranges against source page count
      const pageCount = srcPdf.getPageCount();
      const normalizedRanges = activeRanges
        .map(r => ({ from: Math.max(1, Math.min(pageCount, r.from)), to: Math.max(1, Math.min(pageCount, r.to)) }))
        .filter(r => r.from <= r.to);

      if (normalizedRanges.length === 0) {
        throw new Error(`Enter a valid page range between 1 and ${pageCount}.`);
      }

      // If mergeRanges is true, build a single PDF with pages appended in order
      if (mergeRanges) {
        const newPdf = await PDFDocument.create();
        for (const r of normalizedRanges) {
          const indices = [] as number[];
          for (let p = r.from; p <= r.to; p++) indices.push(p - 1);
          const copied = await newPdf.copyPages(srcPdf, indices);
          copied.forEach(page => newPdf.addPage(page));
        }
        const pdfBytes = await newPdf.save();
        const blob = new Blob([Uint8Array.from(pdfBytes)], { type: 'application/pdf' });
        setSplitBlob(blob);
        setSuccess(true);
      } else {
        // Produce one PDF per range and trigger downloads
        const blobs: Array<{blob: Blob; name: string}> = [];
        let idx = 1;
        for (const r of normalizedRanges) {
          const out = await PDFDocument.create();
          const indices: number[] = [];
          for (let p = r.from; p <= r.to; p++) indices.push(p - 1);
          const copied = await out.copyPages(srcPdf, indices);
          copied.forEach(page => out.addPage(page));
          const bytes = await out.save();
          const blob = new Blob([Uint8Array.from(bytes)], { type: 'application/pdf' });
          const name = `${file.name.replace(/\.pdf$/i, '')}_part${idx}_${r.from}-${r.to}.pdf`;
          blobs.push({ blob, name });
          idx++;
        }
        // Trigger downloads
        blobs.forEach(b => saveAs(b.blob, b.name));
        // Keep last produced blob in state for UI preview/download
        setSplitBlob(blobs[blobs.length - 1].blob ?? null);
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to split PDF.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSplit = () => {
    if (!splitBlob) return;
    saveAs(splitBlob, `${file?.name.replace(/\.pdf$/i, '')}_split.pdf`);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const addRange = () => {
    setRanges(prev => [...prev, { from: Math.min(totalPages || 1, (prev[prev.length - 1]?.to ?? 1) + 1), to: Math.min(totalPages || 1, (prev[prev.length - 1]?.to ?? 1) + 1) }]);
  };

  const updateRange = (index: number, field: 'from' | 'to', value: number) => {
    setRanges(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const removeRange = (index: number) => {
    setRanges(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
          <Copy className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Split PDF</h1>
          <p className="text-slate-400 text-sm mt-1">Extract specific pages from your PDF into a new document.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-violet-400" /> Options
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Split Mode</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setMode('custom')} className={`px-3 py-1 rounded-lg text-sm ${mode==='custom' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Custom</button>
                <button onClick={() => setMode('fixed')} className={`px-3 py-1 rounded-lg text-sm ${mode==='fixed' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Fixed</button>
                <button onClick={() => setMode('smart')} className={`px-3 py-1 rounded-lg text-sm ${mode==='smart' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Smart</button>
              </div>

              {mode === 'custom' && (
                <div className="space-y-2 mt-2">
                  <label className="text-xs text-slate-400">Ranges</label>
                  {ranges.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="text-xs text-slate-400">from</div>
                      <input type="number" min={1} value={r.from} onChange={(e) => updateRange(i, 'from', Number(e.target.value))} className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm text-white" />
                      <div className="text-xs text-slate-400">to</div>
                      <input type="number" min={1} value={r.to} onChange={(e) => updateRange(i, 'to', Number(e.target.value))} className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm text-white" />
                      {ranges.length > 1 && (
                        <button onClick={() => removeRange(i)} className="text-xs text-red-400">Remove</button>
                      )}
                    </div>
                  ))}
                  <button onClick={addRange} className="mt-2 text-sm text-violet-400">+ Add Range</button>
                </div>
              )}

              {mode === 'fixed' && (
                <div className="space-y-2 mt-2">
                  <label className="text-xs text-slate-400">Split every N pages</label>
                  <input type="number" min={1} value={fixedSize} onChange={(e) => setFixedSize(Number(e.target.value))} className="w-24 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm text-white" />
                  {totalPages > 0 && (
                    <p className="text-xs text-slate-500">This will create {Math.ceil(totalPages / Math.max(1, fixedSize))} parts.</p>
                  )}
                </div>
              )}

              {mode === 'smart' && (
                <div className="mt-2 text-xs text-slate-500">Smart split is experimental and will split intelligently (currently full document).</div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <input id="merge" type="checkbox" checked={mergeRanges} onChange={(e) => setMergeRanges(e.target.checked)} className="w-4 h-4" />
                <label htmlFor="merge" className="text-xs text-slate-400">Merge all ranges in one PDF file.</label>
              </div>

              {totalPages > 0 && <p className="text-xs text-slate-400">Total pages: {totalPages}</p>}
            </div>

            <button
              onClick={splitPdf}
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
                  <RefreshCw className="w-5 h-5 animate-spin" /> Splitting...
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" /> Split PDF
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
              <p className="text-slate-400 text-sm mt-2 max-w-xs">Or click to browse. Select pages to extract into a new PDF.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-500/15 rounded-xl border border-red-500/20 text-red-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white truncate max-w-sm sm:max-w-md">{file.name}</h4>
                    <p className="text-xs text-slate-400">{totalPages} pages • {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setSuccess(false);
                    setSplitBlob(null);
                    setError(null);
                    setTotalPages(0);
                  }}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-300">Error</h4>
                    <p className="text-sm mt-1 text-red-400/90">{error}</p>
                  </div>
                </div>
              )}

              {success && splitBlob && (
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-300">PDF Split Successfully!</h4>
                      <p className="text-sm mt-1 text-emerald-400/90">{(splitBlob.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={downloadSplit}
                    className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-violet-600/10"
                  >
                    <Download className="w-4 h-4" /> Download Split PDF
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
