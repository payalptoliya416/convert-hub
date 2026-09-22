import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { 
  Upload, 
  FileImage, 
  Download, 
  Settings, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';

// Configure pdfjs worker locally
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface RenderedPage {
  pageNumber: number;
  dataUrl: string;
}

export default function PdfToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [imageFormat, setImageFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [scale, setScale] = useState<number>(2); // Default to 2x for high quality
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a valid PDF file.');
        return;
      }
      setFile(selectedFile);
      setPages([]);
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
      setPages([]);
      setError(null);
    }
  };

  const convertPdfToImages = async () => {
    if (!file) return;

    setLoading(true);
    setProgress(0);
    setError(null);
    setPages([]);

    try {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
          const loadingTask = pdfjsLib.getDocument({ data: typedarray });
          const pdf = await loadingTask.promise;
          const numPages = pdf.numPages;
          const renderedPagesList: RenderedPage[] = [];

          for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale });
            
            // Create a canvas to render the page
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (!context) {
              throw new Error('Could not get 2D context for canvas');
            }

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
              canvasContext: context,
              viewport: viewport,
              canvas: canvas
            };

            await page.render(renderContext).promise;
            
            const dataUrl = canvas.toDataURL(imageFormat);
            renderedPagesList.push({
              pageNumber: i,
              dataUrl
            });

            setProgress(Math.round((i / numPages) * 100));
          }

          setPages(renderedPagesList);
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'Failed to render PDF pages. Make sure the file is not corrupted.');
        } finally {
          setLoading(false);
        }
      };

      fileReader.readAsArrayBuffer(file);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during conversion.');
      setLoading(false);
    }
  };

  const downloadSingleImage = (page: RenderedPage) => {
    const ext = imageFormat === 'image/png' ? 'png' : 'jpg';
    saveAs(page.dataUrl, `${file?.name.replace(/\.pdf$/i, '')}_page_${page.pageNumber}.${ext}`);
  };

  const downloadAllAsZip = async () => {
    if (pages.length === 0) return;
    
    const zip = new JSZip();
    const ext = imageFormat === 'image/png' ? 'png' : 'jpg';
    
    pages.forEach((page) => {
      // Remove data URL prefix to get the pure base64 string
      const base64Data = page.dataUrl.split(',')[1];
      zip.file(`${file?.name.replace(/\.pdf$/i, '')}_page_${page.pageNumber}.${ext}`, base64Data, { base64: true });
    });

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${file?.name.replace(/\.pdf$/i, '')}_images.zip`);
    } catch (err) {
      console.error('Failed to create ZIP file:', err);
      setError('Failed to create ZIP file.');
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
          <FileImage className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-heading)]">PDF to Image</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Convert pages of your PDF document into high-resolution PNG or JPG images.</p>
        </div>
      </div>

      {/* Main Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left column: File upload & settings */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-6 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-[var(--text-heading)] flex items-center gap-2">
              <Settings className="w-5 h-5 text-violet-400" /> Options
            </h2>
            
            {/* Format selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Output Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImageFormat('image/png')}
                  className={`py-2 rounded-lg text-sm font-semibold transition border cursor-pointer ${
                    imageFormat === 'image/png'
                      ? 'bg-violet-600 border-violet-500 text-[var(--text-heading)]'
                      : 'bg-[var(--bg-base)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-heading)]'
                  }`}
                >
                  PNG
                </button>
                <button
                  type="button"
                  onClick={() => setImageFormat('image/jpeg')}
                  className={`py-2 rounded-lg text-sm font-semibold transition border cursor-pointer ${
                    imageFormat === 'image/jpeg'
                      ? 'bg-violet-600 border-violet-500 text-[var(--text-heading)]'
                      : 'bg-[var(--bg-base)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-heading)]'
                  }`}
                >
                  JPG
                </button>
              </div>
            </div>

            {/* Scale selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Quality (Scale)</label>
              <select
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg py-2.5 px-3 text-[var(--text-heading)] text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                <option value="1">Standard (72 DPI - 1x)</option>
                <option value="2">Medium (150 DPI - 2x)</option>
                <option value="3">High Quality (300 DPI - 3x)</option>
              </select>
            </div>
            
            {/* Action button */}
            <button
              onClick={convertPdfToImages}
              disabled={!file || loading}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                !file 
                  ? 'bg-[var(--bg-hover)] text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed'
                  : loading
                    ? 'bg-violet-700 text-[var(--text-heading)] border border-violet-600 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-500 text-[var(--text-heading)] border border-violet-500 shadow-violet-600/20'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> Rendering...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" /> Convert to Images
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right column: Drag/Drop area & Preview */}
        <div className="md:col-span-2 space-y-6">
          {!file ? (
            /* Drag and Drop Zone */
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] hover:border-violet-500/50 hover:bg-[var(--bg-surface-60)] rounded-3xl p-16 text-center cursor-pointer transition group"
            >
              <input 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div className="p-5 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] text-[var(--text-secondary)] group-hover:text-violet-400 group-hover:scale-110 transition duration-300">
                <Upload className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-heading)] mt-6">Drag and drop your PDF here</h3>
              <p className="text-[var(--text-secondary)] text-sm mt-2 max-w-xs">
                Or click to browse files from your computer. Files are processed locally.
              </p>
            </div>
          ) : (
            /* File selected panel */
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
                    setPages([]);
                    setError(null);
                  }}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {/* Progress Bar */}
              {loading && (
                <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Rendering pages...</span>
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

              {/* Rendered output / Download Panel */}
              {pages.length > 0 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
                    <h3 className="text-lg font-bold text-[var(--text-heading)] flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Rendered Pages ({pages.length})
                    </h3>
                    <button
                      onClick={downloadAllAsZip}
                      className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-[var(--text-heading)] rounded-lg text-sm font-semibold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/10"
                    >
                      <Download className="w-4 h-4" /> Download All (ZIP)
                    </button>
                  </div>

                  {/* Thumbnail Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {pages.map((page) => (
                      <div 
                        key={page.pageNumber} 
                        className="group relative bg-[var(--bg-surface)] border border-[var(--border-soft)] hover:border-violet-500/40 rounded-xl overflow-hidden shadow transition"
                      >
                        <div className="aspect-[3/4] overflow-hidden bg-[var(--bg-base)] flex items-center justify-center p-2">
                          <img 
                            src={page.dataUrl} 
                            alt={`Page ${page.pageNumber}`} 
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="p-3 bg-[var(--bg-surface-60)] border-t border-[var(--border)] flex justify-between items-center text-xs">
                          <span className="font-semibold text-[var(--text-secondary)]">Page {page.pageNumber}</span>
                          <button
                            onClick={() => downloadSingleImage(page)}
                            className="p-1.5 hover:bg-violet-600/20 text-violet-400 hover:text-violet-300 rounded transition cursor-pointer"
                            title="Download this page"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
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
