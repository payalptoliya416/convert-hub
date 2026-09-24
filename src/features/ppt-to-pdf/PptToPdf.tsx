import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import {
  Presentation,
  Upload,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Settings,
} from 'lucide-react';

type SlideImage = {
  dataUrl: string;
  x: number; // EMU
  y: number;
  cx: number;
  cy: number;
  mime: string;
};

type SlideText = {
  text: string;
  x: number;
  y: number;
  cx: number;
  cy: number;
  size: number; // pt
  bold: boolean;
};

type ParsedSlide = {
  images: SlideImage[];
  texts: SlideText[];
};

const EMU_PER_INCH = 914400;

function mimeFromExt(ext: string): string {
  const e = ext.toLowerCase();
  if (e === 'jpg' || e === 'jpeg') return 'image/jpeg';
  if (e === 'png') return 'image/png';
  if (e === 'gif') return 'image/gif';
  if (e === 'bmp') return 'image/bmp';
  if (e === 'webp') return 'image/webp';
  return 'image/png';
}

function jsPdfFormatFromMime(mime: string): 'JPEG' | 'PNG' {
  return mime === 'image/jpeg' ? 'JPEG' : 'PNG';
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function parseXml(xml: string): Document {
  return new DOMParser().parseFromString(xml, 'application/xml');
}

// Resolve relative paths within the pptx zip (handles ../)
function resolvePath(base: string, rel: string): string {
  const baseParts = base.split('/').slice(0, -1);
  const relParts = rel.split('/');
  for (const p of relParts) {
    if (p === '..') baseParts.pop();
    else if (p !== '.' && p !== '') baseParts.push(p);
  }
  return baseParts.join('/');
}

async function parsePptx(file: File): Promise<{
  slideWidth: number; // EMU
  slideHeight: number;
  slides: ParsedSlide[];
}> {
  const zip = await JSZip.loadAsync(file);

  // Presentation size
  const presXml = await zip.file('ppt/presentation.xml')?.async('string');
  let slideWidth = 9144000; // default 10in
  let slideHeight = 6858000; // default 7.5in
  if (presXml) {
    const doc = parseXml(presXml);
    const sldSz = doc.getElementsByTagNameNS('*', 'sldSz')[0];
    if (sldSz) {
      slideWidth = parseInt(sldSz.getAttribute('cx') || String(slideWidth), 10);
      slideHeight = parseInt(sldSz.getAttribute('cy') || String(slideHeight), 10);
    }
  }

  // Enumerate slides in numeric order
  const slideFiles = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)\.xml/)![1], 10);
      const nb = parseInt(b.match(/slide(\d+)\.xml/)![1], 10);
      return na - nb;
    });

  const slides: ParsedSlide[] = [];

  for (const slidePath of slideFiles) {
    const slideXml = await zip.file(slidePath)!.async('string');
    const slideDoc = parseXml(slideXml);

    // Load rels
    const relsPath = slidePath.replace(
      /slides\/(slide\d+)\.xml$/,
      'slides/_rels/$1.xml.rels',
    );
    const relsFile = zip.file(relsPath);
    const relMap = new Map<string, string>(); // rId -> target path in zip
    if (relsFile) {
      const relsXml = await relsFile.async('string');
      const relsDoc = parseXml(relsXml);
      const rels = relsDoc.getElementsByTagName('Relationship');
      for (let i = 0; i < rels.length; i++) {
        const id = rels[i].getAttribute('Id')!;
        const target = rels[i].getAttribute('Target')!;
        const resolved = target.startsWith('/')
          ? target.slice(1)
          : resolvePath(slidePath, target);
        relMap.set(id, resolved);
      }
    }

    const images: SlideImage[] = [];
    const texts: SlideText[] = [];

    // Iterate sp (shapes) and pic (pictures)
    const spTree = slideDoc.getElementsByTagNameNS('*', 'spTree')[0];
    if (!spTree) {
      slides.push({ images, texts });
      continue;
    }

    // Pictures
    const pics = spTree.getElementsByTagNameNS('*', 'pic');
    for (let i = 0; i < pics.length; i++) {
      const pic = pics[i];
      const blip = pic.getElementsByTagNameNS('*', 'blip')[0];
      const xfrm = pic.getElementsByTagNameNS('*', 'xfrm')[0];
      if (!blip || !xfrm) continue;
      const embed =
        blip.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'embed') ||
        blip.getAttribute('r:embed');
      if (!embed) continue;
      const target = relMap.get(embed);
      if (!target) continue;
      const mediaFile = zip.file(target);
      if (!mediaFile) continue;
      const blob = await mediaFile.async('blob');
      const ext = target.split('.').pop() || 'png';
      const mime = mimeFromExt(ext);
      const typedBlob = new Blob([blob], { type: mime });
      const dataUrl = await blobToDataUrl(typedBlob);

      const off = xfrm.getElementsByTagNameNS('*', 'off')[0];
      const ext2 = xfrm.getElementsByTagNameNS('*', 'ext')[0];
      const x = off ? parseInt(off.getAttribute('x') || '0', 10) : 0;
      const y = off ? parseInt(off.getAttribute('y') || '0', 10) : 0;
      const cx = ext2 ? parseInt(ext2.getAttribute('cx') || '0', 10) : 0;
      const cy = ext2 ? parseInt(ext2.getAttribute('cy') || '0', 10) : 0;
      images.push({ dataUrl, x, y, cx, cy, mime });
    }

    // Text shapes
    const sps = spTree.getElementsByTagNameNS('*', 'sp');
    for (let i = 0; i < sps.length; i++) {
      const sp = sps[i];
      const xfrm = sp.getElementsByTagNameNS('*', 'xfrm')[0];
      const txBody = sp.getElementsByTagNameNS('*', 'txBody')[0];
      if (!txBody) continue;

      let x = 914400,
        y = 914400,
        cx = 6000000,
        cy = 1000000;
      if (xfrm) {
        const off = xfrm.getElementsByTagNameNS('*', 'off')[0];
        const ext2 = xfrm.getElementsByTagNameNS('*', 'ext')[0];
        if (off) {
          x = parseInt(off.getAttribute('x') || String(x), 10);
          y = parseInt(off.getAttribute('y') || String(y), 10);
        }
        if (ext2) {
          cx = parseInt(ext2.getAttribute('cx') || String(cx), 10);
          cy = parseInt(ext2.getAttribute('cy') || String(cy), 10);
        }
      }

      const paragraphs = txBody.getElementsByTagNameNS('*', 'p');
      for (let p = 0; p < paragraphs.length; p++) {
        const runs = paragraphs[p].getElementsByTagNameNS('*', 'r');
        let paraText = '';
        let size = 18;
        let bold = false;
        for (let r = 0; r < runs.length; r++) {
          const rPr = runs[r].getElementsByTagNameNS('*', 'rPr')[0];
          if (rPr) {
            const sz = rPr.getAttribute('sz');
            if (sz) size = parseInt(sz, 10) / 100;
            if (rPr.getAttribute('b') === '1') bold = true;
          }
          const tEl = runs[r].getElementsByTagNameNS('*', 't')[0];
          if (tEl && tEl.textContent) paraText += tEl.textContent;
        }
        if (paraText.trim().length > 0) {
          texts.push({
            text: paraText,
            x,
            y: y + p * (size * 12700 * 1.4), // rough line offset in EMU
            cx,
            cy,
            size,
            bold,
          });
        }
      }
    }

    slides.push({ images, texts });
  }

  return { slideWidth, slideHeight, slides };
}

