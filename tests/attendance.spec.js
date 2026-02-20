import { test, expect } from '@playwright/test';

test.describe('4. Kehadiran & Shift', () => {
  const loginAs = async (page, roleName) => {
    await page.goto('/login');
    await page.getByRole('button', { name: roleName, exact: true }).click();
    await expect(page.locator('input[type="email"]')).not.toBeEmpty();
    await page.getByRole('button', { name: /masuk/i, exact: true }).click();
    await expect(page).toHaveURL('/dashboard');
  };

  test('4.1 Admin - Tabel Kehadiran (Bug 001 Check)', async ({ page }) => {
    await loginAs(page, 'Admin');
    await page.goto('/dashboard/attendance');

    await expect(page.getByText(/Total Record/i).first()).toBeVisible();
    await expect(
      page.getByText(/Hadir/i, { exact: true }).first(),
    ).toBeVisible();

    await expect(page.locator('table').first()).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: /Karyawan/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: /Check In/i }).first(),
    ).toBeVisible();
  });

  test('4.2 Staff - Tabel Kehadiran (Restricted View)', async ({ page }) => {
    await loginAs(page, 'Staff');
    await page.goto('/dashboard/attendance');

    await expect(page.locator('table').first()).toBeVisible();

    const employeeHeader = page
      .getByRole('cell', { name: /Karyawan/i })
      .first();
    if (await employeeHeader.isVisible()) {
      await expect(employeeHeader).not.toBeVisible();
    }
  });

  test('4.3 Check-in / Check-out via UI', async ({ page }) => {
    await loginAs(page, 'Staff');
    await page.goto('/dashboard/attendance');

    const checkInBtn = page.getByRole('button', {
      name: /check in|absen masuk/i,
    });
    const checkOutBtn = page.getByRole('button', {
      name: /check out|absen pulang/i,
    });

    if (await checkInBtn.isVisible()) {
      await checkInBtn.click();
      await expect(page.getByText(/berhasil/i).first()).toBeVisible();
    }

    await page.waitForTimeout(1000);

    if (await checkOutBtn.isVisible()) {
      await checkOutBtn.click();
      await expect(page.getByText(/berhasil/i).first()).toBeVisible();
    }
  });
});
