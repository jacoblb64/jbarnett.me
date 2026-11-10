// @ts-check
const { test, expect, waitForPromptAnimation } = require('./fixtures');

test.describe('/ content', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('document basics', async ({ page }) => {
        await expect(page).toHaveTitle('Jacob Barnett');
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
        await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.ico');
        await expect(page.locator('script[data-goatcounter]')).toHaveCount(0);
    });

    test('is fully self-hosted: no third-party requests, xp.css and fonts load locally', async ({ page }) => {
        const sheets = page.locator('link[rel="stylesheet"]');
        await expect(sheets).toHaveCount(2);
        await expect(sheets.nth(0)).toHaveAttribute('href', '/styles/main.css');
        await expect(sheets.nth(1)).toHaveAttribute('href', '/styles/xp/XP.css');
        await page.waitForLoadState('networkidle');
        expect(page.offOrigin).toEqual([]);
        const fonts = await page.evaluate(async () => {
            await document.fonts.ready;
            return Array.from(document.fonts).filter((f) => f.status === 'loaded').map((f) => f.family).sort();
        });
        expect(fonts.length).toBeGreaterThan(0);
        expect(fonts).toContain('Pixelated MS Sans Serif');
        // Window title bars use xp.css's Trebuchet; body text uses its pixel font.
        await expect(page.locator('.title-bar-text').first()).toHaveCSS('font-family', /Trebuchet/);
    });

    test('glitch heading', async ({ page }) => {
        const h1 = page.locator('h1');
        await expect(h1).toHaveCount(1);
        await expect(h1).toBeVisible();
        await expect(h1).toHaveText('Jacob Barnett');
        await expect(h1).toHaveAttribute('data-glitch', 'Jacob Barnett');
        await expect(h1).toHaveClass(/aesthetic-effect-text-glitch/);
    });

    test('three XP windows in order', async ({ page }) => {
        await expect(page.locator('.window .title-bar-text')).toHaveText(['Command Prompt', 'Experience', 'About This Page']);
        const controls = page.locator('.title-bar-controls button');
        await expect(controls).toHaveCount(3);
        for (const [i, label] of ['Minimize', 'Maximize', 'Close'].entries()) {
            await expect(controls.nth(i)).toHaveAttribute('aria-label', label);
        }
    });

    test('command prompt lines appear', async ({ page }) => {
        const pres = page.locator('.window-body.bg-black pre');
        await expect(pres).toHaveText([
            'Microsoft❮R❯ Windows DOS ❮C❯ Copyright Microsoft Corp 1990-2001.',
            'C:\\WINDOWS\\SYSTEM32> hostname',
            'Jacob Barnett is a software engineer',
        ]);
        await waitForPromptAnimation(page);
        await expect(page.locator('.appear-2s')).toHaveCSS('opacity', '1');
    });

    test('experience tree: default open/closed state', async ({ page }) => {
        const details = page.locator('ul.tree-view > details');
        await expect(details).toHaveCount(6);
        await expect(details.locator('> summary')).toContainText([
            'Head of Engineering at MTA Digital Services 2026 - present',
            'Chief Technology Officer at HeraldAPI 2021 - 2025',
            'Engineering Lead for Send Chinatown Love 2020 - 2025',
            'SDLC Architect & Full-Stack Software Engineer at Haven Life 2018 - 2021',
            'Software Development Engineer at Microsoft 2016 - 2018',
            'Education',
        ]);
        await expect(page.locator('ul.tree-view > details[open]')).toHaveCount(2);
        await expect(details.nth(0)).toHaveAttribute('open', '');
        await expect(details.nth(1)).toHaveAttribute('open', '');
        for (const i of [2, 3, 4, 5]) await expect(details.nth(i)).not.toHaveAttribute('open', '');

        // Open sections show their bullets; closed ones hide them.
        await expect(details.nth(0).locator('li').first()).toBeVisible();
        await expect(details.nth(0).locator('li')).toHaveText([
            'Run the countdown clocks, MTA.info, TrainTime and new MTA apps',
            'React Native, Kotlin, low-level connections, and more',
        ]);
        await expect(details.nth(5).locator('li').first()).toBeHidden();
    });

    test('experience tree: toggling sections', async ({ page }) => {
        const education = page.locator('ul.tree-view > details', { hasText: 'Education' });
        const mta = page.locator('ul.tree-view > details', { hasText: 'MTA Digital Services' });

        await education.locator('> summary').click();
        await expect(education).toHaveAttribute('open', '');
        await expect(education.getByText('McGill University')).toBeVisible();
        await expect(education.getByText('GPA 3.7')).toBeVisible();
        await expect(education.getByText('Hong Kong Polytechnic University')).toBeVisible();

        await mta.locator('> summary').click();
        await expect(mta).not.toHaveAttribute('open', '');
        await expect(mta.locator('li').first()).toBeHidden();
    });

    test('external links', async ({ page }) => {
        const morphism = page.getByRole('link', { name: 'Morphism' });
        await expect(morphism).toHaveAttribute('href', 'https://nobrainr.github.io/morphism/');
        await expect(morphism).toHaveAttribute('target', '_blank');
        await expect(morphism).toHaveAttribute('rel', 'noopener noreferrer');

        const havenLife = page.locator('ul.tree-view > details', { hasText: 'Haven Life' });
        // Haven Life is collapsed by default, so the link is hidden; include hidden elements.
        const amorphic = havenLife.getByRole('link', { name: 'Amorphic', includeHidden: true });
        await expect(amorphic).toHaveAttribute('href', 'https://github.com/haven-life/amorphic-framework');
        await expect(amorphic).toHaveAttribute('target', '_blank');
        await expect(amorphic).toHaveAttribute('rel', 'noopener noreferrer');
        await expect(page.locator('ul.tree-view a')).toHaveCount(2);
    });

    test('about window and OK button open the GitHub repo in a new tab', async ({ page, context }) => {
        await expect(page.locator('.window').last().locator('.window-body p')).toHaveText('Built using eleventy and xp.css');
        await expect(page.locator('form[action*="github.com"]')).toHaveAttribute('rel', 'noopener noreferrer');
        await context.route('https://github.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>stub</title>' }));
        const popupPromise = context.waitForEvent('page');
        await page.getByRole('button', { name: 'OK' }).click();
        const popup = await popupPromise;
        await popup.waitForLoadState();
        expect(popup.url()).toMatch(/^https:\/\/github\.com\/jacoblb64\/jbarnett\.me\/?\??$/);
        await popup.close();
    });
});

