import {
    mdiHistory,
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
import { WorkflowEntity } from "../data/entities";
import { computeStateName } from "../../homeassistant-frontend/src/common/entity/compute_state_name";
import { DataTableColumnContainer } from "../../homeassistant-frontend/src/components/data-table/ha-data-table";
import { UNAVAILABLE_STATES } from "../../homeassistant-frontend/src/data/entity";
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
                toggle: {
                    title: "",
                    label: this.react.localize("ui.panel.workflow.picker.headers.toggle"),
                    type: "icon",
                    template: (_toggle, workflow: any) =>
                    html`
                        <ha-entity-toggle
                        .hass=${this.hass}
                        .stateObj=${workflow}
                        ></ha-entity-toggle>
                    `,
                },
                name: {
                    title: this.react.localize("ui.panel.workflow.picker.headers.name"),
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
                // Trigger column
                columns.trigger = {
                    label: this.react.localize("ui.panel.workflow.picker.headers.trigger"),
                    title: "",
                    width: "20%",
                    template: (_info, workflow: any) => html`
                        <mwc-button
                            .workflow=${workflow}
                            @click=${this._triggerTrigger}
                            .disabled=${UNAVAILABLE_STATES.includes(workflow.state)}
                        >
                            ${this.react.localize("ui.panel.workflow.picker.actions.trigger")}
                        </mwc-button>
                    `,
                };
            }
            columns.actions = {
                title: "",
                label: this.react.localize("ui.panel.workflow.picker.headers.actions"),
                type: "overflow-menu",
                width: "7%",
                template: (_info, workflow: any) => html`
                    <ha-icon-overflow-menu
                        .hass=${this.hass}
                        .narrow=${this.narrow}
                        .items=${[
                            // Info Button
                            {
                                path: mdiInformationOutline,
                                label: this.react.localize("ui.panel.workflow.picker.actions.info"),
                                action: () => this._showInfo(workflow),
                            },
                            // Trigger Button
                            {
                                path: mdiPlayCircleOutline,
                                label: this.react.localize("ui.panel.workflow.picker.actions.trigger"),
                                narrowOnly: true,
                                action: () => this._trigger(workflow),
                            },
                            // Trace Button
                            {
                                path: mdiHistory,
                                disabled: !workflow.attributes.workflow_id,
                                label: this.react.localize("ui.panel.workflow.picker.actions.trace"),
                                action: () => {
                                    if (workflow.attributes.workflow_id) {
                                        navigate(`/react/workflow/trace/${workflow.attributes.workflow_id}`);
                                    }
                                },
                            },
                        ]}
                        style="color: var(--secondary-text-color)">
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

    private _triggerTrigger = (ev) => {
        this._trigger(ev.currentTarget.workflow);
    };
  
    private _trigger = (workflow: WorkflowEntity) => {
        triggerWorkflow(this.hass, workflow.entity_id);
    };
  
  
    static get styles(): CSSResultGroup {
        return haStyle;
    }
}
  
declare global {
    interface HTMLElementTagNameMap {
        "react-workflow-panel": ReactWorkflowPanel;
    }
}
  