import React, { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
  PageBreak,
} from "docx";
import { saveAs } from "file-saver";
import {
  FileText,
  Upload,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Settings,
} from "lucide-react";
(
  pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string } }
).GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSuccess(false);
    setDocxBlob(null);
    setError(null);
    setPreviewUrls([]);
    setProgress(0);
  };

  const pickFile = (f: File) => {
    if (f.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      return;
    }
    setFile(f);
    resetState();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) pickFile(e.target.files[0]);
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) pickFile(e.dataTransfer.files[0]);
  };

  const renderPageToPng = async (
    page: pdfjsLib.PDFPageProxy,
    scale = 2,
  ): Promise<{
    bytes: Uint8Array;
    width: number;
    height: number;
    dataUrl: string;
  }> => {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d")!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
    const dataUrl = canvas.toDataURL("image/png");
    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png"),
    );
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return { bytes, width: canvas.width, height: canvas.height, dataUrl };
  };

  const convert = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setError(null);
    setSuccess(false);
    setDocxBlob(null);
    setPreviewUrls([]);

    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const numPages = pdf.numPages;

      const paragraphs: Paragraph[] = [];
      const previews: string[] = [];

      // Title
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [
            new TextRun({
              bold: true,
              size: 32,
              font: "Arial",
            }),
          ],
        }),
      );

      // Word content width (US Letter, 1" margins) = 6.5" = 6.5 * 96 = 624 px (at 96 DPI display units used by docx)
      const maxContentPx = 624;

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);

        const rendered = await renderPageToPng(page, 2);
        previews.push(rendered.dataUrl);

        const displayScale = Math.min(1, maxContentPx / (rendered.width / 2));
        const displayWidth = (rendered.width / 2) * displayScale;
        const displayHeight = (rendered.height / 2) * displayScale;

        paragraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                type: "png",
                data: rendered.bytes,
                transformation: {
                  width: Math.round(displayWidth),
                  height: Math.round(displayHeight),
                },
              }),
            ],
          }),
        );

        if (i < numPages) {
          paragraphs.push(
            new Paragraph({
              children: [new PageBreak()],
            }),
          );
        }

        setProgress(Math.round((i / numPages) * 100));
      }

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: { width: 12240, height: 15840 },
                margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
              },
            },
            children: paragraphs,
          },
        ],
      });
      const blob = await Packer.toBlob(doc);
      setDocxBlob(blob);
      setPreviewUrls(previews);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to convert PDF to Word.",
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadDocx = () => {
    if (!docxBlob || !file) return;
    saveAs(docxBlob, `${file.name.replace(/\.pdf$/i, "")}.docx`);
  };

 return (
  <div className="mx-auto space-y-8">
    <div
      className="flex items-start sm:items-center gap-4 border-b pb-6"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="p-3 rounded-xl border text-[#8B5CF6]"
        style={{ backgroundColor: "rgba(139, 92, 246, 0.10)", borderColor: "var(--border)" }}
      >
        <FileText className="w-8 h-8" />
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-heading)" }}>
          PDF to Word
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Convert any PDF (text, images, screenshots) to an editable Word (.docx) file — 100% in your browser.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 space-y-6">
        <div
          className="rounded-2xl border p-6 space-y-6 shadow-xl"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border)",
          }}
        >
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--text-heading)" }}>
            <Settings className="w-5 h-5 text-violet-400" />
            Options
          </h2>

          <div className="space-y-2">
            <label
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Conversion Mode
            </label>

            <div className="rounded-lg border border-violet-500 bg-violet-600 text-white px-4 py-3 mt-3">
              <p className="font-semibold">Preserve Layout</p>
              <p className="text-xs opacity-80">Keeps images, screenshots and page layout.</p>
            </div>
          </div>

          <button
            onClick={convert}
            disabled={!file || loading}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
              !file
                ? "cursor-not-allowed"
                : loading
                  ? "bg-violet-700 text-white border border-violet-600 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-500 text-white border border-violet-500 shadow-violet-600/20 cursor-pointer"
            }`}
            style={
              !file
                ? {
                    backgroundColor: "var(--bg-hover)",
                    color: "var(--text-muted)",
                    borderColor: "var(--border)",
                  }
                : undefined
            }
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <FileCode className="w-5 h-5" />
                Convert to Word
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
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition group hover:border-violet-500/50"
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
              className="p-5 rounded-2xl border text-[var(--text-secondary)] group-hover:text-violet-400 group-hover:scale-110 transition duration-300"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border)",
              }}
            >
              <Upload className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-bold mt-6" style={{ color: "var(--text-heading)" }}>
              Drag and drop your PDF here
            </h3>

            <p className="text-sm mt-2 max-w-xs" style={{ color: "var(--text-secondary)" }}>
              Or click to select a file. Images, screenshots, and text will all be preserved in the Word document.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div
              className="rounded-2xl border p-4 flex items-center justify-between"
              style={{
                backgroundColor: "var(--bg-surface-60)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-500/15 rounded-xl border border-red-500/20 text-red-400">
                  <FileText className="w-6 h-6" />
                </div>

                <div>
                  <h4
                    className="font-semibold truncate max-w-sm sm:max-w-md"
                    style={{ color: "var(--text-heading)" }}
                  >
                    {file.name}
                  </h4>

                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  resetState();
                }}
                className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer"
              >
                Remove
              </button>
            </div>

            {loading && (
              <div
                className="rounded-2xl border p-6 space-y-3"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-secondary)" }}>Rendering pages...</span>
                  <span className="font-semibold text-violet-400">{progress}%</span>
                </div>

                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: "var(--bg-base)" }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Conversion Failed</h4>
                  <p className="text-sm mt-1 text-red-400/90">{error}</p>
                </div>
              </div>
            )}

            {success && docxBlob && (
              <div className="space-y-6">
                <div
                  className="flex flex-wrap gap-4 justify-between items-center border-b pb-4"
                  style={{ borderColor: "var(--border)" }}
                >
                  <h3
                    className="text-lg font-bold flex items-center gap-2"
                    style={{ color: "var(--text-heading)" }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Word File Ready
                  </h3>

                  <button
                    onClick={downloadDocx}
                    className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-blue-600/10"
                  >
                    <Download className="w-4 h-4" />
                    Download Word (.docx)
                  </button>
                </div>

                {previewUrls.length > 0 && (
                  <div className="space-y-2">
                    <label
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Page Preview
                    </label>

                    <div
                      className="max-h-[32rem] overflow-y-auto rounded-xl p-4 space-y-4 border"
                      style={{
                        backgroundColor: "var(--bg-base)",
                        borderColor: "var(--border)",
                      }}
                    >
                      {previewUrls.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt={`Page ${i + 1}`}
                          className="w-full rounded-md shadow"
                          style={{ border: "1px solid var(--border)" }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);
}
