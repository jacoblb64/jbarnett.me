// @ts-check
const { test, expect } = require('./fixtures');

test.describe('/about/', () => {
    test('renders inside the shared layout', async ({ page }) => {
        const response = await page.goto('/about/');
        expect(response?.status()).toBe(200);
        await expect(page).toHaveTitle('Jacob Barnett');
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
        await expect(page.locator('main')).toContainText('some about might go here?');
        await expect(page.locator('#header')).toHaveCount(1);
        await expect(page.locator('#footer')).toHaveCount(1);
        await expect(page.locator('link[rel="stylesheet"][href="/styles/main.css"]')).toHaveCount(1);
    });
});
