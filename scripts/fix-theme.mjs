/**
 * Bulk light/dark theme migration.
 * Converts hardcoded Tailwind slate classes → CSS variable inline styles.
 *
 * Strategy: operates at the JSX className string level using regex.
 * Safe because we only target slate-800/900/950 colour tokens.
 *
 * Run:  node scripts/fix-theme.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';

// ── Files already updated ────────────────────────────────────────────────────
const SKIP = new Set([
  'Dashboard.tsx','Layout.tsx','Footer.tsx','FooterFile.tsx',
  'WhyChooseUs.tsx','HowItWorks.tsx','TrustedStats.tsx',
  'ThemeContext.tsx','App.tsx','routes.tsx',
  // partially done – will handle remainder via str_replace
  'JpgToPdf.tsx','CompressPdf.tsx','ExcelToPdf.tsx',
  'ExtractPages.tsx','MergePdf.tsx','RemovePages.tsx',
]);

// ── Walk src ─────────────────────────────────────────────────────────────────
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (extname(name) === '.tsx' && !SKIP.has(name)) out.push(full);
  }
  return out;
}

// ── Replacement rules ────────────────────────────────────────────────────────
// Each rule: [regex, replacement]
// We keep it simple: only replace bare class tokens INSIDE className="..." strings.
// JSX inline style injections are done separately where needed.

const CLASS_RULES = [
  // Backgrounds
  [/\bbg-slate-950\b/g,              '__BG_BASE__'],
  [/\bbg-slate-900\/[0-9]+\b/g,      '__BG_SURFACE_60__'],
  [/\bbg-slate-950\/[0-9]+\b/g,      '__BG_SURFACE_60__'],
  [/\bbg-slate-900\b/g,              '__BG_SURFACE__'],
  [/\bbg-slate-800\b/g,              '__BG_HOVER__'],

  // Borders
  [/\bborder-slate-900\b/g,          '__BORDER__'],
  [/\bborder-slate-800\/[0-9]+\b/g,  '__BORDER_SOFT__'],
  [/\bborder-slate-800\b/g,          '__BORDER__'],
  [/\bborder-slate-700\/[0-9]+\b/g,  '__BORDER__'],
  [/\bborder-slate-700\b/g,          '__BORDER_HOVER__'],

  // Text
  [/\btext-white\b/g,                '__TEXT_HEADING__'],
  [/\btext-slate-100\b/g,            '__TEXT_PRIMARY__'],
  [/\btext-slate-200\b/g,            '__TEXT_PRIMARY__'],
  [/\btext-slate-300\b/g,            '__TEXT_SECONDARY__'],
  [/\btext-slate-400\b/g,            '__TEXT_SECONDARY__'],
  [/\btext-slate-500\b/g,            '__TEXT_MUTED__'],
  [/\btext-slate-600\b/g,            '__TEXT_MUTED__'],

  // Placeholder (kept as-is, handled separately if needed)
  [/\bplaceholder:text-slate-[0-9]+\b/g, 'placeholder:text-[var(--text-muted)]'],
];

// Token → Tailwind arbitrary value that reads CSS var
const TOKEN_MAP = {
  '__BG_BASE__':        'bg-[var(--bg-base)]',
  '__BG_SURFACE__':     'bg-[var(--bg-surface)]',
  '__BG_SURFACE_60__':  'bg-[var(--bg-surface-60)]',
  '__BG_HOVER__':       'bg-[var(--bg-hover)]',
  '__BORDER__':         'border-[var(--border)]',
  '__BORDER_SOFT__':    'border-[var(--border-soft)]',
  '__BORDER_HOVER__':   'border-[var(--border-hover)]',
  '__TEXT_HEADING__':   'text-[var(--text-heading)]',
  '__TEXT_PRIMARY__':   'text-[var(--text-primary)]',
  '__TEXT_SECONDARY__': 'text-[var(--text-secondary)]',
  '__TEXT_MUTED__':     'text-[var(--text-muted)]',
};

function applyRules(src) {
  // Step 1: apply regex rules → tokens
  for (const [pattern, token] of CLASS_RULES) {
    src = src.replace(pattern, token);
  }
  // Step 2: tokens → Tailwind arbitrary values
  for (const [token, cls] of Object.entries(TOKEN_MAP)) {
    src = src.replace(new RegExp(token.replace(/[[\]]/g, '\\$&'), 'g'), cls);
  }
  return src;
}

// ── Process files ────────────────────────────────────────────────────────────
const files = walk('src');
let changed = 0, unchanged = 0;

for (const file of files) {
  const original = readFileSync(file, 'utf8');
  const updated  = applyRules(original);

  if (updated !== original) {
    writeFileSync(file, updated, 'utf8');
    changed++;
    process.stdout.write(`✔  ${basename(file)}\n`);
  } else {
    unchanged++;
    process.stdout.write(`–  ${basename(file)} (no changes)\n`);
  }
}

process.stdout.write(`\nDone: ${changed} updated, ${unchanged} unchanged.\n`);
