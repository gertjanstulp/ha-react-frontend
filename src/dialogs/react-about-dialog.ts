import { React } from "../data/react";
import { showAlertDialog } from "../../homeassistant-frontend/src/dialogs/generic/show-dialog-box";

export const showDialogAbout = async (element: any, react: React) =>
  showAlertDialog(element, {
    title: "React",
    confirmText: react.localize("common.close"),
    text: "",
  });
