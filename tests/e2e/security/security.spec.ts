import { test, expect } from '@playwright/test';

test.describe('Security & Hacking Tests', () => {
  test('should reject SQL/NoSQL injection payload in login form', async ({ page }) => {
    await page.goto('/ar-EG/login');
    // Try NoSQL injection payload
    await page.fill('input[name="email"]', '{"$gt": ""}');
    await page.fill('input[name="password"]', '{"$gt": ""}');
    await page.fill('input[name="subdomain"]', 'alnoor');
    
    await page.getByRole('button', { name: 'دخول' }).click();

    // The validation layer or the backend should reject this, but since the email is invalid format,
    // the frontend validation should block it immediately.
    await expect(page.getByText('بريد إلكتروني غير صالح')).toBeVisible();
  });

  test('should prevent access to protected dashboard routes without token', async ({ page }) => {
    // Attempt to navigate directly to the dashboard
    const response = await page.goto('/ar-EG/dashboard');
    
    // Depending on middleware setup, it might redirect to login or show 401
    // Usually it redirects back to login or /
    expect(page.url()).toContain('/login');
  });

  test('should reject forged JWT tokens gracefully', async ({ page, request }) => {
    // Sending a request with a fake JWT to the API
    const response = await request.get('/api/branches', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...fake',
        'x-tenant-id': 'tenant1'
      }
    });

    // Should be unauthorized
    expect(response.status()).toBe(401);
  });
});
