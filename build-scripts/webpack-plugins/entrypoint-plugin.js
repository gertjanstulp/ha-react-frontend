const fs = require("fs-extra");
const path = require("path");
const log = require("fancy-log");

class EntrypointPlugin {
    apply(compiler) {
        if (compiler.hooks && compiler.hooks.done) {
            compiler.hooks.done.tap('GenerateEntrypoint', () => {
                const entrypointManifest = require(path.resolve("./react_frontend/manifest.json"));
                fs.writeFileSync(
                    path.resolve("./react_frontend/entrypoint.js"),
`
try {
    new Function("import('${entrypointManifest["main.js"]}')")();
} catch (err) {
    var el = document.createElement('script');
    el.src = '${entrypointManifest["main.js"]}';
    el.type = 'module';
    document.body.appendChild(el);
}
`,
                    { encoding: "utf-8" }
                );
                log("Finished generating entrypoint")
            });
        }
    }
}

module.exports = {
    EntrypointPlugin: EntrypointPlugin
}