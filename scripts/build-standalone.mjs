// Bundles the Vite build output (dist/) into a single self-contained HTML
// file that can be opened directly via file:// (double-click, no server).
//
// This is necessary, not just convenient: Chrome refuses to load a
// <script type="module" src="..."> file over file:// (blocked by CORS), so
// dist/index.html as-is does not work when opened locally. Inlining the JS
// and CSS directly into one document avoids that extra fetch entirely.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const distAssetsDir = path.join(root, 'dist', 'assets');
const publicDir = path.join(root, 'public');
const outDir = path.join(root, 'dist-standalone');

const files = fs.readdirSync(distAssetsDir);
const jsFile = files.find((f) => f.endsWith('.js'));
const cssFile = files.find((f) => f.endsWith('.css'));
if (!jsFile || !cssFile) {
  throw new Error('dist/assets is missing a built .js or .css file — run `npm run build` first.');
}
const js = fs.readFileSync(path.join(distAssetsDir, jsFile), 'utf8');
const css = fs.readFileSync(path.join(distAssetsDir, cssFile), 'utf8');

const icon192Uri = `data:image/png;base64,${fs.readFileSync(path.join(publicDir, 'icon-192.png')).toString('base64')}`;
const faviconUri = `data:image/svg+xml;base64,${fs.readFileSync(path.join(publicDir, 'favicon.svg')).toString('base64')}`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#1e293b">
<link rel="icon" type="image/svg+xml" href="${faviconUri}">
<link rel="apple-touch-icon" href="${icon192Uri}">
<title>Gradebook</title>
<style>
${css}
</style>
</head>
<body>
<div id="root"></div>
<script type="module">
${js}
</script>
</body>
</html>
`;

fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'Gradebook.html');
fs.writeFileSync(outPath, html);
console.log(`Wrote ${outPath} (${(html.length / 1024).toFixed(0)} KB)`);
