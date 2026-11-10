// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('node:path');

const PORT = 4173;
const repoRoot = path.join(__dirname, '..');

module.exports = defineConfig({
    testDir: __dirname,
    outputDir: path.join(__dirname, 'test-results'),
    // Drop the platform suffix: this suite is only ever run on this macOS machine.
    snapshotPathTemplate: '{testDir}/__snapshots__/{testFileName}/{arg}{ext}',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 0,
    reporter: [['list'], ['html', { outputFolder: path.join(__dirname, 'playwright-report'), open: 'never' }]],
    expect: {
        toHaveScreenshot: { animations: 'disabled', maxDiffPixelRatio: 0.01 },
    },
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: 'retain-on-failure',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
        command: 'npm run build && node test/serve.mjs',
        cwd: repoRoot,
        url: `http://localhost:${PORT}/`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: { ...process.env, PORT: String(PORT) },
    },
});
