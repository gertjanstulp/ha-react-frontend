const gulp = require("gulp");
const del = require("del");

gulp.task("clean", (task) => {
    del.sync([
        "./react_frontend/**/*.js", 
        "./react_frontend/**/*.json", 
        "./react_frontend/**/*.gz", 
        "./react_frontend/**/*.map",
        "./react_frontend/**/*.txt",
        "./homeassistant-frontend/build/*"
    ]);
    task();
});