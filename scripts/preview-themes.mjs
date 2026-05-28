// One-off visual check: open the built options page in Chromium under
// both color schemes and screenshot each. Not part of the test suite.
// Usage: node scripts/preview-themes.mjs
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const EXTENSION = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'tmp');
mkdirSync(OUT, { recursive: true });

const context = await chromium.launchPersistentContext('', {
  channel: 'chromium',
  args: [`--disable-extensions-except=${EXTENSION}`, `--load-extension=${EXTENSION}`],
});

let [sw] = context.serviceWorkers();
if (!sw) sw = await context.waitForEvent('serviceworker');
const extensionId = sw.url().split('/')[2];

for (const scheme of ['light', 'dark']) {
  // Options page
  const optionsPage = await context.newPage();
  await optionsPage.emulateMedia({ colorScheme: scheme });
  await optionsPage.setViewportSize({ width: 1280, height: 1100 });
  await optionsPage.goto(`chrome-extension://${extensionId}/src/options/index.html`);
  await optionsPage.locator('.wordmark h1').waitFor();
  await optionsPage.waitForTimeout(300);
  const optionsOut = path.join(OUT, `options-${scheme}.png`);
  await optionsPage.screenshot({ path: optionsOut, fullPage: true });
  console.log(`✓ ${optionsOut}`);
  await optionsPage.close();

  // Popup
  const popupPage = await context.newPage();
  await popupPage.emulateMedia({ colorScheme: scheme });
  await popupPage.setViewportSize({ width: 380, height: 600 });
  await popupPage.goto(`chrome-extension://${extensionId}/src/popup/index.html`);
  await popupPage.locator('.wordmark h1').waitFor();
  await popupPage.waitForTimeout(300);
  const popupOut = path.join(OUT, `popup-${scheme}.png`);
  await popupPage.screenshot({ path: popupOut, fullPage: true });
  console.log(`✓ ${popupOut}`);
  await popupPage.close();
}

await context.close();
