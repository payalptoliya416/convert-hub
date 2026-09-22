import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import WhyChooseUs from '../../components/WhyChooseUs';
import HowItWorks from '../../components/HowItWorks';
import TrustedStats from '../../components/TrustedStats';
import FooterFile from '../../components/FooterFile';
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
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: React.ComponentType<any>;
  color: string;
  category: 'from-pdf' | 'to-pdf' | 'utils' | 'web-tools';
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
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    description: 'Quickly convert a single JPG or PNG image to a PDF page sized to the image.',
    path: '/jpg-to-pdf',
    icon: FileImage,
    color: 'from-rose-400 to-pink-500 shadow-rose-400/20',
    category: 'to-pdf'
  },
  {
    id: 'html-to-pdf',
    name: 'HTML to PDF',
    description: 'Convert HTML content or rich text into a downloadable PDF.',
    path: '/html-to-pdf',
    icon: FileText,
    color: 'from-indigo-500 to-violet-600 shadow-indigo-500/20',
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
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Extract specific pages from PDF into a new document.',
    path: '/split-pdf',
    icon: Copy,
    color: 'from-purple-500 to-indigo-600 shadow-purple-500/20',
    category: 'utils'
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    description: 'Rotate all pages of your PDF document by 90°, 180°, or 270°.',
    path: '/rotate-pdf',
    icon: RotateCw,
    color: 'from-cyan-500 to-teal-600 shadow-cyan-500/20',
    category: 'utils'
  },
  {
    id: 'crop-pdf',
    name: 'Crop PDF',
    description: 'Remove margins from PDF pages by cropping from all sides.',
    path: '/crop-pdf',
    icon: Crop,
    color: 'from-amber-500 to-orange-600 shadow-amber-500/20',
    category: 'utils'
  },
  {
    id: 'remove-pages',
    name: 'Remove pages',
    description: 'Remove specific pages from a PDF and download the result.',
    path: '/remove-pages',
    icon: FileText,
    color: 'from-red-500 to-rose-600 shadow-red-500/20',
    category: 'utils'
  },
  {
    id: 'extract-pages',
    name: 'Extract pages',
    description: 'Extract specific pages from a PDF into a new document.',
    path: '/extract-pages',
    icon: FileText,
    color: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
    category: 'utils'
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
    id: 'protect-pdf',
    name: 'Protect PDF',
    description: 'Add password protection to encrypt your PDF documents.',
    path: '/protect-pdf',
    icon: Lock,
    color: 'from-red-500 to-pink-600 shadow-red-500/20',
    category: 'utils'
  },
  {
    id: 'html-viewer',
    name: 'HTML Viewer',
    description: 'View and preview HTML files directly in your browser with live rendering.',
    path: '/html-viewer',
    icon: Code2,
    color: 'from-violet-500 to-indigo-600 shadow-violet-500/20',
    category: 'web-tools',
  },

  // Text to Image
  {
    id: 'text-to-image',
    name: 'Text to Image',
    description:
      'Turn your text description into a beautiful AI-generated image directly in your browser.',
    path: '/text-to-image',
    icon: Sparkles,
    color: 'from-fuchsia-500 to-violet-600 shadow-fuchsia-500/20',
    category: 'web-tools',
    badge: 'New',
  },

  // Image Background Remover
  {
    id: 'remove-background',
    name: 'Remove Background',
    description: 'Remove backgrounds from your images and download transparent PNG images.',
    path: '/remove-background',
    icon: ImageIcon,
    color: 'from-pink-500 to-rose-600 shadow-pink-500/20',
    category: 'web-tools',
  },
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    description: 'Create QR codes for URLs, text, phone numbers, emails, and more.',
    path: '/qr-code-generator',
    icon: QrCode,
    color: 'from-cyan-500 to-blue-600 shadow-cyan-500/20',
    category: 'web-tools',
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate strong and secure passwords with customizable options.',
    path: '/password-generator',
    icon: LockKeyhole,
    color: 'from-amber-500 to-orange-600 shadow-amber-500/20',
    category: 'web-tools',
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, beautify, minify, and validate your JSON directly in your browser.',
    path: '/json-formatter',
    icon: Braces,
    color: 'from-cyan-500 to-teal-600 shadow-cyan-500/20',
    category: 'web-tools',
  },
];

export default function Dashboard() {
  const [searchTerm] = useState('');
  // const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'from-pdf' | 'to-pdf' | 'utils' | 'web-tools'>('all');

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative text-center px-4 rounded-3xl overflow-hidden">
        <div className="relative max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>
            Explore Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400">Tool Categories</span>
          </h1>
          <p className="text-base sm:text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            From PDF manipulation to code formatting, finance calculators to
            image editing — find the perfect tool for your needs.
          </p>

          {/* Search bar */}
          {/* <div className="relative max-w-lg mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tools... (e.g. PDF to Word, Merge PDF)"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition shadow-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div> */}
        </div>
      </section>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 justify-center pb-2">
        {(['all', 'from-pdf', 'to-pdf', 'utils', 'web-tools'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-5 py-1.5 rounded-full text-sm font-semibold transition cursor-pointer border"
            style={
              activeCategory === cat
                ? { backgroundColor: '#7c3aed', color: '#fff', borderColor: 'transparent', boxShadow: '0 4px 14px rgba(124,58,237,0.30)' }
                : { backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }
            }
          >
            {cat === 'all' && 'All Tools'}
            {cat === 'from-pdf' && 'Convert from PDF'}
            {cat === 'to-pdf' && 'Convert to PDF'}
            {cat === 'utils' && 'PDF Utilities'}
            {cat === 'web-tools' && 'Web Tools'}
          </button>
        ))}
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              to={tool.path}
              className="group relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-surface-60)',
                borderColor: 'var(--border-soft)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-surface)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-surface-60)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-soft)';
              }}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} text-white shadow-lg`}>
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
                  style={{ color: 'var(--text-heading)' }}
                >
                  {tool.name}
                </h3>
                <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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
        <div
          className="text-center py-16 rounded-2xl border border-dashed"
          style={{ backgroundColor: 'var(--bg-surface-60)', borderColor: 'var(--border)' }}
        >
          <p style={{ color: 'var(--text-muted)' }}>No tools found matching your search term.</p>
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
