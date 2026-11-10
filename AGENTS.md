# AGENTS.md

Guidance for coding agents working in this repo. Humans: see `README.md`. Only facts that change what you'd do are listed here; everything else is discoverable from the code.

## What this is

A two-page personal site (`/` and `/about/`) built with Eleventy 3 (Nunjucks templates) and PostCSS/Tailwind v4, styled to look like Windows XP. No app JavaScript. Deployed by Netlify from `master`. `dist/` is generated output and is gitignored; never edit or commit it.

## Commands

Run from the repo root. Node 24.

- `npm ci` - install (use `ci`, not `install`, unless you're intentionally changing the lockfile)
- `npm run build` - build content + styles into `dist/`
- `npm run build:prod` - same with `NODE_ENV=production` (adds the analytics snippet)
- `npm start` - dev server with watch (port 8080)
- `npm test` - build, then run the Playwright suite in `test/` (~10s)
- `npm run test:update` - rewrite snapshots in `test/__snapshots__/` (see Testing before using)
- `npm run test:report` - open the HTML report from the last run

## Testing rules

- Run `npm test` before you finish any change. It must be green.
- The suite includes HTML snapshots and full-page screenshots. A snapshot failure is either a regression or an intentional change. **Open the report and inspect the diff before running `test:update`.** Never update snapshots to make a failure go away without understanding it, and commit updated snapshots in the same commit as the change that caused them.
- Screenshot baselines are rendered on macOS, and CI runs on a pinned macOS runner. Do not regenerate them on Linux; the visual tests will fail there.
- Tests abort every request that leaves localhost (`test/fixtures.js`). If you add a third-party asset, the suite will fail by design. Prefer self-hosting via Eleventy passthrough copy (see how xp.css is handled in `.eleventy.js`).
- Add or update tests for behavior you change, even if not asked.

## Gotchas that have bitten before

- xp.css is copied from `node_modules/xp.css/dist/` into `dist/styles/xp/` by `.eleventy.js`. The file is `XP.css` (capitals). macOS is case-insensitive and will hide a casing mistake that 404s on Netlify's Linux build.
- `src/styles/main.pcss` overrides aesthetic-css's glitch `@keyframes` with a 9999px clip so the heading effect covers wide/multi-line text. Keep the override after the `aesthetic-css` import so it wins the cascade; tests check this.
- Tailwind is v4 via `@tailwindcss/postcss`. There is no `tailwind.config.js` and none is needed. Utility classes come from `@import "tailwindcss"`.
- Netlify does not read `engines.node`; its Node version is set in the Netlify UI.
- The analytics snippet in `src/includes/layouts/BasePage.html` renders only when `NODE_ENV=production`. Don't hard-code it.

## Git and PRs

- Never commit to or push `master`. It is protected: PR only, squash merge, linear history. Branch from `master`.
- PR title uses Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `ci:`, `docs:`); it becomes the squash commit message. Commit messages on the branch should follow the same convention.
- Every PR gets a Netlify deploy preview and a GitHub Actions `test` run.
- Disclose agent involvement: name the tool and model in the PR description, and add a `Co-Authored-By:` trailer on commits the agent authored.
- Don't open, merge, or close PRs, and don't push, unless the user asked for that specific action in this session.

## Keep this file current

If you change a command, a path mentioned here, or the test workflow, update this file (and `README.md` if it's documented there too) in the same PR. Remove any instruction that no longer affects decisions.
