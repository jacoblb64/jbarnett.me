// @ts-check
const { test, expect, waitForPromptAnimation } = require('./fixtures');

const viewports = {
    desktop: { width: 1280, height: 800 },
    mobile: { width: 390, height: 844 },
};

for (const [name, viewport] of Object.entries(viewports)) {
    test.describe(`${name} (${viewport.width}x${viewport.height})`, () => {
        test.use({ viewport });

        test('home', async ({ page }) => {
            await page.goto('/');
            await waitForPromptAnimation(page);
            await expect(page).toHaveScreenshot(`home-${name}.png`, { fullPage: true });
        });

        test('home with all experience sections expanded', async ({ page }) => {
            await page.goto('/');
            await waitForPromptAnimation(page);
            await page.locator('details').evaluateAll((els) => els.forEach((el) => el.setAttribute('open', '')));
            await expect(page.locator('details[open]')).toHaveCount(6);
            await expect(page).toHaveScreenshot(`home-expanded-${name}.png`, { fullPage: true });
        });

        test('about', async ({ page }) => {
            await page.goto('/about/');
            await expect(page).toHaveScreenshot(`about-${name}.png`, { fullPage: true });
        });
    });
}
