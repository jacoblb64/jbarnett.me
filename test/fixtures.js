// @ts-check
// Shared Playwright fixture: makes every page deterministic and network-free.
//  - Any request that leaves localhost is aborted. The site is meant to be fully
//    self-hosted (xp.css + fonts are copied into dist/styles/xp), so this both
//    blocks GoatCounter analytics and catches accidental third-party requests.
//  - Aborted off-origin requests are collected on `page.offOrigin` for assertions.
const base = require('@playwright/test');

const test = base.test.extend({
    context: async ({ context }, use) => {
        await context.route(/^(?!http:\/\/localhost)/, (route) => route.abort());
        await use(context);
    },
    page: async ({ page }, use) => {
        page.offOrigin = [];
        page.on('requestfailed', (req) => {
            if (!req.url().startsWith('http://localhost')) page.offOrigin.push(req.url());
        });
        await use(page);
    },
});

/** Waits for the one-shot `.appear-3s` prompt line to finish fading in (max ~3s). */
async function waitForPromptAnimation(page) {
    await base.expect(page.locator('.appear-3s')).toHaveCSS('opacity', '1', { timeout: 6000 });
}

module.exports = { test, expect: base.expect, waitForPromptAnimation };