async function buildPdf(
  slideWidth: number,
  slideHeight: number,
  slides: ParsedSlide[],
): Promise<Blob> {
  const widthIn = slideWidth / EMU_PER_INCH;
  const heightIn = slideHeight / EMU_PER_INCH;
  const widthMm = widthIn * 25.4;
  const heightMm = heightIn * 25.4;

  // Pass the short edge first + orientation so jsPDF doesn't double-swap
  // dimensions (which was producing an over-wide page).
  const shortEdge = Math.min(widthMm, heightMm);
  const longEdge = Math.max(widthMm, heightMm);
  const orientation: 'landscape' | 'portrait' =
    widthMm >= heightMm ? 'landscape' : 'portrait';

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: [shortEdge, longEdge],
  });

  const emuToMm = (emu: number) => (emu / EMU_PER_INCH) * 25.4;

  for (let i = 0; i < slides.length; i++) {
    if (i > 0) doc.addPage([shortEdge, longEdge], orientation);
    const slide = slides[i];

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, widthMm, heightMm, 'F');

    // Images
    for (const img of slide.images) {
      try {
        doc.addImage(
          img.dataUrl,
          jsPdfFormatFromMime(img.mime),
          emuToMm(img.x),
          emuToMm(img.y),
          emuToMm(img.cx),
          emuToMm(img.cy),
        );
      } catch (e) {
        console.warn('image add failed', e);
      }
    }

    // Texts
    for (const t of slide.texts) {
      doc.setFont('Helvetica', t.bold ? 'bold' : 'normal');
      // pt size; jsPDF setFontSize is pt regardless of unit
      doc.setFontSize(t.size);
      doc.setTextColor(20, 20, 20);
      const xMm = emuToMm(t.x);
      const yMm = emuToMm(t.y) + (t.size * 0.3528); // baseline offset
      const maxW = Math.max(10, emuToMm(t.cx));
      const lines = doc.splitTextToSize(t.text, maxW);
      doc.text(lines, xMm, yMm, { baseline: 'top' });
    }
  }

  return doc.output('blob');
}

