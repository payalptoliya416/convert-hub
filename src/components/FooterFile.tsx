import React from "react";
import { Link } from "react-router-dom";
import {
  Merge,
  FileText,
  FileImage,
  FileSpreadsheet,
  Presentation,
  Image,
  Code2,
  Minimize2,
  Scissors,
  RotateCw,
  Crop,
  Trash2,
  Files,
  LockKeyhole,
  ImageIcon,
  QrCode,
  Braces,
  Sparkles,
} from "lucide-react";

interface Tool {
  name: string;
  path: string;
  icon: React.ElementType;
}

interface FooterColumnProps {
  title: string;
  tools: Tool[];
}

const FooterColumn: React.FC<FooterColumnProps> = ({ title, tools }) => {
  return (
    <div>
      <h3
        className="text-xs font-bold uppercase tracking-[0.15em]"
        style={{ color: "var(--text-heading)" }}
      >
        {title}
      </h3>

      <div className="mt-5 space-y-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.path}
              to={tool.path}
              className="group flex w-fit items-center gap-2.5 text-sm transition-all duration-200 hover:translate-x-1 hover:text-violet-400"
              style={{ color: "var(--text-secondary)" }}
            >
              <Icon
                className="h-4 w-4 transition-colors duration-200 group-hover:text-violet-400"
                style={{ color: "var(--text-muted)" } as React.CSSProperties}
              />
              <span>{tool.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const FooterFile: React.FC = () => {
  const pdfConversionTools: Tool[] = [
    { name: "PDF to Word", path: "/pdf-to-word", icon: FileText },
    { name: "PDF to PowerPoint", path: "/pdf-to-ppt", icon: Presentation },
    { name: "PDF to Excel", path: "/pdf-to-excel", icon: FileSpreadsheet },
    { name: "PDF to Image", path: "/pdf-to-image", icon: Image },
    { name: "Image to PDF", path: "/image-to-pdf", icon: FileImage },
    { name: "JPG to PDF", path: "/jpg-to-pdf", icon: FileImage },
  ];

  const convertToPdfTools: Tool[] = [
    { name: "HTML to PDF", path: "/html-to-pdf", icon: Code2 },
    { name: "Word to PDF", path: "/word-to-pdf", icon: FileText },
    { name: "PowerPoint to PDF", path: "/ppt-to-pdf", icon: Presentation },
    { name: "Excel to PDF", path: "/excel-to-pdf", icon: FileSpreadsheet },
    { name: "Merge PDF", path: "/merge-pdf", icon: Merge },
    { name: "Compress PDF", path: "/compress-pdf", icon: Minimize2 },
  ];
  const pdfUtilities: Tool[] = [
    { name: "Split PDF", path: "/split-pdf", icon: Scissors },
    { name: "Rotate PDF", path: "/rotate-pdf", icon: RotateCw },
    { name: "Crop PDF", path: "/crop-pdf", icon: Crop },
    { name: "Remove Pages", path: "/remove-pages", icon: Trash2 },
    { name: "Extract Pages", path: "/extract-pages", icon: Files },
    { name: "Protect PDF", path: "/protect-pdf", icon: LockKeyhole },
  ];

  const webTools: Tool[] = [
    { name: "HTML Viewer", path: "/html-viewer", icon: Code2 },
    { name: "Text to Image", path: "/text-to-image", icon: Sparkles },
    {
      name: "AI Background Remover",
      path: "/ai-background-remover",
      icon: ImageIcon,
    },
    { name: "QR Code Generator", path: "/qr-code-generator", icon: QrCode },
    {
      name: "Password Generator",
      path: "/password-generator",
      icon: LockKeyhole,
    },
    { name: "JSON Formatter", path: "/json-formatter", icon: Braces },
  ];

  return (
    <footer
      className="relative border-t mx-4"
      style={{
        backgroundColor: "var(--bg-base)",
        borderColor: "var(--border)",
      }}
    >
      {/* Top Glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <div className="mx-auto max-w-7xl">
        {/* Footer Main */}
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1fr] lg:gap-8 lg:py-14">
          {/* Brand */}
          <div className="lg:pr-8">
            <Link to="/" className="group inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 transition-transform duration-300 group-hover:scale-105">
                <Merge className="h-5 w-5 rotate-45" />
              </div>
              <span
                className="text-xl font-extrabold tracking-tight"
                style={{ color: "var(--text-heading)" }}
              >
                Convert<span className="text-violet-500">Hub</span>
              </span>
            </Link>

            <p
              className="mt-5 max-w-sm text-sm leading-7"
              style={{ color: "var(--text-secondary)" }}
            >
              Fast, secure, and private online tools for converting, editing,
              and managing your files directly in your browser.
            </p>
          </div>

          <FooterColumn title="PDF Conversion" tools={pdfConversionTools} />
          <FooterColumn title="Convert to PDF" tools={convertToPdfTools} />
          <FooterColumn title="PDF Utilities" tools={pdfUtilities} />
          <FooterColumn title="Web Tools" tools={webTools} />
        </div>

        {/* Bottom */}
        <div className="border-t" style={{ borderColor: "var(--border-soft)" }}>
          <div className="flex flex-col items-center justify-center gap-3 pt-6 text-center sm:flex-row sm:text-left">
            <p
              className="text-xs sm:text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              © {new Date().getFullYear()} ConvertHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterFile;
