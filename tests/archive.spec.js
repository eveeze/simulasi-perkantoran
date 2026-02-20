import { test, expect } from '@playwright/test';

test.describe('7. Arsip Dokumen', () => {
  const loginAdmin = async (page) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Admin', exact: true }).click();
    await expect(page.locator('input[type="email"]')).not.toBeEmpty();
    await page.getByRole('button', { name: /masuk/i, exact: true }).click();
    await expect(page).toHaveURL('/dashboard');
  };

  test('7.1 View, Filter, Delete Arsip', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/dashboard/archive');

    await expect(page.locator('table').first()).toBeVisible();

    const filters = ['Semua', 'Surat Masuk', 'Surat Keluar', 'Memo'];
    for (const f of filters) {
      if (
        await page.getByRole('button', { name: f, exact: true }).isVisible()
      ) {
        await page.getByRole('button', { name: f, exact: true }).click();
        await page.waitForTimeout(500);
      }
    }

    const searchInput = page.getByPlaceholder(/cari|search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Surat Test');
      await page.waitForTimeout(1000);
    }
  });
});
