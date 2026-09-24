import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import WhyChooseUs from "../../components/WhyChooseUs";
import HowItWorks from "../../components/HowItWorks";
import TrustedStats from "../../components/TrustedStats";
import FooterFile from "../../components/FooterFile";
import heroImg from "../../assets/hero.png";
// heroImg kept for potential future use

// Tool card images
import imgPdfToWord        from "../../assets/PDFtoword.png";
import imgPdfToPpt         from "../../assets/pdftopowerpoint.png";
import imgPdfToExcel       from "../../assets/pdftoexcel.png";
import imgPdfToImage       from "../../assets/pdftoimage.png";
import imgImageToPdf       from "../../assets/imagetopdf.png";
import imgJpgToPdf         from "../../assets/jpgtopdf.png";
import imgHtmlToPdf        from "../../assets/htmltopdf.png";
import imgWordToPdf        from "../../assets/wordtopdf.png";
import imgPptToPdf         from "../../assets/powerpointtopdf.png";
import imgExcelToPdf       from "../../assets/exceltopdf.png";
import imgMergePdf         from "../../assets/mergepdf.png";
import imgCompressPdf      from "../../assets/compresspdf.png";
import imgSplitPdf         from "../../assets/extractpages.png";
import imgRotatePdf        from "../../assets/rotatepdf.png";
import imgCropPdf          from "../../assets/croppdf.png";
import imgRemovePages      from "../../assets/removepages.png";
import imgExtractPages     from "../../assets/extractpages.png";
import imgProtectPdf       from "../../assets/protectpdf.png";
import imgHtmlViewer       from "../../assets/htmlviewer.png";
import imgTextToImage      from "../../assets/texttoimage.png";
import imgBgRemover        from "../../assets/aibackgoundremover.png";
import imgQrCode           from "../../assets/qrcodegenerator.png";
import imgPasswordGen      from "../../assets/passwordgenerator.png";
import imgJsonFormatter    from "../../assets/jsonformatter.png";
import {
  FileText,
  Presentation,
  Table,
  Image,
  FileImage,
  Merge,
  Minimize2,
  Copy,
  RotateCw,
  Crop,
  Lock,
  ArrowRight,
  Code2,
  ImageIcon,
  QrCode,
  LockKeyhole,
  Braces,
  Sparkles,
  Search,
  Shield,
} from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: React.ComponentType<any>;
  color: string;
  cardGlow: string;
  cardImg?: string;
  category: "from-pdf" | "to-pdf" | "utils" | "web-tools";
  badge?: string;
  popular?: boolean;
}

