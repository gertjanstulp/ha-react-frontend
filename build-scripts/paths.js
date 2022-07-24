/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  polymer_dir: path.resolve(__dirname, ".."),

  build_dir: path.resolve(__dirname, "../build"),
  output_root: path.resolve(__dirname, "../react_frontend"),
  
  translations_src: path.resolve(__dirname, "../src/translations"),
};
