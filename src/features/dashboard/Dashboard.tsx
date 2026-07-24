import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Presentation, 
  Table, 
  Image, 
  FileImage, 
  Merge, 
  Minimize2, 
  ArrowRight,
  Shield,
  Zap,
  Lock,
  Search
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: React.ComponentType<any>;
  color: string;
  category: 'from-pdf' | 'to-pdf' | 'utils';
  badge?: string;
  popular?: boolean;
}

const tools: Tool[] = [
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF files to editable DOCX documents with high layout preservation.',
    path: '/pdf-to-word',
    icon: FileText,
    color: 'from-blue-500 to-indigo-600 shadow-blue-500/20',
    category: 'from-pdf',
    popular: true
  },
  {
    id: 'pdf-to-ppt',
    name: 'PDF to PowerPoint',
    description: 'Convert your PDF pages into slides for PPTX presentations perfectly.',
    path: '/pdf-to-ppt',
    icon: Presentation,
    color: 'from-orange-500 to-red-600 shadow-orange-500/20',
    category: 'from-pdf',
    popular: true
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    description: 'Extract tabular data from PDF files to clean Excel spreadsheet sheets.',
    path: '/pdf-to-excel',
    icon: Table,
    color: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
    category: 'from-pdf'
  },
  {
    id: 'pdf-to-image',
    name: 'PDF to Image',
    description: 'Extract pages from a PDF document as high-resolution PNG or JPG images.',
    path: '/pdf-to-image',
    icon: Image,
    color: 'from-purple-500 to-pink-600 shadow-purple-500/20',
    category: 'from-pdf',
    popular: true
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    description: 'Convert JPG, PNG, WebP images to a single PDF document in seconds.',
    path: '/image-to-pdf',
    icon: FileImage,
    color: 'from-rose-500 to-pink-600 shadow-rose-500/20',
    category: 'to-pdf'
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert Microsoft Word DOCX files into PDF documents easily.',
    path: '/word-to-pdf',
    icon: FileText,
    color: 'from-blue-600 to-sky-500 shadow-blue-600/20',
    category: 'to-pdf'
  },
  {
    id: 'ppt-to-pdf',
    name: 'PowerPoint to PDF',
    description: 'Convert presentation slides (.pptx) into clean PDF documents.',
    path: '/ppt-to-pdf',
    icon: Presentation,
    color: 'from-orange-600 to-amber-500 shadow-orange-600/20',
    category: 'to-pdf'
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    description: 'Convert Excel files (.xlsx) to formatted PDF documents.',
    path: '/excel-to-pdf',
    icon: Table,
    color: 'from-emerald-600 to-green-500 shadow-emerald-600/20',
    category: 'to-pdf'
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into a single document in your preferred order.',
    path: '/merge-pdf',
    icon: Merge,
    color: 'from-violet-500 to-purple-600 shadow-violet-500/20',
    category: 'utils',
    badge: 'Popular'
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce PDF file size without sacrificing readability or image quality.',
    path: '/compress-pdf',
    icon: Minimize2,
    color: 'from-cyan-500 to-blue-600 shadow-cyan-500/20',
    category: 'utils'
  }
];

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'from-pdf' | 'to-pdf' | 'utils'>('all');

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative text-center py-16 px-4 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent"></div>
        <div className="relative max-w-4xl mx-auto space-y-6">
          <span className="px-3 py-1 text-xs font-semibold tracking-wider text-violet-400 bg-violet-400/10 rounded-full border border-violet-400/20 inline-block uppercase">
            100% Free & Browser-Based
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            Convert Files Locally with <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400">Convert Hub</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Fast, secure, and private conversion. Your files never touch our servers — all processing happens directly in your browser.
          </p>

          {/* Search bar */}
          <div className="relative max-w-lg mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tools... (e.g. PDF to Word, Merge PDF)"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition shadow-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12 pt-10 border-t border-slate-800/80 text-left">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Absolute Privacy</h4>
              <p className="text-xs text-slate-400 mt-1">Files never leave your machine. Zero uploads.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Instant Speed</h4>
              <p className="text-xs text-slate-400 mt-1">Conversions occur instantly using web assembly.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Unlimited & Free</h4>
              <p className="text-xs text-slate-400 mt-1">No file size limits, subscription costs, or signups.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 justify-center border-b border-slate-800 pb-4">
        {(['all', 'from-pdf', 'to-pdf', 'utils'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition cursor-pointer ${
              activeCategory === cat
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {cat === 'all' && 'All Tools'}
            {cat === 'from-pdf' && 'Convert from PDF'}
            {cat === 'to-pdf' && 'Convert to PDF'}
            {cat === 'utils' && 'PDF Utilities'}
          </button>
        ))}
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              to={tool.path}
              className="group relative flex flex-col justify-between p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div className="absolute -inset-px bg-gradient-to-r opacity-0 group-hover:opacity-100 transition duration-300 -z-10 rounded-2xl blur-lg bg-slate-800/50"></div>
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${tool.color} text-white shadow-lg`}>
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
                
                <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition">
                  {tool.name}
                </h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
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
      
      {filteredTools.length === 0 && (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 border-dashed">
          <p className="text-slate-500">No tools found matching your search term.</p>
        </div>
      )}
    </div>
  );
}
