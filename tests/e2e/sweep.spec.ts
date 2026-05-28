import { expect, test } from './fixtures';

test('manual sweep deletes history older than the threshold and keeps fresh entries', async ({
  context,
  extensionId,
}) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/src/options/index.html`);
  await expect(page.locator('.wordmark h1')).toBeVisible();

  // Tight threshold (2s), manual frequency, no exempt list, auto-tidy off
  // so the only sweep is the one we explicitly trigger.
  await page.evaluate(async () => {
    await chrome.storage.sync.set({
      settings: {
        thresholdMs: 2000,
        frequency: 'manual',
        exemptDomains: [],
        autoTidy: false,
      },
    });
  });

  // Seed two URLs that we'll let age past the 2s threshold.
  await page.evaluate(async () => {
    await chrome.history.addUrl({ url: 'https://old1.keeptidy.example/' });
    await chrome.history.addUrl({ url: 'https://old2.keeptidy.example/' });
  });

  // Wait until they're older than the threshold.
  await page.waitForTimeout(2500);

  // Seed a fresh URL that must survive the sweep.
  await page.evaluate(async () => {
    await chrome.history.addUrl({ url: 'https://fresh.keeptidy.example/' });
  });

  // Trigger the sweep through the service worker and await the run result.
  const result = await page.evaluate(async () => {
    return await chrome.runtime.sendMessage({ type: 'tidy-now' });
  });
  expect(result).toMatchObject({ ok: true });

  // Inspect what remains.
  const remaining = await page.evaluate(async () => {
    const items = await chrome.history.search({
      text: 'keeptidy.example',
      maxResults: 1000,
      startTime: 0,
    });
    return items.map((i) => i.url);
  });

  expect(remaining).toContain('https://fresh.keeptidy.example/');
  expect(remaining).not.toContain('https://old1.keeptidy.example/');
  expect(remaining).not.toContain('https://old2.keeptidy.example/');
});
