import { mdiClose, mdiCog } from "@mdi/js";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators";
import { cache } from "lit/directives/cache";
import { isComponentLoaded } from "../../homeassistant-frontend/src/common/config/is_component_loaded";
import { fireEvent } from "../../homeassistant-frontend/src/common/dom/fire_event";
import { computeStateName } from "../../homeassistant-frontend/src/common/entity/compute_state_name";
import { removeEntityRegistryEntry } from "../../homeassistant-frontend/src/data/entity_registry";
import { showConfirmationDialog } from "../../homeassistant-frontend/src/dialogs/generic/show-dialog-box";
import { replaceDialog } from "../../homeassistant-frontend/src/dialogs/make-dialog-manager";
// import { showEntityEditorDialog } from "../../homeassistant-frontend/src/panels/config/entities/show-dialog-entity-editor";
import { haStyleDialog } from "../../homeassistant-frontend/src/resources/styles";
import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import { React } from "../data/react"

import "@material/mwc-tab";
import "@material/mwc-tab-bar";

import "./react-workflow-more-info"
import "./react-workflow-state-card"
import "./react-reaction-more-info"
import "./react-reaction-state-card"

import "../../homeassistant-frontend/src/components/ha-dialog"
import "../../homeassistant-frontend/src/components/ha-header-bar";
import "../../homeassistant-frontend/src/components/ha-icon-button";
import "../../homeassistant-frontend/src/dialogs/more-info/ha-more-info-history";
import "../../homeassistant-frontend/src/dialogs/more-info/ha-more-info-logbook";
import "../../homeassistant-frontend/src/state-summary/state-card-toggle"
import { computeDomain } from "../../homeassistant-frontend/src/common/entity/compute_domain";

export interface MoreInfoDialogParams {
    entityId: string | null;
    react: React;
}

