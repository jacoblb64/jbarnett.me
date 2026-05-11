const postcssImport = require("postcss-easy-import");
const postcssPresetEnv = require("postcss-preset-env");
const tailwindcss = require("@tailwindcss/postcss");

module.exports = {
    plugins: [
        tailwindcss,
        postcssImport,
        postcssPresetEnv({
            stage: 3,
            features: {
                "nesting-rules": true,
            },
        }),
        require("autoprefixer"),
    ],
};
