import { test, expect } from '@playwright/test';

test.describe('5. Manajemen Cuti (Leave)', () => {
  const loginAs = async (page, roleName) => {
    await page.goto('/login');
    await page.getByRole('button', { name: roleName, exact: true }).click();
    await expect(page.locator('input[type="email"]')).not.toBeEmpty();
    await page.getByRole('button', { name: /masuk/i, exact: true }).click();
    await expect(page).toHaveURL('/dashboard');
  };

  test('5.1 Pengajuan Cuti (Staff)', async ({ page }) => {
    await loginAs(page, 'Staff');
    await page.goto('/dashboard/leave');

    await expect(page.locator('table').first()).toBeVisible();

    await expect(
      page.getByRole('button', { name: /setuju/i }),
    ).not.toBeVisible();

    await page.getByRole('button', { name: /ajukan cuti/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split('T')[0];

    const startInput = page.locator('input[type="date"]').first();
    await startInput.fill(today);

    const endInput = page.locator('input[type="date"]').nth(1);
    await endInput.fill(tomorrow);

    await page
      .locator('textarea')
      .first()
      .fill('Testing leave request automated');

    await page
      .getByRole('dialog')
      .getByRole('button', { name: /kirim pengajuan/i })
      .click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(
      page
        .getByRole('cell', { name: 'Testing leave request automated' })
        .first(),
    ).toBeVisible();
    await expect(
      page.getByText('PENDING').or(page.getByText('Menunggu')),
    ).toBeVisible();
  });

  test('5.2 Approval Cuti (Admin)', async ({ page }) => {
    await loginAs(page, 'Admin');
    await page.goto('/dashboard/leave');

    const row = page
      .getByRole('row')
      .filter({ hasText: 'Testing leave request automated' })
      .first();

    const approveBtn = row
      .getByRole('button', { name: /setuju|approve/i })
      .first();
    const rejectBtn = row
      .getByRole('button', { name: /tolak|reject/i })
      .first();

    if (await approveBtn.isVisible()) {
      await approveBtn.click();

      await expect(row.getByText(/Disetujui/i)).toBeVisible();
    }
  });
});
