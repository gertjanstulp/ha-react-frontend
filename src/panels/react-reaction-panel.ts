import {
    mdiDelete,
    mdiInformationOutline,
    mdiPlayCircleOutline,
} from "@mdi/js";
import "../../homeassistant-frontend/src/components/entity/ha-entity-toggle";
import "../../homeassistant-frontend/src/components/ha-button-related-filter-menu";
import "../../homeassistant-frontend/src/components/ha-fab";
import "../../homeassistant-frontend/src/components/ha-icon-button";
import "../../homeassistant-frontend/src/components/ha-svg-icon";
import "../../homeassistant-frontend/src/components/ha-icon-overflow-menu";
import "../../homeassistant-frontend/src/layouts/hass-tabs-subpage-data-table";

import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import { ReactionEntity } from "../data/entities";
import { computeStateName } from "../../homeassistant-frontend/src/common/entity/compute_state_name";
import { DataTableColumnContainer } from "../../homeassistant-frontend/src/components/data-table/ha-data-table";
import { UNAVAILABLE_STATES } from "../../homeassistant-frontend/src/data/entity";
import { fireEvent } from "../../homeassistant-frontend/src/common/dom/fire_event";
import { haStyle } from "../../homeassistant-frontend/src/resources/styles";
import { deleteReaction, React, reactNow, triggerReaction } from "../data/react"
import { formatDateTime } from "../tools/datetime";
import { showConfirmationDialog } from "../../homeassistant-frontend/src/dialogs/generic/show-dialog-box";

