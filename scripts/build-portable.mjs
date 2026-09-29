import {
  mkdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const BUILD_DIR = resolve('.portable-build');
const RELEASE_DIR = resolve('release');
const OUTPUT_FILE = resolve(
  RELEASE_DIR,
  'Two-Export-Comparator.html',
);

function sha256(value) {
  return createHash('sha256')
    .update(value, 'utf8')
    .digest('base64');
}

function getAttribute(tag, name) {
  const pattern = new RegExp(
    `${name}\\s*=\\s*["']([^"']+)["']`,
    'i',
  );

  return tag.match(pattern)?.[1] ?? null;
}

function resolveAsset(reference) {
  const clean = decodeURIComponent(
    reference
      .replace(/^[./]+/, '')
      .split(/[?#]/, 1)[0],
  );

  return resolve(BUILD_DIR, clean);
}

let html = await readFile(
  resolve(BUILD_DIR, 'index.html'),
  'utf8',
);

const stylesheetTags = [
  ...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi),
].map((match) => match[0]);

if (stylesheetTags.length !== 1) {
  throw new Error(
    `Expected exactly one stylesheet, found ${stylesheetTags.length}.`,
  );
}

const stylesheetTag = stylesheetTags[0];
const stylesheetHref = getAttribute(stylesheetTag, 'href');

let css = await readFile(
  resolveAsset(stylesheetHref),
  'utf8',
);

css = css.replaceAll('</style', '<\\/style');

const scriptTags = [
  ...html.matchAll(
    /<script\b[^>]*src=["'][^"']+["'][^>]*>\s*<\/script>/gi,
  ),
].map((match) => match[0]);

if (scriptTags.length !== 1) {
  throw new Error(
    `Expected exactly one JS entry, found ${scriptTags.length}.`,
  );
}

const scriptTag = scriptTags[0];
const scriptSrc = getAttribute(scriptTag, 'src');

let javascript = await readFile(
  resolveAsset(scriptSrc),
  'utf8',
);

javascript = javascript.replaceAll(
  '</script',
  '<\\/script',
);

const styleHash = sha256(css);
const scriptHash = sha256(javascript);

const portableCsp = [
  "default-src 'none'",
  `script-src 'sha256-${scriptHash}'`,
  `style-src 'sha256-${styleHash}'`,
  "img-src data:",
  "font-src data:",
  "connect-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-src 'none'",
  "worker-src 'none'",
].join('; ');

const cspMeta =
  `<meta http-equiv="Content-Security-Policy" ` +
  `content="${portableCsp}" />`;

html = html.replace(
  '<head>',
  `<head>\n    ${cspMeta}`,
);

html = html.replace(
  stylesheetTag,
  `<style>${css}</style>`,
);

html = html.replace(
  scriptTag,
  `<script type="module">${javascript}</script>`,
);

await rm(RELEASE_DIR, {
  recursive: true,
  force: true,
});

await mkdir(RELEASE_DIR, {
  recursive: true,
});

await writeFile(
  OUTPUT_FILE,
  html,
  'utf8',
);

console.log('');
console.log('Portable build created:');
console.log(OUTPUT_FILE);
