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
  ShieldCheck,
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
      <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white">
        {title}
      </h3>

      <div className="mt-5 space-y-3">
        {tools.map((tool) => {
          const Icon = tool.icon;

          return (
            <Link
              key={tool.path}
              to={tool.path}
              className="group flex w-fit items-center gap-2.5 text-sm text-slate-400 transition-all duration-200 hover:translate-x-1 hover:text-violet-400"
            >
              <Icon className="h-4 w-4 text-slate-500 transition-colors duration-200 group-hover:text-violet-400" />

              <span>{tool.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const FooterFile: React.FC = () => {
  // PDF Conversion
  const pdfConversionTools: Tool[] = [
    {
      name: "PDF to Word",
      path: "/pdf-to-word",
      icon: FileText,
    },
    {
      name: "PDF to PowerPoint",
      path: "/pdf-to-ppt",
      icon: Presentation,
    },
    {
      name: "PDF to Excel",
      path: "/pdf-to-excel",
      icon: FileSpreadsheet,
    },
    {
      name: "PDF to Image",
      path: "/pdf-to-image",
      icon: Image,
    },
    {
      name: "Image to PDF",
      path: "/image-to-pdf",
      icon: FileImage,
    },
    {
      name: "JPG to PDF",
      path: "/jpg-to-pdf",
      icon: FileImage,
    },
  ];

  // Convert to PDF
  const convertToPdfTools: Tool[] = [
    {
      name: "HTML to PDF",
      path: "/html-to-pdf",
      icon: Code2,
    },
    {
      name: "Word to PDF",
      path: "/word-to-pdf",
      icon: FileText,
    },
    {
      name: "PowerPoint to PDF",
      path: "/ppt-to-pdf",
      icon: Presentation,
    },
    {
      name: "Excel to PDF",
      path: "/excel-to-pdf",
      icon: FileSpreadsheet,
    },
    {
      name: "Merge PDF",
      path: "/merge-pdf",
      icon: Merge,
    },
    {
      name: "Compress PDF",
      path: "/compress-pdf",
      icon: Minimize2,
    },
  ];

  // PDF Utilities
  const pdfUtilities: Tool[] = [
    {
      name: "Split PDF",
      path: "/split-pdf",
      icon: Scissors,
    },
    {
      name: "Rotate PDF",
      path: "/rotate-pdf",
      icon: RotateCw,
    },
    {
      name: "Crop PDF",
      path: "/crop-pdf",
      icon: Crop,
    },
    {
      name: "Remove Pages",
      path: "/remove-pages",
      icon: Trash2,
    },
    {
      name: "Extract Pages",
      path: "/extract-pages",
      icon: Files,
    },
    {
      name: "Protect PDF",
      path: "/protect-pdf",
      icon: LockKeyhole,
    },
  ];

  return (
    <footer className="relative border-t border-slate-800 bg-slate-950">
      {/* Top Glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <div className="mx-auto container">

        {/* Footer Main */}
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr] lg:gap-12 lg:py-14">

          {/* Brand */}
          <div className="lg:pr-8">
            <Link
              to="/"
              className="group inline-flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 transition-transform duration-300 group-hover:scale-105">
                <Merge className="h-5 w-5 rotate-45" />
              </div>

              <span className="text-xl font-extrabold tracking-tight text-white">
                Convert<span className="text-violet-500">Hub</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Fast, secure, and private online tools for converting,
              editing, and managing your files directly in your browser.
            </p>

          </div>

          {/* PDF Conversion */}
          <FooterColumn
            title="PDF Conversion"
            tools={pdfConversionTools}
          />

          {/* Convert to PDF */}
          <FooterColumn
            title="Convert to PDF"
            tools={convertToPdfTools}
          />

          {/* PDF Utilities */}
          <FooterColumn
            title="PDF Utilities"
            tools={pdfUtilities}
          />
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800/80">
          <div className="flex flex-col items-center justify-between gap-3 py-6 text-center sm:flex-row sm:text-left">

            <p className="text-xs text-slate-500 sm:text-sm">
              © {new Date().getFullYear()} ConvertHub. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-end">
              <Link
                to="/"
                className="text-xs text-slate-500 transition hover:text-violet-400 sm:text-sm"
              >
                Home
              </Link>

              <Link
                to="/about"
                className="text-xs text-slate-500 transition hover:text-violet-400 sm:text-sm"
              >
                About Us
              </Link>

              <Link
                to="/privacy"
                className="text-xs text-slate-500 transition hover:text-violet-400 sm:text-sm"
              >
                Privacy Policy
              </Link>

              <Link
                to="/terms"
                className="text-xs text-slate-500 transition hover:text-violet-400 sm:text-sm"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default FooterFile;