@customElement("react-reaction-panel")
class ReactReactionPanel extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public react!: React;
  
    @property() public route!: Route;
    
    @property({ type: Boolean }) public narrow!: boolean;
    
    @property({ type: Boolean }) public isWide!: boolean;

    @property() public reactions!: ReactionEntity[];
  
    @state() private _filteredReactions?: string[] | null;
  
    private _reactions = memoizeOne(
        (
            reactions: ReactionEntity[],
            filteredReactions?: string[] | null
        ) => {
            if (filteredReactions === null) {
                return [];
            }
            return (
                filteredReactions
                    ? reactions.filter((reaction) =>
                    filteredReactions!.includes(reaction.entity_id)
                    )
                    : reactions
            ).map((reaction) => ({
                ...reaction,
                name: computeStateName(reaction),
                when: reaction.state || undefined,
            }));
        }
    );
  
    private _columns = memoizeOne(
        (narrow: boolean, _locale): DataTableColumnContainer => {
            const columns: DataTableColumnContainer = {
                toggle: {
                    title: "",
                    label: this.react.localize("ui.panel.reaction.picker.headers.toggle"),
                    type: "icon",
                    template: (_toggle, reaction: any) =>
                    html`
                        <ha-entity-toggle
                        .hass=${this.hass}
                        .stateObj=${reaction}
                        ></ha-entity-toggle>
                    `,
                },
                name: {
                    title: this.react.localize("ui.panel.reaction.picker.headers.name"),
                    sortable: true,
                    filterable: true,
                    direction: "asc",
                    grows: true,
                    template: narrow
                        ? (name, reaction: any) =>
                            html`
                                ${name}
                                <div class="secondary">
                                ${this.react.localize("ui.panel.reaction.picker.headers.when")}:
                                ${reaction.attributes.when
                                    ? formatDateTime(
                                        new Date(reaction.attributes.when),
                                        this.hass.locale
                                    )
                                    : this.react.localize("ui.components.relative_time.never")}
                                </div>
                            `
                        : undefined,
                },
            };
            if (!narrow) {
                columns.when = {
                    sortable: true,
                    width: "20%",
                    title: this.react.localize("ui.panel.reaction.picker.headers.when"),
                    template: (when) => html`
                    ${when
                        ? formatDateTime(new Date(when), this.hass.locale)
                        : this.react.localize("ui.components.relative_time.never")}
                    `,
                };
                columns.trigger = {
                    label: this.react.localize("ui.panel.reaction.picker.headers.trigger"),
                    title: "",
                    width: "20%",
                    template: (_info, reaction: any) => html`
                        <mwc-button
                            .reaction=${reaction}
                            @click=${this._doTrigger}
                            .disabled=${UNAVAILABLE_STATES.includes(reaction.state)}
                        >
                            ${this.react.localize("ui.panel.reaction.picker.actions.trigger")}
                        </mwc-button>
                        <mwc-button
                            .reaction=${reaction}
                            @click=${this._doReactNow}
                            .disabled=${UNAVAILABLE_STATES.includes(reaction.state)}
                        >
                            ${this.react.localize("ui.panel.reaction.picker.actions.react_now")}
                        </mwc-button>
                    `,
                };
            }
            columns.actions = {
                title: "",
                label: this.react.localize("ui.panel.reaction.picker.headers.actions"),
                type: "overflow-menu",
                width: "7%",
                template: (_info, reaction: any) => html`
                    <ha-icon-overflow-menu
                    .hass=${this.hass}
                    .narrow=${this.narrow}
                    .items=${[
                        // Info Button
                        {
                            path: mdiInformationOutline,
                            label: this.react.localize("ui.panel.reaction.picker.actions.info"),
                            action: () => this._showInfo(reaction),
                        },
                        // Delete Button
                        {
                            path: mdiDelete,
                            label: this.react.localize("ui.panel.reaction.picker.actions.delete"),
                            action: () => this._delete(reaction),
                        },
                        // Trigger Button
                        {
                            path: mdiPlayCircleOutline,
                            label: this.react.localize("ui.panel.reaction.picker.actions.trigger"),
                            narrowOnly: true,
                            action: () => this._trigger(reaction),
                        },
                        // React Now Button
                        {
                            path: mdiPlayCircleOutline,
                            label: this.react.localize("ui.panel.reaction.picker.actions.react_now"),
                            narrowOnly: true,
                            action: () => this._trigger(reaction),
                        },
                    ]}
                    style="color: var(--secondary-text-color)"
                    >
                    </ha-icon-overflow-menu>
                `,
            };
            return columns;
        }
    );
  
    protected render(): TemplateResult {
      return html`
        <hass-tabs-subpage-data-table
            .hass=${this.hass}
            .narrow=${this.narrow}
            back-path="/react/entry"
            id="id"
            .route=${this.route}
            .tabs=${this.react.sections}
            .columns=${this._columns(this.narrow, this.hass.locale)}
            .data=${this._reactions(this.reactions, this._filteredReactions)}
            .noDataText=${this.react.localize(
                "ui.panel.reaction.picker.no_reactions"
            )}
        >
        </hass-tabs-subpage-data-table>
      `;
    }
  
    private _showInfo(reaction: ReactionEntity) {
        const entityId = reaction.entity_id;
        fireEvent(this, "hass-more-info", { entityId });
    }

    private _delete(reaction: ReactionEntity) {
        showConfirmationDialog(this, {
            title: this.react.localize("ui.dialogs.confirm_delete_reaction.title"),
            text: this.react.localize("ui.dialogs.confirm_delete_reaction.text"),
            confirmText: this.hass.localize("ui.common.remove"),
            dismissText: this.hass.localize("ui.common.cancel"),
            confirm: () => {
                deleteReaction(this.hass, reaction.entity_id);
            },
        });
    }

    private _doTrigger = (ev) => {
        this._trigger(ev.currentTarget.reaction);
    };
  
    private _trigger = (reaction: ReactionEntity) => {
        triggerReaction(this.hass, reaction.entity_id);
    };

    private _doReactNow = (ev) => {
        this._reactNow(ev.currentTarget.reaction);
    };
  
    private _reactNow = (reaction: ReactionEntity) => {
        reactNow(this.hass, reaction.entity_id);
    };
  
    static get styles(): CSSResultGroup {
        return haStyle;
    }
}
  
declare global {
    interface HTMLElementTagNameMap {
        "react-reaction-panel": ReactReactionPanel;
    }
}
  