const fs = require("fs");

let rawcore = fs.readFileSync("./homeassistant-frontend/package.json");
let rawreact = fs.readFileSync("./package.json");

const core = JSON.parse(rawcore);
const react = JSON.parse(rawreact);

fs.writeFileSync(
  "./package.json",
  JSON.stringify(
    {
      ...react,
      resolutions: { ...core.resolutions, ...react.resolutionsOverride },
      dependencies: { ...core.dependencies, ...react.dependenciesOverride },
      devDependencies: { ...core.devDependencies, ...react.devDependenciesOverride },
    },
    null,
    2
  )
);
