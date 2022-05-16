/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const env = require("./env.js");
const paths = require("./paths.js");

// Files from NPM Packages that should not be imported
module.exports.ignorePackages = () => [
  // Part of yaml.js and only used for !!js functions that we don't use
  require.resolve("esprima"),
];

// Files from NPM packages that we should replace with empty file
module.exports.emptyPackages = () =>
    [
        // Contains all color definitions for all material color sets.
        // We don't use it
        require.resolve("@polymer/paper-styles/color.js"),
        require.resolve("@polymer/paper-styles/default-theme.js"),
        // Loads stuff from a CDN
        require.resolve("@polymer/font-roboto/roboto.js"),
        require.resolve("@vaadin/vaadin-material-styles/typography.js"),
        require.resolve("@vaadin/vaadin-material-styles/font-icons.js"),
        // wrapped in require.resolve so it blows up if file no longer exists
        require.resolve(
            path.resolve(paths.polymer_dir, "src/resources/compatibility.ts")
        ),
        // This polyfill is loaded in workers to support ES5, filter it out.
        require.resolve("proxy-polyfill/src/index.js"),
        // Icons in supervisor conflict with icons in HA so we don't load.
        // isHassioBuild &&
        // require.resolve(
        //     path.resolve(paths.polymer_dir, "src/components/ha-icon.ts")
        // ),
        // isHassioBuild &&
        // require.resolve(
        //     path.resolve(paths.polymer_dir, "src/components/ha-icon-picker.ts")
        // ),
    ].filter(Boolean);

module.exports.definedVars = ({ isProdBuild, defineOverlay }) => ({
    __DEV__: !isProdBuild,
    __BUILD__: JSON.stringify("latest"),
    __VERSION__: JSON.stringify(env.version()),
    __DEMO__: false,
    __SUPERVISOR__: false,
    __BACKWARDS_COMPAT__: false,
    __STATIC_PATH__: "/static/",
    "process.env.NODE_ENV": JSON.stringify(
        isProdBuild ? "production" : "development"
    ),
    ...defineOverlay,
});

module.exports.terserOptions = () => ({
    safari10: false,
    ecma: undefined,
    output: { comments: false },
});

module.exports.babelOptions = () => ({
    babelrc: false,
    compact: false,
    presets: [
        "@babel/preset-typescript",
    ].filter(Boolean),
    plugins: [
         // Only support the syntax, Webpack will handle it.
        "@babel/plugin-syntax-import-meta",
        "@babel/plugin-syntax-dynamic-import",
        "@babel/plugin-syntax-top-level-await",
        "@babel/plugin-proposal-optional-chaining",
        "@babel/plugin-proposal-nullish-coalescing-operator",
        ["@babel/plugin-proposal-decorators", { decoratorsBeforeExport: true }],
        ["@babel/plugin-proposal-private-methods", { loose: true }],
        ["@babel/plugin-proposal-private-property-in-object", { loose: true }],
        ["@babel/plugin-proposal-class-properties", { loose: true }],
    ].filter(Boolean),
    exclude: [
        // \\ for Windows, / for Mac OS and Linux
        /node_modules[\\/]core-js/,
        /node_modules[\\/]webpack[\\/]buildin/,
    ]
});

const outputPath = (outputRoot) =>
    path.resolve(outputRoot);

const publicPath = (root = "") =>
    `${root}/reactfiles/frontend/`;


module.exports.config = {
    app({ isProdBuild }) {
        return {
            entry: "./src/main.ts",
            // entry: {
            //     app: "./src/main.ts"
            //     // service_worker: "./src/entrypoints/service_worker.ts",
            //     // app: "./src/entrypoints/app.ts",
            //     // authorize: "./src/entrypoints/authorize.ts",
            //     // onboarding: "./src/entrypoints/onboarding.ts",
            //     // core: "./src/entrypoints/core.ts",
            //     // "custom-panel": "./src/entrypoints/custom-panel.ts",
            // },
            outputPath: outputPath(paths.output_root),
            publicPath: publicPath(),
            isProdBuild,
        };
    },
};
