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
  Mail,
} from "lucide-react";

const Footer: React.FC = () => {
  const pdfTools = [
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

  const convertTools = [
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

  const pdfUtilities = [
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
      {/* Subtle top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* Footer Content */}
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr] lg:gap-10 lg:py-14">

          {/* Brand */}
          <div className="lg:pr-6">
            <Link
              to="/"
              className="group inline-flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 transition-all duration-300 group-hover:scale-105">
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

            <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3 py-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Your files stay private and secure.</span>
            </div>
          </div>

          {/* PDF Conversion */}
          <FooterColumn
            title="PDF Conversion"
            tools={pdfTools}
          />

          {/* Convert to PDF */}
          <FooterColumn
            title="Convert to PDF"
            tools={convertTools}
          />

          {/* PDF Utilities */}
          <FooterColumn
            title="PDF Utilities"
            tools={pdfUtilities}
          />
        </div>

        {/* Company Links */}
        <div className="border-t border-slate-800/80 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:justify-start">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              Company
            </span>

            <Link
              to="/"
              className="text-sm text-slate-400 transition hover:text-violet-400"
            >
              Home
            </Link>

            <Link
              to="/about"
              className="text-sm text-slate-400 transition hover:text-violet-400"
            >
              About Us
            </Link>

            <Link
              to="/privacy"
              className="text-sm text-slate-400 transition hover:text-violet-400"
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms"
              className="text-sm text-slate-400 transition hover:text-violet-400"
            >
              Terms of Service
            </Link>

            <Link
              to="/contact"
              className="flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-violet-400"
            >
              <Mail className="h-4 w-4" />
              Contact Us
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800/80">
          <div className="flex flex-col items-center justify-between gap-3 py-6 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-slate-500 sm:text-sm">
              © {new Date().getFullYear()} ConvertHub. All rights reserved.
            </p>

            <p className="text-xs text-slate-500 sm:text-sm">
              Free tools. No registration. No hidden charges.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};


/* Reusable Footer Column */
interface Tool {
  name: string;
  path: string;
  icon: React.ElementType;
}

interface FooterColumnProps {
  title: string;
  tools: Tool[];
}

const FooterColumn: React.FC<FooterColumnProps> = ({
  title,
  tools,
}) => {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white">
        {title}
      </h3>

      <div className="mt-5 space-y-3.5">
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

export default Footer;