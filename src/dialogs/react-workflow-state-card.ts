import { LitElement, html, TemplateResult, CSSResultGroup, css } from "lit";
import { customElement, property } from "lit/decorators";
import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import "../../homeassistant-frontend/src/components/entity/ha-entity-toggle";
import "../../homeassistant-frontend/src/components/entity/state-info";
import { HassEntity } from "home-assistant-js-websocket";

@customElement("react-workflow-state-card")
export class ReactWorkflowStateCard extends LitElement  {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public stateObj?: HassEntity;

    @property({ type: Boolean }) public inDialog = false;

    protected render(): TemplateResult | void {
        return html`
            <state-card-toggle
                .hass=${this.hass}
                .stateObj=${this.stateObj}
                .inDialog=${this.inDialog}>
            </state-card-toggle>
            `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "react-workflow-state-card": ReactWorkflowStateCard;
    }
}

