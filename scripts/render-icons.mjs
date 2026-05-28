import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SVG_PATH = path.join(ROOT, 'design/logo.svg');
const OUT_DIR = path.join(ROOT, 'public/icons');
const SIZES = [16, 32, 48, 128];

const svg = readFileSync(SVG_PATH, 'utf8');

const html = `<!doctype html>
<html><head>
<meta charset="utf-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@800&display=swap" rel="stylesheet"/>
<style>
  html, body { margin: 0; padding: 0; background: transparent; }
  #icon, #icon svg { display: block; }
</style>
</head>
<body>
<div id="icon">${svg}</div>
</body></html>`;

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  deviceScaleFactor: 1,
  viewport: { width: 256, height: 256 },
});

for (const size of SIZES) {
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate((s) => {
    const svg = document.querySelector('svg');
    svg.setAttribute('width', String(s));
    svg.setAttribute('height', String(s));
  }, size);
  const buf = await page.locator('svg').screenshot({ omitBackground: true });
  writeFileSync(path.join(OUT_DIR, `${size}.png`), buf);
  await page.close();
  console.log(`  rendered ${size}×${size} → public/icons/${size}.png`);
}

await context.close();
await browser.close();
