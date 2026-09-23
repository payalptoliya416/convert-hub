import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import WhyChooseUs from "../../components/WhyChooseUs";
import HowItWorks from "../../components/HowItWorks";
import TrustedStats from "../../components/TrustedStats";
import FooterFile from "../../components/FooterFile";
import heroImg from "../../assets/hero.png";
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
  category: "from-pdf" | "to-pdf" | "utils" | "web-tools";
  badge?: string;
  popular?: boolean;
}

const tools: Tool[] = [
  {
    id: "pdf-to-word",
    name: "PDF to Word",
    description:
      "Convert PDF files to editable DOCX documents with high layout preservation.",
    path: "/pdf-to-word",
    icon: FileText,
    color: "from-blue-500 to-indigo-600 shadow-blue-500/20",
    category: "from-pdf",
  },
  {
    id: "pdf-to-ppt",
    name: "PDF to PowerPoint",
    description:
      "Convert your PDF pages into slides for PPTX presentations perfectly.",
    path: "/pdf-to-ppt",
    icon: Presentation,
    color: "from-orange-500 to-red-600 shadow-orange-500/20",
    category: "from-pdf",
  },
  {
    id: "pdf-to-excel",
    name: "PDF to Excel",
    description:
      "Extract tabular data from PDF files to clean Excel spreadsheet sheets.",
    path: "/pdf-to-excel",
    icon: Table,
    color: "from-emerald-500 to-teal-600 shadow-emerald-500/20",
    category: "from-pdf",
  },
  {
    id: "pdf-to-image",
    name: "PDF to Image",
    description:
      "Extract pages from a PDF document as high-resolution PNG or JPG images.",
    path: "/pdf-to-image",
    icon: Image,
    color: "from-purple-500 to-pink-600 shadow-purple-500/20",
    category: "from-pdf",
  },
  {
    id: "image-to-pdf",
    name: "Image to PDF",
    description:
      "Convert JPG, PNG, WebP images to a single PDF document in seconds.",
    path: "/image-to-pdf",
    icon: FileImage,
    color: "from-rose-500 to-pink-600 shadow-rose-500/20",
    category: "to-pdf",
  },
  {
    id: "jpg-to-pdf",
    name: "JPG to PDF",
    description:
      "Quickly convert a single JPG or PNG image to a PDF page sized to the image.",
    path: "/jpg-to-pdf",
    icon: FileImage,
    color: "from-rose-400 to-pink-500 shadow-rose-400/20",
    category: "to-pdf",
  },
  {
    id: "html-to-pdf",
    name: "HTML to PDF",
    description: "Convert HTML content or rich text into a downloadable PDF.",
    path: "/html-to-pdf",
    icon: FileText,
    color: "from-indigo-500 to-violet-600 shadow-indigo-500/20",
    category: "to-pdf",
  },
  {
    id: "word-to-pdf",
    name: "Word to PDF",
    description: "Convert Microsoft Word DOCX files into PDF documents easily.",
    path: "/word-to-pdf",
    icon: FileText,
    color: "from-blue-600 to-sky-500 shadow-blue-600/20",
    category: "to-pdf",
  },
  {
    id: "ppt-to-pdf",
    name: "PowerPoint to PDF",
    description:
      "Convert presentation slides (.pptx) into clean PDF documents.",
    path: "/ppt-to-pdf",
    icon: Presentation,
    color: "from-orange-600 to-amber-500 shadow-orange-600/20",
    category: "to-pdf",
  },
  {
    id: "excel-to-pdf",
    name: "Excel to PDF",
    description: "Convert Excel files (.xlsx) to formatted PDF documents.",
    path: "/excel-to-pdf",
    icon: Table,
    color: "from-emerald-600 to-green-500 shadow-emerald-600/20",
    category: "to-pdf",
  },
  {
    id: "merge-pdf",
    name: "Merge PDF",
    description:
      "Combine multiple PDF files into a single document in your preferred order.",
    path: "/merge-pdf",
    icon: Merge,
    color: "from-violet-500 to-purple-600 shadow-violet-500/20",
    category: "utils",
    badge: "Popular",
  },
  {
    id: "compress-pdf",
    name: "Compress PDF",
    description:
      "Reduce PDF file size without sacrificing readability or image quality.",
    path: "/compress-pdf",
    icon: Minimize2,
    color: "from-cyan-500 to-blue-600 shadow-cyan-500/20",
    category: "utils",
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    description: "Extract specific pages from PDF into a new document.",
    path: "/split-pdf",
    icon: Copy,
    color: "from-purple-500 to-indigo-600 shadow-purple-500/20",
    category: "utils",
  },
  {
    id: "rotate-pdf",
    name: "Rotate PDF",
    description: "Rotate all pages of your PDF document by 90°, 180°, or 270°.",
    path: "/rotate-pdf",
    icon: RotateCw,
    color: "from-cyan-500 to-teal-600 shadow-cyan-500/20",
    category: "utils",
  },
  {
    id: "crop-pdf",
    name: "Crop PDF",
    description: "Remove margins from PDF pages by cropping from all sides.",
    path: "/crop-pdf",
    icon: Crop,
    color: "from-amber-500 to-orange-600 shadow-amber-500/20",
    category: "utils",
  },
  {
    id: "remove-pages",
    name: "Remove pages",
    description: "Remove specific pages from a PDF and download the result.",
    path: "/remove-pages",
    icon: FileText,
    color: "from-red-500 to-rose-600 shadow-red-500/20",
    category: "utils",
  },
  {
    id: "extract-pages",
    name: "Extract pages",
    description: "Extract specific pages from a PDF into a new document.",
    path: "/extract-pages",
    icon: FileText,
    color: "from-emerald-500 to-teal-600 shadow-emerald-500/20",
    category: "utils",
  },
  // {
  //   id: 'pdf-watermark',
  //   name: 'PDF Watermark',
  //   description: 'Add text watermark to all pages of your PDF document.',
  //   path: '/pdf-watermark',
  //   icon: Droplets,
  //   color: 'from-blue-500 to-cyan-600 shadow-blue-500/20',
  //   category: 'utils'
  // },
  {
    id: "protect-pdf",
    name: "Protect PDF",
    description: "Add password protection to encrypt your PDF documents.",
    path: "/protect-pdf",
    icon: Lock,
    color: "from-red-500 to-pink-600 shadow-red-500/20",
    category: "utils",
  },
  {
    id: "html-viewer",
    name: "HTML Viewer",
    description:
      "View and preview HTML files directly in your browser with live rendering.",
    path: "/html-viewer",
    icon: Code2,
    color: "from-violet-500 to-indigo-600 shadow-violet-500/20",
    category: "web-tools",
  },

  // Text to Image
  {
    id: "text-to-image",
    name: "Text to Image",
    description:
      "Turn your text description into a beautiful AI-generated image directly in your browser.",
    path: "/text-to-image",
    icon: Sparkles,
    color: "from-fuchsia-500 to-violet-600 shadow-fuchsia-500/20",
    category: "web-tools",
  },

  // Image Background Remover
  {
    id: "ai-background-remover",
    name: "AI Background Remover",
    description:
      "Remove backgrounds from your images and download transparent PNG images.",
    path: "/ai-background-remover",
    icon: ImageIcon,
    color: "from-pink-500 to-rose-600 shadow-pink-500/20",
    category: "web-tools",
  },
  {
    id: "qr-code-generator",
    name: "QR Code Generator",
    description:
      "Create QR codes for URLs, text, phone numbers, emails, and more.",
    path: "/qr-code-generator",
    icon: QrCode,
    color: "from-cyan-500 to-blue-600 shadow-cyan-500/20",
    category: "web-tools",
  },
  {
    id: "password-generator",
    name: "Password Generator",
    description:
      "Generate strong and secure passwords with customizable options.",
    path: "/password-generator",
    icon: LockKeyhole,
    color: "from-amber-500 to-orange-600 shadow-amber-500/20",
    category: "web-tools",
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description:
      "Format, beautify, minify, and validate your JSON directly in your browser.",
    path: "/json-formatter",
    icon: Braces,
    color: "from-cyan-500 to-teal-600 shadow-cyan-500/20",
    category: "web-tools",
  },
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
      <div className="space-y-8">
        {/* ── Hero Banner — full-bleed, bleeds into navbar ── */}
        <section className="relative -mx-6 -mt-7">
          {/* Full-width gradient background — bleeds behind navbar via negative margin */}
          <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
            {/* Base lavender/white gradient — light mode */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(160deg, #ede9fe 0%, #f5f3ff 25%, #fdf4ff 50%, #fce7f3 75%, #eff6ff 100%)",
              }}
            />

            {/* Dark mode overlay — darkens the light gradient in dark theme */}
            <div
              className="absolute inset-0"
              style={{
                background: "var(--hero-dark-overlay, transparent)",
              }}
            />

            {/* Blob — top-left purple */}
            <div
              className="absolute -top-20 -left-20 w-[480px] h-[480px] rounded-full blur-[80px] opacity-60"
              style={{
                background:
                  "radial-gradient(circle, #c4b5fd 0%, #a78bfa 40%, transparent 70%)",
              }}
            />
            {/* Blob — top-right pink/rose */}
            <div
              className="absolute -top-10 right-[15%] w-[360px] h-[360px] rounded-full blur-[70px] opacity-50"
              style={{
                background:
                  "radial-gradient(circle, #fbcfe8 0%, #f9a8d4 45%, transparent 70%)",
              }}
            />
            {/* Blob — bottom-left teal/green (image 2 style) */}
            <div
              className="absolute bottom-0 -left-10 w-[300px] h-[300px] rounded-full blur-[70px] opacity-40"
              style={{
                background:
                  "radial-gradient(circle, #99f6e4 0%, #5eead4 50%, transparent 70%)",
              }}
            />
            {/* Blob — bottom-right yellow/amber */}
            <div
              className="absolute bottom-[-20px] right-[5%] w-[260px] h-[260px] rounded-full blur-[60px] opacity-35"
              style={{
                background:
                  "radial-gradient(circle, #fde68a 0%, #fbbf24 50%, transparent 70%)",
              }}
            />
          </div>

          <div className="relative flex flex-col lg:flex-row items-center px-6 pt-8 pb-10 max-w-[1400px] mx-auto lg:pt-10 lg:pb-14">
            {/* ─────────────────────────
        LEFT CONTENT
    ───────────────────────── */}
            <div className="w-full lg:w-[50%] text-center lg:text-left">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-semibold"
                style={{
                  backgroundColor: "rgba(124,58,237,0.08)",
                  borderColor: "rgba(124,58,237,0.25)",
                  color: "#8b5cf6",
                }}
              >
                <Shield className="w-3.5 h-3.5" />

                <span>100% Free</span>
                <span className="opacity-40">•</span>
                <span>No Signup</span>
                <span className="opacity-40">•</span>
                <span>Secure & Private</span>
              </div>

              {/* Heading */}
              <h1
                className="mt-6 text-[38px] sm:text-[44px] md:text-[50px] xl:text-[56px] font-black tracking-tight leading-[1.05]"
                style={{ color: "var(--hero-heading-color)" }}
              >
                All Your File Tools
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #7c3aed, #ec4899, #f59e0b)",
                  }}
                >
                  in One Place
                </span>
              </h1>

              {/* Description */}
              <p
                className="mt-5 max-w-[520px] mx-auto lg:mx-0 text-[15px] md:text-base leading-7"
                style={{ color: "var(--hero-text-color)" }}
              >
                Convert, edit, generate and manage your files — fast, secure and{" "}
                <strong style={{ color: "var(--hero-heading-color)" }}>
                  completely free.
                </strong>
              </p>

              {/* Search with dropdown */}
              <div
                ref={searchRef}
                className="relative max-w-[470px] mx-auto lg:mx-0 mt-7"
              >
                <Search
                  className="absolute left-4 top-[27px] -translate-y-1/2 w-5 h-5 pointer-events-none z-10"
                  style={{ color: "var(--text-muted)" }}
                />

                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchTerm}
                  autoComplete="off"
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => searchTerm && setSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearchOpen(false);
                      setSearchTerm("");
                    }
                    if (e.key === "Enter" && searchResults.length === 1) {
                      navigate(searchResults[0].path);
                      setSearchOpen(false);
                      setSearchTerm("");
                    }
                  }}
                  className="w-full h-[54px] pl-12 pr-14 rounded-2xl border text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.75)",
                    borderColor: "rgba(124,58,237,0.20)",
                    color: "#1e1b4b",
                    backdropFilter: "blur(8px)",
                  }}
                />

                <button
                  type="button"
                  aria-label="Search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center text-white transition hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  }}
                >
                  <Search className="w-4 h-4" />
                </button>

                {/* Dropdown results */}
                {searchOpen && searchResults.length > 0 && (
                  <div
                    className="absolute left-0 right-0 top-[58px] z-50 rounded-2xl border shadow-2xl overflow-hidden"
                    style={{
                      backgroundColor: "var(--bg-elevated, var(--bg-surface))",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div className="max-h-[340px] overflow-y-auto custom-scrollbar py-2">
                      {searchResults.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <Link
                            key={tool.id}
                            to={tool.path}
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchTerm("");
                            }}
                            className="flex items-center gap-3 px-4 py-3 transition-colors"
                            style={{ color: "var(--text-primary)" }}
                            onMouseEnter={(e) =>
                              ((
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor = "var(--bg-hover)")
                            }
                            onMouseLeave={(e) =>
                              ((
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor = "transparent")
                            }
                          >
                            <div
                              className={`shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div
                                className="text-sm font-semibold truncate"
                                dangerouslySetInnerHTML={{
                                  __html: tool.name.replace(
                                    new RegExp(
                                      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
                                      "gi",
                                    ),
                                    '<mark style="background:var(--search-highlight-bg,rgba(139,92,246,0.25));color:var(--search-highlight-text,#7c3aed);border-radius:3px;padding:0 2px">$1</mark>',
                                  ),
                                }}
                              />
                              <div
                                className="text-xs truncate mt-0.5"
                                style={{ color: "var(--text-muted)" }}
                              >
                                {tool.description}
                              </div>
                            </div>
                            <ArrowRight className="shrink-0 w-4 h-4 ml-auto text-violet-400 opacity-60" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* No results message */}
                {searchOpen &&
                  searchTerm.trim() &&
                  searchResults.length === 0 && (
                    <div
                      className="absolute left-0 right-0 top-[58px] z-50 rounded-2xl border shadow-2xl px-4 py-5 text-sm text-center"
                      style={{
                        backgroundColor:
                          "var(--bg-elevated, var(--bg-surface))",
                        borderColor: "var(--border)",
                        color: "var(--text-muted)",
                      }}
                    >
                      No tools found for "
                      <strong style={{ color: "var(--text-primary)" }}>
                        {searchTerm}
                      </strong>
                      "
                    </div>
                  )}
              </div>
            </div>

            {/* ─────────────────────────
        RIGHT IMAGE
    ───────────────────────── */}
            <div className="w-full lg:w-[50%] flex justify-center lg:justify-end items-center mt-8 lg:mt-0">
              <div className="relative w-full max-w-[520px] xl:max-w-[620px]">
                {/* Image glow */}
                <div
                  className="absolute inset-6 rounded-full blur-3xl opacity-25 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle, #7c3aed 0%, #ec4899 55%, transparent 75%)",
                  }}
                />

                <img
                  src={heroImg}
                  alt="File tools illustration"
                  className="
                  relative
                  z-10
                  w-full
                  h-auto
                  object-contain
                  drop-shadow-2xl
                "
                  style={{
                    filter: "drop-shadow(0 20px 40px rgba(124,58,237,0.22))",
                  }}
                />
              </div>
            </div>
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

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center pb-2">
          {(["all", "from-pdf", "to-pdf", "utils", "web-tools"] as const).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-10 py-2 rounded-full text-lg font-semibold transition cursor-pointer border"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {gridTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                to={tool.path}
                className="group relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
                style={{
                  backgroundColor: "var(--bg-surface-60)",
                  borderColor: "var(--border-soft)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--bg-surface)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--border-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--bg-surface-60)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--border-soft)";
                }}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} text-white shadow-lg`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    {tool.badge && (
                      <span className="px-2.5 py-0.5 text-xs font-semibold text-violet-400 bg-violet-400/10 rounded-full border border-violet-400/20">
                        {tool.badge}
                      </span>
                    )}
                    {tool.popular && !tool.badge && (
                      <span className="px-2.5 py-0.5 text-xs font-semibold text-amber-400 bg-amber-400/10 rounded-full border border-amber-400/20">
                        Popular
                      </span>
                    )}
                  </div>

                  <h3
                    className="text-xl font-bold group-hover:text-violet-400 transition"
                    style={{ color: "var(--text-heading)" }}
                  >
                    {tool.name}
                  </h3>
                  <p
                    className="text-sm mt-2 leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {tool.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm mt-6 group-hover:translate-x-1 transition duration-300">
                  Open Tool <ArrowRight className="w-4 h-4" />
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

      <div className="-mx-4">
        <WhyChooseUs />
        <HowItWorks />
        <TrustedStats />
        <FooterFile />
      </div>
    </>
  );
}
