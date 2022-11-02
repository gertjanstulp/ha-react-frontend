import {
    mdiDelete,
    mdiInformationOutline,
    mdiPlay,
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
import { customElement, property } from "lit/decorators";
import memoizeOne from "memoize-one";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import { Run } from "../data/entities";
// import { computeStateName } from "../../homeassistant-frontend/src/common/entity/compute_state_name";
import { DataTableColumnContainer } from "../../homeassistant-frontend/src/components/data-table/ha-data-table";
import { UNAVAILABLE_STATES } from "../../homeassistant-frontend/src/data/entity";
// import { fireEvent } from "../../homeassistant-frontend/src/common/dom/fire_event";
import { haStyle } from "../../homeassistant-frontend/src/resources/styles";
import { deleteRun, React, runNow } from "../data/react"
import { formatDateTime } from "../tools/datetime";
import { showConfirmationDialog } from "../../homeassistant-frontend/src/dialogs/generic/show-dialog-box";
import { SubscribeMixin } from "../../homeassistant-frontend/src/mixins/subscribe-mixin";
// import { UnsubscribeFunc } from "home-assistant-js-websocket";

@customElement("react-run-panel")
class ReactRunPanel extends SubscribeMixin(LitElement) {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public react!: React;
  
    @property() public route!: Route;
    
    @property({ type: Boolean }) public narrow!: boolean;
    
    @property({ type: Boolean }) public isWide!: boolean;
    
    @property() public runs!: Run[];

    private _columns = memoizeOne(
        (narrow: boolean, _locale): DataTableColumnContainer => {
            const columns: DataTableColumnContainer = {
                workflow_id: {
                    title: this.react.localize("ui.panel.run.picker.headers.workflow"),
                    sortable: true,
                    filterable: true,
                    direction: "asc",
                    grows: true,
                    template: narrow
                        ? (workflow_id, run: any) =>
                            html`
                                ${workflow_id}
                                <div class="secondary">
                                ${this.react.localize("ui.panel.run.picker.headers.when")}:
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
                columns.id = {
                    sortable: true,
                    width: "20%",
                    title: this.react.localize("ui.panel.run.picker.headers.id"),
                    template: (id) => html`${id}`,
                };
                columns.start_time = {
                    sortable: true,
                    width: "20%",
                    title: this.react.localize("ui.panel.run.picker.headers.started"),
                    template: (start_time) => html`
                        ${formatDateTime(new Date(start_time), this.hass.locale)}
                    `,
                };
                // columns.trigger = {
                //     // label: this.react.localize("ui.panel.run.picker.headers.trigger"),
                //     title: "",
                //     width: "20%",
                //     template: (_info, run: any) => html`
                //         <mwc-button
                //             .run=${run}
                //             @click=${this._doRunNow}
                //             .disabled=${UNAVAILABLE_STATES.includes(run.state)}
                //         >
                //             ${this.react.localize("ui.panel.run.picker.actions.run_now")}
                //         </mwc-button>
                //     `,
                // };
            }
            columns.actions = {
                title: "",
                width: this.narrow ? undefined : "10%",
                type: "overflow-menu",
                template: (_: string, run: any) =>
                  html`
                    <ha-icon-overflow-menu
                      .hass=${this.hass}
                      narrow
                      .items=${[
                        {
                            path: mdiInformationOutline,
                            label: this.react.localize("ui.panel.run.picker.actions.info"),
                            action: () => this._showInfo(run),
                        },
                        {
                            path: mdiPlay,
                            label: this.react.localize("ui.panel.run.picker.actions.run_now"),
                            action: () => this._runNow(run),
                        },
                        {
                            divider: true,
                        },
                        {
                            path: mdiDelete,
                            label: this.react.localize("ui.panel.run.picker.actions.delete"),
                            action: () => this._delete(run),
                            warning: true,
                        },
                      ]}
                    >
                    </ha-icon-overflow-menu>
                  `,
            };
            // columns.actions = {
            //     title: "",
            //     label: this.react.localize("ui.panel.run.picker.headers.actions"),
            //     type: "overflow-menu",
            //     width: "7%",
            //     template: (_info, run: any) => html`
            //         <ha-icon-overflow-menu
            //         .hass=${this.hass}
            //         .narrow=${this.narrow}
            //         .items=${[
            //             // Info Button
            //             {
            //                 path: mdiInformationOutline,
            //                 label: this.react.localize("ui.panel.run.picker.actions.info"),
            //                 action: () => this._showInfo(run),
            //             },
            //             // Delete Button
            //             {
            //                 path: mdiDelete,
            //                 label: this.react.localize("ui.panel.run.picker.actions.delete"),
            //                 action: () => this._delete(run),
            //             },
            //             // Run Now Button
            //             {
            //                 path: mdiPlayCircleOutline,
            //                 label: this.react.localize("ui.panel.run.picker.actions.run_now"),
            //                 narrowOnly: true,
            //                 action: () => this._runNow(run),
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
            back-path="/react/entry"
            id="id"
            .route=${this.route}
            .tabs=${this.react.sections}
            .columns=${this._columns(this.narrow, this.hass.locale)}
            .data=${this.runs}
            .noDataText=${this.react.localize(
                "ui.panel.run.picker.no_runs"
            )}
        >
        </hass-tabs-subpage-data-table>
      `;
    }
  
    private _showInfo(run: Run) {
        // const entityId = run.entity_id;
        // fireEvent(this, "hass-more-info", { entityId });
    }

    private _delete(run: Run) {
        showConfirmationDialog(this, {
            title: this.react.localize("ui.dialogs.confirm_delete_run.title"),
            text: this.react.localize("ui.dialogs.confirm_delete_run.text"),
            confirmText: this.hass.localize("ui.common.remove"),
            dismissText: this.hass.localize("ui.common.cancel"),
            confirm: () => {
                deleteRun(this.hass, run.id);
            },
        });
    }

    private _doRunNow = (ev) => {
        this._runNow(ev.currentTarget.run);
    };
  
    private _runNow = (run: Run) => {
        runNow(this.hass, run.id);
    };
  
    static get styles(): CSSResultGroup {
        return haStyle;
    }
}
  
declare global {
    interface HTMLElementTagNameMap {
        "react-run-panel": ReactRunPanel;
    }
}
  