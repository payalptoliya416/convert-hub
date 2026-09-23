import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  Presentation,
  Table,
  Image,
  FileImage,
  Merge,
  Minimize2,
  Code2,
  Scissors,
  RotateCw,
  Crop,
  FileX,
  FileOutput,
  Lock,
  Home,
  ChevronDown,
  Menu,
  X,
  FileCode2,
  Sparkles,
  ImageIcon,
  QrCode,
  LockKeyhole,
  Braces,
  Search,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface LayoutProps {
  children: React.ReactNode;
}

const dropdownTools = [
  {
    name: "PDF to Word",
    path: "/pdf-to-word",
    icon: FileText,
    color: "text-blue-400",
  },
  {
    name: "PDF to PowerPoint",
    path: "/pdf-to-ppt",
    icon: Presentation,
    color: "text-orange-400",
  },
  {
    name: "PDF to Excel",
    path: "/pdf-to-excel",
    icon: Table,
    color: "text-emerald-400",
  },
  {
    name: "PDF to Image",
    path: "/pdf-to-image",
    icon: Image,
    color: "text-purple-400",
  },
  {
    name: "Image to PDF",
    path: "/image-to-pdf",
    icon: FileImage,
    color: "text-rose-400",
  },
  {
    name: "JPG to PDF",
    path: "/jpg-to-pdf",
    icon: FileImage,
    color: "text-pink-400",
  },
  {
    name: "HTML to PDF",
    path: "/html-to-pdf",
    icon: Code2,
    color: "text-violet-400",
  },
  {
    name: "Word to PDF",
    path: "/word-to-pdf",
    icon: FileText,
    color: "text-blue-500",
  },
  {
    name: "PowerPoint to PDF",
    path: "/ppt-to-pdf",
    icon: Presentation,
    color: "text-orange-500",
  },
  {
    name: "Excel to PDF",
    path: "/excel-to-pdf",
    icon: Table,
    color: "text-emerald-500",
  },
  {
    name: "Merge PDF",
    path: "/merge-pdf",
    icon: Merge,
    color: "text-violet-400",
  },
  {
    name: "Compress PDF",
    path: "/compress-pdf",
    icon: Minimize2,
    color: "text-cyan-400",
  },
  {
    name: "Split PDF",
    path: "/split-pdf",
    icon: Scissors,
    color: "text-purple-400",
  },
  {
    name: "Rotate PDF",
    path: "/rotate-pdf",
    icon: RotateCw,
    color: "text-cyan-400",
  },
  { name: "Crop PDF", path: "/crop-pdf", icon: Crop, color: "text-orange-400" },
  {
    name: "Remove Pages",
    path: "/remove-pages",
    icon: FileX,
    color: "text-rose-500",
  },
  {
    name: "Extract Pages",
    path: "/extract-pages",
    icon: FileOutput,
    color: "text-emerald-400",
  },
  {
    name: "Protect PDF",
    path: "/protect-pdf",
    icon: Lock,
    color: "text-pink-500",
  },
  {
    name: "HTML Viewer",
    path: "/html-viewer",
    icon: FileCode2,
    color: "text-violet-400",
  },
  {
    name: "Text to Image",
    path: "/text-to-image",
    icon: Sparkles,
    color: "text-fuchsia-400",
  },
  {
    name: "AI Background Remover",
    path: "/ai-background-remover",
    icon: ImageIcon,
    color: "text-pink-400",
  },
  {
    name: "QR Code Generator",
    path: "/qr-code-generator",
    icon: QrCode,
    color: "text-cyan-400",
  },
  {
    name: "Password Generator",
    path: "/password-generator",
    icon: LockKeyhole,
    color: "text-amber-400",
  },
  {
    name: "JSON Formatter",
    path: "/json-formatter",
    icon: Braces,
    color: "text-cyan-400",
  },
];

