const gulp = require("gulp");
const fs = require("fs-extra");

gulp.task("generate-icon-json", async function (task) {
    await fs.mkdirs("./homeassistant-frontend/build/mdi");

    await fs.writeFile(
        "./homeassistant-frontend/build/mdi/iconList.json",
        "{}",
        "utf-8"
    );
    task();
});
