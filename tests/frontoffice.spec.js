import { test, expect } from '@playwright/test';

test.describe('9. Front Office', () => {
  test('9.1 Front Office Face ID UI Check', async ({ page }) => {
    await page.goto('/frontoffice');

    await expect(page.getByText(/Face ID/i).first()).toBeVisible();

    const camContainer = page
      .locator('video')
      .or(page.locator('.scanner-container'));
    await expect(camContainer).toBeVisible();
  });
});
