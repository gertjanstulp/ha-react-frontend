import { PolymerElement } from "@polymer/polymer/polymer-element";
import dynamicContentUpdater from "../../homeassistant-frontend/src/common/dom/dynamic_content_updater";
import "./react-state-card-toggle";

class ReactStateCardContent extends PolymerElement {
    static get properties() {
      return {
        hass: Object,
        stateObj: Object,
        inDialog: {
          type: Boolean,
          value: false,
        },
      };
    }
  
    static get observers() {
      return ["inputChanged(hass, inDialog, stateObj)"];
    }
  
    inputChanged(hass, inDialog, stateObj) {
        if (!stateObj || !hass) return;
        let stateCard = "react-state-card-toggle";
        dynamicContentUpdater(this, stateCard.toUpperCase(), {
            hass: hass,
            stateObj: stateObj,
            inDialog: inDialog,
        });
    }
  }
  customElements.define("react-state-card-content", ReactStateCardContent);