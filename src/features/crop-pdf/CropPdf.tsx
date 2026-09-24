import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { 
  Crop,
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Settings,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

type DragAction = 'none' | 'drawing' | 'moving' | 'nw' | 'ne' | 'sw' | 'se';

export default function CropPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

  // Pagination & Options
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [cropScope, setCropScope] = useState<'all' | 'current'>('all');

  // Interactive Canvas & Crop Area
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [pdfViewport, setPdfViewport] = useState<{ width: number; height: number } | null>(null);

  // Dragging State
  const [dragAction, setDragAction] = useState<DragAction>('none');
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialCrop, setInitialCrop] = useState<CropArea | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a valid PDF file.');
        return;
      }
      loadFile(selectedFile);
    }
  };

  const loadFile = (selectedFile: File) => {
    setFile(selectedFile);
    setSuccess(false);
    setCroppedBlob(null);
    setError(null);
    setCurrentPage(1);
    setCropArea(null);
    renderPdfPage(selectedFile, 1);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a valid PDF file.');
        return;
      }
      loadFile(selectedFile);
    }
  };

  // Render PDF Page on Canvas
  const renderPdfPage = async (pdfFile: File, pageNum: number) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setTotalPages(pdf.numPages);

      const page = await pdf.getPage(pageNum);
      // Auto fit scale to container width if needed (e.g., scale 1.2 for crisp render)
      const viewport = page.getViewport({ scale: 1.2 });
      setPdfViewport({ width: viewport.width, height: viewport.height });

      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvas: canvas,
        canvasContext: context,
        viewport,
      }).promise;

      // Default crop area (10% padding from edge)
      if (!cropArea) {
        setCropArea({
          x: viewport.width * 0.1,
          y: viewport.height * 0.1,
          width: viewport.width * 0.8,
          height: viewport.height * 0.8,
        });
      }
    } catch (err) {
      console.error('Error rendering PDF:', err);
      setError('Could not preview PDF page.');
    }
  };

  useEffect(() => {
    if (file) {
      renderPdfPage(file, currentPage);
    }
  }, [currentPage]);

  // Handle Drag Start
  const handleMouseDown = (e: React.MouseEvent, action: DragAction) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setDragAction(action);
    setDragStart({ x: mouseX, y: mouseY });

    if (action === 'drawing') {
      const newBox = { x: mouseX, y: mouseY, width: 0, height: 0 };
      setCropArea(newBox);
      setInitialCrop(newBox);
    } else if (cropArea) {
      setInitialCrop({ ...cropArea });
    }
  };

  // Smooth Global Window Mouse Movement Listeners
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragAction === 'none' || !containerRef.current || !initialCrop || !pdfViewport) return;

    const rect = containerRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(e.clientX - rect.left, pdfViewport.width));
    const currentY = Math.max(0, Math.min(e.clientY - rect.top, pdfViewport.height));

    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;

    if (dragAction === 'drawing') {
      const width = currentX - initialCrop.x;
      const height = currentY - initialCrop.y;
      setCropArea({
        x: width < 0 ? currentX : initialCrop.x,
        y: height < 0 ? currentY : initialCrop.y,
        width: Math.abs(width),
        height: Math.abs(height),
      });
    } else if (dragAction === 'moving') {
      const newX = Math.max(0, Math.min(initialCrop.x + deltaX, pdfViewport.width - initialCrop.width));
      const newY = Math.max(0, Math.min(initialCrop.y + deltaY, pdfViewport.height - initialCrop.height));
      setCropArea({
        ...initialCrop,
        x: newX,
        y: newY,
      });
    } else if (dragAction === 'nw') {
      const newW = initialCrop.width - deltaX;
      const newH = initialCrop.height - deltaY;
      if (newW > 20 && newH > 20) {
        setCropArea({
          x: initialCrop.x + deltaX,
          y: initialCrop.y + deltaY,
          width: newW,
          height: newH,
        });
      }
    } else if (dragAction === 'se') {
      const newW = Math.min(pdfViewport.width - initialCrop.x, initialCrop.width + deltaX);
      const newH = Math.min(pdfViewport.height - initialCrop.y, initialCrop.height + deltaY);
      if (newW > 20 && newH > 20) {
        setCropArea({
          ...initialCrop,
          width: newW,
          height: newH,
        });
      }
    } else if (dragAction === 'ne') {
      const newW = Math.min(pdfViewport.width - initialCrop.x, initialCrop.width + deltaX);
      const newH = initialCrop.height - deltaY;
      if (newW > 20 && newH > 20) {
        setCropArea({
          ...initialCrop,
          y: initialCrop.y + deltaY,
          width: newW,
          height: newH,
        });
      }
    } else if (dragAction === 'sw') {
      const newW = initialCrop.width - deltaX;
      const newH = Math.min(pdfViewport.height - initialCrop.y, initialCrop.height + deltaY);
      if (newW > 20 && newH > 20) {
        setCropArea({
          ...initialCrop,
          x: initialCrop.x + deltaX,
          width: newW,
          height: newH,
        });
      }
    }
  }, [dragAction, dragStart, initialCrop, pdfViewport]);

  const handleMouseUp = useCallback(() => {
    setDragAction('none');
  }, []);

  useEffect(() => {
    if (dragAction !== 'none') {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragAction, handleMouseMove, handleMouseUp]);

  const handleReset = () => {
    if (pdfViewport) {
      setCropArea({
        x: pdfViewport.width * 0.1,
        y: pdfViewport.height * 0.1,
        width: pdfViewport.width * 0.8,
        height: pdfViewport.height * 0.8,
      });
    }
  };

  // Crop & Download PDF
  const cropPdf = async () => {
    if (!file || !cropArea || !pdfViewport) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page, index) => {
        if (cropScope === 'current' && index + 1 !== currentPage) {
          return;
        }

        const { width: origWidth, height: origHeight } = page.getSize();
        const scaleX = origWidth / pdfViewport.width;
        const scaleY = origHeight / pdfViewport.height;

        // PDF coordinate conversion (Bottom-Left is origin)
        const cropX = cropArea.x * scaleX;
        const cropY = (pdfViewport.height - (cropArea.y + cropArea.height)) * scaleY;
        const cropW = cropArea.width * scaleX;
        const cropH = cropArea.height * scaleY;

        page.setCropBox(cropX, cropY, cropW, cropH);
      });

     const pdfBytes = await pdfDoc.save();

      const bytes = new Uint8Array(pdfBytes);

      const blob = new Blob(
        [bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength
        )],
        {
          type: "application/pdf",
        }
      );
