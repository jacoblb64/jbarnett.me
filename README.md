[![Netlify Status](https://api.netlify.com/api/v1/badges/a8b6d572-d6c2-4e95-b9f6-0640b37e0aa8/deploy-status)](https://app.netlify.com/sites/jbarnett/deploys)


# *[jbarnett.me](https://jbarnett.me)*

A personal site in the spirit of old school Windows XP, inspired by my days at Microsoft and love of vaporwave.

Using [eleventy](https://www.11ty.dev/) for static site generation and a lot of [XP.css](https://github.com/botoxparty/XP.css/), a little bit of [aesthetic.css](https://github.com/torch2424/aesthetic-css), and some help from [tailwind](https://tailwindcss.com/). Deploying on [netlify](https://www.netlify.com/) and using [goat counter](https://www.goatcounter.com/) for analytics.

A personal site is meant to show some personality, and also be fun to tweak and learn. Most of the code was forked from ideas used for [my personal review site](https://github.com/jacoblb64/in-search-of-stuff)

## dev setup
- `npm install`
- `npm run build` - builds content with `eleventy` and styles with `postcss`
- `npm run start` - serve and watch both sources for changes

## deploying
- pushes to master are automatically built and deployed with `netlify`
## testing
End-to-end tests live in `test/` and run with [Playwright](https://playwright.dev/) against a fresh `npm run build` of `dist/`. They cover the rendered HTML (text snapshots), compiled CSS (computed-style checks), `<details>` behavior, links, and full-page screenshots at desktop and mobile widths. xp.css is served from a vendored copy in `test/fixtures/` so runs are network-free and deterministic.

- `npm test` - build the site and run the suite
- `npm run test:update` - accept intentional visual/HTML changes by rewriting `test/__snapshots__/`
- `npm run test:report` - open the HTML report from the last run

Snapshots in `test/__snapshots__/` are committed and act as the baseline. When upgrading dependencies: run `npm test` first (green), upgrade, rebuild, run `npm test` again. Any diff is either a regression or an intentional change to review and then accept with `test:update`.
