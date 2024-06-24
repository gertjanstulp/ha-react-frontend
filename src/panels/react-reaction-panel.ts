import {
    mdiDelete,
    mdiInformationOutline,
    mdiPlay,
} from "@mdi/js";
import "../../homeassistant-frontend/src/components/entity/ha-entity-toggle";
// import "../../homeassistant-frontend/src/components/ha-button-related-filter-menu";
import "../../homeassistant-frontend/src/components/ha-fab";
import "../../homeassistant-frontend/src/components/ha-icon-button";
import "../../homeassistant-frontend/src/components/ha-svg-icon";
import "../../homeassistant-frontend/src/components/ha-icon-overflow-menu";
import "../../homeassistant-frontend/src/layouts/hass-tabs-subpage-data-table";

import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import memoizeOne from "memoize-one";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
// import { computeStateName } from "../../homeassistant-frontend/src/common/entity/compute_state_name";
import { DataTableColumnContainer } from "../../homeassistant-frontend/src/components/data-table/ha-data-table";
import { haStyle } from "../../homeassistant-frontend/src/resources/styles";
import { deleteReaction, React, reactNow } from "../data/react"
import { formatDateTime } from "../tools/datetime";
import { showConfirmationDialog } from "../../homeassistant-frontend/src/dialogs/generic/show-dialog-box";
import { SubscribeMixin } from "../../homeassistant-frontend/src/mixins/subscribe-mixin";
import { Reaction } from "../data/entities";
// import { UnsubscribeFunc } from "home-assistant-js-websocket";

@customElement("react-reaction-panel")
class ReactReactionPanel extends SubscribeMixin(LitElement) {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public react!: React;
  
    @property() public route!: Route;
    
    @property({ type: Boolean }) public narrow!: boolean;
    
    @property({ type: Boolean }) public isWide!: boolean;

    @property() public reactions!: Reaction[];
  
    private _columns = memoizeOne(
        (narrow: boolean, _locale): DataTableColumnContainer => {
            const columns: DataTableColumnContainer = {
                workflow_id: {
                    title: this.react.localize("ui.panel.reaction.picker.headers.workflow"),
                    sortable: true,
                    filterable: true,
                    direction: "asc",
                    grows: true,
                    template: narrow
                        ? (workflow_id, run: any) =>
                            html`
                                ${workflow_id}
                                <div class="secondary">
                                ${this.react.localize("ui.panel.reaction.picker.headers.when")}:
                                ${run.attributes.when
                                    ? formatDateTime(
                                        new Date(run.attributes.when),
                                        this.hass.locale
                                    )
                                    : this.react.localize("ui.components.relative_time.never")}
                                </div>
                            `
                        : undefined,
                },
            };
            if (!narrow) {
                columns.run_id = {
                    sortable: true,
                    width: "10%",
                    title: this.react.localize("ui.panel.reaction.picker.headers.run"),
                    template: (run_id) => html`${run_id}`,
                };
                columns.reactor_id = {
                    sortable: true,
                    width: "20%",
                    title: this.react.localize("ui.panel.reaction.picker.headers.reactor"),
                    template: (reactor_id) => html`${reactor_id}`,
                };
                columns.wait_type = {
                    sortable: true,
                    width: "10%",
                    title: this.react.localize("ui.panel.reaction.picker.headers.wait_type"),
                    template: (wait_type) => 
                        wait_type == 1 || wait_type == 2 || wait_type == 3 ? 
                            html`${this.react.localize("ui.panel.reaction.picker.wait_types." + wait_type)}` :
                        ''
                };
                columns.when = {
                    sortable: true,
                    width: "20%",
                    title: this.react.localize("ui.panel.reaction.picker.headers.when"),
                    template: (when) => 
                        when 
                            ? html`${formatDateTime(new Date(when), this.hass.locale)}`
                            : '',
                };
            }
            columns.actions = {
                title: "",
                width: this.narrow ? undefined : "10%",
                type: "overflow-menu",
                template: (_: string, reaction: any) =>
                  html`
                    <ha-icon-overflow-menu
                      .hass=${this.hass}
                      narrow
                      .items=${[
                        {
                            path: mdiInformationOutline,
                            label: this.react.localize("ui.panel.reaction.picker.actions.info"),
                            action: () => this._showInfo(reaction),
                        },
                        {
                            path: mdiPlay,
                            label: this.react.localize("ui.panel.reaction.picker.actions.react_now"),
                            action: () => this._reactNow(reaction),
                        },
                        {
                            divider: true,
                        },
                        {
                            path: mdiDelete,
                            label: this.react.localize("ui.panel.reaction.picker.actions.delete"),
                            action: () => this._delete(reaction),
                            warning: true,
                        },
                      ]}
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
            .data=${this.reactions}
            .noDataText=${this.react.localize(
                "ui.panel.reaction.picker.no_reactions"
            )}
        >
        </hass-tabs-subpage-data-table>
      `;
    }
  
    private _showInfo(reaction: Reaction) {
        // const entityId = reaction.entityId;
        // fireEvent(this, "hass-more-info", { entityId });
    }

    private _delete(reaction: Reaction) {
        showConfirmationDialog(this, {
            title: this.react.localize("ui.dialogs.confirm_delete_reaction.title"),
            text: this.react.localize("ui.dialogs.confirm_delete_reaction.text"),
            confirmText: this.hass.localize("ui.common.remove"),
            dismissText: this.hass.localize("ui.common.cancel"),
            confirm: () => {
                deleteReaction(this.hass, reaction.id);
            },
        });
    }
    
    private _doReactNow = (ev) => {
        this._reactNow(ev.currentTarget.reaction);
    };
  
    private _reactNow = (reaction: Reaction) => {
        reactNow(this.hass, reaction.id);
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
  