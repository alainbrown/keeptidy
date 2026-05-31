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

test('a normal sweep spares old history on exempt domains', async ({
  context,
  extensionId,
}) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/src/options/index.html`);
  await expect(page.locator('.wordmark h1')).toBeVisible();

  // Tight threshold, with one domain on the exempt list. Both entries
  // age past the threshold, but the exempt one must survive — history
  // trimming now honors the exempt list instead of bulk-deleting by range.
  await page.evaluate(async () => {
    await chrome.storage.sync.set({
      settings: {
        thresholdMs: 2000,
        frequency: 'manual',
        exemptDomains: ['keep.keeptidy.example'],
        autoTidy: false,
      },
    });
  });

  await page.evaluate(async () => {
    await chrome.history.addUrl({ url: 'https://keep.keeptidy.example/' });
    await chrome.history.addUrl({ url: 'https://drop.keeptidy.example/' });
  });

  // Age both entries past the 2s threshold.
  await page.waitForTimeout(2500);

  const result = await page.evaluate(async () => {
    return await chrome.runtime.sendMessage({ type: 'tidy-now' });
  });
  expect(result).toMatchObject({ ok: true });

  const remaining = await page.evaluate(async () => {
    const items = await chrome.history.search({
      text: 'keeptidy.example',
      maxResults: 100,
      startTime: 0,
    });
    return items.map((i) => i.url);
  });
  expect(remaining).toContain('https://keep.keeptidy.example/');
  expect(remaining).not.toContain('https://drop.keeptidy.example/');
});

test('age clock: an old entry is cleaned even on an active domain', async ({
  context,
  extensionId,
}) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/src/options/index.html`);
  await expect(page.locator('.wordmark h1')).toBeVisible();

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

  // Seed an old page on a domain we'll keep active, plus a page on a
  // domain that stays dormant.
  await page.evaluate(async () => {
    await chrome.history.addUrl({ url: 'https://active.keeptidy.example/old' });
    await chrome.history.addUrl({ url: 'https://dormant.keeptidy.example/page' });
  });

  // Age both past the 2s threshold.
  await page.waitForTimeout(2500);

  // Now touch the active domain again. History/downloads run on the
  // per-entry age clock, so the fresh page survives but the old /old
  // page is cleaned on its own age — recent activity on the domain does
  // NOT protect older entries (that's the cookie/site-data clock).
  await page.evaluate(async () => {
    await chrome.history.addUrl({ url: 'https://active.keeptidy.example/fresh' });
  });

  const result = await page.evaluate(async () => {
    return await chrome.runtime.sendMessage({ type: 'tidy-now' });
  });
  expect(result).toMatchObject({ ok: true });

  const remaining = await page.evaluate(async () => {
    const items = await chrome.history.search({
      text: 'keeptidy.example',
      maxResults: 100,
      startTime: 0,
    });
    return items.map((i) => i.url);
  });
  // Age clock: the fresh page survives, the old page is cleaned on its
  // own age despite its domain being active.
  expect(remaining).toContain('https://active.keeptidy.example/fresh');
  expect(remaining).not.toContain('https://active.keeptidy.example/old');
  // The dormant domain's entry is cleaned too (it's also old).
  expect(remaining).not.toContain('https://dormant.keeptidy.example/page');
});

test('sweep skips history when categories.history is disabled', async ({
  context,
  extensionId,
}) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/src/options/index.html`);
  await expect(page.locator('.wordmark h1')).toBeVisible();

  // Same tight-threshold setup as the happy-path sweep, but with the
  // history category flag turned OFF. The sweep should run, but the
  // per-entry history deletion path should be skipped.
  await page.evaluate(async () => {
    await chrome.storage.sync.set({
      settings: {
        thresholdMs: 2000,
        frequency: 'manual',
        exemptDomains: [],
        autoTidy: false,
        categories: {
          history: false,
          downloads: true,
          cookies: true,
          siteData: true,
        },
      },
    });
  });

  await page.evaluate(async () => {
    await chrome.history.addUrl({ url: 'https://gated.keeptidy.example/' });
  });

  // Age it past the 2s threshold — under normal settings this entry
  // would get deleted by the sweep.
  await page.waitForTimeout(2500);

  const result = await page.evaluate(async () => {
    return await chrome.runtime.sendMessage({ type: 'tidy-now' });
  });
  expect(result).toMatchObject({ ok: true });

  // History entry must still be there — the gating short-circuited.
  const remaining = await page.evaluate(async () => {
    const items = await chrome.history.search({
      text: 'gated.keeptidy.example',
      maxResults: 100,
      startTime: 0,
    });
    return items.map((i) => i.url);
  });
  expect(remaining).toContain('https://gated.keeptidy.example/');
});

test('erase-all wipes history regardless of threshold and exempt list', async ({
  context,
  extensionId,
}) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/src/options/index.html`);
  await expect(page.locator('.wordmark h1')).toBeVisible();

  // Configure a wide threshold + put the URL in the exempt list. Under
  // a normal sweep this would protect the entry; erase-all is the
  // override-everything button and should still wipe it.
  await page.evaluate(async () => {
    await chrome.storage.sync.set({
      settings: {
        thresholdMs: 60 * 24 * 60 * 60 * 1000, // 60 days — fresh entries are safe
        frequency: 'manual',
        exemptDomains: ['nuke.keeptidy.example'],
        autoTidy: false,
        categories: {
          history: true,
          downloads: true,
          cookies: true,
          siteData: true,
        },
      },
    });
  });

  await page.evaluate(async () => {
    await chrome.history.addUrl({ url: 'https://nuke.keeptidy.example/' });
    await chrome.history.addUrl({ url: 'https://other.keeptidy.example/' });
  });

  const result = await page.evaluate(async () => {
    return await chrome.runtime.sendMessage({ type: 'erase-all' });
  });
  expect(result).toMatchObject({ ok: true });

  const remaining = await page.evaluate(async () => {
    const items = await chrome.history.search({
      text: 'keeptidy.example',
      maxResults: 100,
      startTime: 0,
    });
    return items.map((i) => i.url);
  });
  expect(remaining).not.toContain('https://nuke.keeptidy.example/');
  expect(remaining).not.toContain('https://other.keeptidy.example/');
});
