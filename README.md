[![Netlify Status](https://api.netlify.com/api/v1/badges/a8b6d572-d6c2-4e95-b9f6-0640b37e0aa8/deploy-status)](https://app.netlify.com/sites/jbarnett/deploys)


# *[jbarnett.me](https://jbarnett.me)*

A personal site in the spirit of old school Windows XP, inspired by my days at Microsoft and love of vaporwave.

Using [eleventy](https://www.11ty.dev/) for static site generation and a lot of [XP.css](https://github.com/botoxparty/XP.css/), a little bit of [aesthetic.css](https://github.com/torch2424/aesthetic-css), and some help from [tailwind](https://tailwindcss.com/). Deploying on [netlify](https://www.netlify.com/) and using [goat counter](https://www.goatcounter.com/) for analytics.

A personal site is meant to show some personality, and also be fun to tweak and learn. Most of the code was forked from ideas used for [my personal review site](https://github.com/jacoblb64/in-search-of-stuff)

## dev setup
- `npm install`
- `npm run build` - builds content with `eleventy` and styles with `postcss` into `dist/`
- `npm run build:prod` - same, with `NODE_ENV=production` (adds the GoatCounter analytics snippet)
- `npm run start` - serve `dist/` locally and watch both sources for changes
- `npm test` - build and run the end-to-end suite (see below)

Node 24 is expected (see `engines` in `package.json`).

## contributing / workflow
`master` is protected. Changes land through a pull request:

1. Branch off `master` and commit your work. Use [Conventional Commits](https://www.conventionalcommits.org/) in the PR title (`feat:`, `fix:`, `chore:`, `test:`, `ci:`, `docs:`), since the PR title becomes the squash-commit message.
2. Open a PR. Two things kick off automatically:
   - **GitHub Actions** runs the `test` workflow (`.github/workflows/test.yml`), which builds the site and runs the Playwright suite. If it fails, the HTML report and traces are attached to the run as an artifact.
   - **Netlify** builds a deploy preview of the branch and links it from the PR checks, so you can click through the real site before merging.
3. Merge with **squash** (the only merge method allowed; linear history is enforced). Merging to `master` triggers the production deploy on Netlify.

Note: the ruleset currently enables required status checks but doesn't list any, so a red `test` run won't block the merge button on its own. Add the `e2e` job to the required checks in the repo's rulesets if you want CI to gate merges.

## testing
End-to-end tests live in `test/` and run with [Playwright](https://playwright.dev/) against a fresh `npm run build`. A tiny dependency-free static server (`test/serve.mjs`) serves `dist/`, so the tests see exactly what Netlify deploys rather than the dev server's live-reload output.

What's covered:
- **Build output** - expected files exist, exact HTML snapshots of both pages, the compiled CSS contains the custom rules and the glitch keyframe override, the production build includes the analytics snippet, and no stylesheet comes from a CDN.
- **Behavior** - window titles, prompt lines fading in, the `<details>` experience tree (default state and toggling), link targets, and the "OK" button opening the repo in a new tab.
- **Compiled styles** - computed-style checks that Tailwind utilities and custom rules actually apply.
- **Self-hosting** - any request that leaves localhost is aborted and asserted absent; xp.css and its fonts load from this origin.
- **Visual** - full-page screenshots of home (collapsed and fully expanded) and about, at desktop and mobile widths.

Commands:
- `npm test` - build the site and run the suite
- `npm run test:update` - accept intentional visual/HTML changes by rewriting `test/__snapshots__/`
- `npm run test:report` - open the HTML report from the last run

Snapshots in `test/__snapshots__/` are committed and act as the baseline. When a test fails, open the report to see the diff image; decide whether it's a regression to fix or an intentional change to accept with `test:update`, and commit the updated snapshot alongside the change.

The screenshot baselines are rendered on macOS, and CI is pinned to a `macos-15` runner to match. Running the suite on Linux will fail the visual tests until the PNGs are regenerated there.

## deploying
- `master` is deployed automatically by Netlify on every merge
- every PR gets a Netlify deploy preview
- xp.css and its fonts are copied from `node_modules` into `dist/styles/xp/` at build time, so the site makes no third-party requests except GoatCounter in production
