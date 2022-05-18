import { HassEntity } from "home-assistant-js-websocket";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import "../../homeassistant-frontend/src/components/ha-attributes"

@customElement("react-workflow-more-info")
class ReactWorkflowMoreInfo extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property() public stateObj?: HassEntity;

    protected render(): TemplateResult {
        if (!this.hass || !this.stateObj) {
            return html``;
        }

        return html`<ha-attributes
            .hass=${this.hass}
            .stateObj=${this.stateObj}
        ></ha-attributes>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "react-workflow-more-info": ReactWorkflowMoreInfo;
    }
}
