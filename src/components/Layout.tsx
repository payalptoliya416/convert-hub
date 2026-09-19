import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const dropdownTools = [
  { name: 'PDF to Word', path: '/pdf-to-word', icon: FileText, color: 'text-blue-400' },
  { name: 'PDF to PowerPoint', path: '/pdf-to-ppt', icon: Presentation, color: 'text-orange-400' },
  { name: 'PDF to Excel', path: '/pdf-to-excel', icon: Table, color: 'text-emerald-400' },
  { name: 'PDF to Image', path: '/pdf-to-image', icon: Image, color: 'text-purple-400' },
  { name: 'Image to PDF', path: '/image-to-pdf', icon: FileImage, color: 'text-rose-400' },
  { name: 'JPG to PDF', path: '/jpg-to-pdf', icon: FileImage, color: 'text-pink-400' },
  { name: 'HTML to PDF', path: '/html-to-pdf', icon: Code2, color: 'text-violet-400' },
  { name: 'Word to PDF', path: '/word-to-pdf', icon: FileText, color: 'text-blue-500' },
  { name: 'PowerPoint to PDF', path: '/ppt-to-pdf', icon: Presentation, color: 'text-orange-500' },
  { name: 'Excel to PDF', path: '/excel-to-pdf', icon: Table, color: 'text-emerald-500' },
  { name: 'Merge PDF', path: '/merge-pdf', icon: Merge, color: 'text-violet-400' },
  { name: 'Compress PDF', path: '/compress-pdf', icon: Minimize2, color: 'text-cyan-400' },
  { name: 'Split PDF', path: '/split-pdf', icon: Scissors, color: 'text-purple-400' },
  { name: 'Rotate PDF', path: '/rotate-pdf', icon: RotateCw, color: 'text-cyan-400' },
  { name: 'Crop PDF', path: '/crop-pdf', icon: Crop, color: 'text-orange-400' },
  { name: 'Remove Pages', path: '/remove-pages', icon: FileX, color: 'text-rose-500' },
  { name: 'Extract Pages', path: '/extract-pages', icon: FileOutput, color: 'text-emerald-400' },
  { name: 'Protect PDF', path: '/protect-pdf', icon: Lock, color: 'text-pink-500' },
];

export default function Layout({ children }: LayoutProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-violet-600/30 selection:text-white">

      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/75 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/20 group-hover:scale-105 transition duration-300">
              <Merge className="w-5 h-5 rotate-45" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-violet-400 transition">
              Convert<span className="text-violet-500">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`text-sm font-semibold flex items-center gap-1.5 transition ${location.pathname === '/' ? 'text-violet-400' : 'text-slate-400 hover:text-white'}`}
            >
              <Home className="w-4 h-4" /> Dashboard
            </Link>

            {/* Tools Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`text-sm font-semibold flex items-center gap-1 transition cursor-pointer ${
                  location.pathname !== '/' ? 'text-violet-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Tools <ChevronDown className={`w-4 h-4 transition duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <>
                  {/* Backdrop overlay to close dropdown */}
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                  
                  <div className="custom-scrollbar absolute right-0 mt-3 w-80 max-h-[70vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-3 shadow-2xl z-20 grid grid-cols-1 gap-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 mb-1">
                      Available Converters
                    </div>
                    {dropdownTools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <Link
                          key={tool.path}
                          to={tool.path}
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                            location.pathname === tool.path 
                              ? 'bg-violet-600/10 text-violet-400 font-semibold' 
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${tool.color}`} />
                          {tool.name}
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-900 bg-slate-950 px-4 py-4 space-y-4 shadow-2xl">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-900"
            >
              Dashboard
            </Link>
            <div className="border-t border-slate-900 pt-2 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Tools
              </div>
              <div className="grid grid-cols-2 gap-1">
                {dropdownTools.map((tool) => (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs text-slate-300 hover:bg-slate-900"
                  >
                    <tool.icon className={`w-3.5 h-3.5 ${tool.color}`} />
                    {tool.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 pt-7">
        {children}
      </main>
    </div>
  );
}
