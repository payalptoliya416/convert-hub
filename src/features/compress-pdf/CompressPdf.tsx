import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { 
  Minimize2, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Settings
} from 'lucide-react';

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
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
      setCompressedBlob(null);
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
      setSuccess(false);
      setCompressedBlob(null);
      setError(null);
    }
  };

  const compressPdfFile = async () => {
    if (!file) return;

    setLoading(true);
    setProgress(30);
    setError(null);
    setSuccess(false);
    setOriginalSize(file.size);

    try {
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
        reader.readAsArrayBuffer(file);
      });

      setProgress(60);

      const pdfDoc = await PDFDocument.load(fileBytes);
      
      const cleanedPdf = await PDFDocument.create();
      const copiedPages = await cleanedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => cleanedPdf.addPage(page));

      setProgress(85);

      const compressedPdfBytes = await cleanedPdf.save({
        useObjectStreams: true
      });

      const generatedBlob = new Blob(
        [compressedPdfBytes.slice()],
        { type: "application/pdf" }
      );
      setCompressedBlob(generatedBlob);
      setCompressedSize(generatedBlob.size);
      setProgress(100);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to compress PDF file.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCompressedPdf = () => {
    if (!compressedBlob) return;
    const name = file?.name.replace(/\.pdf$/i, '') || 'document';
    saveAs(compressedBlob, `${name}_compressed.pdf`);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
          <Minimize2 className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-heading)' }}>Compress PDF</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Reduce PDF file size by stripping metadata and optimizing document streams locally.</p>
        </div>
      </div>

      {/* Main Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Options */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-2xl border p-6 space-y-6 shadow-xl" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <Settings className="w-5 h-5 text-violet-400" /> Options
            </h2>

            {/* Action button */}
            <button
              onClick={compressPdfFile}
              disabled={!file || loading}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                !file 
                  ? 'border border-[var(--border)] cursor-not-allowed'
                  : loading
                    ? 'bg-violet-700 text-[var(--text-heading)] border border-violet-600 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-500 text-[var(--text-heading)] border border-violet-500 shadow-violet-600/20'
              }`}
              style={!file ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)' } : undefined}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> Optimizing...
                </>
              ) : (
                <>
                  <Minimize2 className="w-5 h-5" /> Compress PDF
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
              className="flex flex-col items-center justify-center border-2 border-dashed hover:border-violet-500/50 rounded-3xl p-16 text-center cursor-pointer transition group"
              style={{ borderColor: 'var(--border)' }}
            >
              <input 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div className="p-5 rounded-2xl border text-[var(--text-secondary)] group-hover:text-violet-400 group-hover:scale-110 transition duration-300" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                <Upload className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mt-6" style={{ color: 'var(--text-heading)' }}>Drag and drop your PDF here</h3>
              <p className="text-sm mt-2 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Or click to browse. We will strip structural redundancies and optimize output streams.
              </p>
            </div>
          ) : (
            /* Conversion Progress & Output details */
            <div className="space-y-6">
              <div className="border rounded-2xl p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--bg-surface-60)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-500/15 rounded-xl border border-red-500/20 text-red-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold truncate max-w-sm sm:max-w-md" style={{ color: 'var(--text-heading)' }}>{file.name}</h4>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setSuccess(false);
                    setCompressedBlob(null);
                    setError(null);
                  }}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {/* Progress Bar */}
              {loading && (
                <div className="border rounded-2xl p-6 space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>Rebuilding page layers...</span>
                    <span className="font-semibold text-violet-400">{progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
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
                    <h4 className="font-semibold text-red-300">Compression Failed</h4>
                    <p className="text-sm mt-1 text-red-400/90">{error}</p>
                  </div>
                </div>
              )}

              {/* Success output */}
              {success && compressedBlob && (
                <div className="space-y-6">
                  <div className="border rounded-2xl p-6 flex flex-wrap gap-4 items-center justify-between shadow-2xl" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-500/15 rounded-xl border border-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold" style={{ color: 'var(--text-heading)' }}>PDF Compressed Successfully!</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <span className="line-through">{(originalSize / (1024 * 1024)).toFixed(2)} MB</span>
                          <span className="text-emerald-400 font-semibold">{(compressedSize / (1024 * 1024)).toFixed(2)} MB</span>
                          <span className="px-1.5 py-0.2 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400 font-bold">
                            -{Math.round(((originalSize - compressedSize) / originalSize) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={downloadCompressedPdf}
                      className="py-2.5 px-5 bg-cyan-600 hover:bg-cyan-500 text-[var(--text-heading)] rounded-lg text-sm font-semibold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-600/10"
                    >
                      <Download className="w-4 h-4" /> Download Compressed PDF
                    </button>
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
