import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { 
  Merge, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  FileText,
  Settings
} from 'lucide-react';

interface PdfFile {
  id: string;
  file: File;
}

export default function MergePdf() {
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addPdfs(selectedFiles);
    }
  };

  const addPdfs = (files: File[]) => {
    const validPdfs = files.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (validPdfs.length === 0) {
      setError('Please select valid PDF files.');
      return;
    }

    const newPdfs = validPdfs.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file
    }));

    setPdfs(prev => [...prev, ...newPdfs]);
    setSuccess(false);
    setMergedBlob(null);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const selectedFiles = Array.from(e.dataTransfer.files);
      addPdfs(selectedFiles);
    }
  };

  const removePdf = (id: string) => {
    setPdfs(prev => prev.filter(pdf => pdf.id !== id));
    setSuccess(false);
    setMergedBlob(null);
  };

  const movePdf = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pdfs.length - 1) return;

    const newPdfs = [...pdfs];
    const temp = newPdfs[index];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    newPdfs[index] = newPdfs[targetIdx];
    newPdfs[targetIdx] = temp;

    setPdfs(newPdfs);
    setSuccess(false);
    setMergedBlob(null);
  };

  const mergePdfFiles = async () => {
    if (pdfs.length < 2) {
      setError('Please add at least 2 PDF files to merge.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const pdfObj of pdfs) {
        const fileBytes = await new Promise<Uint8Array>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(new Uint8Array(e.target.result as ArrayBuffer));
            } else {
              reject(new Error('Failed to read file bytes.'));
            }
          };
          reader.onerror = (err) => reject(err);
          reader.readAsArrayBuffer(pdfObj.file);
        });

        const srcDoc = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const generatedBlob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
      setMergedBlob(generatedBlob);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to merge PDF files. Some files might be password protected or corrupted.');
    } finally {
      setLoading(false);
    }
  };

  const downloadMergedPdf = () => {
    if (!mergedBlob) return;
    saveAs(mergedBlob, `merged_document.pdf`);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
        <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20 text-violet-400">
          <Merge className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Merge PDF</h1>
          <p className="text-slate-400 text-sm mt-1">Combine multiple PDF files into a single document in your preferred order locally.</p>
        </div>
      </div>

      {/* Main Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Info & Action */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-violet-400" /> Actions
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Order matters. Use the up and down arrows to arrange the files in the sequence they should appear in the final merged PDF.
            </p>

            {/* Action button */}
            <button
              onClick={mergePdfFiles}
              disabled={pdfs.length < 2 || loading}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                pdfs.length < 2 
                  ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                  : loading
                    ? 'bg-violet-700 text-white border border-violet-600 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-500 text-white border border-violet-500 shadow-violet-600/20'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> Merging files...
                </>
              ) : (
                <>
                  <Merge className="w-5 h-5" /> Merge PDFs
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Upload / File list */}
        <div className="md:col-span-2 space-y-6">
          {/* Upload Zone */}
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/10 rounded-3xl p-8 text-center cursor-pointer transition group"
          >
            <input 
              type="file" 
              accept=".pdf" 
              multiple 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 group-hover:text-violet-400 transition">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-md font-bold text-white mt-4">Add PDF files to merge</h3>
            <p className="text-slate-400 text-xs mt-1">
              Drag PDFs here or click to browse. You need at least 2 files.
            </p>
          </div>

          {/* Error messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-300">Merging Failed</h4>
                <p className="text-sm mt-1 text-red-400/90">{error}</p>
              </div>
            </div>
          )}

          {/* PDF Queue & Success results */}
          {pdfs.length > 0 && (
            <div className="space-y-6">
              {/* Success Result */}
              {success && mergedBlob && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-wrap gap-4 items-center justify-between shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/15 rounded-xl border border-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">PDFs Merged Successfully!</h4>
                      <p className="text-xs text-slate-400">Combined {pdfs.length} files • {(mergedBlob.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={downloadMergedPdf}
                    className="py-2.5 px-5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-violet-600/10"
                  >
                    <Download className="w-4 h-4" /> Download Merged PDF
                  </button>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">PDF Queue ({pdfs.length})</h3>
                  <button 
                    onClick={() => setPdfs([])} 
                    className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-2">
                  {pdfs.map((pdf, idx) => (
                    <div 
                      key={pdf.id} 
                      className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-red-400 shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-xs text-white truncate max-w-[200px] sm:max-w-xs">{pdf.file.name}</h4>
                          <p className="text-[10px] text-slate-500">{(pdf.file.size / (1024 * 1024)).toFixed(2)} MB • Index: {idx + 1}</p>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => movePdf(idx, 'up')}
                          disabled={idx === 0}
                          className={`p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer ${idx === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => movePdf(idx, 'down')}
                          disabled={idx === pdfs.length - 1}
                          className={`p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer ${idx === pdfs.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removePdf(pdf.id)}
                          className="p-1.5 rounded bg-slate-950 border border-slate-800 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition cursor-pointer ml-2"
                          title="Remove PDF"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
