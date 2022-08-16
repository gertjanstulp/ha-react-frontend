import "@polymer/iron-flex-layout/iron-flex-layout-classes";
import { html } from "@polymer/polymer/lib/utils/html-tag";
/* eslint-plugin-disable lit */
import { PolymerElement } from "@polymer/polymer/polymer-element";
import "../../homeassistant-frontend/src/components/entity/ha-entity-toggle";
import "../../homeassistant-frontend/src/components/entity/state-info";

class ReactStateCardToggle extends PolymerElement {
    static get template() {
        return html`
            <style>
                ha-entity-toggle {
                    margin: -4px -16px -4px 0;
                    padding: 4px 16px;
                }
                .layout.horizontal,
                .layout.vertical {
                    display: -ms-flexbox;
                    display: -webkit-flex;
                    display: flex;
                }
                .layout.horizontal {
                    -ms-flex-direction: row;
                    -webkit-flex-direction: row;
                    flex-direction: row;
                }
                .layout.justified {
                    -ms-flex-pack: justify;
                    -webkit-justify-content: space-between;
                    justify-content: space-between;
                }
            </style>

            <div class="horizontal justified layout">
                ${this.stateInfoTemplate}
                <ha-entity-toggle
                    state-obj="[[stateObj]]"
                    hass="[[hass]]"
                ></ha-entity-toggle>
            </div>
        `;
    }

    static get stateInfoTemplate() {
        return html`
            <state-info
                hass="[[hass]]"
                state-obj="[[stateObj]]"
                in-dialog="[[inDialog]]"
            ></state-info>
        `;
    }

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
}
customElements.define("react-state-card-toggle", ReactStateCardToggle);
