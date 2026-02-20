import { test, expect } from '@playwright/test';

test.describe('7. Manajemen Keuangan', () => {
  const loginAdmin = async (page) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Admin', exact: true }).click();
    await expect(page.locator('input[type="email"]')).not.toBeEmpty();
    await page.getByRole('button', { name: /masuk/i, exact: true }).click();
    await expect(page).toHaveURL('/dashboard');
  };

  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('7.1 Pendapatan - Create', async ({ page }) => {
    await page.goto('/dashboard/revenue');

    await expect(page.getByText(/Total Pendapatan/i)).toBeVisible();

    await page.getByRole('button', { name: /tambah pendapatan/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page
      .locator('input[placeholder="Judul pendapatan..."]')
      .fill('Proyek Website Playwright');

    await page.locator('input[type="number"]').fill('100000');

    await page
      .locator('input[placeholder="Klien, Proyek, dll"]')
      .fill('Klien ABC');

    await page
      .getByRole('dialog')
      .getByRole('button', { name: /tambah pendapatan/i })
      .click();

    await expect(
      page
        .getByRole('cell', { name: 'Proyek Website Playwright', exact: false })
        .first(),
    ).toBeVisible();
  });

  test('7.2 Pengeluaran - Create', async ({ page }) => {
    await page.goto('/dashboard/expenses');

    await page.getByRole('button', { name: /tambah pengeluaran/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page
      .locator('input[placeholder="Judul pengeluaran..."]')
      .fill('Lisensi Software Playwright');
    await page.locator('select').first().selectOption('OPERASIONAL');

    await page.locator('input[type="number"]').fill('50000');

    await page
      .getByRole('dialog')
      .getByRole('button', { name: /tambah pengeluaran/i })
      .click();

    await expect(
      page
        .getByRole('cell', {
          name: 'Lisensi Software Playwright',
          exact: false,
        })
        .first(),
    ).toBeVisible();
  });

  test('7.3 Hutang - Create & Partial Payment', async ({ page }) => {
    await page.goto('/dashboard/debts');

    await expect(page.getByText(/Total Hutang/i)).toBeVisible();

    await page.getByRole('button', { name: /tambah hutang/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await page
      .locator('input[placeholder="Nama debitur"]')
      .fill('Hutang Vendor Playwright');
    await page
      .locator('input[placeholder="Nama kreditur"]')
      .fill('Kreditur Test');

    await page.locator('input[type="number"]').fill('200000');
    await page.locator('input[type="date"]').fill('2026-12-31');

    await page
      .getByRole('dialog')
      .getByRole('button', { name: /tambah hutang/i })
      .click();

    await expect(
      page
        .getByRole('cell', { name: 'Hutang Vendor Playwright', exact: false })
        .first(),
    ).toBeVisible();

    const debtRow = page
      .getByRole('row')
      .filter({ hasText: 'Hutang Vendor Playwright' })
      .first();
    const payBtn = debtRow.getByRole('button', { name: /bayar/i });
    if (await payBtn.isVisible()) {
      await payBtn.click();
      await expect(page.getByRole('dialog')).toBeVisible();

      await page
        .getByRole('dialog')
        .locator('input[type="number"]')
        .fill('50000');

      await page
        .getByRole('dialog')
        .getByRole('button', { name: /catat pembayaran/i })
        .click();

      await expect(debtRow.getByText(/Sebagian/i)).toBeVisible();
    }
  });
});
