import { test, expect } from '@playwright/test';

test.describe('1. Authentication & Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('1.1 Login Page - Visual Check and Empty Submit', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/SimKantor/i);

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.getByRole('button', {
      name: /masuk/i,
      exact: true,
    });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();

    await loginButton.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('1.2 Failed Login', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input[type="email"]').fill('wrong@office.sim');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: /masuk/i, exact: true }).click();

    const errorMsg = page.getByText(
      /Invalid credentials|User not found|email atau password/i,
    );
    await expect(errorMsg).toBeVisible();
  });

  const rolesToTest = [
    { roleName: 'Admin', expectedUrl: '/dashboard' },
    { roleName: 'Manager', expectedUrl: '/dashboard' },
    { roleName: 'Secretary', expectedUrl: '/dashboard' },
    { roleName: 'Staff', expectedUrl: '/dashboard' },
    { roleName: 'Front Office', expectedUrl: '/dashboard' },
  ];

  for (const role of rolesToTest) {
    test(`1.3 Login as ${role.roleName} using Demo Button`, async ({
      page,
    }) => {
      await page.goto('/login');

      await page
        .getByRole('button', { name: role.roleName, exact: true })
        .click();

      await expect(page.locator('input[type="email"]')).not.toBeEmpty();
      await expect(page.locator('input[type="password"]')).not.toBeEmpty();

      await page.getByRole('button', { name: /masuk/i, exact: true }).click();
      await expect(page).toHaveURL(role.expectedUrl);
    });
  }

  test('1.4 Auth Guard (Redirect to /login without session)', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('1.5 Logout & Session Persist', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Admin', exact: true }).click();
    await expect(page.locator('input[type="email"]')).not.toBeEmpty();
    await page.getByRole('button', { name: /masuk/i, exact: true }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.reload();
    await expect(page).toHaveURL('/dashboard');

    await page
      .getByRole('button', { name: /logout|keluar/i })
      .evaluate((node) => node.click());

    await expect(page).toHaveURL(/.*\/login/);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
