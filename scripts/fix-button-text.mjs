/**
 * Fix: restore text-white on colored buttons/backgrounds.
 * The previous script incorrectly replaced text-white with text-[var(--text-heading)]
 * on elements that have a colored background (violet, red, blue, emerald, orange, etc.)
 * where text should ALWAYS be white regardless of theme.
 *
 * Strategy: on any line that has BOTH:
 *   - text-[var(--text-heading)]
 *   - a colored bg- class (bg-violet, bg-red, bg-blue, bg-emerald, bg-orange, bg-cyan,
 *     bg-gradient, from-violet, from-blue, etc.)
 * → replace text-[var(--text-heading)] back to text-white
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';

const COLORED_BG = [
  'bg-violet', 'bg-red', 'bg-blue', 'bg-emerald', 'bg-orange',
  'bg-cyan', 'bg-indigo', 'bg-pink', 'bg-rose', 'bg-amber',
  'bg-teal', 'bg-green', 'bg-gradient', 'from-violet', 'from-blue',
  'from-red', 'from-emerald', 'from-indigo', 'from-pink', 'from-cyan',
];

function fixLine(line) {
  if (!line.includes('text-[var(--text-heading)]')) return line;
  const hasColoredBg = COLORED_BG.some(cls => line.includes(cls));
  if (hasColoredBg) {
    return line.replace(/text-\[var\(--text-heading\)\]/g, 'text-white');
  }
  return line;
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (extname(name) === '.tsx') out.push(full);
  }
  return out;
}

const files = walk('src');
let changed = 0;

for (const file of files) {
  const original = readFileSync(file, 'utf8');
  const fixed = original.split('\n').map(fixLine).join('\n');
  if (fixed !== original) {
    writeFileSync(file, fixed, 'utf8');
    changed++;
    console.log('fixed: ' + basename(file));
  }
}

console.log('\nDone: ' + changed + ' files fixed.');
