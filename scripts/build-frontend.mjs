import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
const assets = [
  ['index.html', 'index.html'],
  ['css', 'css'],
  ['js', 'js'],
  ['node_modules/marked/lib/marked.umd.js', 'vendor/marked.umd.js'],
  ['node_modules/dompurify/dist/purify.min.js', 'vendor/purify.min.js'],
  ['node_modules/@highlightjs/cdn-assets/highlight.min.js', 'vendor/highlight.min.js'],
  ['node_modules/@highlightjs/cdn-assets/styles/github.min.css', 'vendor/github.min.css'],
];

await rm(output, { recursive: true, force: true });
for (const [source, target] of assets) {
  const destination = resolve(output, target);
  await mkdir(dirname(destination), { recursive: true });
  await cp(resolve(root, source), destination, { recursive: true });
}

const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const indexPath = resolve(output, 'index.html');
const indexHtml = await readFile(indexPath, 'utf8');
const versionedIndex = indexHtml.replace(
  /(<span id="app-version">)[^<]*(<\/span>)/,
  `$1${packageJson.version}$2`,
);
await writeFile(indexPath, versionedIndex);
