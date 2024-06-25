// Run HA develop mode
const gulp = require("gulp");
const webserver = require("../webserver");

require("./clean.js");
require("./translations.js");
require("./gen-icons-json.js")
require("./compress.js");
require("./webpack.js");
require("./entrypoint.js");
require("./dummies.js")

gulp.task(
    "develop",
    gulp.series(
        async function setEnv() {
            process.env.NODE_ENV = "development";
        },
        "clean",
        "generate-translations",
        "gen-icons-json",
        "dummies",
        "webpack-watch",
        "entrypoint"
    )
);

gulp.task(
    "build",
    gulp.series(
        async function setEnv() {
            process.env.NODE_ENV = "production";
        },
        "clean",
        "generate-translations",
        "gen-icons-json",
        "dummies",
        "webpack-prod",
        "entrypoint",
        // Don't compress running tests
        ...(["compress"]),
    )
);

gulp.task("serve", () => {
    webserver.create_server()
})