const fs = require("fs-extra");
const gulp = require("gulp");

gulp.task("entrypoint", async function (task) {
    writeEntrypoint();
    task();
});

function writeEntrypoint() {
    const entrypointManifest = require(path.resolve("./react_frontend/manifest.json"));
    fs.writeFileSync(
        path.resolve("./react_frontend/entrypoint.js"),
`
try {
    new Function("import('/reactfiles/frontend/${entrypointManifest["./src/main.ts"]}')")();
} catch (err) {
    var el = document.createElement('script');
    el.src = '/reactfiles/frontend/${entrypointManifest["./src/main.ts"]}';
    el.type = 'module';
    document.body.appendChild(el);
}
`,
        { encoding: "utf-8" }
    );
}