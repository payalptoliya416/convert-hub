import React, { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { FileImage, Upload, Download, RefreshCw, AlertCircle } from 'lucide-react';

export default function JpgToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (!f.type.startsWith('image/')) {
        setError('Please select a JPG/PNG image file.');
        return;
      }
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setError(null);
      setSuccess(false);
      setPdfBlob(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (!f.type.startsWith('image/')) {
        setError('Please drop a JPG/PNG image file.');
        return;
      }
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setError(null);
      setSuccess(false);
      setPdfBlob(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const triggerFileSelect = () => fileInputRef.current?.click();

  const convertToPdf = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = URL.createObjectURL(file);
      });

      // Convert px to mm approx (96dpi)
      const pxToMm = (px: number) => (px * 25.4) / 96;
      const imgWmm = pxToMm(img.naturalWidth);
      const imgHmm = pxToMm(img.naturalHeight);

      // Use custom page size equal to image size for best quality
      const orientation = img.naturalWidth >= img.naturalHeight ? 'landscape' : 'portrait';
      const doc = new jsPDF({ unit: 'mm', format: [imgWmm, imgHmm], orientation });

      // Draw image filling the page
      doc.addImage(img, 'JPEG', 0, 0, imgWmm, imgHmm);

      const blob = doc.output('blob');
      setPdfBlob(blob);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to convert image to PDF.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    if (!pdfBlob || !file) return;
    const name = file.name.replace(/\.[^/.]+$/, '');
    saveAs(pdfBlob, `${name}.pdf`);
  };

  return (
    <div className="mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
        <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
          <FileImage className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">JPG to PDF</h1>
          <p className="text-slate-400 text-sm mt-1">Quickly convert a JPG (or PNG) image to a single-page PDF.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-white">Options</h2>
            <p className="text-xs text-slate-400">Upload a JPG/PNG file and convert to a single PDF page sized to the image.</p>

            <button
              onClick={convertToPdf}
              disabled={!file || loading}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${!file ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : loading ? 'bg-violet-700 text-white' : 'bg-violet-600 hover:bg-violet-500 text-white'}`}
            >
              {loading ? <><RefreshCw className="w-5 h-5 animate-spin" /> Converting...</> : <><Download className="w-5 h-5" /> Convert</>}
            </button>

            {success && pdfBlob && (
              <button onClick={downloadPdf} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold">Download PDF</button>
            )}

          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/10 rounded-3xl p-16 text-center cursor-pointer transition group"
          >
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 group-hover:text-violet-400 transition duration-300">
              <Upload className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white mt-6">Drop a JPG/PNG here</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-xs">Or click to browse. The output PDF will match the image size and orientation.</p>
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

          {file && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                  {previewUrl && <img src={previewUrl} alt="preview" className="object-cover w-full h-full" />}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{file.name}</h4>
                  <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <div>
                <button onClick={() => { setFile(null); setPreviewUrl(null); setPdfBlob(null); setSuccess(false); }} className="text-xs font-semibold text-red-400">Remove</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
