import { test, expect } from '@playwright/test';

test.describe('Smoke Tests — Public Pages', () => {
    test('homepage loads with correct title and key content', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/PharmConnect/);
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();
        await expect(page.getByText('Compliance Alerts')).toBeVisible();
        await expect(page.getByText('Active Partnerships')).toBeVisible();
    });

    test('marketplace page loads with heading', async ({ page }) => {
        await page.goto('/marketplace');
        await expect(page).toHaveTitle(/PharmConnect/);
        await expect(page.getByRole('heading', { name: /Marketplace/ })).toBeVisible();
    });

    test('regulatory guide page loads with heading', async ({ page }) => {
        await page.goto('/regulatory-guide');
        await expect(page).toHaveTitle(/PharmConnect/);
        await expect(page.getByRole('heading', { name: /Regulatory Guide/ })).toBeVisible();
    });

    test('agent chat page loads', async ({ page }) => {
        await page.goto('/agent-chat');
        await expect(page).toHaveTitle(/PharmConnect/);
        await expect(page.locator('nav')).toBeVisible();
    });

    test('login page loads with sign-in form', async ({ page }) => {
        await page.goto('/auth/login');
        await expect(page).toHaveTitle(/PharmConnect/);
        await expect(page.getByText('Sign in to your account')).toBeVisible();
    });

    test('register page loads', async ({ page }) => {
        await page.goto('/auth/register');
        await expect(page).toHaveTitle(/PharmConnect/);
    });
});

test.describe('Smoke Tests — Auth Guard', () => {
    test('dashboard redirects unauthenticated users to login', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForURL(/\/auth\/login\?redirect=%2Fdashboard/);
        await expect(page).toHaveURL(/\/auth\/login/);
    });
});

test.describe('Smoke Tests — API Routes', () => {
    test('GET /api/suppliers does not return 500', async ({ request }) => {
        const response = await request.get('/api/suppliers');
        expect(response.status()).toBeLessThan(500);
    });

    test('POST /api/agent/chat rejects missing messages body', async ({ request }) => {
        const response = await request.post('/api/agent/chat', {
            data: {},
        });
        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('messages array required');
    });

    test('POST /api/agent/chat rejects non-array messages', async ({ request }) => {
        const response = await request.post('/api/agent/chat', {
            data: { messages: 'not-an-array' },
        });
        expect(response.status()).toBe(400);
    });

    test('GET /api/agent/chat returns 405 (POST-only)', async ({ request }) => {
        const response = await request.get('/api/agent/chat');
        expect(response.status()).toBe(405);
    });
});
