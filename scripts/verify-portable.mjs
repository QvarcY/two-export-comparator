import {
  access,
  readFile,
  stat,
} from 'node:fs/promises';
import { resolve } from 'node:path';

const FILE = resolve(
  'release',
  'Two-Export-Comparator.html',
);

await access(FILE);

const info = await stat(FILE);
const html = await readFile(FILE, 'utf8');

const required = [
  'Content-Security-Policy',
  "connect-src 'none'",
  "default-src 'none'",
  '<style>',
  '<script type="module">',
  'Two-Export Comparator',
];

for (const fragment of required) {
  if (!html.includes(fragment)) {
    throw new Error(
      `Missing required fragment: ${fragment}`,
    );
  }
}

const forbidden = [
  /<script\b[^>]*\bsrc\s*=/i,
  /<link\b[^>]*\brel=["']stylesheet["']/i,
  /(?:src|href)=["']\.?\/?assets\//i,
  /localhost:\d+/i,
];

for (const pattern of forbidden) {
  if (pattern.test(html)) {
    throw new Error(
      `Portable HTML contains an external runtime dependency: ${pattern}`,
    );
  }
}

console.log('');
console.log('Portable verification passed.');
console.log(
  `Single file size: ${(info.size / 1024).toFixed(1)} KiB`,
);
console.log(
  'No external JS/CSS runtime assets detected.',
);
console.log(
  'Network connections are blocked by CSP.',
);