;
      setCroppedBlob(blob);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to crop PDF.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCropped = () => {
    if (!croppedBlob) return;
    saveAs(croppedBlob, `${file?.name.replace(/\.pdf$/i, '')}_cropped.pdf`);
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Top Header */}
      <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
        <div className="p-3 rounded-xl border text-[#8B5CF6]"
        style={{ backgroundColor: "rgba(139, 92, 246, 0.10)", borderColor: "var(--border)" }}>
          <Crop className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-heading)]">Crop PDF</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Select and crop custom areas visually with your mouse cursor.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Options Panel (Dark Theme) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <h2 className="text-lg font-bold text-[var(--text-heading)] flex items-center gap-2">
                <Settings className="w-5 h-5 text-violet-400" /> Options
              </h2>
              {file && (
                <button
                  onClick={handleReset}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Selection
                </button>
              )}
            </div>

            {/* Scope Selection */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Apply Crop To:</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl cursor-pointer hover:border-[var(--border-hover)] transition">
                  <input
                    type="radio"
                    name="scope"
                    value="all"
                    checked={cropScope === 'all'}
                    onChange={() => setCropScope('all')}
                    className="accent-violet-500 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-[var(--text-primary)]">All pages</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl cursor-pointer hover:border-[var(--border-hover)] transition">
                  <input
                    type="radio"
                    name="scope"
                    value="current"
                    checked={cropScope === 'current'}
                    onChange={() => setCropScope('current')}
                    className="accent-violet-500 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-[var(--text-primary)]">Current page ({currentPage})</span>
                </label>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={cropPdf}
              disabled={!file || loading || !cropArea}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                !file || !cropArea
                  ? 'bg-[var(--bg-hover)] text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed'
                  : loading
                    ? 'bg-violet-700 text-white border border-violet-600 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-500 text-white border border-violet-500 shadow-violet-600/20 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> Cropping...
                </>
              ) : (
                <>
                  <Crop className="w-5 h-5" /> Crop PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Preview & Cursor Cropping Area (Dark Theme) */}
        <div className="lg:col-span-2 space-y-6">
          {!file ? (
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] hover:border-violet-500/50 hover:bg-[var(--bg-surface-60)] rounded-3xl p-16 text-center cursor-pointer transition group min-h-[400px]"
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
              <p className="text-[var(--text-secondary)] text-sm mt-2 max-w-xs">Or click to browse and select a file to crop.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File details banner */}
              <div className="bg-[var(--bg-surface-60)] border border-[var(--border)] rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-500/15 rounded-xl border border-red-500/20 text-red-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--text-heading)] truncate max-w-xs sm:max-w-md">{file.name}</h4>
                    <p className="text-xs text-[var(--text-secondary)]">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setSuccess(false);
                    setCroppedBlob(null);
                    setError(null);
                  }}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-400">Error</h4>
                    <p className="text-sm mt-1 text-red-400/90">{error}</p>
                  </div>
                </div>
              )}

              {/* Success & Download Box */}
              {success && croppedBlob && (
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-400">PDF Cropped Successfully!</h4>
                      <p className="text-sm mt-1 text-emerald-400/90">{(croppedBlob.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={downloadCropped}
                    className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-violet-600/10"
                  >
                    <Download className="w-4 h-4" /> Download Cropped PDF
                  </button>
                </div>
              )}
              {/* Visual Crop Viewer Box */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col items-center justify-center overflow-x-auto">
                <p className="text-xs text-[var(--text-secondary)] mb-4 font-medium">
                  💡 Click & drag to draw a box, or drag inside/corners of the selection box to adjust.
                </p>

                {/* Canvas & Selection Wrapper */}
                <div
                  ref={containerRef}
                  className="relative select-none border border-[var(--border-hover)] bg-[var(--bg-base)] shadow-2xl cursor-crosshair overflow-hidden"
                  onMouseDown={(e) => handleMouseDown(e, 'drawing')}
                >
                  <canvas ref={canvasRef} className="block pointer-events-none" />

                  {/* Dynamic Crop Overlay Box */}
                  {cropArea && (
                    <div
                      className="absolute border-2 border-violet-400 bg-violet-500/20 shadow-lg cursor-move"
                      style={{
                        left: `${cropArea.x}px`,
                        top: `${cropArea.y}px`,
                        width: `${cropArea.width}px`,
                        height: `${cropArea.height}px`,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, 'moving')}
                    >
                      {/* Corner Handles */}
                      <div
                        className="w-3.5 h-3.5 bg-violet-400 border border-white absolute -top-1.5 -left-1.5 cursor-nwse-resize rounded-full"
                        onMouseDown={(e) => handleMouseDown(e, 'nw')}
                      />
                      <div
                        className="w-3.5 h-3.5 bg-violet-400 border border-white absolute -top-1.5 -right-1.5 cursor-nesw-resize rounded-full"
                        onMouseDown={(e) => handleMouseDown(e, 'ne')}
                      />
                      <div
                        className="w-3.5 h-3.5 bg-violet-400 border border-white absolute -bottom-1.5 -left-1.5 cursor-nesw-resize rounded-full"
                        onMouseDown={(e) => handleMouseDown(e, 'sw')}
                      />
                      <div
                        className="w-3.5 h-3.5 bg-violet-400 border border-white absolute -bottom-1.5 -right-1.5 cursor-nwse-resize rounded-full"
                        onMouseDown={(e) => handleMouseDown(e, 'se')}
                      />
                    </div>
                  )}
                </div>

                {/* Page Navigation */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center gap-4 bg-[var(--bg-base)] border border-[var(--border)] px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)]">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      className="p-1 hover:bg-[var(--bg-hover)] rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      className="p-1 hover:bg-[var(--bg-hover)] rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}