import React, { useState, useRef } from 'react';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { 
  FileText, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Settings
} from 'lucide-react';

export default function WordToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [htmlPreview, setHtmlPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext !== 'docx') {
        setError('Please select a valid Word document (.docx).');
        return;
      }
      setFile(selectedFile);
      setSuccess(false);
      setPdfBlob(null);
      setHtmlPreview('');
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
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext !== 'docx') {
        setError('Please select a valid Word document (.docx).');
        return;
      }
      setFile(selectedFile);
      setSuccess(false);
      setPdfBlob(null);
      setHtmlPreview('');
      setError(null);
    }
  };

  const convertWordToPdf = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          
          // Use mammoth to extract HTML content with images
          const result = await mammoth.convertToHtml({ arrayBuffer });
          const html = result.value;
          const docMessages = result.messages || [];
          
          // Log any warnings
          if (docMessages.length > 0) {
            console.warn('Mammoth conversion messages:', docMessages);
          }
          
          setHtmlPreview(html);

          // Create a hidden container to render HTML
          const container = document.createElement('div');
          container.innerHTML = html;
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.top = '-9999px';
          container.style.width = '210mm';
          container.style.backgroundColor = 'white';
          container.style.padding = '20px';
          container.style.fontSize = '11pt';
          container.style.fontFamily = 'Helvetica, Arial, sans-serif';
          container.style.lineHeight = '1.6';
          container.style.color = '#000';
          
          // Style images in container
          const images = container.querySelectorAll('img');
          images.forEach((img) => {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.margin = '10px 0';
          });
          
          document.body.appendChild(container);

          // Wait for all images to load
          const imageLoadPromises: Promise<void>[] = [];
          images.forEach((img: HTMLImageElement) => {
            imageLoadPromises.push(
              new Promise((resolve) => {
                if (img.complete) {
                  resolve();
                } else {
                  img.onload = () => resolve();
                  img.onerror = () => {
                    console.warn('Failed to load image:', img.src);
                    resolve();
                  };
                }
              })
            );
          });

          await Promise.all(imageLoadPromises);

          // Create PDF with content height
          const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });

          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();

          // Extract text and images from container
          let yPosition = 15;
          const margins = { left: 10, right: 10, top: 5, bottom: 10 };
          const contentWidth = pageWidth - margins.left - margins.right;

          // Process paragraphs and images
          container.querySelectorAll('p, img, h1, h2, h3, h4, h5, h6').forEach((element) => {
            if (yPosition > pageHeight - margins.bottom - 10) {
              doc.addPage();
              yPosition = margins.top;
            }

            if (element.tagName === 'IMG') {
              const img = element as HTMLImageElement;
              const imgWidth = Math.min(img.naturalWidth, contentWidth);
              const imgHeight = (img.naturalHeight / img.naturalWidth) * imgWidth;

              if (yPosition + imgHeight > pageHeight - margins.bottom) {
                doc.addPage();
                yPosition = margins.top;
              }

              try {
                doc.addImage(img.src, 'PNG', margins.left, yPosition, imgWidth, imgHeight);
                yPosition += imgHeight + 5;
              } catch (imgErr) {
                console.warn('Could not add image to PDF:', imgErr);
              }
            } else {
              const text = element.textContent || '';
              if (text.trim()) {
                const fontSize = element.tagName.startsWith('H') 
                  ? Math.max(12, 18 - (parseInt(element.tagName[1]) * 2))
                  : 11;
                const isBold = element.tagName.startsWith('H');

                doc.setFont('Helvetica', isBold ? 'bold' : 'normal');
                doc.setFontSize(fontSize);

                const lines = doc.splitTextToSize(text, contentWidth);
                const lineHeight = fontSize / 2.5;

                lines.forEach((line: string) => {
                  if (yPosition > pageHeight - margins.bottom - 5) {
                    doc.addPage();
                    yPosition = margins.top;
                  }
                  doc.text(line, margins.left, yPosition);
                  yPosition += lineHeight;
                });

                yPosition += 2; // Paragraph spacing
              }
            }
          });

          document.body.removeChild(container);

          const generatedBlob = doc.output('blob');
          setPdfBlob(generatedBlob);
          setSuccess(true);
        } catch (err: any) {
          console.error('Conversion error:', err);
          setError(err.message || 'Failed to convert Word file to PDF. Make sure the file is valid and contains supported content.');
        } finally {
          setLoading(false);
        }
      };

      fileReader.readAsArrayBuffer(file);
    } catch (err: any) {
      console.error('File reading error:', err);
      setError(err.message || 'An error occurred during file reading.');
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    if (!pdfBlob) return;
    saveAs(pdfBlob, `${file?.name.replace(/\.docx$/i, '')}.pdf`);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start sm:items-center gap-4 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
          <FileText className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-heading)' }}>Word to PDF</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Convert Microsoft Word (.docx) documents to PDF files locally in your browser.</p>
        </div>
      </div>

      {/* Main Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Options */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-2xl border p-6 space-y-6 shadow-xl" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <Settings className="w-5 h-5 text-violet-400" /> Actions
            </h2>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Mammoth.js parses Word structures client-side. Best suited for text documents with headings, lists, and standard styling.
            </p>

            {/* Action button */}
            <button
              onClick={convertWordToPdf}
              disabled={!file || loading}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                !file 
                  ? 'cursor-not-allowed'
                  : loading
                    ? 'bg-violet-700 text-white border border-violet-600 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-500 text-white border border-violet-500 shadow-violet-600/20'
              }`}
              style={!file ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', borderColor: 'var(--border)' } : undefined}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> Converting...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" /> Convert to PDF
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
              className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] hover:border-violet-500/50 hover:bg-[var(--bg-surface-60)] rounded-3xl p-16 text-center cursor-pointer transition group"
            >
              <input 
                type="file" 
                accept=".docx" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div className="p-5 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] text-[var(--text-secondary)] group-hover:text-violet-400 group-hover:scale-110 transition duration-300">
                <Upload className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-heading)] mt-6">Drag and drop your DOCX file here</h3>
              <p className="text-[var(--text-secondary)] text-sm mt-2 max-w-xs">
                Or click to browse. We will render document details and format them into a PDF file.
              </p>
            </div>
          ) : (
            /* Conversion Progress & Preview */
            <div className="space-y-6">
              <div className="rounded-2xl border p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--bg-surface-60)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/15 rounded-xl border border-blue-500/20 text-blue-400">
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
                    setPdfBlob(null);
                    setHtmlPreview('');
                    setError(null);
                  }}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {/* Progress */}
              {loading && (
                <div className="rounded-2xl border p-6 text-center text-sm space-y-2" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-violet-400" />
                  <p>Parsing DOCX contents...</p>
                </div>
              )}

              {/* Error messages */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-400">Conversion Failed</h4>
                    <p className="text-sm mt-1 text-red-400/90">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Result */}
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
                      className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-blue-600/10"
                    >
                      <Download className="w-4 h-4" /> Download PDF Document
                    </button>
                  </div>

                  {/* HTML Preview (Read-only representation) */}
                  {htmlPreview && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Document HTML Preview</label>
                      <div 
                        className="rounded-xl border p-6 max-h-96 overflow-y-auto text-sm space-y-4 prose prose-invert"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-base)', color: 'var(--text-secondary)' }}
                        dangerouslySetInnerHTML={{ __html: htmlPreview }}
                      ></div>
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
