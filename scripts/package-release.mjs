import {
  copyFile,
  mkdir,
  readFile,
  writeFile,
} from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const pkg = JSON.parse(
  await readFile(resolve('package.json'), 'utf8'),
);

const version = pkg.version;
const baseName = `Two-Export-Comparator-v${version}`;

const releaseDir = resolve('release');
const sourceHtml = resolve(
  releaseDir,
  'Two-Export-Comparator.html',
);

const versionedHtml = resolve(
  releaseDir,
  `${baseName}.html`,
);

const zipFile = resolve(
  releaseDir,
  `${baseName}.zip`,
);

const sumsFile = resolve(
  releaseDir,
  'SHA256SUMS.txt',
);

await mkdir(releaseDir, {
  recursive: true,
});

await copyFile(
  sourceHtml,
  versionedHtml,
);

const htmlBuffer = await readFile(versionedHtml);

const htmlSha256 = createHash('sha256')
  .update(htmlBuffer)
  .digest('hex');

execFileSync(
  'powershell.exe',
  [
    '-NoProfile',
    '-Command',
    `Compress-Archive -Path '${versionedHtml.replaceAll("'", "''")}' -DestinationPath '${zipFile.replaceAll("'", "''")}' -Force`,
  ],
  {
    stdio: 'inherit',
  },
);

const zipBuffer = await readFile(zipFile);

const zipSha256 = createHash('sha256')
  .update(zipBuffer)
  .digest('hex');

const sums = [
  `${htmlSha256}  ${baseName}.html`,
  `${zipSha256}  ${baseName}.zip`,
  '',
].join('\n');

await writeFile(
  sumsFile,
  sums,
  'utf8',
);

console.log('');
console.log('Release artifacts created:');
console.log(`- ${baseName}.html`);
console.log(`- ${baseName}.zip`);
console.log('- SHA256SUMS.txt');
console.log('');
console.log(`HTML SHA-256: ${htmlSha256}`);
console.log(`ZIP  SHA-256: ${zipSha256}`);
