import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const html = await readFile(resolve('dist', 'index.html'), 'utf8');
const normalizedHtml = html
  .replaceAll('&#39;', "'")
  .replaceAll('&quot;', '"')
  .replaceAll('&amp;', '&');

const required = [
  'Content-Security-Policy',
  "connect-src 'none'",
  "script-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
];

for (const fragment of required) {
  if (!normalizedHtml.includes(fragment)) {
    throw new Error('Production dist is missing required CSP fragment: ' + fragment);
  }
}

if (/(?:src|href)=["']https?:\/\//i.test(normalizedHtml)) {
  throw new Error('Production dist index contains an external script/style/resource URL');
}

console.log('dist verification passed: static CSP present, no external entry resources');
