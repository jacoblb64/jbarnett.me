const lazyImagesPlugin = require('eleventy-plugin-lazyimages');

module.exports = (config) => {
    config.addPassthroughCopy("src/favicon.ico");
    config.addPassthroughCopy("src/assets/**/*");
    config.addPassthroughCopy("src/js/*");
    
    config.addPlugin(lazyImagesPlugin, {
        transformImgPath: (imgPath) => { return `src/${imgPath}`}
    });

    return {
        dir: {
            input: "src",
            output: "dist",
            includes: "includes",
            data: "data",
        },
        environment: process.env.NODE_ENV,
    };
};
