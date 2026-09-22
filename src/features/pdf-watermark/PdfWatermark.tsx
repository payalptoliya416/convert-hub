// import React, { useState, useRef } from 'react';
// import { PDFDocument, rgb } from 'pdf-lib';
// import { saveAs } from 'file-saver';
// import { 
//   Droplets,
//   Upload, 
//   Download, 
//   RefreshCw, 
//   CheckCircle2, 
//   AlertCircle,
//   FileText,
//   Settings
// } from 'lucide-react';

// export default function PdfWatermark() {
//   const [file, setFile] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);
//   const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
//   const [opacity, setOpacity] = useState(0.3);
//   const [angle, setAngle] = useState(-45);
//   const [watermarkedBlob, setWatermarkedBlob] = useState<Blob | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const selectedFile = e.target.files[0];
//       if (selectedFile.type !== 'application/pdf') {
//         setError('Please select a valid PDF file.');
//         return;
//       }
//       setFile(selectedFile);
//       setSuccess(false);
//       setWatermarkedBlob(null);
//       setError(null);
//     }
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       const selectedFile = e.dataTransfer.files[0];
//       if (selectedFile.type !== 'application/pdf') {
//         setError('Please select a valid PDF file.');
//         return;
//       }
//       setFile(selectedFile);
//       setSuccess(false);
//       setWatermarkedBlob(null);
//       setError(null);
//     }
//   };

//   const addWatermark = async () => {
//     if (!file) return;

//     setLoading(true);
//     setError(null);
//     setSuccess(false);

//     try {
//       const arrayBuffer = await file.arrayBuffer();
//       const pdfDoc = await PDFDocument.load(arrayBuffer);
//       const pages = pdfDoc.getPages();

//       pages.forEach(page => {
//         const { width, height } = page.getSize();
        
//         page.drawText(watermarkText, {
//           x: width / 2,
//           y: height / 2,
//           size: 60,
//           color: rgb(0.8, 0.8, 0.8),
//           opacity: opacity,
//           rotate: angle,
//           align: 'center'
//         });
//       });

//       const pdfBytes = await pdfDoc.save();
//       const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//       setWatermarkedBlob(blob);
//       setSuccess(true);
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message || 'Failed to add watermark.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadWatermarked = () => {
//     if (!watermarkedBlob) return;
//     saveAs(watermarkedBlob, `${file?.name.replace(/\.pdf$/i, '')}_watermarked.pdf`);
//   };

//   const triggerFileSelect = () => {
//     fileInputRef.current?.click();
//   };

//   return (
//     <div className="mx-auto space-y-8">
//       <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
//         <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
//           <Droplets className="w-8 h-8" />
//         </div>
//         <div>
//           <h1 className="text-3xl font-bold text-[var(--text-heading)]">PDF Watermark</h1>
//           <p className="text-[var(--text-secondary)] text-sm mt-1">Add text watermark to all pages of your PDF document.</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//         <div className="md:col-span-1 space-y-6">
//           <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-6 space-y-6 shadow-xl">
//             <h2 className="text-lg font-bold text-[var(--text-heading)] flex items-center gap-2">
//               <Settings className="w-5 h-5 text-violet-400" /> Options
//             </h2>

//             <div className="space-y-2">
//               <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Watermark Text</label>
//               <input
//                 type="text"
//                 value={watermarkText}
//                 onChange={(e) => setWatermarkText(e.target.value)}
//                 className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg py-2.5 px-3 text-[var(--text-heading)] text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Opacity: {(opacity * 100).toFixed(0)}%</label>
//               <input
//                 type="range"
//                 min="0.1"
//                 max="1"
//                 step="0.1"
//                 value={opacity}
//                 onChange={(e) => setOpacity(Number(e.target.value))}
//                 className="w-full cursor-pointer"
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Angle: {angle}°</label>
//               <input
//                 type="range"
//                 min="-90"
//                 max="90"
//                 step="5"
//                 value={angle}
//                 onChange={(e) => setAngle(Number(e.target.value))}
//                 className="w-full cursor-pointer"
//               />
//             </div>

//             <button
//               onClick={addWatermark}
//               disabled={!file || loading}
//               className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
//                 !file 
//                   ? 'bg-[var(--bg-hover)] text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed'
//                   : loading
//                     ? 'bg-violet-700 text-white border border-violet-600 cursor-not-allowed'
//                     : 'bg-violet-600 hover:bg-violet-500 text-white border border-violet-500 shadow-violet-600/20'
//               }`}
//             >
//               {loading ? (
//                 <>
//                   <RefreshCw className="w-5 h-5 animate-spin" /> Adding...
//                 </>
//               ) : (
//                 <>
//                   <Droplets className="w-5 h-5" /> Add Watermark
//                 </>
//               )}
//             </button>
//           </div>
//         </div>

//         <div className="md:col-span-2 space-y-6">
//           {!file ? (
//             <div 
//               onDragOver={handleDragOver}
//               onDrop={handleDrop}
//               onClick={triggerFileSelect}
//               className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] hover:border-violet-500/50 hover:bg-[var(--bg-surface-60)] rounded-3xl p-16 text-center cursor-pointer transition group"
//             >
//               <input 
//                 type="file" 
//                 accept=".pdf" 
//                 className="hidden" 
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//               />
//               <div className="p-5 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] text-[var(--text-secondary)] group-hover:text-violet-400 group-hover:scale-110 transition duration-300">
//                 <Upload className="w-10 h-10" />
//               </div>
//               <h3 className="text-xl font-bold text-[var(--text-heading)] mt-6">Drag and drop your PDF here</h3>
//               <p className="text-[var(--text-secondary)] text-sm mt-2 max-w-xs">Or click to browse. Watermark will be added to all pages.</p>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               <div className="bg-[var(--bg-surface-60)] border border-[var(--border)] rounded-2xl p-4 flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2.5 bg-red-500/15 rounded-xl border border-red-500/20 text-red-400">
//                     <FileText className="w-6 h-6" />
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-[var(--text-heading)] truncate max-w-sm sm:max-w-md">{file.name}</h4>
//                     <p className="text-xs text-[var(--text-secondary)]">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => {
//                     setFile(null);
//                     setSuccess(false);
//                     setWatermarkedBlob(null);
//                     setError(null);
//                   }}
//                   className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer"
//                 >
//                   Remove
//                 </button>
//               </div>

//               {error && (
//                 <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-3 text-red-400">
//                   <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
//                   <div>
//                     <h4 className="font-semibold text-red-400">Error</h4>
//                     <p className="text-sm mt-1 text-red-400/90">{error}</p>
//                   </div>
//                 </div>
//               )}

//               {success && watermarkedBlob && (
//                 <div className="space-y-4">
//                   <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3">
//                     <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
//                     <div>
//                       <h4 className="font-semibold text-emerald-400">Watermark Added Successfully!</h4>
//                       <p className="text-sm mt-1 text-emerald-400/90">{(watermarkedBlob.size / 1024).toFixed(1)} KB</p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={downloadWatermarked}
//                     className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-violet-600/10"
//                   >
//                     <Download className="w-4 h-4" /> Download Watermarked PDF
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
