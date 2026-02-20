import { test, expect } from '@playwright/test';

test.describe('10/11. Edge Cases & API Security', () => {
  test('10.1 UI Guard: Staff Accessing /dashboard/admin', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Staff', exact: true }).click();
    await expect(page.locator('input[type="email"]')).not.toBeEmpty();
    await page.getByRole('button', { name: /masuk/i, exact: true }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.goto('/dashboard/admin');

    const accessDenied = page.getByText(/Akses hanya untuk Admin/i);
    await expect(accessDenied).toBeVisible();
  });

  test.describe('API Request Tests with Auth', () => {
    test('Staff calling revenue and admin endpoints returns 403', async ({
      page,
      request,
    }) => {
      await page.goto('/login');
      await page.getByRole('button', { name: 'Staff', exact: true }).click();
      await expect(page.locator('input[type="email"]')).not.toBeEmpty();
      await page.getByRole('button', { name: /masuk/i, exact: true }).click();
      await expect(page).toHaveURL('/dashboard');

      const adminRes = await page.request.get('/api/admin');

      expect(adminRes.status()).toBe(403);

      const revRes = await page.request.post('/api/revenue', {
        data: { title: 'Test', amount: 100 },
      });
      expect(revRes.status()).toBe(403);
    });

    test('Upload file without token -> 401', async ({ request }) => {
      const uploadRes = await request.post('/api/upload', {
        multipart: {
          file: {
            name: 'test.jpg',
            mimeType: 'image/jpeg',
            buffer: Buffer.from('mock img'),
          },
        },
      });

      expect(uploadRes.status()).toBe(401);
    });

    test('Biometric Edge Case: Face Register without employeeId -> 400', async ({
      page,
    }) => {
      await page.goto('/login');
      await page.getByRole('button', { name: 'Admin', exact: true }).click();
      await expect(page.locator('input[type="email"]')).not.toBeEmpty();
      await page.getByRole('button', { name: /masuk/i, exact: true }).click();
      await expect(page).toHaveURL('/dashboard');

      const registerRes = await page.request.post('/api/face/register', {
        data: {
          descriptor: new Array(128).fill(0.1),
        },
      });

      expect(registerRes.status()).toBe(400);
    });
  });
});
