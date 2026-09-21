import { Routes, Route } from 'react-router-dom';
import Dashboard from '../features/dashboard/Dashboard';
import PdfToWord from '../features/pdf-to-word/PdfToWord';
import PdfToPpt from '../features/pdf-to-ppt/PdfToPpt';
import PdfToExcel from '../features/pdf-to-excel/PdfToExcel';
import PdfToImage from '../features/pdf-to-image/PdfToImage';
import ImageToPdf from '../features/image-to-pdf/ImageToPdf';
import WordToPdf from '../features/word-to-pdf/WordToPdf';
import PptToPdf from '../features/ppt-to-pdf/PptToPdf';
import ExcelToPdf from '../features/excel-to-pdf/ExcelToPdf';
import MergePdf from '../features/merge-pdf/MergePdf';
import CompressPdf from '../features/compress-pdf/CompressPdf';
import SplitPdf from '../features/split-pdf/SplitPdf';
import RotatePdf from '../features/rotate-pdf/RotatePdf';
import CropPdf from '../features/crop-pdf/CropPdf';
import RemovePages from '../features/remove-pages/RemovePages';
import ExtractPages from '../features/extract-pages/ExtractPages';
import HTMLtoPDF from '../features/html-to-pdf/HtmlToPdf';
// import PdfWatermark from '../features/pdf-watermark/PdfWatermark';
import ProtectPdf from '../features/protect-pdf/ProtectPdf';
import JpgToPdf from '../features/jpg-to-pdf/JpgToPdf';
import HtmlViewer from '../features/html-viewer/HTMLViewer';
import TextToImage from '../features/text-to-image/TextToImage';
import ImageBackgroundRemover from '../features/image-bg-remover/ImageBackgroundRemover';
import QRCodeGenerator from '../features/QRCode-generator/QRCodeGenerator';
import PasswordGenerator from '../features/password-generator/PasswordGenerator';
import JsonFormatter from '../features/JSON-formatter/JSONFormatter';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/pdf-to-word" element={<PdfToWord />} />
      <Route path="/pdf-to-ppt" element={<PdfToPpt />} />
      <Route path="/pdf-to-excel" element={<PdfToExcel />} />
      <Route path="/pdf-to-image" element={<PdfToImage />} />
      <Route path="/image-to-pdf" element={<ImageToPdf />} />
      <Route path="/word-to-pdf" element={<WordToPdf />} />
      <Route path="/ppt-to-pdf" element={<PptToPdf />} />
      <Route path="/excel-to-pdf" element={<ExcelToPdf />} />
      <Route path="/merge-pdf" element={<MergePdf />} />
      <Route path="/compress-pdf" element={<CompressPdf />} />
      <Route path="/split-pdf" element={<SplitPdf />} />
      <Route path="/rotate-pdf" element={<RotatePdf />} />
      <Route path="/remove-pages" element={<RemovePages />} />
      <Route path="/extract-pages" element={<ExtractPages />} />
      <Route path="/crop-pdf" element={<CropPdf />} />
      {/* <Route path="/pdf-watermark" element={<PdfWatermark />} /> */}
      <Route path="/protect-pdf" element={<ProtectPdf />} />
      <Route path="/html-to-pdf" element={<HTMLtoPDF />} />
      <Route path="/jpg-to-pdf" element={<JpgToPdf />} />

      <Route path="/html-viewer" element={<HtmlViewer />} />
      <Route path="/text-to-image" element={<TextToImage />} />
      <Route path="/image-background-remover" element={<ImageBackgroundRemover />} />
      <Route path="/qr-code-generator" element={<QRCodeGenerator />} />
      <Route path="/password-generator" element={<PasswordGenerator />} />
      <Route path="/json-formatter" element={<JsonFormatter />} />

      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
}
