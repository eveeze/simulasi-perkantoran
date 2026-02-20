import { test, expect } from '@playwright/test';

test.describe('2. Dashboard & Navigation', () => {
  const loginAs = async (page, roleName) => {
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    await page.goto('/login');
    await page.getByRole('button', { name: roleName, exact: true }).click();
    await expect(page.locator('input[type="email"]')).not.toBeEmpty();
    await expect(page.locator('input[type="password"]')).not.toBeEmpty();
    await page.getByRole('button', { name: /masuk/i, exact: true }).click();

    // Wait for the response of the login fetch
    const response = await page.waitForResponse((res) =>
      res.url().includes('/api/auth/login'),
    );
    console.log('API RESPONSE STATUS:', response.status());
    const json = await response.json().catch(() => null);
    console.log('API RESPONSE BODY:', json);

    await expect(page).toHaveURL('/dashboard');
  };

  test('2.1 Dashboard Admin - Cards & Lists', async ({ page }) => {
    await loginAs(page, 'Admin');

    await expect(page.getByText(/Selamat datang/i)).toBeVisible();

    await expect(page.getByText(/Total Karyawan/i)).toBeVisible();
    await expect(page.getByText(/Hadir Hari Ini/i)).toBeVisible();
    await expect(page.getByText(/Terlambat/i)).toBeVisible();
    await expect(page.getByText(/Cuti Pending/i)).toBeVisible();

    await expect(
      page.getByText(/Kehadiran Terkini/i, { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByText(/Pengajuan Cuti Pending/i, { exact: false }),
    ).toBeVisible();
  });

  test('2.2 Sidebar Navigation - Admin', async ({ page }) => {
    await loginAs(page, 'Admin');

    const sidebar = page.locator('.sidebar');

    const expectedMenus = [
      'Dashboard',
      'Kehadiran',
      'Cuti',
      'Karyawan',
      'Registrasi Wajah',
      'Korespondensi',
      'Kearsipan',
      'Pendapatan',
      'Pengeluaran',
      'Hutang',
      'Laporan',
      'Panel Admin',
    ];

    for (const menu of expectedMenus) {
      await expect(
        sidebar.getByText(new RegExp(menu, 'i'), { exact: true }).first(),
      ).toBeVisible();
    }
  });

  test('2.3 Sidebar Navigation - Staff (Role Restrictions)', async ({
    page,
  }) => {
    await loginAs(page, 'Staff');

    const sidebar = page.locator('.sidebar');

    const expectedMenus = ['Dashboard', 'Kehadiran', 'Cuti', 'Kearsipan'];
    for (const menu of expectedMenus) {
      await expect(
        sidebar.getByText(new RegExp(menu, 'i'), { exact: true }).first(),
      ).toBeVisible();
    }

    const hiddenMenus = [
      'Karyawan',
      'Registrasi Wajah',
      'Korespondensi',
      'Pendapatan',
      'Pengeluaran',
      'Hutang',
      'Laporan',
      'Panel Admin',
    ];
    for (const menu of hiddenMenus) {
      await expect(
        sidebar.getByText(new RegExp(menu, 'i'), { exact: true }).first(),
      ).not.toBeVisible();
    }
  });

  test('2.4 Active Menu Highlight', async ({ page }) => {
    await loginAs(page, 'Admin');

    await page
      .locator('.sidebar')
      .getByText(/Kehadiran/i, { exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/dashboard\/attendance|\/kehadiran/);

    const activeLink = page.locator('a.sidebar-link.active');
    await expect(activeLink).toContainText(/Kehadiran/i);
  });
});
