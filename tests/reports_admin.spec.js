import { test, expect } from '@playwright/test';

test.describe('8. Analitik & Laporan', () => {
  const loginAdmin = async (page) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Admin', exact: true }).click();
    await expect(page.locator('input[type="email"]')).not.toBeEmpty();
    await page.getByRole('button', { name: /masuk/i, exact: true }).click();
    await expect(page).toHaveURL('/dashboard');
  };

  test('8.1 Laporan Berkala (Admin)', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/dashboard/reports');

    await expect(
      page
        .getByRole('heading', { name: /Ringkasan Keuangan/i, exact: false })
        .first(),
    ).toBeVisible();

    const addBtn = page.getByRole('button', { name: /buat laporan/i });
    await addBtn.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    await page
      .locator('input[type="text"]')
      .first()
      .fill('Laporan Kuartal Playwright');
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /buat laporan/i, exact: false })
      .first()
      .click();

    await expect(
      page
        .getByRole('heading', {
          name: 'Laporan Kuartal Playwright',
          exact: false,
        })
        .first(),
    ).toBeVisible();
  });

  test('8.2 Panel Admin (Eksklusif Admin)', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/dashboard/admin');

    await expect(
      page.getByRole('heading', { name: /Panel Admin/i, exact: false }).first(),
    ).toBeVisible();
    await expect(page.getByText(/Total Karyawan/i).first()).toBeVisible();
    await expect(page.getByText(/Laba Bersih/i).first()).toBeVisible();
  });
});