@customElement("react-details-dialog")
export class ReactDetailsDialog extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public react!: React;

    @property({ type: Boolean, reflect: true }) public large = false;

    @state() private _entityId?: string | null;

    @state() private _entityType?: string | null;

    @state() private _domain?: string | null;

    @state() private _currTabIndex = 0;

    public showDialog(params: MoreInfoDialogParams) {
        this._entityId = params.entityId;
        this.react = params.react
        if (!this._entityId) {
            this.closeDialog();
            return;
        }
        this._domain = computeDomain(this._entityId);
        if (this._domain === "react") {
            this._entityType = "workflow"
        } else {
            this._entityType = "reaction"
        }
        this.large = false;
    }

    public closeDialog() {
        this._entityId = undefined;
        this._currTabIndex = 0;
        fireEvent(this, "dialog-closed", { dialog: this.localName });
    }

    protected render() {
        if (!this._entityId) {
            return html``;
        }
        const entityId = this._entityId;
        const stateObj = this.hass.states[entityId];

        if (!stateObj) {
            return html``;
        }

        const domain = "react";
        const name = computeStateName(stateObj);
        
        return html`
            <ha-dialog
                open
                @closed=${this.closeDialog}
                .heading=${name}
                hideActions
                data-domain=${domain}
            >
                <div slot="heading" class="heading">
                    <ha-header-bar>
                        <ha-icon-button
                            slot="navigationIcon"
                            dialogAction="cancel"
                            .label=${this.hass.localize("ui.dialogs.more_info_control.dismiss")}
                            .path=${mdiClose}
                        ></ha-icon-button>
                        <div
                            slot="title"
                            class="main-title"
                            .title=${name}
                            @click=${this._enlarge}
                        >
                            ${name}
                        </div>
                        ${this.hass.user!.is_admin
                            ? html`
                                <ha-icon-button
                                    slot="actionItems"
                                    .label=${this.hass.localize("ui.dialogs.more_info_control.settings")}
                                    .path=${mdiCog}
                                    @click=${this._gotoSettings}
                                ></ha-icon-button>
                                `
                            : ""}
                    </ha-header-bar>
                    <mwc-tab-bar
                        .activeIndex=${this._currTabIndex}
                        @MDCTabBar:activated=${this._handleTabChanged}
                    >
                        <mwc-tab
                            .label=${this.hass.localize("ui.dialogs.more_info_control.details")}
                            dialogInitialFocus
                        ></mwc-tab>
                        <mwc-tab
                            .label=${this.hass.localize("ui.dialogs.more_info_control.history")}
                        ></mwc-tab>
                    </mwc-tab-bar>
                </div>

                <div class="content" tabindex="-1" dialogInitialFocus>
                    ${cache(
                        this._currTabIndex === 0
                        ? html`
                            ${this._entityType === "reaction"
                                ? html`
                                    <state-card-display
                                        inDialog
                                        .stateObj=${stateObj}
                                        .hass=${this.hass}>
                                    </state-card-display>
                                    <react-reaction-more-info
                                        .stateObj=${stateObj}
                                        .hass=${this.hass}
                                        .react=${this.react}>
                                    </react-reaction-more-info>
                                    `
                                : html`
                                    <react-workflow-state-card
                                        inDialog
                                        .stateObj=${stateObj}
                                        .hass=${this.hass}>
                                    </react-workflow-state-card>
                                    <react-workflow-more-info
                                        .stateObj=${stateObj}
                                        .hass=${this.hass}
                                        .react=${this.react}>
                                    </react-workflow-more-info>
                                    `
                            }
                            ${stateObj.attributes.restored
                                ? html`
                                    
                                    `
                                : ""
                            }
                            `
                        : html`
                            ${this._computeShowHistoryComponent()
                                ? html`
                                    <ha-more-info-history
                                        .hass=${this.hass}
                                        .entityId=${this._entityId}>
                                    </ha-more-info-history>`
                                : ""
                            }
                            ${this._computeShowLogBookComponent(entityId) 
                                ? html`
                                    <ha-more-info-logbook
                                        .hass=${this.hass}
                                        .entityId=${this._entityId}
                                    ></ha-more-info-logbook>`
                                : ""
                            }
                            `
                    )}
                </div>
            </ha-dialog>
        `;
    }

    private _enlarge() {
        this.large = !this.large;
    }

    private _computeShowHistoryComponent() {
        return (
            isComponentLoaded(this.hass, "history")
        );
    }

    private _computeShowLogBookComponent(entityId): boolean {
        if (!isComponentLoaded(this.hass, "logbook")) {
            return false;
        }

        const stateObj = this.hass.states[entityId];
        if (!stateObj) {
            return false;
        }

        return true;
    }

    private _removeEntity() {
        const entityId = this._entityId!;
        showConfirmationDialog(this, {
            title: "ui.dialogs.more_info_control.restored.confirm_remove_title",
            text: "ui.dialogs.more_info_control.restored.confirm_remove_text",
            confirmText: this.hass.localize("ui.common.remove"),
            dismissText: this.hass.localize("ui.common.cancel"),
            confirm: () => {
                removeEntityRegistryEntry(this.hass, entityId);
            },
        });
    }

    private _gotoSettings() {
        // replaceDialog(this);
        // showEntityEditorDialog(this, {
        //     entity_id: this._entityId!,
        // });
        // this.closeDialog();
    }

    
    private _handleTabChanged(ev: CustomEvent): void {
        const newTab = ev.detail.index;
        if (newTab === this._currTabIndex) {
            return;
        }

        this._currTabIndex = ev.detail.index;
    }

    static get styles() {
        return [
            haStyleDialog,
            css`
                ha-dialog {
                    --dialog-surface-position: static;
                    --dialog-content-position: static;
                }

                ha-header-bar {
                    --mdc-theme-on-primary: var(--primary-text-color);
                    --mdc-theme-primary: var(--mdc-theme-surface);
                    flex-shrink: 0;
                    display: block;
                }
                .content {
                    outline: none;
                }
                @media all and (max-width: 450px), all and (max-height: 500px) {
                    ha-header-bar {
                        --mdc-theme-primary: var(--app-header-background-color);
                        --mdc-theme-on-primary: var(--app-header-text-color, white);
                        border-bottom: none;
                    }
                }

                .heading {
                    border-bottom: 1px solid
                    var(--mdc-dialog-scroll-divider-color, rgba(0, 0, 0, 0.12));
                }

                @media all and (min-width: 451px) and (min-height: 501px) {
                    ha-dialog {
                        --mdc-dialog-max-width: 90vw;
                    }

                    .content {
                        width: 352px;
                    }

                    ha-header-bar {
                        width: 400px;
                    }

                    .main-title {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        cursor: default;
                    }

                    :host([large]) .content {
                        width: calc(90vw - 48px);
                    }

                    :host([large]) ha-dialog[data-domain="camera"] .content,
                    :host([large]) ha-header-bar {
                        width: 90vw;
                    }
                }

                ha-more-info-history,
                ha-more-info-logbook:not(:last-child) {
                    display: block;
                    margin-bottom: 16px;
                }
            `,
        ];
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "react-details-dialog": ReactDetailsDialog;
    }
}
