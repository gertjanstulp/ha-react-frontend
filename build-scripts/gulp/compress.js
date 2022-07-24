// Tasks to compress

const gulp = require("gulp");
const zopfli = require("gulp-zopfli-green");
const merge = require("merge-stream");
const path = require("path");
const paths = require("../paths");

const zopfliOptions = { threshold: 150 };

gulp.task("compress", function compressApp() {
    const jsCompressed = gulp
        .src(path.resolve(paths.output_root, "**/*.js"))
        .pipe(zopfli(zopfliOptions))
        .pipe(gulp.dest(paths.output_root));

    return merge(jsCompressed);
});
