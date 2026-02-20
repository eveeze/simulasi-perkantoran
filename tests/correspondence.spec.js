import { test, expect } from '@playwright/test';

test.describe('6. Korespondensi', () => {
  const loginAdmin = async (page) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Admin', exact: true }).click();
    await expect(page.locator('input[type="email"]')).not.toBeEmpty();
    await page.getByRole('button', { name: /masuk/i, exact: true }).click();
    await expect(page).toHaveURL('/dashboard');
  };

  test('6.1 Buat Surat & Tanda Tangan (Admin/Secretary)', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/dashboard/correspondence');

    await expect(page.locator('table').first()).toBeVisible();

    const docTitle = `Surat Test Playwright ${Date.now()}`;
    const createBtn = page.getByRole('button', { name: /buat surat/i });
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await expect(page.getByRole('dialog')).toBeVisible();

      await page
        .locator('input[placeholder="Perihal surat..."]')
        .fill(docTitle);
      await page.locator('select').first().selectOption('MEMO');

      await page
        .getByRole('dialog')
        .getByRole('button', { name: /kirim surat/i })
        .click();

      await expect(
        page.getByRole('cell', { name: docTitle, exact: false }).first(),
      ).toBeVisible();
    }

    const row = page.getByRole('row').filter({ hasText: docTitle }).first();
    const signBtn = row.getByRole('button', { name: /tanda tangan/i });
    if (await signBtn.isVisible()) {
      await signBtn.click();
      await expect(row.getByText(/ditandatangani/i)).toBeVisible();
    }
  });
});
