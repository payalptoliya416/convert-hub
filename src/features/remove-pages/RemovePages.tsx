import React, { useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Upload, Download, RefreshCw, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export default function RemovePages() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [removeInput, setRemoveInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [outBlob, setOutBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleFile = async (f: File | null) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      return;
    }
    setFile(f);
    setError(null);
    setSuccess(false);
    setOutBlob(null);
    try {
      const ab = await f.arrayBuffer();
      const pdf = await PDFDocument.load(ab);
      setTotalPages(pdf.getPageCount());
    } catch (err) {
      console.error(err);
      setError('Failed to read PDF');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  function parseRemoveInput(input: string, max: number) {
    // Accept formats like: 1,3,5-7
    const parts = input.split(',').map(p => p.trim()).filter(Boolean);
    const removeSet = new Set<number>();
    for (const part of parts) {
      if (part.includes('-')) {
        const [aStr, bStr] = part.split('-').map(s => s.trim());
        const a = parseInt(aStr, 10);
        const b = parseInt(bStr, 10);
        if (Number.isNaN(a) || Number.isNaN(b)) continue;
        const from = Math.max(1, Math.min(a, b));
        const to = Math.min(max, Math.max(a, b));
        for (let i = from; i <= to; i++) removeSet.add(i);
      } else {
        const n = parseInt(part, 10);
        if (Number.isNaN(n)) continue;
        if (n >= 1 && n <= max) removeSet.add(n);
      }
    }
    return Array.from(removeSet).sort((x, y) => x - y);
  }

  const removePages = async () => {
    if (!file) return setError('Select a PDF first');
    if (!removeInput.trim()) return setError('Enter pages to remove (e.g., 1,3-5)');

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const ab = await file.arrayBuffer();
      const src = await PDFDocument.load(ab);
      const count = src.getPageCount();
      const toRemove = parseRemoveInput(removeInput, count);
      if (toRemove.length === 0) throw new Error('No valid pages to remove');

      // Build new PDF by adding pages that are NOT in toRemove
      const newPdf = await PDFDocument.create();
      const keepIndices: number[] = [];
      for (let i = 1; i <= count; i++) {
        if (!toRemove.includes(i)) keepIndices.push(i - 1);
      }

      if (keepIndices.length === 0) throw new Error('Resulting PDF would be empty');

      const copied = await newPdf.copyPages(src, keepIndices);
      copied.forEach(p => newPdf.addPage(p));

      const bytes = await newPdf.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      setOutBlob(blob);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to remove pages');
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!outBlob || !file) return;
    saveAs(outBlob, `${file.name.replace(/\.pdf$/i, '')}_removed.pdf`);
  };

  return (
    <div className="mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
        <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
          <FileText className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Remove pages</h1>
          <p className="text-slate-400 text-sm mt-1">Select pages you want to remove from the PDF and download the result.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-white">Options</h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pages to remove</label>
              <input value={removeInput} onChange={(e) => setRemoveInput(e.target.value)} placeholder="example: 1,5-8" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
              <p className="text-xs text-slate-500">Enter comma-separated pages and ranges (1-indexed). Total pages: {totalPages || '—'}</p>
            </div>

            <button onClick={removePages} disabled={!file || loading} className={`w-full py-3 rounded-xl font-bold ${!file ? 'bg-slate-800 text-slate-500' : loading ? 'bg-violet-700 text-white' : 'bg-violet-600 hover:bg-violet-500 text-white'}`}>
              {loading ? <><RefreshCw className="w-5 h-5 animate-spin" /> Removing...</> : <>Remove Pages</>}
            </button>

            {outBlob && (
              <button onClick={download} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold">Download Result</button>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {!file ? (
            <div onDragOver={handleDragOver} onDrop={handleDrop} onClick={triggerFileSelect} className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/10 rounded-3xl p-16 text-center cursor-pointer transition group">
              <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 group-hover:text-violet-400 group-hover:scale-110 transition duration-300">
                <Upload className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white mt-6">Drag and drop your PDF here</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xs">Or click to browse. Click Remove Pages when ready.</p>
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
                <button onClick={() => { setFile(null); setTotalPages(0); setRemoveInput(''); setOutBlob(null); setSuccess(false); setError(null); }} className="text-xs font-semibold text-red-400 hover:text-red-300">Remove</button>
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

              {success && outBlob && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-emerald-300">Pages Removed</h4>
                    <p className="text-sm mt-1 text-emerald-400/90">Download the modified PDF using the button on the left.</p>
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
