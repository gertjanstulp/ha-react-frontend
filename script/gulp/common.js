const gulp = require("gulp");
const del = require("del");
require("./rollup.js");
require("./translations");
require("./icons")

gulp.task("cleanup", (task) => {
    del.sync(["./homeassistant-frontend/build/**", "./homeassistant-frontend/build"]);
    del.sync(["./react_frontend/*.js", "./react_frontend/*.json", "./react_frontend/*.gz"]);
    task();
});

gulp.task("common", gulp.series("cleanup", "generate-translations", "generate-icon-json"));
