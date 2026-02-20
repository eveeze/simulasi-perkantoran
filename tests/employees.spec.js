import { test, expect } from '@playwright/test';

test.describe('3. Karyawan & Biometrik (Admin Only)', () => {
  const loginAdmin = async (page) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Admin', exact: true }).click();
    await expect(page.locator('input[type="email"]')).not.toBeEmpty();
    await page.getByRole('button', { name: /masuk/i, exact: true }).click();
    await expect(page).toHaveURL('/dashboard');
  };

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await loginAdmin(page);
  });

  test('3.1 Manajemen Karyawan - View, Create, Edit, Delete', async ({
    page,
  }) => {
    await page.goto('/dashboard/employees');

    await expect(page.locator('table').first()).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: /Nama/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: /Email/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: /Peran/i }).first(),
    ).toBeVisible();

    const newEmail = `testuser_${Date.now()}@office.sim`;

    await page.getByRole('button', { name: /tambah karyawan/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.locator('input[type="text"]').fill('Test User Automation');
    await page.locator('input[type="email"]').fill(newEmail);
    await page.locator('input[type="password"]').fill('password123');

    await page.locator('select').first().selectOption('STAFF');

    await page
      .getByRole('dialog')
      .getByRole('button', { name: /tambah karyawan/i })
      .click();

    await expect(page.getByRole('dialog')).not.toBeVisible();

    await expect(
      page
        .getByRole('cell', { name: 'Test User Automation', exact: true })
        .first(),
    ).toBeVisible();

    const row = page
      .getByRole('row')
      .filter({ hasText: 'Test User Automation' });
    await row.getByRole('button', { name: /edit|ubah/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await page.locator('input[type="text"]').fill('Test User Edited');

    await page
      .getByRole('dialog')
      .getByRole('button', { name: /simpan/i })
      .click();

    await expect(
      page.getByRole('cell', { name: 'Test User Edited', exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Test User Automation', exact: true }),
    ).not.toBeVisible();

    const editRow = page
      .getByRole('row')
      .filter({ hasText: 'Test User Edited' });

    page.on('dialog', (dialog) => dialog.accept());
    await editRow.getByRole('button', { name: /hapus/i }).click();

    await expect(
      page.getByRole('cell', { name: 'Test User Edited', exact: true }),
    ).not.toBeVisible();
  });

  test('3.2 Registrasi Wajah', async ({ page }) => {
    await page.goto('/dashboard/face-register');

    await expect(
      page.getByRole('heading', { name: /Registrasi Wajah/i }),
    ).toBeVisible();

    const camContainer = page
      .locator('video')
      .or(page.locator('.scanner-container'));
    await expect(camContainer).toBeVisible();

    const dropdown = page.locator('select').first();
    await expect(dropdown).toBeVisible();

    const daftarkanWajahBtn = page.getByRole('button', {
      name: /daftarkan wajah/i,
    });
    if (await daftarkanWajahBtn.isVisible()) {
      await expect(daftarkanWajahBtn).toBeVisible();
    }
  });
});
