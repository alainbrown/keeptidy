import { expect, test } from './fixtures';

test('user adjusts threshold and adds an exempt domain', async ({
  context,
  extensionId,
}) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/src/options/index.html`);

  // Wait for the container to finish loading settings and render.
  await expect(page.locator('.wordmark h1')).toBeVisible();

  // Default preset (2 months) is active.
  const preset2mo = page.getByRole('button', { name: '2 months', exact: true });
  await expect(preset2mo).toHaveClass(/on/);

  // Switch to 6 months.
  const preset6mo = page.getByRole('button', { name: '6 months', exact: true });
  await preset6mo.click();
  await expect(preset6mo).toHaveClass(/on/);
  await expect(preset2mo).not.toHaveClass(/on/);

  // Add a new exempt domain.
  const input = page.getByPlaceholder('add domain...');
  await input.fill('example.test');
  await input.press('Enter');
  await expect(
    page.locator('.dom').filter({ hasText: 'example.test' }),
  ).toBeVisible();

  // Reload — chrome.storage.sync state must survive within the session.
  await page.reload();
  await expect(
    page.getByRole('button', { name: '6 months', exact: true }),
  ).toHaveClass(/on/);
  await expect(
    page.locator('.dom').filter({ hasText: 'example.test' }),
  ).toBeVisible();
});
