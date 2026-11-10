// @ts-check
// Shared Playwright fixture: makes every page deterministic and network-free.
//  - xp.css is loaded from unpkg (unpinned) in BasePage.html; serve the vendored copy instead.
//  - GoatCounter analytics is blocked outright (only present in production builds anyway).
const base = require('@playwright/test');
const path = require('node:path');

const XP_CSS = path.join(__dirname, 'fixtures', 'xp.css');

const test = base.test.extend({
    context: async ({ context }, use) => {
        await context.route('**/unpkg.com/xp.css**', (route) => route.fulfill({ path: XP_CSS, contentType: 'text/css' }));
        await context.route('**/gc.zgo.at/**', (route) => route.abort());
        await use(context);
    },
});

/** Waits for the one-shot `.appear-3s` prompt line to finish fading in (max ~3s). */
async function waitForPromptAnimation(page) {
    await base.expect(page.locator('.appear-3s')).toHaveCSS('opacity', '1', { timeout: 6000 });
}

module.exports = { test, expect: base.expect, waitForPromptAnimation };
