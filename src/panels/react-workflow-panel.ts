import {
    mdiCancel,
    mdiInformationOutline,
    mdiPlay,
    mdiPlayCircleOutline,
    mdiStopCircleOutline,
    mdiTransitConnection,
} from "@mdi/js";
import "../../homeassistant-frontend/src/components/ha-button-related-filter-menu";
import "../../homeassistant-frontend/src/components/ha-chip";
import "../../homeassistant-frontend/src/components/ha-fab";
import "../../homeassistant-frontend/src/components/ha-icon-button";
import "../../homeassistant-frontend/src/components/ha-icon-overflow-menu";
import "../../homeassistant-frontend/src/components/ha-svg-icon";
import "../../homeassistant-frontend/src/layouts/hass-tabs-subpage-data-table";

import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import { WorkflowEntity } from "../data/entities";
import { computeStateName } from "../../homeassistant-frontend/src/common/entity/compute_state_name";
import { DataTableColumnContainer } from "../../homeassistant-frontend/src/components/data-table/ha-data-table";
import { fireEvent } from "../../homeassistant-frontend/src/common/dom/fire_event";
import { haStyle } from "../../homeassistant-frontend/src/resources/styles";
import { navigate } from "../../homeassistant-frontend/src/common/navigate";
import {React, triggerWorkflow} from "../data/react"
import { formatDateTime } from "../tools/datetime";

@customElement("react-workflow-panel")
class ReactWorkflowPanel extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public react!: React;
  
    @property() public route!: Route;
    
    @property({ type: Boolean }) public narrow!: boolean;
    
    @property({ type: Boolean }) public isWide!: boolean;

    @property() public workflows!: WorkflowEntity[];
  
    @state() private _filteredWorkflows?: string[] | null;
  
    private _workflows = memoizeOne(
        (
            workflows: WorkflowEntity[],
            filteredWorkflows?: string[] | null
        ) => {
            if (filteredWorkflows === null) {
                return [];
            }
            return (
                filteredWorkflows
                    ? workflows.filter((workflow) =>
                        filteredWorkflows!.includes(workflow.entity_id)
                    )
                    : workflows
            ).map((workflow) => ({
                ...workflow,
                name: computeStateName(workflow),
                last_triggered: workflow.attributes.last_triggered || undefined,
            }));
        }
    );
  
    private _columns = memoizeOne(
        (narrow: boolean, _locale): DataTableColumnContainer => {
            const columns: DataTableColumnContainer = {
                icon: {
                    title: "",
                    label: this.react.localize("ui.panel.workflow.picker.headers.state"),
                    type: "icon",
                    template: (_, workflow) =>
                        html`<ha-state-icon .state=${workflow}></ha-state-icon>`,
                },
                name: {
                    title: this.react.localize("ui.panel.workflow.picker.headers.name"),
                    main: true,
                    sortable: true,
                    filterable: true,
                    direction: "asc",
                    grows: true,
                    template: narrow
                    ? (name, workflow: any) =>
                        html`
                            ${name}
                            <div class="secondary">
                            ${this.react.localize("ui.panel.workflow.picker.headers.last_triggered")}:
                            ${workflow.attributes.last_triggered
                                ? formatDateTime(new Date(workflow.attributes.last_triggered), this.hass.locale)
                                : this.react.localize("ui.components.relative_time.never")}
                            </div>
                        `
                    : undefined,
                },
            };
            if (!narrow) {
                // Last triggered column
                columns.last_triggered = {
                    sortable: true,
                    width: "20%",
                    title: this.react.localize("ui.panel.workflow.picker.headers.last_triggered"),
                    template: (last_triggered) => html`
                    ${last_triggered
                        ? formatDateTime(new Date(last_triggered), this.hass.locale)
                        : this.react.localize("ui.components.relative_time.never")}
                    `,
                };
            }

            columns.disabled = this.narrow
                ? {
                    title: "",
                    template: (_, workflow: WorkflowEntity) =>
                        workflow.state == "off"
                            ? html`
                                <paper-tooltip animation-delay="0" position="left">
                                    ${this.react.localize("ui.panel.workflow.picker.badges.disabled")}
                                </paper-tooltip>
                                <ha-svg-icon
                                    .path=${mdiCancel}
                                    style="color: var(--secondary-text-color)"
                                ></ha-svg-icon>`
                            : "",
                }
                : {
                    width: "20%",
                    title: "",
                    template: (_, workflow: WorkflowEntity) =>
                        workflow.state == "off"
                            ? html`
                                <ha-chip>
                                    ${this.react.localize("ui.panel.workflow.picker.badges.disabled")}
                                </ha-chip>`
                            : "",
                };

            columns.actions = {
                title: "",
                width: this.narrow ? undefined : "10%",
                type: "overflow-menu",
                template: (_: string, workflow: any) =>
                    html`
                        <ha-icon-overflow-menu
                        .hass=${this.hass}
                        narrow
                        .items=${[
                            // Info Button
                            {
                                path: mdiInformationOutline,
                                label: this.react.localize("ui.panel.workflow.picker.actions.info"),
                                action: () => this._showInfo(workflow),
                            },
                            // Trigger Button
                            {
                                path: mdiPlay,
                                label: this.react.localize("ui.panel.workflow.picker.actions.trigger"),
                                narrowOnly: true,
                                action: () => this._trigger(workflow),
                            },
                            // Trace Button
                            {
                                path: mdiTransitConnection,
                                disabled: !workflow.attributes.workflow_id,
                                label: this.react.localize("ui.panel.workflow.picker.actions.trace"),
                                action: () => {
                                    if (workflow.attributes.workflow_id) {
                                        navigate(`/react/workflow/trace/${workflow.attributes.workflow_id}`);
                                    }
                                },
                            },
                            {
                                divider: true,
                            },
                            // Enable/disable button
                            {
                                path:
                                    workflow.state === "off"
                                        ? mdiPlayCircleOutline
                                        : mdiStopCircleOutline,
                                label:
                                    workflow.state === "off"
                                        ? this.react.localize("ui.panel.workflow.picker.actions.enable")
                                        : this.react.localize("ui.panel.workflow.picker.actions.disable"),
                                action: () => this._toggle(workflow),
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
                id="entity_id"
                .route=${this.route}
                .tabs=${this.react.sections}
                .columns=${this._columns(this.narrow, this.hass.locale)}
                .data=${this._workflows(this.workflows, this._filteredWorkflows)}
                .noDataText=${this.react.localize("ui.panel.workflow.picker.no_workflows")}
            >
            </hass-tabs-subpage-data-table>
        `;
    }
  
    private _showInfo(workflow: WorkflowEntity) {
        const entityId = workflow.entity_id;
        fireEvent(this, "hass-more-info", { entityId });
    }

    private _trigger = (workflow: WorkflowEntity) => {
        triggerWorkflow(this.hass, workflow.entity_id);
    };
  
    private async _toggle(workflow): Promise<void> {
        const service = workflow.state === "off" ? "turn_on" : "turn_off";
        await this.hass.callService("react", service, {
            entity_id: workflow.entity_id,
        });
    }
  
    static get styles(): CSSResultGroup {
        return haStyle;
    }
}
  
declare global {
    interface HTMLElementTagNameMap {
        "react-workflow-panel": ReactWorkflowPanel;
    }
}
  