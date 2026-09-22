import { readFileSync, writeFileSync } from 'fs';

const rules = [
  [/\bbg-slate-950\b/g,             'bg-[var(--bg-base)]'],
  [/\bbg-slate-900\/[0-9]+\b/g,     'bg-[var(--bg-surface-60)]'],
  [/\bbg-slate-950\/[0-9]+\b/g,     'bg-[var(--bg-surface-60)]'],
  [/\bbg-slate-900\b/g,             'bg-[var(--bg-surface)]'],
  [/\bbg-slate-800\b/g,             'bg-[var(--bg-hover)]'],
  [/\bborder-slate-900\b/g,         'border-[var(--border)]'],
  [/\bborder-slate-800\/[0-9]+\b/g, 'border-[var(--border-soft)]'],
  [/\bborder-slate-800\b/g,         'border-[var(--border)]'],
  [/\bborder-slate-700\/[0-9]+\b/g, 'border-[var(--border)]'],
  [/\bborder-slate-700\b/g,         'border-[var(--border-hover)]'],
  [/\btext-slate-100\b/g,           'text-[var(--text-primary)]'],
  [/\btext-slate-200\b/g,           'text-[var(--text-primary)]'],
  [/\btext-slate-300\b/g,           'text-[var(--text-secondary)]'],
  [/\btext-slate-400\b/g,           'text-[var(--text-secondary)]'],
  [/\btext-slate-500\b/g,           'text-[var(--text-muted)]'],
  [/\btext-slate-600\b/g,           'text-[var(--text-muted)]'],
  [/\bplaceholder:text-slate-[0-9]+\b/g, 'placeholder:text-[var(--text-muted)]'],
  [/\btext-white\b/g,               'text-[var(--text-heading)]'],
];

const files = [
  'src/features/compress-pdf/CompressPdf.tsx',
  'src/features/excel-to-pdf/ExcelToPdf.tsx',
  'src/features/extract-pages/ExtractPages.tsx',
  'src/features/jpg-to-pdf/JpgToPdf.tsx',
  'src/features/merge-pdf/MergePdf.tsx',
  'src/features/remove-pages/RemovePages.tsx',
];

for (const f of files) {
  let src = readFileSync(f, 'utf8');
  for (const [pat, rep] of rules) src = src.replace(pat, rep);
  writeFileSync(f, src, 'utf8');
  console.log('fixed: ' + f);
}
