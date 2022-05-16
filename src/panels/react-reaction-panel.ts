import {
    mdiHistory,
    mdiInformationOutline,
    mdiPencil,
    mdiPencilOff,
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
import { formatDateTime } from "../../homeassistant-frontend/src/common/datetime/format_date_time";
import { UNAVAILABLE_STATES } from "../../homeassistant-frontend/src/data/entity";
// import { reactSections } from "./react-main-panel";
import { fireEvent } from "../../homeassistant-frontend/src/common/dom/fire_event";
import { haStyle } from "../../homeassistant-frontend/src/resources/styles";
import { reactSections } from "./react-main-panel";
  
@customElement("react-reaction-panel")
class ReactReactionPanel extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;
  
    @property({ type: Boolean }) public isWide!: boolean;
  
    @property({ type: Boolean }) public narrow!: boolean;
  
    @property() public route!: Route;
  
    @property() public reactions!: ReactionEntity[];
  
    @property() private _activeFilters?: string[];
  
    @state() private _filteredReactions?: string[] | null;
  
    @state() private _filterValue?;
  
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
                last_triggered: reaction.attributes.last_triggered || undefined,
            }));
      }
    );
  
    private _columns = memoizeOne(
        (narrow: boolean, _locale): DataTableColumnContainer => {
            const columns: DataTableColumnContainer = {
                toggle: {
                    title: "",
                    label: this.hass.localize(
                    "ui.panel.config.reaction.picker.headers.toggle"
                    ),
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
                    title: this.hass.localize(
                    "ui.panel.config.reaction.picker.headers.name"
                    ),
                    sortable: true,
                    filterable: true,
                    direction: "asc",
                    grows: true,
                    template: narrow
                    ? (name, reaction: any) =>
                        html`
                            ${name}
                            <div class="secondary">
                            ${this.hass.localize("ui.card.reaction.last_triggered")}:
                            ${reaction.attributes.last_triggered
                                ? formatDateTime(
                                    new Date(reaction.attributes.last_triggered),
                                    this.hass.locale
                                )
                                : this.hass.localize("ui.components.relative_time.never")}
                            </div>
                        `
                    : undefined,
                },
            };
            // if (!narrow) {
            //     columns.last_triggered = {
            //         sortable: true,
            //         width: "20%",
            //         title: this.hass.localize("ui.card.reaction.last_triggered"),
            //         template: (last_triggered) => html`
            //         ${last_triggered
            //             ? formatDateTime(new Date(last_triggered), this.hass.locale)
            //             : this.hass.localize("ui.components.relative_time.never")}
            //         `,
            //     };
            //     columns.trigger = {
            //         label: this.hass.localize(
            //         "ui.panel.config.reaction.picker.headers.trigger"
            //         ),
            //         title: html`
            //         <mwc-button style="visibility: hidden">
            //             ${this.hass.localize("ui.card.reaction.trigger")}
            //         </mwc-button>
            //         `,
            //         width: "20%",
            //         template: (_info, reaction: any) => html`
            //         <mwc-button
            //             .reaction=${reaction}
            //             @click=${this._triggerRunActions}
            //             .disabled=${UNAVAILABLE_STATES.includes(reaction.state)}
            //         >
            //             ${this.hass.localize("ui.card.reaction.trigger")}
            //         </mwc-button>
            //         `,
            //     };
            // }
            // columns.actions = {
            //     title: "",
            //     label: this.hass.localize(
            //         "ui.panel.config.reaction.picker.headers.actions"
            //     ),
            //     type: "overflow-menu",
            //     template: (_info, reaction: any) => html`
            //         <ha-icon-overflow-menu
            //         .hass=${this.hass}
            //         .narrow=${this.narrow}
            //         .items=${[
            //             // Info Button
            //             {
            //                 path: mdiInformationOutline,
            //                 label: this.hass.localize(
            //                     "ui.panel.config.reaction.picker.show_info_reaction"
            //                 ),
            //                 action: () => this._showInfo(reaction),
            //             },
            //             // Trigger Button
            //             {
            //                 path: mdiPlayCircleOutline,
            //                 label: this.hass.localize("ui.card.reaction.trigger"),
            //                 narrowOnly: true,
            //                 action: () => this._runActions(reaction),
            //             },
            //             // Trace Button
            //             {
            //                 path: mdiHistory,
            //                 disabled: !reaction.attributes.id,
            //                 label: this.hass.localize(
            //                     "ui.panel.config.reaction.picker.dev_reaction"
            //                 ),
            //                 tooltip: !reaction.attributes.id
            //                     ? this.hass.localize(
            //                         "ui.panel.config.reaction.picker.dev_only_editable"
            //                     )
            //                     : "",
            //                 action: () => {
            //                     if (reaction.attributes.id) {
            //                         // navigate(
            //                         //     `/config/reaction/trace/${reaction.attributes.id}`
            //                         // );
            //                     }
            //                 },
            //             },
            //             // Edit Button
            //             {
            //                 path: reaction.attributes.id ? mdiPencil : mdiPencilOff,
            //                 disabled: !reaction.attributes.id,
            //                 label: this.hass.localize(
            //                     "ui.panel.config.reaction.picker.edit_reaction"
            //                 ),
            //                 tooltip: !reaction.attributes.id
            //                     ? this.hass.localize(
            //                         "ui.panel.config.reaction.picker.dev_only_editable"
            //                     )
            //                     : "",
            //                 action: () => {
            //                     if (reaction.attributes.id) {
            //                         // navigate(
            //                         //     `/config/reaction/edit/${reaction.attributes.id}`
            //                         // );
            //                     }
            //                 },
            //             },
            //         ]}
            //         style="color: var(--secondary-text-color)"
            //         >
            //         </ha-icon-overflow-menu>
            //     `,
            // };
            return columns;
        }
    );
  
    protected render(): TemplateResult {
      return html`
        <hass-tabs-subpage-data-table
            .hass=${this.hass}
            .narrow=${this.narrow}
            back-path="/react"
            id="id"
            .route=${this.route}
            .tabs=${reactSections.react}
            .activeFilters=${this._activeFilters}
            .columns=${this._columns(this.narrow, this.hass.locale)}
            .data=${this._reactions(this.reactions, this._filteredReactions)}
            .noDataText=${this.hass.localize(
                "ui.panel.config.reaction.picker.no_reactions"
            )}
            @clear-filter=${this._clearFilter}
            hasFab
        >
            <ha-button-related-filter-menu
                slot="filter-menu"
                corner="BOTTOM_START"
                .narrow=${this.narrow}
                .hass=${this.hass}
                .value=${this._filterValue}
                exclude-domains='["reaction"]'
                @related-changed=${this._relatedFilterChanged}
            >
            </ha-button-related-filter-menu>
        </hass-tabs-subpage-data-table>
      `;
    }
  
    private _relatedFilterChanged(ev: CustomEvent) {
        this._filterValue = ev.detail.value;
        if (!this._filterValue) {
            this._clearFilter();
            return;
        }
        this._activeFilters = [ev.detail.filter];
        this._filteredReactions = ev.detail.items.reaction || null;
    }
  
    private _clearFilter() {
        this._filteredReactions = undefined;
        this._activeFilters = undefined;
        this._filterValue = undefined;
    }
  
    private _showInfo(reaction: ReactionEntity) {
        const entityId = reaction.entity_id;
        fireEvent(this, "hass-more-info", { entityId });
    }
  
    private _triggerRunActions = (ev) => {
        this._runActions(ev.currentTarget.reaction);
    };
  
    private _runActions = (reaction: ReactionEntity) => {
        // triggerReactionActions(this.hass, reaction.entity_id);
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
  