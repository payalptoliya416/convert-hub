import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { 
  FileText, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileCode,
  Settings
} from 'lucide-react';

// Configure pdfjs worker locally
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';


export default function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [convertedText, setConvertedText] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [formattingMode, setFormattingMode] = useState<'clean' | 'formatted'>('formatted');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a valid PDF file.');
        return;
      }
      setFile(selectedFile);
      setConvertedText([]);
      setSuccess(false);
      setDocxBlob(null);
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
      setConvertedText([]);
      setSuccess(false);
      setDocxBlob(null);
      setError(null);
    }
  };

  const convertPdfToWord = async () => {
    if (!file) return;

    setLoading(true);
    setProgress(0);
    setError(null);
    setConvertedText([]);
    setSuccess(false);
    setDocxBlob(null);

    try {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
          const loadingTask = pdfjsLib.getDocument({ data: typedarray });
          const pdf = await loadingTask.promise;
          const numPages = pdf.numPages;

          const paragraphs: Paragraph[] = [];
          const textPreviewList: string[] = [];

          // Add title header page inside docx
          paragraphs.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
              children: [
                new TextRun({
                  text: file.name.replace(/\.pdf$/i, ''),
                  bold: true,
                  size: 32,
                  font: 'Arial'
                })
              ]
            })
          );

          for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const items = textContent.items as any[];

            if (items.length === 0) {
              // Scanned page/image only
              paragraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `[Page ${i}: No text found. This may be a scanned page.]`,
                      italics: true,
                      color: '888888',
                      font: 'Arial'
                    })
                  ],
                  spacing: { after: 200 }
                })
              );
              textPreviewList.push(`[Page ${i} is empty or scanned]`);
              continue;
            }

            // Extract and reconstruct lines using their Y-coordinates
            // transform[4] = X, transform[5] = Y
            const linesMap: { [key: number]: any[] } = {};
            const yTolerance = 5; // Group items together if they are on a similar line height

            items.forEach((item) => {
              const y = Math.round(item.transform[5]);
              // Find if we already have a line close to this Y value
              const matchingY = Object.keys(linesMap).find(
                (existingY) => Math.abs(Number(existingY) - y) < yTolerance
              );

              if (matchingY) {
                linesMap[Number(matchingY)].push(item);
              } else {
                linesMap[y] = [item];
              }
            });

            // Sort lines by Y descending (PDF coordinates run from bottom-up)
            const sortedYKeys = Object.keys(linesMap)
              .map(Number)
              .sort((a, b) => b - a);

            // Add a Page break text for page separations in preview
            textPreviewList.push(`--- Page ${i} ---`);

            sortedYKeys.forEach((yKey) => {
              // Sort items in the line by X coordinate ascending (left-to-right)
              const lineItems = linesMap[yKey].sort((a, b) => a.transform[4] - b.transform[4]);
              
              let lineText = '';
              const textRunsForLine: TextRun[] = [];

              lineItems.forEach((item, index) => {
                const itemText = item.str;
                lineText += (index > 0 && !lineText.endsWith(' ') && !itemText.startsWith(' ') ? ' ' : '') + itemText;
                
                // Construct Docx TextRun with basic properties
                const isBold = item.fontName?.toLowerCase().includes('bold') || false;
                const isItalic = item.fontName?.toLowerCase().includes('italic') || false;

                textRunsForLine.push(
                  new TextRun({
                    text: itemText + (index < lineItems.length - 1 ? ' ' : ''),
                    bold: isBold && formattingMode === 'formatted',
                    italics: isItalic && formattingMode === 'formatted',
                    font: 'Arial',
                    size: 22
                  })
                );
              });

              if (lineText.trim()) {
                textPreviewList.push(lineText);
                paragraphs.push(
                  new Paragraph({
                    children: textRunsForLine,
                    spacing: { after: 120 }
                  })
                );
              }
            });

            // Add page separator spacer between pages in Word Document
            if (i < numPages) {
              paragraphs.push(
                new Paragraph({
                  children: [new TextRun({ text: '', break: 1 })]
                })
              );
            }

            setProgress(Math.round((i / numPages) * 100));
          }

          // Build Word Document
          const doc = new Document({
            sections: [
              {
                properties: {},
                children: paragraphs
              }
            ]
          });

          const blob = await Packer.toBlob(doc);
          setDocxBlob(blob);
          setConvertedText(textPreviewList);
          setSuccess(true);
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'Failed to parse PDF and generate Word file.');
        } finally {
          setLoading(false);
        }
      };

      fileReader.readAsArrayBuffer(file);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during file parsing.');
      setLoading(false);
    }
  };

  const downloadDocx = () => {
    if (!docxBlob) return;
    saveAs(docxBlob, `${file?.name.replace(/\.pdf$/i, '')}.docx`);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
          <FileText className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">PDF to Word</h1>
          <p className="text-slate-400 text-sm mt-1">Convert PDF files to editable Microsoft Word (.docx) documents locally.</p>
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

            {/* Layout preservation */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Formatting Style</label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setFormattingMode('formatted')}
                  className={`py-2 px-4 rounded-lg text-sm font-semibold transition border text-left cursor-pointer flex justify-between items-center ${
                    formattingMode === 'formatted'
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Formatted Text</span>
                  <span className="text-xs opacity-80">(Preserves bold/italics)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormattingMode('clean')}
                  className={`py-2 px-4 rounded-lg text-sm font-semibold transition border text-left cursor-pointer flex justify-between items-center ${
                    formattingMode === 'clean'
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Clean Text</span>
                  <span className="text-xs opacity-80">(Standard formatting)</span>
                </button>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={convertPdfToWord}
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
                  <RefreshCw className="w-5 h-5 animate-spin" /> Converting...
                </>
              ) : (
                <>
                  <FileCode className="w-5 h-5" /> Convert to Word
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Upload / Preview */}
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
                Or click to select a file. PDF text structure will be converted into an editable DOCX file.
              </p>
            </div>
          ) : (
            /* Conversion Progress & Preview */
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
                    setConvertedText([]);
                    setSuccess(false);
                    setDocxBlob(null);
                    setError(null);
                  }}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {/* Progress */}
              {loading && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Extracting text layout...</span>
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

              {/* Error message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-300">Conversion Failed</h4>
                    <p className="text-sm mt-1 text-red-400/90">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Result */}
              {success && docxBlob && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-4 justify-between items-center border-b border-slate-800 pb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Word File Ready
                    </h3>
                    <button
                      onClick={downloadDocx}
                      className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-blue-600/10"
                    >
                      <Download className="w-4 h-4" /> Download Word (.docx)
                    </button>
                  </div>

                  {/* Text preview window */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Document Text Preview</label>
                    <div className="h-96 rounded-xl bg-slate-950 border border-slate-800 p-6 overflow-y-auto font-mono text-xs text-slate-300 space-y-2 select-all">
                      {convertedText.map((line, idx) => (
                        <div key={idx} className={line.startsWith('--- Page') ? 'text-violet-400 font-bold border-b border-slate-900 py-1' : ''}>
                          {line}
                        </div>
                      ))}
                    </div>
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
