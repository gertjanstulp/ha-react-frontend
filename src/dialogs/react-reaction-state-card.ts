import { LitElement, html, TemplateResult, CSSResultGroup, css } from "lit";
import { customElement, property } from "lit/decorators";
import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import "../../homeassistant-frontend/src/components/entity/ha-entity-toggle";
import "../../homeassistant-frontend/src/components/entity/state-info";
import { HassEntity } from "home-assistant-js-websocket";
import { computeStateName } from "../../homeassistant-frontend/src/common/entity/compute_state_name";
import "../../homeassistant-frontend/src/panels/lovelace/components/hui-timestamp-display"
import "@polymer/iron-flex-layout/iron-flex-layout-classes";
import "../../homeassistant-frontend/src/state-summary/state-card-display"

@customElement("react-reaction-state-card")
export class ReactReactionStateCard extends LitElement  {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public stateObj?: HassEntity;

    @property({ type: Boolean }) public inDialog = false;

    protected render(): TemplateResult | void {
        if (!this.hass || !this.stateObj) {
            return html``;
        }
        
        return html`
            <state-card-display
                .hass=${this.hass}
                .stateObj=${this.stateObj}
                .inDialog=${this.inDialog}>
            </state-card-display>
            `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "react-reaction-state-card": ReactReactionStateCard;
    }
}

