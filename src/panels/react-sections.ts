import memoizeOne from "memoize-one";
import { mdiExclamation, mdiSitemap, mdiSitemapOutline, mdiSwapHorizontalBold } from "@mdi/js";

import { Route } from "../../homeassistant-frontend/src/types";

import { Configuration } from "../data/common";
import { localize } from "../localize/localize";

export const sections = (language: string) => ({
  subsections: {
    react: [
      {
        // categories: ["integration"],
        iconPath: mdiSitemapOutline,
        id: "workflow",
        // iconColor: "rgb(13, 71, 161)",
        iconColor: "#3c8dc3",
        description: localize(language, "sections.workflows.description"),
        name: localize(language, "sections.workflows.title"),
        path: "/react/workflow",
        core: true,
      },
      {
        // categories: ["plugin", "theme"],
        iconPath: mdiSwapHorizontalBold,
        id: "run",
        // iconColor: "rgb(177, 52, 92)",
        iconColor: "#B1345C",
        description: localize(language, "sections.runs.description"),
        name: localize(language, "sections.runs.title"),
        path: "/react/run",
        core: true,
      },
      {
        // categories: ["plugin", "theme"],
        iconPath: mdiExclamation,
        id: "reaction",
        // iconColor: "rgb(177, 52, 92)",
        iconColor: "#E48629",
        description: localize(language, "sections.reactions.description"),
        name: localize(language, "sections.reactions.title"),
        path: "/react/reaction",
        core: true,
      },
    ],
  },
});

export const sectionsEnabled = memoizeOne((language: string, config: Configuration) =>
  sections(language).subsections.react.filter((section) => {
    // const categories = section.categories;
    return (
      // categories?.filter((category) => config.dev || config?.categories?.includes(category))
      //   .length !== 0
      true
    );
  })
);

export const activePanel = (language: string, route: Route) => {
  const section = route.path.replace("/", "");
  return sections(language).subsections.react.find((panel) => panel.id === section);
};
