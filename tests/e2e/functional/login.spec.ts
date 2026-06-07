import { test, expect } from '@playwright/test';

test.describe('Login & Usability - Functional', () => {
  test('should display the login page with correct Arabic RTL layout by default', async ({ page }) => {
    // Go to default root which should redirect to /ar-EG or show default
    await page.goto('/login');
    
    // Check if the dir is rtl
    const htmlElement = await page.locator('html');
    await expect(htmlElement).toHaveAttribute('dir', 'rtl');
    await expect(htmlElement).toHaveAttribute('lang', 'ar-EG');

    // Check presence of login fields
    await expect(page.locator('input[name="subdomain"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'دخول' })).toBeVisible();
  });

  test('should switch to LTR when switching language to English', async ({ page }) => {
    await page.goto('/en-US/login');
    
    const htmlElement = await page.locator('html');
    await expect(htmlElement).toHaveAttribute('dir', 'ltr');
    await expect(htmlElement).toHaveAttribute('lang', 'en-US');

    // The button might still be localized based on actual dict files
    await expect(page.locator('input[name="subdomain"]')).toBeVisible();
  });

  test('Abnormal Scenario: Login with incorrect credentials should fail', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="subdomain"]', 'invalid-tenant');
    await page.fill('input[name="email"]', 'wrong@school.com');
    await page.fill('input[name="password"]', 'badpassword');
    
    await page.getByRole('button', { name: 'دخول' }).click();

    // Verify error message is displayed (connection error or invalid credentials)
    // We expect some error alert box since it failed
    const errorAlert = page.locator('.text-destructive');
    await expect(errorAlert.first()).toBeVisible();
  });
});
