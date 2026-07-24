import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { 
  FileImage, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Settings
} from 'lucide-react';

interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
}

export default function ImageToPdf() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('fit');
  const [margin, setMargin] = useState<number>(0); // margin in mm
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addImages(selectedFiles);
    }
  };

  const addImages = (files: File[]) => {
    const validImages = files.filter(f => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      setError('Please select valid image files (PNG, JPG, WebP).');
      return;
    }

    const newImages = validImages.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
    setSuccess(false);
    setPdfBlob(null);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const selectedFiles = Array.from(e.dataTransfer.files);
      addImages(selectedFiles);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const target = prev.find(img => img.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter(img => img.id !== id);
    });
    setSuccess(false);
    setPdfBlob(null);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;

    const newImages = [...images];
    const temp = newImages[index];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    newImages[index] = newImages[targetIdx];
    newImages[targetIdx] = temp;

    setImages(newImages);
    setSuccess(false);
    setPdfBlob(null);
  };

  const convertImagesToPdf = async () => {
    if (images.length === 0) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let doc = new jsPDF();
      let isFirstPage = true;

      for (let i = 0; i < images.length; i++) {
        const imgObj = images[i];
        
        // Load image as HTMLImageElement to get dimensions
        const img: HTMLImageElement = await new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = (err) => reject(err);
          image.src = imgObj.previewUrl;
        });

        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        // Page setup
        if (pageSize === 'fit') {
          // Calculate page dimension matching image aspect ratio
          // px to mm: 1px = 0.264583mm (at 96 DPI)
          // To prevent huge pages, we scale width to 210mm (A4 width) and scale height proportionally
          const pageW = 210;
          const pageH = (imgHeight / imgWidth) * 210;

          if (isFirstPage) {
            doc = new jsPDF({
              orientation: pageW > pageH ? 'landscape' : 'portrait',
              unit: 'mm',
              format: [pageW, pageH]
            });
            isFirstPage = false;
          } else {
            doc.addPage([pageW, pageH], pageW > pageH ? 'landscape' : 'portrait');
          }

          doc.addImage(img, 'PNG', margin, margin, pageW - (margin * 2), pageH - (margin * 2));
        } else {
          // Standard A4 or Letter
          const isA4 = pageSize === 'a4';
          const pageW = isA4 ? 210 : 215.9; // mm
          const pageH = isA4 ? 297 : 279.4; // mm

          if (isFirstPage) {
            doc = new jsPDF({
              orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
              unit: 'mm',
              format: pageSize
            });
            isFirstPage = false;
          } else {
            doc.addPage(pageSize, imgWidth > imgHeight ? 'landscape' : 'portrait');
          }

          // Calculate scaling to fit image inside standard page
          const actualPageW = imgWidth > imgHeight ? pageH : pageW;
          const actualPageH = imgWidth > imgHeight ? pageW : pageH;

          const ratio = Math.min(
            (actualPageW - (margin * 2)) / imgWidth,
            (actualPageH - (margin * 2)) / imgHeight
          );

          const drawW = imgWidth * ratio;
          const drawH = imgHeight * ratio;

          const xOffset = (actualPageW - drawW) / 2;
          const yOffset = (actualPageH - drawH) / 2;

          doc.addImage(img, 'PNG', xOffset, yOffset, drawW, drawH);
        }
      }

      const generatedBlob = doc.output('blob');
      setPdfBlob(generatedBlob);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to convert images to PDF.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    if (!pdfBlob) return;
    const name = images[0]?.file.name.split('.')[0] || 'converted';
    saveAs(pdfBlob, `${name}_images.pdf`);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
        <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
          <FileImage className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Image to PDF</h1>
          <p className="text-slate-400 text-sm mt-1">Convert PNG, JPG, WebP images to a combined high-quality PDF document locally.</p>
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

            {/* Page Size settings */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Page Size Mode</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                <option value="fit">Fit Page to Image Size</option>
                <option value="a4">Standard A4 size</option>
                <option value="letter">US Letter size</option>
              </select>
            </div>

            {/* Margins */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Page Margins</label>
              <select
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                <option value="0">No Margins (0mm)</option>
                <option value="5">Small Margins (5mm)</option>
                <option value="10">Default Margins (10mm)</option>
                <option value="15">Large Margins (15mm)</option>
              </select>
            </div>

            {/* Action button */}
            <button
              onClick={convertImagesToPdf}
              disabled={images.length === 0 || loading}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                images.length === 0 
                  ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                  : loading
                    ? 'bg-violet-700 text-white border border-violet-600 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-500 text-white border border-violet-500 shadow-violet-600/20'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> Packaging...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Compile to PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Upload / Image list */}
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
              accept="image/*" 
              multiple 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 group-hover:text-violet-400 transition">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-md font-bold text-white mt-4">Add images to PDF</h3>
            <p className="text-slate-400 text-xs mt-1">
              Drag images here or click to browse. Reorder and set margins as needed.
            </p>
          </div>

          {/* Error messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-300">Compilation Failed</h4>
                <p className="text-sm mt-1 text-red-400/90">{error}</p>
              </div>
            </div>
          )}

          {/* Image List & Success results */}
          {images.length > 0 && (
            <div className="space-y-6">
              {/* Success Result */}
              {success && pdfBlob && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-wrap gap-4 items-center justify-between shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/15 rounded-xl border border-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">PDF Compiled Successfully!</h4>
                      <p className="text-xs text-slate-400">Contains {images.length} pages • {(pdfBlob.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={downloadPdf}
                    className="py-2.5 px-5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-rose-600/10"
                  >
                    <Download className="w-4 h-4" /> Download PDF Document
                  </button>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Images Queue ({images.length})</h3>
                  <button 
                    onClick={() => setImages([])} 
                    className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-2">
                  {images.map((img, idx) => (
                    <div 
                      key={img.id} 
                      className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                          <img src={img.previewUrl} alt="thumbnail" className="object-cover w-full h-full" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-xs text-white truncate max-w-[200px] sm:max-w-xs">{img.file.name}</h4>
                          <p className="text-[10px] text-slate-500">{(img.file.size / 1024).toFixed(1)} KB • Index: {idx + 1}</p>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => moveImage(idx, 'up')}
                          disabled={idx === 0}
                          className={`p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer ${idx === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(idx, 'down')}
                          disabled={idx === images.length - 1}
                          className={`p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer ${idx === images.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="p-1.5 rounded bg-slate-950 border border-slate-800 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition cursor-pointer ml-2"
                          title="Remove Image"
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
