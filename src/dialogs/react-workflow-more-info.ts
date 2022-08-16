import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import { UNAVAILABLE_STATES } from "../../homeassistant-frontend/src/data/entity";
import { triggerWorkflow } from "../data/react";
import { React } from "../data/react"

import "../../homeassistant-frontend/src/components/ha-attributes"
import "../../homeassistant-frontend/src/components/ha-relative-time";

@customElement("react-workflow-more-info")
class ReactWorkflowMoreInfo extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;
    
    @property({ attribute: false }) public react!: React;

    @property() public stateObj?: HassEntity;

    protected render(): TemplateResult {
        if (!this.hass || !this.stateObj) {
            return html``;
        }

        return html`
            <hr />
            <div class="flex">
                <div>${this.react.localize("ui.dialogs.info.workflow.last_triggered")}:</div>
                <ha-relative-time
                    .hass=${this.hass}
                    .datetime=${this.stateObj.attributes.last_triggered}
                    capitalize
                ></ha-relative-time>
            </div>
            <div class="actions">
                <mwc-button
                    @click=${this._trigger}
                    .disabled=${UNAVAILABLE_STATES.includes(this.stateObj!.state)}
                >
                    ${this.react.localize("ui.dialogs.info.workflow.trigger")}
                </mwc-button>
            </div>
        `;
    }

    private _trigger() {
        triggerWorkflow(this.hass, this.stateObj!.entity_id);
    }

    static get styles(): CSSResultGroup {
        return css`
            .flex {
                display: flex;
                justify-content: space-between;
            }
            .attributes {
                margin: 8px 0;
                
            }
            .actions {
                margin: 8px 0;
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
            }
            hr {
                border-color: var(--divider-color);
                border-bottom: none;
                margin: 16px 0;
            }
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "react-workflow-more-info": ReactWorkflowMoreInfo;
    }
}
