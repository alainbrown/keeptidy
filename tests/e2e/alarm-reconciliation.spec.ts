import { expect, test } from './fixtures';

/**
 * Exercises the storage → service-worker → chrome.alarms wiring.
 * Whenever the user changes `settings.frequency`, the service worker
 * should reconcile the existing alarm so it fires on the new period.
 * Without this test, a regression that left the alarm out of sync with
 * the visible setting would go unnoticed.
 */
test('alarm period reflects the current frequency setting', async ({
  context,
  extensionId,
}) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/src/options/index.html`);
  await expect(page.locator('.wordmark h1')).toBeVisible();

  // autoTidy: true is required — the service worker only schedules an
  // alarm when auto-tidy is enabled.
  await page.evaluate(async () => {
    await chrome.storage.sync.set({
      settings: {
        thresholdMs: 60 * 24 * 60 * 60 * 1000,
        frequency: 'hourly',
        exemptDomains: [],
        autoTidy: true,
        categories: {
          history: true,
          downloads: true,
          cookies: true,
          siteData: true,
        },
      },
    });
  });

  // The SW handles storage.onChanged asynchronously; give it a beat to
  // call reconcileAlarm.
  await page.waitForTimeout(400);

  let alarm = await page.evaluate(async () => {
    return await chrome.alarms.get('keeptidy-sweep');
  });
  expect(alarm?.periodInMinutes).toBe(60);

  // Bump the frequency. The alarm should be re-created with the new
  // period — same name, new schedule.
  await page.evaluate(async () => {
    const raw = await chrome.storage.sync.get('settings');
    await chrome.storage.sync.set({
      settings: { ...raw.settings, frequency: '24h' },
    });
  });

  await page.waitForTimeout(400);

  alarm = await page.evaluate(async () => {
    return await chrome.alarms.get('keeptidy-sweep');
  });
  expect(alarm?.periodInMinutes).toBe(1440);

  // Disabling auto-tidy should remove the alarm entirely.
  await page.evaluate(async () => {
    const raw = await chrome.storage.sync.get('settings');
    await chrome.storage.sync.set({
      settings: { ...raw.settings, autoTidy: false },
    });
  });

  await page.waitForTimeout(400);

  alarm = await page.evaluate(async () => {
    return await chrome.alarms.get('keeptidy-sweep');
  });
  expect(alarm).toBeUndefined();
});
