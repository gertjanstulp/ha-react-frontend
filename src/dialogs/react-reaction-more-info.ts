import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import { UNAVAILABLE_STATES } from "../../homeassistant-frontend/src/data/entity";
import { reactNow, triggerReaction } from "../data/react";
import { React } from "../data/react"

import "../../homeassistant-frontend/src/components/ha-attributes"
import "../../homeassistant-frontend/src/components/ha-relative-time";
import { ReactionEntity } from "../data/entities";

@customElement("react-reaction-more-info")
class ReactReactionMoreInfo extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;
    
    @property({ attribute: false }) public react!: React;

    @property() public stateObj?: ReactionEntity;

    protected render(): TemplateResult {
        if (!this.hass || !this.stateObj) {
            return html``;
        }

        return html`
            <hr />
            <div class="row">
                <div class="key">${this.react.localize("ui.dialogs.info.reaction.id")}</div>
                <div class="value">${this.stateObj.attributes.id}</div>
            </div>
            <div class="row">
                <div class="key">${this.react.localize("ui.dialogs.info.reaction.workflow_id")}</div>
                <div class="value">${this.stateObj.attributes.workflow_id}</div>
            </div>
            <div class="row">
                <div class="key">${this.react.localize("ui.dialogs.info.reaction.entity")}</div>
                <div class="value">${this.stateObj.attributes.entity}</div>
            </div>
            <div class="row">
                <div class="key">${this.react.localize("ui.dialogs.info.reaction.type")}</div>
                <div class="value">${this.stateObj.attributes.type}</div>
            </div>
            <div class="row">
                <div class="key">${this.react.localize("ui.dialogs.info.reaction.action")}</div>
                <div class="value">${this.stateObj.attributes.action}</div>
            </div>
            <div class="row">
                <div class="key">${this.react.localize("ui.dialogs.info.reaction.reset_workflow")}</div>
                <div class="value">${this.stateObj.attributes.reset_workflow}</div>
            </div>
            <div class="row">
                <div class="key">${this.react.localize("ui.dialogs.info.reaction.overwrite")}</div>
                <div class="value">${this.stateObj.attributes.overwrite}</div>
            </div>
            <div class="row">
                <div class="key">${this.react.localize("ui.dialogs.info.reaction.forward_action")}</div>
                <div class="value">${this.stateObj.attributes.forward_action}</div>
            </div>
            <div class="actions">
                <mwc-button
                    @click=${this._trigger}
                    .disabled=${UNAVAILABLE_STATES.includes(this.stateObj!.state)}>
                    ${this.react.localize("ui.dialogs.info.reaction.trigger")}
                </mwc-button>
                <mwc-button
                    @click=${this._reactNow}
                    .disabled=${UNAVAILABLE_STATES.includes(this.stateObj!.state)}>
                    ${this.react.localize("ui.dialogs.info.reaction.react_now")}
                </mwc-button>
            </div>
        `;
    }

    private _trigger() {
        triggerReaction(this.hass, this.stateObj!.entity_id);
    }

    private _reactNow() {
        reactNow(this.hass, this.stateObj!.entity_id);
    };
    
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
            .row {
                margin: 0;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
            }
              
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "react-reaction-more-info": ReactReactionMoreInfo;
    }
}
