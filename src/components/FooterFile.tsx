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

const FooterColumn: React.FC<FooterColumnProps> = ({ title, tools }) => (
  <div>
    <h3 className="text-xs font-bold uppercase tracking-[0.18em] mb-4"
      style={{ color: "var(--text-heading)" }}>
      {title}
    </h3>
    <ul className="space-y-2.5">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <li key={tool.path}>
            <Link
              to={tool.path}
              className="group flex items-center gap-2 text-sm transition-all duration-200 hover:translate-x-1"
              style={{ color: "var(--text-footer)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#a78bfa"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
              <span>{tool.name}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  </div>
);

/* ── Social icon SVGs — standalone so no className prop issue ── */
const IconFacebook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const IconInstagram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
const IconLinkedIn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
const IconYouTube = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
  </svg>
);

const socialLinks = [
  { Ico: IconFacebook,  href: "#", label: "Facebook"  },
  { Ico: IconX,         href: "#", label: "X"         },
  { Ico: IconInstagram, href: "#", label: "Instagram" },
  { Ico: IconLinkedIn,  href: "#", label: "LinkedIn"  },
  { Ico: IconYouTube,   href: "#", label: "YouTube"   },
];

const FooterFile: React.FC = () => {
  const pdfConversionTools: Tool[] = [
    { name: "PDF to Word",       path: "/pdf-to-word",  icon: FileText        },
    { name: "PDF to PowerPoint", path: "/pdf-to-ppt",   icon: Presentation    },
    { name: "PDF to Excel",      path: "/pdf-to-excel", icon: FileSpreadsheet },
    { name: "PDF to Image",      path: "/pdf-to-image", icon: Image           },
    { name: "Image to PDF",      path: "/image-to-pdf", icon: FileImage       },
    { name: "JPG to PDF",        path: "/jpg-to-pdf",   icon: FileImage       },
  ];

  const convertToPdfTools: Tool[] = [
    { name: "HTML to PDF",       path: "/html-to-pdf",  icon: Code2           },
    { name: "Word to PDF",       path: "/word-to-pdf",  icon: FileText        },
    { name: "PowerPoint to PDF", path: "/ppt-to-pdf",   icon: Presentation    },
    { name: "Excel to PDF",      path: "/excel-to-pdf", icon: FileSpreadsheet },
    { name: "Merge PDF",         path: "/merge-pdf",    icon: Merge           },
    { name: "Compress PDF",      path: "/compress-pdf", icon: Minimize2       },
  ];

  const pdfUtilities: Tool[] = [
    { name: "Split PDF",     path: "/split-pdf",    icon: Scissors    },
    { name: "Rotate PDF",    path: "/rotate-pdf",   icon: RotateCw    },
    { name: "Crop PDF",      path: "/crop-pdf",     icon: Crop        },
    { name: "Remove Pages",  path: "/remove-pages", icon: Trash2      },
    { name: "Extract Pages", path: "/extract-pages",icon: Files       },
    { name: "Protect PDF",   path: "/protect-pdf",  icon: LockKeyhole },
  ];

  const webTools: Tool[] = [
    { name: "HTML Viewer",           path: "/html-viewer",           icon: Code2       },
    { name: "Text to Image",         path: "/text-to-image",         icon: Sparkles    },
    { name: "AI Background Remover", path: "/ai-background-remover", icon: ImageIcon   },
    { name: "QR Code Generator",     path: "/qr-code-generator",     icon: QrCode      },
    { name: "Password Generator",    path: "/password-generator",    icon: LockKeyhole },
    { name: "JSON Formatter",        path: "/json-formatter",        icon: Braces      },
  ];

  return (
    <footer
      className="relative overflow-hidden border-t"
      style={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border)" }}
    >
      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      {/* Content — sits above the image via z-10 */}
      <div className="relative z-10 mx-auto max-w-[1400px] px-6">

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] lg:gap-10 lg:py-16">

          {/* Brand column */}
          <div className="flex flex-col gap-5 lg:pr-6">
            <Link to="/" className="group inline-flex items-center gap-3 w-fit">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-600/25 transition-transform duration-300 group-hover:scale-105">
                <Merge className="h-5 w-5 rotate-45" />
              </div>
              <span className="text-xl font-extrabold tracking-tight" style={{ color: "var(--text-heading)" }}>
                Convert<span className="text-violet-500">Hub</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed max-w-[260px]" style={{ color: "var(--text-footer)" }}>
              Fast, secure, and private online tools for converting, editing, and managing
              your files directly in your browser.
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              {socialLinks.map(({ Ico, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/50 hover:text-violet-400"
                  style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)", color: "var(--text-muted)" }}
                >
                  <Ico />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="PDF Conversion" tools={pdfConversionTools} />
          <FooterColumn title="Convert to PDF"  tools={convertToPdfTools}  />
          <FooterColumn title="PDF Utilities"   tools={pdfUtilities}       />
          <FooterColumn title="Web Tools"       tools={webTools}           />
        </div>

        {/* Divider */}
        <div className="h-px w-full" style={{ backgroundColor: "var(--border-soft)" }} />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row sm:gap-0">
          <p className="text-sm order-2 sm:order-1" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>ConvertHub</span>
            . All rights reserved.
          </p>

          <div className="flex items-center gap-6 order-1 sm:order-2">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm transition hover:text-violet-400"
                style={{ color: "var(--text-muted)" }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default FooterFile;
