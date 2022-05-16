/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");
const paths = require("./paths.js");

module.exports = {
  isProdBuild() {
    return (
      process.env.NODE_ENV === "production"
    );
  },
  version() {
    const version = fs
      .readFileSync(path.resolve(paths.polymer_dir, "setup.cfg"), "utf8")
      .match(/version\W+=\W(.*)/);
    if (!version) {
      throw Error("Version not found");
    }
    return version[1];
  },
};
