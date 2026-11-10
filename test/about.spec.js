// @ts-check
const { test, expect } = require('./fixtures');

test.describe('/about/', () => {
    test('renders inside the shared layout', async ({ page, request }) => {
        const response = await page.goto('/about/');
        expect(response?.status()).toBe(200);
        await expect(page).toHaveTitle('About - Jacob Barnett');
        await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.ico');
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
        await expect(page.locator('main')).toContainText('some about might go here?');
        await expect(page.locator('#header')).toHaveCount(1);
        await expect(page.locator('#footer')).toHaveCount(1);
        await expect(page.locator('link[rel="stylesheet"][href="/styles/main.css"]')).toHaveCount(1);
        // Favicon href is absolute, so it resolves from nested routes too.
        const href = await page.locator('link[rel="icon"]').evaluate((el) => el.href);
        expect((await request.get(href)).status()).toBe(200);
    });
});