const tools: Tool[] = [
  { id: "pdf-to-word", name: "PDF to Word", description: "Convert PDF files to editable DOCX documents with high layout preservation.", path: "/pdf-to-word", icon: FileText, color: "from-blue-400 to-indigo-500", cardGlow: "rgba(99,102,241,0.13)", cardImg: imgPdfToWord, category: "from-pdf" },
  { id: "pdf-to-ppt", name: "PDF to PowerPoint", description: "Convert your PDF pages into slides for PPTX presentations perfectly.", path: "/pdf-to-ppt", icon: Presentation, color: "from-orange-400 to-red-500", cardGlow: "rgba(249,115,22,0.13)", cardImg: imgPdfToPpt, category: "from-pdf" },
  { id: "pdf-to-excel", name: "PDF to Excel", description: "Extract tabular data from PDF files to clean Excel spreadsheet sheets.", path: "/pdf-to-excel", icon: Table, color: "from-emerald-400 to-teal-500", cardGlow: "rgba(16,185,129,0.13)", cardImg: imgPdfToExcel, category: "from-pdf" },
  { id: "pdf-to-image", name: "PDF to Image", description: "Extract pages from a PDF document as high-resolution PNG or JPG images.", path: "/pdf-to-image", icon: Image, color: "from-purple-400 to-pink-500", cardGlow: "rgba(168,85,247,0.13)", cardImg: imgPdfToImage, category: "from-pdf" },
  { id: "image-to-pdf", name: "Image to PDF", description: "Convert JPG, PNG, WebP images to a single PDF document in seconds.", path: "/image-to-pdf", icon: FileImage, color: "from-rose-400 to-pink-500", cardGlow: "rgba(244,63,94,0.13)", cardImg: imgImageToPdf, category: "to-pdf" },
  { id: "jpg-to-pdf", name: "JPG to PDF", description: "Quickly convert a single JPG or PNG image to a PDF page sized to the image.", path: "/jpg-to-pdf", icon: FileImage, color: "from-rose-400 to-pink-400", cardGlow: "rgba(251,113,133,0.13)", cardImg: imgJpgToPdf, category: "to-pdf" },
  { id: "html-to-pdf", name: "HTML to PDF", description: "Convert HTML content or rich text into a downloadable PDF.", path: "/html-to-pdf", icon: FileText, color: "from-indigo-400 to-violet-500", cardGlow: "rgba(99,102,241,0.13)", cardImg: imgHtmlToPdf, category: "to-pdf" },
  { id: "word-to-pdf", name: "Word to PDF", description: "Convert Microsoft Word DOCX files into PDF documents easily.", path: "/word-to-pdf", icon: FileText, color: "from-blue-500 to-sky-400", cardGlow: "rgba(14,165,233,0.13)", cardImg: imgWordToPdf, category: "to-pdf" },
  { id: "ppt-to-pdf", name: "PowerPoint to PDF", description: "Convert presentation slides (.pptx) into clean PDF documents.", path: "/ppt-to-pdf", icon: Presentation, color: "from-orange-500 to-amber-400", cardGlow: "rgba(245,158,11,0.13)", cardImg: imgPptToPdf, category: "to-pdf" },
  { id: "excel-to-pdf", name: "Excel to PDF", description: "Convert Excel files (.xlsx) to formatted PDF documents.", path: "/excel-to-pdf", icon: Table, color: "from-emerald-500 to-green-400", cardGlow: "rgba(16,185,129,0.13)", cardImg: imgExcelToPdf, category: "to-pdf" },
  { id: "merge-pdf", name: "Merge PDF", description: "Combine multiple PDF files into a single document in your preferred order.", path: "/merge-pdf", icon: Merge, color: "from-violet-400 to-purple-500", cardGlow: "rgba(139,92,246,0.13)", cardImg: imgMergePdf, category: "utils", badge: "Popular" },
  { id: "compress-pdf", name: "Compress PDF", description: "Reduce PDF file size without sacrificing readability or image quality.", path: "/compress-pdf", icon: Minimize2, color: "from-cyan-400 to-blue-500", cardGlow: "rgba(6,182,212,0.13)", cardImg: imgCompressPdf, category: "utils" },
  { id: "split-pdf", name: "Split PDF", description: "Extract specific pages from PDF into a new document.", path: "/split-pdf", icon: Copy, color: "from-purple-400 to-indigo-500", cardGlow: "rgba(139,92,246,0.13)", cardImg: imgSplitPdf, category: "utils" },
  { id: "rotate-pdf", name: "Rotate PDF", description: "Rotate all pages of your PDF document by 90°, 180°, or 270°.", path: "/rotate-pdf", icon: RotateCw, color: "from-cyan-400 to-teal-500", cardGlow: "rgba(6,182,212,0.13)", cardImg: imgRotatePdf, category: "utils" },
  { id: "crop-pdf", name: "Crop PDF", description: "Remove margins from PDF pages by cropping from all sides.", path: "/crop-pdf", icon: Crop, color: "from-amber-400 to-orange-500", cardGlow: "rgba(245,158,11,0.13)", cardImg: imgCropPdf, category: "utils" },
  { id: "remove-pages", name: "Remove pages", description: "Remove specific pages from a PDF and download the result.", path: "/remove-pages", icon: FileText, color: "from-red-400 to-rose-500", cardGlow: "rgba(239,68,68,0.13)", cardImg: imgRemovePages, category: "utils" },
  { id: "extract-pages", name: "Extract pages", description: "Extract specific pages from a PDF into a new document.", path: "/extract-pages", icon: FileText, color: "from-emerald-400 to-teal-500", cardGlow: "rgba(16,185,129,0.13)", cardImg: imgExtractPages, category: "utils" },
  { id: "protect-pdf", name: "Protect PDF", description: "Add password protection to encrypt your PDF documents.", path: "/protect-pdf", icon: Lock, color: "from-red-400 to-pink-500", cardGlow: "rgba(244,63,94,0.13)", cardImg: imgProtectPdf, category: "utils" },
  { id: "html-viewer", name: "HTML Viewer", description: "View and preview HTML files directly in your browser with live rendering.", path: "/html-viewer", icon: Code2, color: "from-violet-400 to-indigo-500", cardGlow: "rgba(139,92,246,0.13)", cardImg: imgHtmlViewer, category: "web-tools" },
  { id: "text-to-image", name: "Text to Image", description: "Turn your text description into a beautiful AI-generated image directly in your browser.", path: "/text-to-image", icon: Sparkles, color: "from-fuchsia-400 to-violet-500", cardGlow: "rgba(217,70,239,0.13)", cardImg: imgTextToImage, category: "web-tools" },
  { id: "ai-background-remover", name: "AI Background Remover", description: "Remove backgrounds from your images and download transparent PNG images.", path: "/ai-background-remover", icon: ImageIcon, color: "from-pink-400 to-rose-500", cardGlow: "rgba(236,72,153,0.13)", cardImg: imgBgRemover, category: "web-tools" },
  { id: "qr-code-generator", name: "QR Code Generator", description: "Create QR codes for URLs, text, phone numbers, emails, and more.", path: "/qr-code-generator", icon: QrCode, color: "from-cyan-400 to-blue-500", cardGlow: "rgba(6,182,212,0.13)", cardImg: imgQrCode, category: "web-tools" },
  { id: "password-generator", name: "Password Generator", description: "Generate strong and secure passwords with customizable options.", path: "/password-generator", icon: LockKeyhole, color: "from-amber-400 to-orange-500", cardGlow: "rgba(245,158,11,0.13)", cardImg: imgPasswordGen, category: "web-tools" },
  { id: "json-formatter", name: "JSON Formatter", description: "Format, beautify, minify, and validate your JSON directly in your browser.", path: "/json-formatter", icon: Braces, color: "from-cyan-400 to-teal-500", cardGlow: "rgba(6,182,212,0.13)", cardImg: imgJsonFormatter, category: "web-tools" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<
    "all" | "from-pdf" | "to-pdf" | "utils" | "web-tools"
  >("all");

  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const searchResults = searchTerm.trim()
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  // Grid shows ALL tools filtered only by category tab (never by search)
  const gridTools = tools.filter(
    (tool) => activeCategory === "all" || tool.category === activeCategory,
  );

  return (
    <>
      <div className="space-y-8 max-w-[1400px] mx-auto ">
        {/* ── Hero Banner ── */}
        <section className="relative -mx-6 -mt-7 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 pointer-events-none -z-10">
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(160deg, #ede9fe 0%, #f5f3ff 25%, #fdf4ff 50%, #fce7f3 75%, #eff6ff 100%)" }} />
            <div className="absolute inset-0"
              style={{ background: "var(--hero-dark-overlay, transparent)" }} />
            <div className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full blur-[90px] opacity-50"
              style={{ background: "radial-gradient(circle, #c4b5fd 0%, #a78bfa 40%, transparent 70%)" }} />
            <div className="absolute -top-10 right-[10%] w-[380px] h-[380px] rounded-full blur-[80px] opacity-40"
              style={{ background: "radial-gradient(circle, #fbcfe8 0%, #f9a8d4 45%, transparent 70%)" }} />
            <div className="absolute bottom-0 left-[20%] w-[280px] h-[280px] rounded-full blur-[70px] opacity-30"
              style={{ background: "radial-gradient(circle, #99f6e4 0%, #5eead4 50%, transparent 70%)" }} />
            <div className="absolute bottom-[-10px] right-[8%] w-[240px] h-[240px] rounded-full blur-[60px] opacity-25"
              style={{ background: "radial-gradient(circle, #fde68a 0%, #fbbf24 50%, transparent 70%)" }} />
          </div>

          <div className="relative max-w-[1400px] mx-auto px-6 pt-14 pb-16 lg:pt-16 lg:pb-20">

            {/* ── Floating tool cards — LEFT (desktop only) ── */}
            <div className="hidden xl:flex flex-col gap-3 absolute left-6 top-1/2 -translate-y-1/2 w-[168px]">
              {[
                { icon: FileText,  label: "PDF to Word",   badge: "NEW",  color: "from-blue-400 to-indigo-500"   },
                { icon: FileImage, label: "Image to PDF",  badge: "FREE", color: "from-rose-400 to-pink-500"     },
                { icon: Lock,      label: "Protect PDF",   badge: "HOT",  color: "from-red-400 to-pink-500"      },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i}
                    className={`animate-fade-in-up delay-${(i + 2) * 100} ${i === 1 ? "animate-float" : i === 0 ? "animate-float-slow" : "animate-float-delayed"}`}
                  >
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border shadow-lg backdrop-blur-sm"
                      style={{ backgroundColor: "var(--bg-surface)", borderColor: "rgba(139,92,246,0.20)" }}>
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold truncate leading-tight" style={{ color: "var(--text-heading)" }}>{item.label}</p>
                        <span className="text-[9px] font-bold text-violet-500 uppercase tracking-wide">{item.badge}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Floating tool cards — RIGHT (desktop only) ── */}
            <div className="hidden xl:flex flex-col gap-3 absolute right-6 top-1/2 -translate-y-1/2 w-[168px]">
              {[
                { icon: QrCode,    label: "QR Generator", badge: "TOP",  color: "from-cyan-400 to-blue-500"     },
                { icon: Sparkles,  label: "AI Image Gen", badge: "AI",   color: "from-fuchsia-400 to-violet-500" },
                { icon: Merge,     label: "Merge PDF",    badge: "FREE", color: "from-violet-400 to-purple-500"  },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i}
                    className={`animate-fade-in-up delay-${(i + 3) * 100} ${i === 1 ? "animate-float-slow" : i === 0 ? "animate-float-delayed" : "animate-float"}`}
                  >
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border shadow-lg backdrop-blur-sm"
                      style={{ backgroundColor: "var(--bg-surface)", borderColor: "rgba(139,92,246,0.20)" }}>
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold truncate leading-tight" style={{ color: "var(--text-heading)" }}>{item.label}</p>
                        <span className="text-[9px] font-bold text-violet-500 uppercase tracking-wide">{item.badge}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Center content ── */}
            <div className="xl:px-52">

              {/* Badge */}
              <div className="flex justify-center mb-6 animate-fade-in-down">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-semibold"
                  style={{ backgroundColor: "rgba(124,58,237,0.08)", borderColor: "rgba(124,58,237,0.25)", color: "#8b5cf6" }}>
                  <Shield className="w-3.5 h-3.5" />
                  <span>100% Free</span><span className="opacity-40">•</span>
                  <span>No Signup</span><span className="opacity-40">•</span>
                  <span>Secure & Private</span>
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-center text-[40px] sm:text-[52px] md:text-[62px] xl:text-[68px] font-black tracking-tight leading-[1.05] max-w-4xl mx-auto animate-fade-in-up delay-100"
                style={{ color: "var(--hero-heading-color)" }}>
                All Your File Tools
                <br />
                for{" "}
                <span className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(90deg, #7c3aed, #ec4899, #f59e0b)" }}>
                   in One Place
                </span>
              </h1>

              {/* Subtext */}
              <p className="text-center mt-5 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto animate-fade-in-up delay-200"
                style={{ color: "var(--hero-text-color)" }}>
               Convert, edit, generate and manage your files — fast, secure and{" "}
 <strong style={{ color: "var(--hero-heading-color)" }}>
                  completely free.
                </strong>              </p>

              {/* Search */}
              <div ref={searchRef} className="relative max-w-[560px] mx-auto mt-8 animate-scale-in delay-300">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10"
                  style={{ color: "var(--text-muted)" }} />
                <input type="text" placeholder="Search for tools..."
                  value={searchTerm} autoComplete="off"
                  onChange={(e) => { setSearchTerm(e.target.value); setSearchOpen(true); }}
                  onFocus={() => searchTerm && setSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") { setSearchOpen(false); setSearchTerm(""); }
                    if (e.key === "Enter" && searchResults.length === 1) {
                      navigate(searchResults[0].path); setSearchOpen(false); setSearchTerm("");
                    }
                  }}
                  className="w-full h-[52px] pl-12 pr-14 rounded-2xl border text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 shadow-xl"
                  style={{ backgroundColor: "var(--bg-surface)", borderColor: "rgba(124,58,237,0.20)", color: "var(--text-primary)", backdropFilter: "blur(10px)" }}
                />
                <button type="button" aria-label="Search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center text-white transition hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
                  <Search className="w-4 h-4" />
                </button>

                {searchOpen && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-[60px] z-50 rounded-2xl border shadow-2xl overflow-hidden"
                    style={{ backgroundColor: "var(--bg-elevated, var(--bg-surface))", borderColor: "var(--border)" }}>
                    <div className="max-h-[320px] overflow-y-auto custom-scrollbar py-2">
                      {searchResults.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <Link key={tool.id} to={tool.path}
                            onClick={() => { setSearchOpen(false); setSearchTerm(""); }}
                            className="flex items-center gap-3 px-4 py-3 transition-colors"
                            style={{ color: "var(--text-primary)" }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-hover)")}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
                          >
                            <div className={`shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold truncate"
                                dangerouslySetInnerHTML={{
                                  __html: tool.name.replace(
                                    new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
                                    '<mark style="background:var(--search-highlight-bg,rgba(139,92,246,0.25));color:var(--search-highlight-text,#7c3aed);border-radius:3px;padding:0 2px">$1</mark>',
                                  ),
                                }} />
                              <div className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>{tool.description}</div>
                            </div>
                            <ArrowRight className="shrink-0 w-4 h-4 ml-auto text-violet-400 opacity-60" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
                {searchOpen && searchTerm.trim() && searchResults.length === 0 && (
                  <div className="absolute left-0 right-0 top-[60px] z-50 rounded-2xl border shadow-2xl px-4 py-5 text-sm text-center"
                    style={{ backgroundColor: "var(--bg-elevated, var(--bg-surface))", borderColor: "var(--border)", color: "var(--text-muted)" }}>
                    No tools found for "<strong style={{ color: "var(--text-primary)" }}>{searchTerm}</strong>"
                  </div>
                )}
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap justify-center gap-2 mt-5 animate-fade-in-up delay-400">
                {(["PDF", "Image", "Converter", "Compress", "Security"] as const).map((chip) => (
                  <button key={chip}
                    onClick={() => {
                      if (chip === "PDF") setActiveCategory("utils");
                      else if (chip === "Image") setActiveCategory("web-tools");
                      else if (chip === "Converter") setActiveCategory("to-pdf");
                      else setActiveCategory("utils");
                      document.getElementById("tools-grid")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition hover:border-violet-400 hover:text-violet-500 cursor-pointer"
                    style={{ backgroundColor: "rgba(255,255,255,0.55)", borderColor: "var(--border)", color: "var(--text-secondary)", backdropFilter: "blur(6px)" }}>
                    {chip}
                  </button>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-8 animate-fade-in-up delay-500">
                <a href="#tools-grid"
                  onClick={(e) => { e.preventDefault(); document.getElementById("tools-grid")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white transition hover:scale-105 shadow-xl"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 8px 24px rgba(124,58,237,0.35)" }}>
                  Get started
                </a>
                <a href="#tools-grid"
                  onClick={(e) => { e.preventDefault(); document.getElementById("tools-grid")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition hover:gap-2.5"
                  style={{ color: "var(--hero-text-color)" }}>
                  Learn more <ArrowRight className="w-4 h-4" />
                </a>
              </div>

            </div>{/* end center */}
          </div>
        </section>

        {/* Section heading */}
        {/* <div className="text-center space-y-1">
          <h2
            className="text-2xl md:text-3xl font-black tracking-tight"
            style={{ color: "var(--text-heading)" }}
          >
            Explore Our{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(90deg, #7c3aed, #ec4899)",
              }}
            >
              Tool Categories
            </span>
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Find the perfect tool for every job
          </p>
        </div> */}

        {/* Section heading */}
        <div className="text-center space-y-1 pt-2">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight"
            style={{ color: "var(--text-heading)" }}>
            Explore Our{" "}
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #7c3aed, #ec4899)" }}>
              Tools
            </span>
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Find the perfect tool for every job
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center pb-2">
          {(["all", "from-pdf", "to-pdf", "utils", "web-tools"] as const).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-3 md:px-5 lg:px-10 py-1.5 md:py-2 rounded-full text-sm font-semibold transition cursor-pointer border"
                style={
                  activeCategory === cat
                    ? {
                        backgroundColor: "#7c3aed",
                        color: "#fff",
                        borderColor: "transparent",
                        boxShadow: "0 4px 14px rgba(124,58,237,0.30)",
                      }
                    : {
                        backgroundColor: "var(--bg-surface)",
                        color: "var(--text-secondary)",
                        borderColor: "var(--border)",
                      }
                }
              >
                {cat === "all" && "All Tools"}
                {cat === "from-pdf" && "Convert from PDF"}
                {cat === "to-pdf" && "Convert to PDF"}
                {cat === "utils" && "PDF Utilities"}
                {cat === "web-tools" && "Web Tools"}
              </button>
            ),
          )}
        </div>

        {/* Tool Grid */}
        <div id="tools-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {gridTools.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                to={tool.path}
                className="group relative flex flex-col p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 overflow-hidden cursor-pointer"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-soft)",
                  animationDelay: `${(idx % 10) * 50}ms`,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "rgba(124,58,237,0.35)";
                  el.style.boxShadow = `0 16px 40px ${tool.cardGlow}`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--border-soft)";
                  el.style.boxShadow = "";
                }}
              >
                {/* Hover gradient bg tint */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{ background: `radial-gradient(ellipse at 80% 110%, ${tool.cardGlow.replace("0.13","0.18")} 0%, transparent 60%)` }}
                />

                {/* Top row: gradient icon */}
                <div className="flex items-start justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                    style={{ boxShadow: `0 6px 18px ${tool.cardGlow}` }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {tool.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "rgba(124,58,237,0.12)", color: "#8b5cf6" }}>
                      {tool.badge}
                    </span>
                  )}
                </div>

                {/* Title + description */}
                <div className="mt-4 flex-1 relative z-10">
                  <h3 className="text-sm font-bold leading-snug group-hover:text-violet-500 transition-colors duration-200"
                    style={{ color: "var(--text-heading)" }}>
                    {tool.name}
                  </h3>
                  <p className="text-xs mt-2 leading-relaxed line-clamp-2"
                    style={{ color: "var(--text-secondary)" }}>
                    {tool.description}
                  </p>
                </div>

                {/* Open Tool arrow */}
                <div className="relative z-10 flex items-center gap-1 mt-4 text-xs font-semibold text-violet-500 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:gap-2">
                  Open Tool <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>

        {gridTools.length === 0 && (
          <div
            className="text-center py-16 rounded-2xl border border-dashed"
            style={{
              backgroundColor: "var(--bg-surface-60)",
              borderColor: "var(--border)",
            }}
          >
            <p style={{ color: "var(--text-muted)" }}>
              No tools found matching your search term.
            </p>
          </div>
        )}
      </div>

      <div className="-mx-6">
        <WhyChooseUs />
        <HowItWorks />
        <TrustedStats />
        <FooterFile />
      </div>
    </>
  );
}
