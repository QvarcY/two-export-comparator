import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const src = resolve(root, 'src');

async function sourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(path));
    else if (entry.name.endsWith('.js')) files.push(path);
  }

  return files;
}

test('source does not contain network or persistent browser-storage APIs', async () => {
  const forbidden = [
    /\bfetch\s*\(/,
    /\bXMLHttpRequest\b/,
    /\bWebSocket\b/,
    /\bEventSource\b/,
    /\bsendBeacon\s*\(/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\bindexedDB\b/,
    /document\.cookie/,
  ];

  for (const file of await sourceFiles(src)) {
    const content = await readFile(file, 'utf8');
    for (const pattern of forbidden) {
      assert.doesNotMatch(
        content,
        pattern,
        relative(root, file) + ' violates the local-only privacy invariant'
      );
    }
  }
});

test('source does not assign imported content through unsafe HTML execution APIs', async () => {
  const forbidden = [
    /\.innerHTML\s*=/,
    /\.outerHTML\s*=/,
    /insertAdjacentHTML\s*\(/,
    /document\.write\s*\(/,
    /\beval\s*\(/,
    /new\s+Function\s*\(/,
  ];

  for (const file of await sourceFiles(src)) {
    const content = await readFile(file, 'utf8');
    for (const pattern of forbidden) {
      assert.doesNotMatch(
        content,
        pattern,
        relative(root, file) + ' uses an unsafe HTML/code execution API'
      );
    }
  }
});

test('entry HTML does not load third-party scripts, styles or fonts', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');

  assert.doesNotMatch(html, /<script[^>]+src=["']https?:\/\//i);
  assert.doesNotMatch(html, /<link[^>]+href=["']https?:\/\//i);
});
