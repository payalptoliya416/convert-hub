import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pptxgen from 'pptxgenjs';
import { 
  Presentation, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Settings,
  Layout
} from 'lucide-react';

// Configure pdfjs worker locally
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PageImage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

export default function PdfToPpt() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<PageImage[]>([]);
  const [success, setSuccess] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'fit' | 'original'>('original');
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
      setPages([]);
      setSuccess(false);
      setError(null);
    }
  };

  const convertPdfToPpt = async () => {
    if (!file) return;

    setLoading(true);
    setProgress(0);
    setError(null);
    setPages([]);
    setSuccess(false);

    try {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
          const loadingTask = pdfjsLib.getDocument({ data: typedarray });
          const pdf = await loadingTask.promise;
          const numPages = pdf.numPages;
          const renderedPagesList: PageImage[] = [];

          for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            
            // Using 2x scale for high resolution page screenshots
            const viewport = page.getViewport({ scale: 2 });
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
            
            const dataUrl = canvas.toDataURL('image/png');
            renderedPagesList.push({
              pageNumber: i,
              dataUrl,
              width: viewport.width,
              height: viewport.height
            });

            setProgress(Math.round((i / numPages) * 100));
          }

          setPages(renderedPagesList);
          setSuccess(true);
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'Failed to render PDF pages.');
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

  const downloadPptx = async () => {
    if (pages.length === 0) return;

    try {
      const pptx = new pptxgen();

      if (layoutMode === 'original' && pages.length > 0) {
        // Use the first page dimensions (converted to inches: 72 points per inch)
        // Set custom layout for the presentation so slides exactly match the PDF page size
        const firstPage = pages[0];
        const widthInches = (firstPage.width / 2) / 72; // Divide by 2 because scale is 2
        const heightInches = (firstPage.height / 2) / 72;

        pptx.defineLayout({
          name: 'CUSTOM_PDF',
          width: widthInches,
          height: heightInches
        });
        pptx.layout = 'CUSTOM_PDF';
      } else {
        // Standard widescreen 16:9
        pptx.layout = 'LAYOUT_16x9';
      }

      pages.forEach((page) => {
        const slide = pptx.addSlide();
        // Insert page snapshot covering 100% of the slide
        slide.addImage({
          data: page.dataUrl,
          x: 0,
          y: 0,
          w: '100%',
          h: '100%'
        });
      });

      const fileName = `${file?.name.replace(/\.pdf$/i, '')}.pptx`;
      await pptx.writeFile({ fileName });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create PPTX file.');
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
        <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20 text-orange-400">
          <Presentation className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">PDF to PowerPoint</h1>
          <p className="text-slate-400 text-sm mt-1">Convert your PDF pages into fully formatted PowerPoint presentation slides.</p>
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

            {/* Slide Layout style */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Layout className="w-3.5 h-3.5" /> Slide Layout
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setLayoutMode('original')}
                  className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition border text-left cursor-pointer flex justify-between items-center ${
                    layoutMode === 'original'
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Match PDF Size</span>
                  <span className="text-xs opacity-80">(Recommended)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('fit')}
                  className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition border text-left cursor-pointer flex justify-between items-center ${
                    layoutMode === 'fit'
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Fit 16:9 Slides</span>
                  <span className="text-xs opacity-80">(Standard PPTX)</span>
                </button>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={convertPdfToPpt}
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
                  <RefreshCw className="w-5 h-5 animate-spin" /> Rendering Pages...
                </>
              ) : (
                <>
                  <Presentation className="w-5 h-5" /> Load PDF Pages
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
                Or click to browse. We will render pages as high-fidelity images and pack them into slides.
              </p>
            </div>
          ) : (
            /* Conversion Progress & Slide Export */
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
                    setPages([]);
                    setSuccess(false);
                    setError(null);
                  }}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {/* Progress Bar */}
              {loading && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Processing page graphics...</span>
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
                    <h4 className="font-semibold text-red-300">Conversion Failed</h4>
                    <p className="text-sm mt-1 text-red-400/90">{error}</p>
                  </div>
                </div>
              )}

              {/* Success output */}
              {success && pages.length > 0 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Slides Rendered ({pages.length})
                    </h3>
                    <button
                      onClick={downloadPptx}
                      className="py-2 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-orange-600/10"
                    >
                      <Download className="w-4 h-4" /> Download PowerPoint (.pptx)
                    </button>
                  </div>

                  {/* Slide Carousel Preview */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {pages.map((p) => (
                      <div 
                        key={p.pageNumber} 
                        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow"
                      >
                        <div className="aspect-[16/9] overflow-hidden bg-slate-950 flex items-center justify-center p-2">
                          <img 
                            src={p.dataUrl} 
                            alt={`Slide ${p.pageNumber}`} 
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 text-xs text-center font-semibold text-slate-300">
                          Slide {p.pageNumber}
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
