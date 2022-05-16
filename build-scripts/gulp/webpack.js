/* eslint-disable @typescript-eslint/no-var-requires */
// Tasks to run webpack.
const fs = require("fs");
const gulp = require("gulp");
const webpack = require("webpack");
const log = require("fancy-log");
const {createConfig} = require("../webpack-config");
const webserver = require("../webserver")

const isWsl =
    fs.existsSync("/proc/version") &&
    fs
        .readFileSync("/proc/version", "utf-8")
        .toLocaleLowerCase()
        .includes("microsoft");

const doneHandler = (done) => (err, stats) => {
    if (err) {
        log.error(err.stack || err);
        if (err.details) {
            log.error(err.details);
        }
        return;
    }

    if (stats.hasErrors() || stats.hasWarnings()) {
        // eslint-disable-next-line no-console
        console.log(stats.toString("minimal"));
    }

    log(`Build done @ ${new Date().toLocaleTimeString()}`);

    if (done) {
        done();
    }
};

const prodBuild = (conf) =>
    new Promise((resolve) => {
        webpack(
            conf,
            // Resolve promise when done. Because we pass a callback, webpack closes itself
            doneHandler(resolve)
        );
    });

gulp.task("webpack-watch", () => {
    // This command will run forever because we don't close compiler
    webpack(createConfig({ isProdBuild: false }))
    .watch({ poll: isWsl }, 
        doneHandler());
});

gulp.task("webpack-prod", () =>
    prodBuild(createConfig({ isProdBuild: true }))
);
