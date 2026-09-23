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
  <div className="mx-auto space-y-6">
    {/* Header */}
    <div
      className="flex items-center gap-4 border-b pb-5"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
        <Presentation className="h-6 w-6" />
      </div>

      <div className="min-w-0">
        <h1
          className="text-2xl font-bold sm:text-3xl"
          style={{ color: "var(--text-heading)" }}
        >
          PDF to PowerPoint
        </h1>

        <p
          className="mt-1 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          Convert your PDF pages into fully formatted PowerPoint presentation
          slides.
        </p>
      </div>
    </div>

    {/* Main */}
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Options */}
      <div
        className="rounded-2xl border p-5"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mb-5 flex items-center gap-2">
          <Settings className="h-5 w-5 text-violet-400" />

          <h2
            className="text-base font-bold"
            style={{ color: "var(--text-heading)" }}
          >
            Options
          </h2>
        </div>

        {/* Slide Layout */}
        <div className="space-y-3">
          <label
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-secondary)" }}
          >
            <Layout className="h-3.5 w-3.5" />
            Slide Layout
          </label>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setLayoutMode("original")}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition cursor-pointer ${
                layoutMode === "original"
                  ? "border-violet-500 bg-violet-600 text-white"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-violet-500/40 hover:text-[var(--text-heading)]"
              }`}
              style={
                layoutMode !== "original"
                  ? { backgroundColor: "var(--bg-input)" }
                  : {}
              }
            >
              <span className="text-sm font-semibold">Match PDF Size</span>
              <span className="text-[11px] opacity-75">
                (Recommended)
              </span>
            </button>

            <button
              type="button"
              onClick={() => setLayoutMode("fit")}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition cursor-pointer ${
                layoutMode === "fit"
                  ? "border-violet-500 bg-violet-600 text-white"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-violet-500/40 hover:text-[var(--text-heading)]"
              }`}
              style={
                layoutMode !== "fit"
                  ? { backgroundColor: "var(--bg-input)" }
                  : {}
              }
            >
              <span className="text-sm font-semibold">
                Fit 16:9 Slides
              </span>

              <span className="text-[11px] opacity-75">
                (Standard PPTX)
              </span>
            </button>
          </div>
        </div>

        {/* Convert */}
        <button
          onClick={convertPdfToPpt}
          disabled={!file || loading}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition cursor-pointer ${
            !file
              ? "cursor-not-allowed border-[var(--border)] bg-[var(--bg-hover)] text-[var(--text-muted)]"
              : loading
                ? "cursor-not-allowed border-violet-600 bg-violet-700 text-white"
                : "border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-600/10 hover:bg-violet-500"
          }`}
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Rendering Pages...
            </>
          ) : (
            <>
              <Presentation className="h-4 w-4" />
              Load PDF Pages
            </>
          )}
        </button>
      </div>

      {/* Upload / Output */}
      <div className="lg:col-span-2">
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className="group flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition hover:border-violet-500/50"
            style={{ borderColor: "var(--border)" }}
          >
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl border transition duration-300 group-hover:scale-105 group-hover:text-violet-400"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <Upload className="h-7 w-7" />
            </div>

            <h3
              className="mt-5 text-lg font-bold"
              style={{ color: "var(--text-heading)" }}
            >
              Drag and drop your PDF here
            </h3>

            <p
              className="mt-2 max-w-md text-sm leading-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Or click to browse. We will render pages as high-fidelity
              images and pack them into slides.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Selected File */}
            <div
              className="flex items-center justify-between gap-4 rounded-2xl border p-4"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
                  <FileText className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h4
                    className="truncate text-sm font-semibold"
                    style={{ color: "var(--text-heading)" }}
                  >
                    {file.name}
                  </h4>

                  <p
                    className="mt-0.5 text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setPages([]);
                  setSuccess(false);
                  setError(null);
                }}
                className="shrink-0 text-xs font-semibold text-red-400 transition hover:text-red-300 cursor-pointer"
              >
                Remove
              </button>
            </div>

            {/* Progress */}
            {loading && (
              <div
                className="rounded-2xl border p-5"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Processing page graphics...
                  </span>

                  <span className="font-semibold text-violet-400">
                    {progress}%
                  </span>
                </div>

                <div
                  className="h-2 overflow-hidden rounded-full"
                  style={{ backgroundColor: "var(--bg-base)" }}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-400">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <h4 className="text-sm font-semibold">
                    Conversion Failed
                  </h4>

                  <p className="mt-1 text-sm text-red-400/80">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Success */}
            {success && pages.length > 0 && (
              <div
                className="rounded-2xl border p-5"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4" style={{ borderColor: "var(--border)" }}>
                  <h3
                    className="flex items-center gap-2 text-base font-bold"
                    style={{ color: "var(--text-heading)" }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    Slides Rendered ({pages.length})
                  </h3>

                  <button
                    onClick={downloadPptx}
                    className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    Download PowerPoint (.pptx)
                  </button>
                </div>

                {/* Preview */}
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {pages.map((p) => (
                    <div
                      key={p.pageNumber}
                      className="overflow-hidden rounded-xl border"
                      style={{
                        backgroundColor: "var(--bg-surface)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <div
                        className="flex aspect-[16/9] items-center justify-center overflow-hidden p-2"
                        style={{ backgroundColor: "var(--bg-base)" }}
                      >
                        <img
                          src={p.dataUrl}
                          alt={`Slide ${p.pageNumber}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <div
                        className="border-t px-3 py-2 text-center text-xs font-semibold"
                        style={{
                          backgroundColor: "var(--bg-surface)",
                          borderColor: "var(--border)",
                          color: "var(--text-secondary)",
                        }}
                      >
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
