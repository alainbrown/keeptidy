import { expect, test } from './fixtures';

/**
 * Asserts that the dark @media block doesn't just exist on :root, but
 * that its values actually flow through to the rendered DOM — both via
 * normal CSS inheritance (the wordmark text color) and via the inline
 * `style={{ stroke: 'var(--ink)' }}` pattern we use on the timeline SVG.
 *
 * Replaces an earlier pair of tests that just locked specific hex values
 * on :root — those passed even when the cascade was broken at the SVG
 * level, which defeats the point.
 */
test('dark mode propagates to rendered DOM (text + SVG inline style)', async ({
  context,
  extensionId,
}) => {
  const page = await context.newPage();
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(`chrome-extension://${extensionId}/src/options/index.html`);
  await expect(page.locator('.wordmark h1')).toBeVisible();

  // The wordmark inherits its color from body, which uses var(--ink). In
  // dark mode --ink is #f6f6f3 → rgb(246, 246, 243). This verifies the
  // ordinary CSS inheritance path.
  const wordmarkColor = await page
    .locator('.wordmark h1')
    .evaluate((el) => getComputedStyle(el).color);
  expect(wordmarkColor).toBe('rgb(246, 246, 243)');

  // The timeline threshold marker uses style={{ stroke: 'var(--ink)' }} —
  // this exercises the path where we set CSS variables inside the SVG
  // `style` attribute (the only way to make SVG presentation attributes
  // theme-aware, since SVG attributes like `stroke="..."` don't resolve
  // CSS variables). If we ever break that wiring, this assertion catches
  // it.
  const markerStroke = await page.evaluate(() => {
    const circle = document.querySelector('.tl svg circle[r="8"]');
    return circle ? getComputedStyle(circle).stroke : null;
  });
  expect(markerStroke).toBe('rgb(246, 246, 243)');
});
