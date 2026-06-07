import { test, expect } from '@playwright/test';

test.describe('Data Validation', () => {
  test('should validate empty inputs on login', async ({ page }) => {
    await page.goto('/ar-EG/login');
    
    // Submit empty form
    await page.getByRole('button', { name: 'دخول' }).click();

    // Check for validation errors under each input
    // The messages might depend on standard z.string().min() text or custom Zod messages
    const errorMessages = page.locator('.text-destructive');
    await expect(errorMessages.nth(0)).toBeVisible();
    await expect(errorMessages.nth(1)).toBeVisible();
    await expect(errorMessages.nth(2)).toBeVisible();
  });

  test('should validate incorrect email format', async ({ page }) => {
    await page.goto('/ar-EG/login');
    await page.fill('input[name="subdomain"]', 'validtenant');
    await page.fill('input[name="email"]', 'not-an-email');
    await page.fill('input[name="password"]', 'pass123');
    
    await page.getByRole('button', { name: 'دخول' }).click();

    // The second error message (for email) should show up
    await expect(page.getByText('بريد إلكتروني غير صالح')).toBeVisible();
  });
});