test.describe('/ compiled styles are applied', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('tailwind utilities', async ({ page }) => {
        // text-6xl is 3.75rem; xp.css sets the root font-size so this resolves to 80px, not 60px.
        await expect(page.locator('h1')).toHaveCSS('font-size', '80px');
        await expect(page.locator('h1')).toHaveCSS('font-style', 'italic');
        await expect(page.locator('main')).toHaveCSS('display', 'flex');
        await expect(page.locator('main')).toHaveCSS('flex-direction', 'column');
        await expect(page.locator('main')).toHaveCSS('padding-left', '80px'); // md:px-20 at 1280px
        await expect(page.locator('body')).toHaveCSS('display', 'flex');
        await expect(page.locator('.window-body.bg-black')).toHaveCSS('background-color', 'rgb(0, 0, 0)');
        const container = page.locator('main > div').first();
        await expect(container).toHaveCSS('max-width', '896px'); // max-w-4xl
    });

    test('custom rules', async ({ page }) => {
        const hr = page.locator('hr.office-colors');
        await expect(hr).toHaveCSS('height', '8px');
        await expect(hr).toHaveCSS('background-image', /linear-gradient\(to right, rgb\(222, 72, 43\) 25%, rgb\(252, 207, 3\) 50%, rgb\(129, 192, 70\) 75%, rgb\(59, 119, 188\) 100%\)/);
        await expect(hr).toHaveCSS('border-top-width', '0px');

        await expect(page.locator('h1')).toHaveCSS('-webkit-text-stroke-width', '1px');
        await expect(page.locator('h1')).toHaveCSS('-webkit-text-stroke-color', 'rgb(0, 0, 0)');

        await expect(page.locator('pre').first()).toHaveCSS('white-space', 'pre-wrap');
        await expect(page.locator('pre').first()).toHaveCSS('padding', '12px 8px 2px');

        await expect(page.getByRole('link', { name: 'Morphism' })).toHaveCSS('color', 'rgb(0, 0, 255)');

        await expect(page.locator('.appear-2s')).toHaveCSS('animation-duration', '2s');
        await expect(page.locator('.appear-3s')).toHaveCSS('animation-duration', '3s');
    });

    test('glitch pseudo-elements use the overridden keyframes', async ({ page }) => {
        const result = await page.locator('h1').evaluate((el) => {
            const before = getComputedStyle(el, '::before');
            const after = getComputedStyle(el, '::after');
            return {
                beforeContent: before.content,
                beforeAnim: before.animationName,
                afterAnim: after.animationName,
                // Walk the stylesheets for the final (overriding) keyframe definitions.
                keyframes: Array.from(document.styleSheets)
                    .flatMap((s) => { try { return Array.from(s.cssRules); } catch { return []; } })
                    .filter((r) => r instanceof CSSKeyframesRule && /aesthetic-effect-text-glitch-anim-[12]/.test(r.name))
                    .map((r) => ({ name: r.name, text: r.cssText })),
            };
        });
        // `content: attr(data-glitch)` resolves to the attribute value in computed style.
        expect(result.beforeContent).toBe('"Jacob Barnett"');
        expect(result.beforeAnim).toBe('aesthetic-effect-text-glitch-anim-2');
        expect(result.afterAnim).toBe('aesthetic-effect-text-glitch-anim-1');
        // The last definition of each name wins; it must be our 9999px override (not upstream's 450px).
        for (const name of ['aesthetic-effect-text-glitch-anim-1', 'aesthetic-effect-text-glitch-anim-2']) {
            const defs = result.keyframes.filter((k) => k.name === name);
            expect(defs.length, name).toBeGreaterThan(0);
            expect(defs[defs.length - 1].text).toContain('9999px');
            expect(defs[defs.length - 1].text).not.toContain('450px');
        }
    });

    test('static assets are served', async ({ request }) => {
        const css = await request.get('/styles/main.css');
        expect(css.status()).toBe(200);
        expect(css.headers()['content-type']).toContain('text/css');
        const favicon = await request.get('/favicon.ico');
        expect(favicon.status()).toBe(200);
        const xp = await request.get('/styles/xp/XP.css');
        expect(xp.status()).toBe(200);
        expect(xp.headers()['content-type']).toContain('text/css');
        for (const font of ['ms_sans_serif.woff2', 'ms_sans_serif_bold.woff2', 'PerfectDOSVGA437Win.woff2']) {
            expect((await request.get(`/styles/xp/${font}`)).status(), font).toBe(200);
        }
    });
});