export default function PptToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptFile = (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pptx') {
      setError('Please select a valid PowerPoint file (.pptx).');
      return;
    }
    setFile(selectedFile);
    setSuccess(false);
    setPdfBlob(null);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) acceptFile(e.target.files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      acceptFile(e.dataTransfer.files[0]);
  };

  const convertPptToPdf = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    setStatus('Reading .pptx file...');

    try {
      const { slideWidth, slideHeight, slides } = await parsePptx(file);
      if (slides.length === 0) throw new Error('No slides found in this file.');
      setStatus(`Rendering ${slides.length} slide(s) to PDF...`);
      const blob = await buildPdf(slideWidth, slideHeight, slides);
      setPdfBlob(blob);
      setSuccess(true);
      setStatus('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process presentation.';
      console.error(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    if (!pdfBlob || !file) return;
    saveAs(pdfBlob, `${file.name.replace(/\.pptx$/i, '')}.pdf`);
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-start sm:items-center gap-4 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <div className="p-3 rounded-xl border text-[#8B5CF6]"
        style={{ backgroundColor: "rgba(139, 92, 246, 0.10)", borderColor: "var(--border)" }}>
          <Presentation className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-heading)' }}>PowerPoint to PDF</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Convert PowerPoint presentation slides (.pptx) to PDF documents locally — with embedded images preserved.
          </p>
        </div>
      </div>

      {/* Main Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Actions */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-2xl border p-6 space-y-6 shadow-xl" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <Settings className="w-5 h-5 text-violet-400" /> Actions
            </h2>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Slides are parsed from the .pptx package. Embedded images and text are rendered onto a PDF matching your original slide dimensions.
            </p>

            <button
              onClick={convertPptToPdf}
              disabled={!file || loading}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg ${
                !file
                  ? 'bg-[var(--bg-hover)] text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed'
                  : loading
                    ? 'bg-violet-700 text-white border border-violet-600 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-500 text-white border border-violet-500 shadow-violet-600/20 cursor-pointer'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> Rendering...
                </>
              ) : (
                <>
                  <Presentation className="w-5 h-5" /> Convert to PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column */}
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
                accept=".pptx"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div className="p-5 rounded-2xl border text-[var(--text-secondary)] group-hover:text-violet-400 group-hover:scale-110 transition duration-300" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                <Upload className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mt-6" style={{ color: 'var(--text-heading)' }}>Drag and drop your PPTX file here</h3>
              <p className="text-sm mt-2 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Or click to browse. Images and text embedded in your slides will be preserved in the PDF.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--bg-surface-60)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-500/15 rounded-xl border border-orange-500/20 text-orange-400">
                    <Presentation className="w-6 h-6" />
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
                    setPdfBlob(null);
                    setError(null);
                  }}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {loading && (
                <div className="rounded-2xl border p-6 text-center text-sm space-y-2" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-violet-400" />
                  <p>{status || 'Processing presentation...'}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-400">Conversion Failed</h4>
                    <p className="text-sm mt-1 text-red-400/90">{error}</p>
                  </div>
                </div>
              )}

              {success && pdfBlob && (
                <div className="space-y-6">
                  <div className="rounded-2xl border p-6 flex flex-wrap gap-4 items-center justify-between shadow-2xl" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-500/15 rounded-xl border border-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold" style={{ color: 'var(--text-heading)' }}>PDF Compiled Successfully!</h4>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{(pdfBlob.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={downloadPdf}
                      className="py-2.5 px-5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-orange-600/10"
                    >
                      <Download className="w-4 h-4" /> Download PDF Document
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
