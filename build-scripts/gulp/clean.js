const gulp = require("gulp");
const del = import("del");

gulp.task("clean", async function (task) {
    (await del).deleteSync([
        "./react_frontend/**/*.js", 
        "./react_frontend/**/*.json", 
        "./react_frontend/**/*.gz", 
        "./react_frontend/**/*.map",
        "./react_frontend/**/*.txt",
        "./homeassistant-frontend/build/*"
    ]);
    task();
});