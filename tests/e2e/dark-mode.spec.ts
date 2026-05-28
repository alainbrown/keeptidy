import { expect, test } from './fixtures';

test('options page applies dark tokens when the system prefers dark', async ({
  context,
  extensionId,
}) => {
  const page = await context.newPage();
  // Override prefers-color-scheme for this page; defaults in our fixture are
  // unspecified, so without this the page would render in light mode.
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(`chrome-extension://${extensionId}/src/options/index.html`);

  // Wait until the page has actually rendered the OptionsContainer.
  await expect(page.locator('.wordmark h1')).toBeVisible();

  // The dark-mode @media block in tokens.css should have flipped the
  // canonical tokens. We read them off :root via getPropertyValue.
  const tokens = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      bg1: style.getPropertyValue('--bg-1').trim(),
      ink: style.getPropertyValue('--ink').trim(),
      ink2: style.getPropertyValue('--ink-2').trim(),
      ink3: style.getPropertyValue('--ink-3').trim(),
      panel: style.getPropertyValue('--panel').trim(),
      surfaceRaised: style.getPropertyValue('--surface-raised').trim(),
      // lime should stay the same across themes
      lime: style.getPropertyValue('--lime').trim(),
    };
  });

  expect(tokens.bg1).toBe('#131316');
  expect(tokens.ink).toBe('#f6f6f3');
  // Secondary text tokens need enough luminance on the dark ground —
  // verify both are bright enough to remain readable.
  expect(tokens.ink2).toBe('#d0d0d4');
  expect(tokens.ink3).toBe('#92929a');
  expect(tokens.panel).toBe('#202028');
  expect(tokens.surfaceRaised).toBe('#2a2a30');
  expect(tokens.lime).toBe('#c8ff00');
});

test('options page applies light tokens when the system prefers light', async ({
  context,
  extensionId,
}) => {
  const page = await context.newPage();
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(`chrome-extension://${extensionId}/src/options/index.html`);
  await expect(page.locator('.wordmark h1')).toBeVisible();

  const tokens = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      bg1: style.getPropertyValue('--bg-1').trim(),
      ink: style.getPropertyValue('--ink').trim(),
      surfaceRaised: style.getPropertyValue('--surface-raised').trim(),
    };
  });

  expect(tokens.bg1).toBe('#f6f6f3');
  expect(tokens.ink).toBe('#14141a');
  expect(tokens.surfaceRaised).toBe('#14141a');
});
