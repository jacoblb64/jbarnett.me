module.exports = (config) => {
    config.addPassthroughCopy({ "src/favicons": "/" });
    config.addPassthroughCopy("src/assets/**/*");
    // Serve xp.css (and the fonts it references relatively) from this origin
    // instead of an unpinned unpkg.com URL. Only the stylesheet and fonts; the
    // package's dist also ships docs we don't want. Note the file is XP.css
    // (case matters on Linux/Netlify).
    config.addPassthroughCopy({ "node_modules/xp.css/dist/XP.css": "styles/xp/XP.css" });
    config.addPassthroughCopy({ "node_modules/xp.css/dist/*.woff2": "styles/xp" });
    config.addPassthroughCopy({ "node_modules/xp.css/dist/*.woff": "styles/xp" });

    return {
        dir: {
            input: "src",
            output: "dist",
            includes: "includes",
            data: "data",
        },
        htmlTemplateEngine: "njk",
        markdownTemplateEngine: "njk",
    };
};
