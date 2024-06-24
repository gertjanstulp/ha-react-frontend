/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const env = require("./env.js");
const paths = require("./paths.js");
const { dependencies } = require("../package.json");

const BABEL_PLUGINS = path.join(__dirname, "babel-plugins");

// Files from NPM Packages that should not be imported
module.exports.ignorePackages = () => [
  // Part of yaml.js and only used for !!js functions that we don't use
//   require.resolve("esprima"),
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
        // // Compatibility not needed for latest builds
        // latestBuild &&
        // // wrapped in require.resolve so it blows up if file no longer exists
        // require.resolve(
        //     path.resolve(paths.polymer_dir, "src/resources/compatibility.ts")
        // ),
        // // This polyfill is loaded in workers to support ES5, filter it out.
        // latestBuild && require.resolve("proxy-polyfill/src/index.js"),
        // // Icons in supervisor conflict with icons in HA so we don't load.
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
    __BUILD__: JSON.stringify("es5"),
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
    safari10: true,
    ecma: 5,
    output: { comments: false },
});

module.exports.babelOptions = () => ({
    babelrc: false,
    compact: false,
    assumptions: {
        privateFieldsAsProperties: true,
        setPublicClassFields: true,
        setSpreadProperties: true,
    },
    browserslistEnv: "legacy",
    presets: [
        [
            "@babel/preset-env",
            {
                useBuiltIns: "usage",
                corejs: dependencies["core-js"],
                bugfixes: true,
                shippedProposals: true,
            },
        ],
        "@babel/preset-typescript",
    ].filter(Boolean),
    plugins: [
        [
            path.join(BABEL_PLUGINS, "inline-constants-plugin.cjs"),
            {
                modules: ["@mdi/js"],
                ignoreModuleNotFound: true,
            },
        ],
        // Import helpers and regenerator from runtime package
        [
          "@babel/plugin-transform-runtime",
          { version: dependencies["@babel/runtime"] },
        ],
        // Support  some proposals still in TC39 process
        ["@babel/plugin-proposal-decorators", { decoratorsBeforeExport: true }],
    ].filter(Boolean),
    exclude: [
        // \\ for Windows, / for Mac OS and Linux
        /node_modules[\\/]core-js/,
        /node_modules[\\/]webpack[\\/]buildin/,
    ],
    overrides: [
        // {
        //     // Add plugin to inject various polyfills, excluding the polyfills
        //     // themselves to prevent self-injection.
        //     plugins: [
        //         [
        //             path.join(BABEL_PLUGINS, "custom-polyfill-plugin.js"),
        //             { method: "usage-global" },
        //         ],
        //     ],
        //     exclude: [
        //         path.join(paths.polymer_dir, "src/resources/polyfills"),
        //         ...[
        //             "@formatjs/(?:ecma402-abstract|intl-\\w+)",
        //             "@lit-labs/virtualizer/polyfills",
        //             "@webcomponents/scoped-custom-element-registry",
        //             "element-internals-polyfill",
        //             "proxy-polyfill",
        //             "unfetch",
        //         ].map((p) => new RegExp(`/node_modules/${p}/`)),
        //     ],
        // },
        {
            // Use unambiguous for dependencies so that require() is correctly injected into CommonJS files
            // Exclusions are needed in some cases where ES modules have no static imports or exports, such as polyfills
            sourceType: "unambiguous",
            include: /\/node_modules\//,
            exclude: [
                "element-internals-polyfill",
                "@?lit(?:-labs|-element|-html)?",
            ].map((p) => new RegExp(`/node_modules/${p}/`)),
        },
    ],
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
            defineOverlay: {
                __BACKWARDS_COMPAT__: true,
            },
        };
    },
};
