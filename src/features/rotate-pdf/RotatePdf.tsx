import React, { useState, useRef } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { saveAs } from "file-saver";
import {
  RotateCw,
  Upload,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Settings,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function RotatePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rotateAngle, setRotateAngle] = useState(90);
  const [rotatedBlob, setRotatedBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const [previewImage, setPreviewImage] = useState("");
  // const [pageCount, setPageCount] = useState(0);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      setRotatedBlob(null);

      setFile(selectedFile);

      // Generate preview of uploaded PDF
      await generatePreview(selectedFile);

    } catch (err) {
      console.error(err);
      setError("Failed to load PDF preview.");
    } finally {
      setLoading(false);
    }
  };

const generatePreview = async (pdfFile: File | Blob) => {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();

    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
    });

    const pdf = await loadingTask.promise;

    // setPageCount(pdf.numPages);

    const page = await pdf.getPage(1);

    const viewport = page.getViewport({
      scale: 1.5,
    });

    const canvas = document.createElement("canvas");

    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page
      .render({
        canvas,
        canvasContext: context,
        viewport,
      } as any)
      .promise;

    // setPreviewImage(canvas.toDataURL("image/png"));
  } catch (err) {
    console.error("Preview Error:", err);
    setError("Failed to generate preview.");
  }
};

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a valid PDF file.");
        return;
      }
      setFile(selectedFile);
      setSuccess(false);
      setRotatedBlob(null);
      setError(null);
    }
  };

  const rotatePdf = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        const currentRotation = page.getRotation().angle || 0;
        const newRotation = (currentRotation + rotateAngle) % 360;
        page.setRotation(degrees(newRotation));
      });

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([Uint8Array.from(pdfBytes)], {
        type: "application/pdf",
      });

      setRotatedBlob(blob);

      await generatePreview(blob);

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to rotate PDF.");
    } finally {
      setLoading(false);
    }
  };

  const downloadRotated = () => {
    if (!rotatedBlob) return;
    saveAs(rotatedBlob, `${file?.name.replace(/\.pdf$/i, "")}_rotated.pdf`);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mx-auto space-y-8">
      <div className="flex items-start sm:items-center gap-4 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <div className="p-3 rounded-xl border text-[#8B5CF6]"
        style={{ backgroundColor: "rgba(139, 92, 246, 0.10)", borderColor: "var(--border)" }}>
          <RotateCw className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-heading)' }}>Rotate PDF</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Rotate all pages of your PDF document by 90°, 180°, or 270°.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-2xl border p-6 space-y-6 shadow-xl" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <Settings className="w-5 h-5 text-violet-400" /> Options
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Rotation Angle
              </label>
              <select
                value={rotateAngle}
                onChange={(e) => setRotateAngle(Number(e.target.value))}
                className="w-full border rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-heading)' }}
              >
                <option value="90">90° Clockwise</option>
                <option value="180">180° Flip</option>
                <option value="270">270° Counter-clockwise</option>
              </select>
            </div>

            <button
              onClick={rotatePdf}
              disabled={!file || loading}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                !file
                  ? "bg-[var(--bg-hover)] text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed"
                  : loading
                    ? "bg-violet-700 text-white border border-violet-600 cursor-not-allowed"
                    : "bg-violet-600 hover:bg-violet-500 text-white border border-violet-500 shadow-violet-600/20  cursor-pointer"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> Rotating...
                </>
              ) : (
                <>
                  <RotateCw className="w-5 h-5" /> Rotate PDF
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
              <h3 className="text-xl font-bold mt-6" style={{ color: 'var(--text-heading)' }}>
                Drag and drop your PDF here
              </h3>
              <p className="text-sm mt-2 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Or click to browse. All pages will be rotated.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--bg-surface-60)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-500/15 rounded-xl border border-red-500/20 text-red-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold truncate max-w-sm sm:max-w-md" style={{ color: 'var(--text-heading)' }}>
                      {file.name}
                    </h4>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setSuccess(false);
                    setRotatedBlob(null);
                    setError(null);
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
                    <h4 className="font-semibold text-red-400">Error</h4>
                    <p className="text-sm mt-1 text-red-400/90">{error}</p>
                  </div>
                </div>
              )}

              {success && rotatedBlob && (
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-400">
                        PDF Rotated Successfully!
                      </h4>
                      <p className="text-sm mt-1 text-emerald-400/90">
                        Rotation angle: {rotateAngle}°
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={downloadRotated}
                    className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-violet-600/10"
                  >
                    <Download className="w-4 h-4" /> Download Rotated PDF
                  </button>
                </div>
              )}
                  {/* {previewImage && (
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4">
                <h3 className="text-[var(--text-heading)] font-semibold mb-3">
                  PDF Preview
                </h3>

                <img
                  src={previewImage}
                  alt="PDF Preview"
                  className="w-full max-h-[500px] object-contain rounded-lg border border-[var(--border-hover)]"
                />
              </div>
            )} */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
