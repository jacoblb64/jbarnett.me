[![Netlify Status](https://api.netlify.com/api/v1/badges/478bb8e9-7f7b-4b3d-9e0c-37f2854433e7/deploy-status)](https://app.netlify.com/sites/in-search-of-stuff/deploys)

# in-search-of-stuff

A personal review site to document some of the enchanting items that I've found.

Using [eleventy](https://www.11ty.dev/) for static site generation and [tailwind](https://tailwindcss.com/) for styling. Deploying on [netlify](https://www.netlify.com/) and using [goat counter](https://www.goatcounter.com/) for analytics.

The goals of this project are to have an incredibly lightwight, fast-loading and responsive site, and to eventually be able to write new reviews in pure markdown, and separate presentation from content.

## dev setup
- `npm install`
- `npm run build` - builds content with `eleventy` and styles with `postcss`
- `npm run start` - serve and watch both sources for changes