export default function Layout({ children }: LayoutProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useTheme();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{
        backgroundColor: "var(--bg-base)",
        color: "var(--text-primary)",
      }}
    >
      {/* Navbar */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{
          backgroundColor:
            location.pathname === "/" ? "transparent" : "var(--nav-bg)",
          borderColor:
            location.pathname === "/" ? "transparent" : "var(--nav-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/20 group-hover:scale-105 transition duration-300">
              <Merge className="w-5 h-5 rotate-45" />
            </div>
            <span
              className="font-extrabold text-xl tracking-tight group-hover:text-violet-400 transition"
              style={{ color: "var(--text-heading)" }}
            >
              Convert<span className="text-violet-500">Hub</span>
            </span>
          </Link>

          {/* Right side: Theme toggle + mobile menu */}
          <div className="flex items-center gap-2">
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`text-sm font-semibold flex items-center gap-1.5 transition ${
                  location.pathname === "/"
                    ? "text-violet-400"
                    : "hover:text-white"
                }`}
                style={
                  location.pathname !== "/"
                    ? { color: "var(--text-secondary)" }
                    : {}
                }
              >
                <Home className="w-4 h-4" /> Dashboard
              </Link>

              {/* Tools Dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`text-sm font-semibold flex items-center gap-1 transition cursor-pointer ${
                    location.pathname !== "/"
                      ? "text-violet-400"
                      : "hover:text-white"
                  }`}
                  style={
                    location.pathname === "/"
                      ? { color: "var(--text-secondary)" }
                      : {}
                  }
                >
                  All Tools{" "}
                  <ChevronDown
                    className={`w-4 h-4 transition duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => {
                        setDropdownOpen(false);
                        setSearchQuery("");
                      }}
                    ></div>

                    <div
                      className="custom-scrollbar absolute right-0 mt-3 w-80 max-h-[70vh] rounded-2xl border shadow-2xl z-20 flex flex-col overflow-hidden"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--bg-surface)",
                      }}
                    >
                      {/* Search */}
                      <div
                        className="relative p-3 border-b shrink-0"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <Search
                          className="absolute left-6 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                          style={{ color: "var(--text-muted)" }}
                        />
                        <input
                          ref={searchRef}
                          autoFocus
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const filtered = dropdownTools.filter((t) =>
                                t.name
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase()),
                              );
                              if (filtered.length === 1) {
                                navigate(filtered[0].path);
                                setDropdownOpen(false);
                                setSearchQuery("");
                              }
                            }
                            if (e.key === "Escape") {
                              setDropdownOpen(false);
                              setSearchQuery("");
                            }
                          }}
                          placeholder="Search tools..."
                          className="w-full pl-9 pr-8 py-2 rounded-xl border text-sm outline-none focus:border-violet-500 transition"
                          style={{
                            backgroundColor: "var(--bg-input)",
                            borderColor: "var(--border)",
                            color: "var(--text-primary)",
                          }}
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-6 top-1/2 -translate-y-1/2 transition"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Tool List */}
                      <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
                        {(() => {
                          const filtered = dropdownTools.filter((t) =>
                            t.name
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()),
                          );
                          if (filtered.length === 0) {
                            return (
                              <div
                                className="px-3 py-6 text-center text-sm"
                                style={{ color: "var(--text-muted)" }}
                              >
                                No tools found
                              </div>
                            );
                          }
                          return filtered.map((tool) => {
                            const Icon = tool.icon;
                            const isActive = location.pathname === tool.path;
                            return (
                              <Link
                                key={tool.path}
                                to={tool.path}
                                onClick={() => {
                                  setDropdownOpen(false);
                                  setSearchQuery("");
                                }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                                  isActive
                                    ? "bg-violet-600/10 text-violet-400 font-semibold"
                                    : "hover:text-white"
                                }`}
                                style={
                                  !isActive
                                    ? {
                                        color: "var(--text-secondary)",
                                      }
                                    : {}
                                }
                                onMouseEnter={(e) => {
                                  if (!isActive)
                                    (
                                      e.currentTarget as HTMLElement
                                    ).style.backgroundColor = "var(--bg-hover)";
                                }}
                                onMouseLeave={(e) => {
                                  if (!isActive)
                                    (
                                      e.currentTarget as HTMLElement
                                    ).style.backgroundColor = "";
                                }}
                              >
                                <Icon
                                  className={`w-4 h-4 shrink-0 ${tool.color}`}
                                />
                                {searchQuery ? (
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: tool.name.replace(
                                        new RegExp(
                                          `(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
                                          "gi",
                                        ),
                                        '<mark class="bg-violet-500/20 text-violet-600 dark:text-violet-300 rounded px-0.5" style="background-color:var(--search-highlight-bg,rgba(139,92,246,0.25));color:var(--search-highlight-text,#7c3aed)">$1</mark>',
                                      ),
                                    }}
                                  />
                                ) : (
                                  tool.name
                                )}
                              </Link>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </nav>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className="p-2 rounded-lg border transition cursor-pointer"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 border rounded-lg transition cursor-pointer"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t shadow-2xl flex flex-col"
            style={{
              maxHeight: "calc(100dvh - 64px)",
              backgroundColor: "var(--bg-base)",
              borderColor: "var(--border)",
            }}
          >
            {/* Dashboard link */}
            <div className="px-4 pt-3 pb-2 shrink-0">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-xl text-sm font-semibold transition"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--bg-surface)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "")
                }
              >
                Dashboard
              </Link>
            </div>

            {/* Search bar */}
            <div
              className="px-4 pb-3 shrink-0 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border text-sm outline-none focus:border-violet-500 transition"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable tool list */}
            <div className="overflow-y-auto flex-1 px-4 py-3">
              {(() => {
                const filtered = dropdownTools.filter((t) =>
                  t.name.toLowerCase().includes(searchQuery.toLowerCase()),
                );
                if (filtered.length === 0) {
                  return (
                    <div
                      className="py-8 text-center text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No tools found
                    </div>
                  );
                }
                return (
                  <div className="flex flex-col gap-1">
                    {filtered.map((tool) => {
                      const isActive = location.pathname === tool.path;
                      return (
                        <Link
                          key={tool.path}
                          to={tool.path}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setSearchQuery("");
                          }}
                          className={`flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm transition ${
                            isActive
                              ? "bg-violet-600/10 text-violet-400 font-semibold"
                              : ""
                          }`}
                          style={
                            !isActive ? { color: "var(--text-secondary)" } : {}
                          }
                          onMouseEnter={(e) => {
                            if (!isActive)
                              (
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor = "var(--bg-surface)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive)
                              (
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor = "";
                          }}
                        >
                          <tool.icon
                            className={`w-4 h-4 shrink-0 ${tool.color}`}
                          />
                          <span className="truncate">{tool.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-[1400px] w-full mx-auto px-6 py-7 relative">
        {children}
        {/* Bottom decorative gradient blobs */}
        <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-0">
          {/* Left blob — violet/purple */}
          <div
            className="absolute bottom-0 left-[-80px] w-[420px] h-[220px] rounded-full blur-[70px] opacity-25"
            style={{
              background:
                "radial-gradient(ellipse, #7c3aed 0%, #4f46e5 50%, transparent 75%)",
            }}
          />
          {/* Center blob — pink */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[180px] rounded-full blur-[80px] opacity-15"
            style={{
              background:
                "radial-gradient(ellipse, #ec4899 0%, #a855f7 55%, transparent 75%)",
            }}
          />
          {/* Right blob — indigo/blue */}
          <div
            className="absolute bottom-0 right-[-60px] w-[380px] h-[200px] rounded-full blur-[65px] opacity-20"
            style={{
              background:
                "radial-gradient(ellipse, #6366f1 0%, #0ea5e9 55%, transparent 75%)",
            }}
          />
        </div>
      </main>
    </div>
  );
}
