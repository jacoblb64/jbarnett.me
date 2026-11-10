// @ts-check
// Build-output tests: the webServer has already run `npm run build`, so dist/ is fresh.
const { test, expect } = require('./fixtures');
const fs = require('node:fs');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const dist = path.join(__dirname, '..', 'dist');
const read = (p) => fs.readFileSync(path.join(dist, p), 'utf8');
// Normalize trailing whitespace per line so editor/OS line-ending noise doesn't fail the snapshot.
const normalize = (s) => s.split('\n').map((l) => l.trimEnd()).join('\n').trim() + '\n';

test.describe('build output', () => {
    test('emits the expected files', () => {
        for (const file of ['index.html', 'about/index.html', 'styles/main.css', 'styles/xp/XP.css', 'styles/xp/XP.css.map', 'styles/xp/ms_sans_serif.woff2', 'styles/xp/PerfectDOSVGA437Win.woff', 'favicon.ico', 'favicon.svg', 'favicon-96x96.png']) {
            expect(fs.existsSync(path.join(dist, file)), file).toBe(true);
        }
    });

    test('home HTML matches snapshot', () => {
        expect(normalize(read('index.html'))).toMatchSnapshot('index.html');
    });

    test('about HTML matches snapshot', () => {
        expect(normalize(read('about/index.html'))).toMatchSnapshot('about.html');
    });

    test('compiled CSS contains the custom glitch keyframe overrides', () => {
        const css = read('styles/main.css');
        // Both names are defined twice: upstream aesthetic-css (450px right edge) and our override
        // (9999px, commit 5d6c5f2). The later definition wins in the cascade, so it must be ours.
        for (const name of ['aesthetic-effect-text-glitch-anim-1', 'aesthetic-effect-text-glitch-anim-2']) {
            // One balanced @keyframes block: keyframe bodies nest exactly one level of braces.
            const blocks = css.match(new RegExp(`@keyframes\\s+${name}\\s*\\{(?:[^{}]*\\{[^{}]*\\})*[^{}]*\\}`, 'g')) || [];
            expect(blocks.length, `@keyframes ${name} definitions`).toBe(2);
            expect(blocks[0], `${name} upstream`).toContain('450px');
            expect(blocks[1], `${name} override`).toContain('9999px');
            expect(blocks[1], `${name} override`).not.toContain('450px');
        }
    });

    test('compiled CSS contains the custom rules and tailwind utilities used by the page', () => {
        const css = read('styles/main.css');
        for (const needle of ['.office-colors', '.stroke', '.appear-2s', '.appear-3s', '.tree-view a', '@keyframes appear', '--xp-red', '.text-6xl', '.max-w-4xl', '.space-y-10', '.min-h-full']) {
            expect(css, needle).toContain(needle);
        }
    });

    test('non-production build has no analytics script', () => {
        expect(read('index.html')).not.toContain('goatcounter');
    });

    test('production build includes the analytics script', () => {
        const out = fs.mkdtempSync(path.join(os.tmpdir(), 'jbarnett-prod-'));
        try {
            execFileSync('npx', ['eleventy', '--quiet', `--output=${out}`], {
                cwd: path.join(__dirname, '..'),
                env: { ...process.env, NODE_ENV: 'production' },
                stdio: 'pipe',
            });
            const html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
            expect(html).toContain('data-goatcounter="https://jbarnett.goatcounter.com/count"');
            expect(html).toContain('gc.zgo.at/count.js');
        } finally {
            fs.rmSync(out, { recursive: true, force: true });
        }
    });

    test('no stylesheet is loaded from a CDN', () => {
        for (const f of ['index.html', 'about/index.html']) expect(read(f), f).not.toMatch(/https?:\/\/[^"']*\.css/);
    });

    test('does not copy xp.css docs cruft', () => {
        const files = fs.readdirSync(path.join(dist, 'styles/xp'));
        expect(files.sort()).toEqual(['PerfectDOSVGA437Win.woff', 'PerfectDOSVGA437Win.woff2', 'XP.css', 'XP.css.map', 'ms_sans_serif.woff', 'ms_sans_serif.woff2', 'ms_sans_serif_bold.woff', 'ms_sans_serif_bold.woff2'].sort());
    });
});
