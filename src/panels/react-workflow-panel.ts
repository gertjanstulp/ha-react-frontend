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
import { WorkflowEntity } from "../data/entities";
import { computeStateName } from "../../homeassistant-frontend/src/common/entity/compute_state_name";
import { DataTableColumnContainer } from "../../homeassistant-frontend/src/components/data-table/ha-data-table";
import { formatDateTime } from "../../homeassistant-frontend/src/common/datetime/format_date_time";
import { UNAVAILABLE_STATES } from "../../homeassistant-frontend/src/data/entity";
// import { reactSections } from "./react-main-panel";
import { fireEvent } from "../../homeassistant-frontend/src/common/dom/fire_event";
import { haStyle } from "../../homeassistant-frontend/src/resources/styles";
import { reactSections } from "./react-main-panel";
import { navigate } from "../../homeassistant-frontend/src/common/navigate";
import {React} from "../data/react"

@customElement("react-workflow-panel")
class ReactWorkflowPanel extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public react!: React;
  
    @property() public route!: Route;
    
    @property({ type: Boolean }) public narrow!: boolean;
    
    @property({ type: Boolean }) public isWide!: boolean;

    @property({ type: Boolean }) public showAdvanced!: boolean;
  
    @property() public workflows!: WorkflowEntity[];
  
    @property() private _activeFilters?: string[];
  
    @state() private _filteredWorkflows?: string[] | null;
  
    @state() private _filterValue?;
  
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
                    label: this.react.localize(
                        "ui.panel.workflow.picker.headers.toggle"
                    ),
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
                    title: this.react.localize(
                        "ui.panel.workflow.picker.headers.name"
                    ),
                    sortable: true,
                    filterable: true,
                    direction: "asc",
                    grows: true,
                    template: narrow
                    ? (name, workflow: any) =>
                        html`
                            ${name}
                            <div class="secondary">
                            ${this.react.localize("ui.card.workflow.last_triggered")}:
                            ${workflow.attributes.last_triggered
                                ? formatDateTime(
                                    new Date(workflow.attributes.last_triggered),
                                    this.hass.locale
                                )
                                : this.react.localize("ui.components.relative_time.never")}
                            </div>
                        `
                    : undefined,
                },
            };
            if (!narrow) {
                columns.last_triggered = {
                    sortable: true,
                    width: "20%",
                    title: this.react.localize("ui.card.workflow.last_triggered"),
                    template: (last_triggered) => html`
                    ${last_triggered
                        ? formatDateTime(new Date(last_triggered), this.hass.locale)
                        : this.react.localize("ui.components.relative_time.never")}
                    `,
                };
                columns.trigger = {
                    label: this.react.localize(
                        "ui.panel.workflow.picker.headers.trigger"
                    ),
                    title: html`
                    <mwc-button style="visibility: hidden">
                        ${this.react.localize("ui.card.workflow.trigger")}
                    </mwc-button>
                    `,
                    width: "20%",
                    template: (_info, workflow: any) => html`
                    <mwc-button
                        .workflow=${workflow}
                        @click=${this._triggerRunActions}
                        .disabled=${UNAVAILABLE_STATES.includes(workflow.state)}
                    >
                        ${this.react.localize("ui.card.workflow.trigger")}
                    </mwc-button>
                    `,
                };
            }
            columns.actions = {
                title: "",
                label: this.react.localize(
                    "ui.panel.workflow.picker.headers.actions"
                ),
                type: "overflow-menu",
                template: (_info, workflow: any) => html`
                    <ha-icon-overflow-menu
                    .hass=${this.hass}
                    .narrow=${this.narrow}
                    .items=${[
                        // Info Button
                        {
                            path: mdiInformationOutline,
                            label: this.react.localize(
                                "ui.panel.workflow.picker.show_info_workflow"
                            ),
                            action: () => this._showInfo(workflow),
                        },
                        // Trigger Button
                        {
                            path: mdiPlayCircleOutline,
                            label: this.react.localize("ui.card.workflow.trigger"),
                            narrowOnly: true,
                            action: () => this._runActions(workflow),
                        },
                        // Trace Button
                        {
                            path: mdiHistory,
                            disabled: !workflow.attributes.workflow_id,
                            label: this.react.localize(
                                "ui.panel.workflow.picker.trace"
                            ),
                            action: () => {
                                if (workflow.attributes.workflow_id) {
                                    navigate(
                                        `/react/workflow/trace/${workflow.attributes.workflow_id}`
                                    );
                                }
                            },
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
            back-path="/react"
            id="entity_id"
            .route=${this.route}
            .tabs=${reactSections.react}
            .activeFilters=${this._activeFilters}
            .columns=${this._columns(this.narrow, this.hass.locale)}
            .data=${this._workflows(this.workflows, this._filteredWorkflows)}
            .noDataText=${this.react.localize(
                "ui.panel.workflow.picker.no_workflows"
            )}
            @clear-filter=${this._clearFilter}
        >
            <ha-button-related-filter-menu
                slot="filter-menu"
                corner="BOTTOM_START"
                .narrow=${this.narrow}
                .hass=${this.hass}
                .value=${this._filterValue}
                exclude-domains='["workflow"]'
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
        this._filteredWorkflows = ev.detail.items.workflow || null;
    }
  
    private _clearFilter() {
        this._filteredWorkflows = undefined;
        this._activeFilters = undefined;
        this._filterValue = undefined;
    }
    
    private _showInfo(workflow: WorkflowEntity) {
        const entityId = workflow.entity_id;
        fireEvent(this, "hass-more-info", { entityId });
    }

    private _triggerRunActions = (ev) => {
        this._runActions(ev.currentTarget.workflow);
    };
  
    private _runActions = (workflow: WorkflowEntity) => {
        // triggerWorkflowActions(this.hass, workflow.entity_id);
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
  