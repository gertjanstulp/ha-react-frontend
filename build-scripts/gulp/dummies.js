const gulp = require("gulp");
const fs = require("fs");
const path = require("path");

gulp.task("gen-dummy-translations-json", (done) => {
    if (!fs.existsSync("./homeassistant-frontend/build/translations")) {
        fs.mkdirSync("./homeassistant-frontend/build/translations", { recursive: true });
    }
  
    fs.writeFileSync(path.resolve("./homeassistant-frontend/build/translations", "translationMetadata.json"), "{}");
    
    done();
});

gulp.task("dummies", gulp.series("gen-dummy-translations-json"));
