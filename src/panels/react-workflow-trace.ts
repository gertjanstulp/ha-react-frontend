import {
    mdiDownload,
    mdiRayEndArrow,
    mdiRayStartArrow,
    mdiRefresh,
} from "@mdi/js";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators";
import { classMap } from "lit/directives/class-map";
import { repeat } from "lit/directives/repeat";

import { formatDateTimeWithSeconds } from "../../homeassistant-frontend/src/common/datetime/format_date_time";
import { traceTabStyles } from "../../homeassistant-frontend/src/components/trace/trace-tab-styles";
import { showAlertDialog } from "../../homeassistant-frontend/src/dialogs/generic/show-dialog-box";
import { haStyle } from "../../homeassistant-frontend/src/resources/styles";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";

import "../../homeassistant-frontend/src/components/ha-icon-button";
import "../../homeassistant-frontend/src/components/trace/ha-trace-config";

import { WorkflowEntity } from "../data/entities";
import { WorkflowTrace, WorkflowTraceExtended } from "../data/trace";
import { loadTrace, loadTraces } from "../data/websocket";
import { reactSections } from "./react-main-panel";
import { NodeInfo, ReactScriptGraph } from "./trace/react-script-graph";

import "./trace/react-script-graph"
import "./trace/react-trace-path-details";
  
@customElement("react-workflow-trace")
export class ReactWorkflowTrace extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;
  
    @property() public workflowId!: string;
  
    @property({ attribute: false }) public workflows!: WorkflowEntity[];
  
    @property({ type: Boolean }) public isWide?: boolean;
  
    @property({ type: Boolean, reflect: true }) public narrow!: boolean;
  
    @property({ attribute: false }) public route!: Route;
  
    @state() private _entityId?: string;
  
    @state() private _traces?: WorkflowTrace[];
  
    @state() private _runId?: string;
  
    @state() private _selected?: NodeInfo;
  
    @state() private _trace?: WorkflowTraceExtended;
  
    @state() private _view:
        | "details"
        | "config"
        | "timeline" = "details";
  
    @query("react-script-graph") private _graph?: ReactScriptGraph;
  
    protected render(): TemplateResult {
        const stateObj = this._entityId
            ? this.hass.states[this._entityId]
            : undefined;
    
        const graph = this._graph;
        const trackedNodes = graph?.trackedNodes;
        const renderedNodes = graph?.renderedNodes;
    
        const title = stateObj?.attributes.friendly_name || this._entityId;
    
        let devButtons: TemplateResult | string = "";
        if (__DEV__) {
            devButtons = html`
                <div style="position: absolute; right: 0;">
                    <button @click=${this._importTrace}>Import trace</button>
                    <button @click=${this._loadLocalStorageTrace}>Load stored trace</button>
                </div>`;
        }
    
        const actionButtons = html`
            <ha-icon-button
                .label=${this.hass.localize("ui.panel.config.automation.trace.refresh")}
                .path=${mdiRefresh}
                @click=${this._refreshTraces}
            ></ha-icon-button>
            <ha-icon-button
                .label=${this.hass.localize(
                    "ui.panel.config.automation.trace.download_trace"
                )}
                .path=${mdiDownload}
                .disabled=${!this._trace}
                @click=${this._downloadTrace}
            ></ha-icon-button>
        `;
    
        return html`
            ${devButtons}
            <hass-tabs-subpage
                .hass=${this.hass}
                .narrow=${this.narrow}
                .route=${this.route}
                .tabs=${reactSections.react}
            >
            ${this.narrow
                ? html`<span slot="header">${title}</span>
                    <div slot="toolbar-icon">${actionButtons}</div>`
                : ""}
            <div class="toolbar">
                ${!this.narrow
                ? html`<div>
                    ${title}
                    </div>`
                : ""}
                ${this._traces && this._traces.length > 0
                ? html`
                    <div>
                        <ha-icon-button
                            .label=${this.hass!.localize(
                                "ui.panel.config.automation.trace.older_trace"
                            )}
                            .path=${mdiRayEndArrow}
                            .disabled=${this._traces[this._traces.length - 1].run_id ===this._runId}
                            @click=${this._pickOlderTrace}
                        ></ha-icon-button>
                        <select .value=${this._runId} @change=${this._pickTrace}>
                        ${repeat(
                            this._traces,
                            (trace) => trace.run_id,
                            (trace) =>
                            html`<option value=${trace.run_id}>
                                ${formatDateTimeWithSeconds(
                                new Date(trace.timestamp.start),
                                this.hass.locale
                                )}
                            </option>`
                        )}
                        </select>
                        <ha-icon-button
                            .label=${this.hass!.localize(
                                "ui.panel.config.automation.trace.newer_trace"
                            )}
                            .path=${mdiRayStartArrow}
                            .disabled=${this._traces[0].run_id === this._runId}
                            @click=${this._pickNewerTrace}
                        ></ha-icon-button>
                    </div>
                    `
                : ""}
                ${!this.narrow ? html`<div>${actionButtons}</div>` : ""}
            </div>
    
            ${this._traces === undefined
                ? html`<div class="container">Loading…</div>`
                : this._traces.length === 0
                ? html`<div class="container">No traces found</div>`
                : this._trace === undefined
                ? ""
                : html`
                    <div class="main">
                    <div class="graph">
                        <react-script-graph
                            .trace=${this._trace}
                            .selected=${this._selected?.path}
                            @graph-node-selected=${this._pickNode}
                        ></react-script-graph>
                    </div>
    
                    <div class="info">
                        <div class="tabs top">
                            ${[
                                ["details", "Step Details"],
                                ["config", "Automation Config"],
                            ].map(
                                ([view, label]) => html`
                                <button
                                    tabindex="0"
                                    .view=${view}
                                    class=${classMap({ active: this._view === view })}
                                    @click=${this._showTab}
                                >
                                    ${label}
                                </button>
                                `
                            )}
                        </div>
                        ${this._selected === undefined ||
                        trackedNodes === undefined
                        ? ""
                        : this._view === "details"
                        ? html`
                            <react-trace-path-details
                                .hass=${this.hass}
                                .narrow=${this.narrow}
                                .trace=${this._trace}
                                .selected=${this._selected}
                                .trackedNodes=${trackedNodes}
                                .renderedNodes=${renderedNodes!}
                            ></react-trace-path-details>
                            `
                        : html`
                            <ha-trace-config
                                .hass=${this.hass}
                                .trace=${this._trace}
                            ></ha-trace-config>
                            `}
                    </div>
                    </div>
                `}
            </hass-tabs-subpage>
        `;
    }
  
    protected firstUpdated(changedProps) {
        super.firstUpdated(changedProps);
    
        if (!this.workflowId) {
            return;
        }
    
        const params = new URLSearchParams(location.search);
        this._loadTraces(params.get("run_id") || undefined);
    }
  
    protected updated(changedProps) {
        super.updated(changedProps);
    
        // Only reset if workflowId has changed and we had one before.
        if (changedProps.get("workflowId")) {
            this._traces = undefined;
            this._entityId = undefined;
            this._runId = undefined;
            this._trace = undefined;
            if (this.workflowId) {
                this._loadTraces();
            }
        }
    
        if (changedProps.has("_runId") && this._runId) {
            this._trace = undefined;
            this._loadTrace();
        }
    
          if (
            changedProps.has("workflows") &&
            this.workflowId &&
            !this._entityId
        ) {
            const workflow = this.workflows.find(
                (entity: WorkflowEntity) => entity.attributes.id === this.workflowId
            );
            this._entityId = workflow?.entity_id;
        }
    }
  
    private _pickOlderTrace() {
        const curIndex = this._traces!.findIndex((tr) => tr.run_id === this._runId);
        this._runId = this._traces![curIndex + 1].run_id;
        this._selected = undefined;
    }
  
    private _pickNewerTrace() {
        const curIndex = this._traces!.findIndex((tr) => tr.run_id === this._runId);
        this._runId = this._traces![curIndex - 1].run_id;
        this._selected = undefined;
    }
  
    private _pickTrace(ev) {
        this._runId = ev.target.value;
        this._selected = undefined;
    }
  
    private _pickNode(ev) {
        this._selected = ev.detail;
    }
  
    private _refreshTraces() {
        this._loadTraces();
    }
  
    private async _loadTraces(runId?: string) {
        this._traces = await loadTraces(this.hass, this.workflowId);
        // Newest will be on top.
        this._traces.reverse();
    
        if (runId) {
            this._runId = runId;
        }
    
        // Check if current run ID still exists
        if (
            this._runId &&
            !this._traces.some((trace) => trace.run_id === this._runId)
        ) {
            this._runId = undefined;
            this._selected = undefined;
      
            // If we came here from a trace passed into the url, clear it.
            if (runId) {
                const params = new URLSearchParams(location.search);
                params.delete("run_id");
                history.replaceState(
                    null,
                    "",
                    `${location.pathname}?${params.toString()}`
                );
            }
      
            await showAlertDialog(this, {
                text: "Chosen trace is no longer available",
            });
        }
    
        // See if we can set a default runID
        if (!this._runId && this._traces.length > 0) {
            this._runId = this._traces[0].run_id;
        }
    }
  
    private async _loadTrace() {
        const trace = await loadTrace(
            this.hass,
            this.workflowId,
            this._runId!
        );
    
        this._trace = trace;
    }
  
    private _downloadTrace() {
        const aEl = document.createElement("a");
        aEl.download = `trace ${this._entityId} ${
            this._trace!.timestamp.start
        }.json`;
        aEl.href = `data:application/json;charset=utf-8,${encodeURI(
            JSON.stringify(
                {
                    trace: this._trace,
                },
                undefined,
                2
            )
        )}`;
        aEl.click();
    }
  
    private _importTrace() {
        const traceText = prompt("Enter downloaded trace");
        if (!traceText) {
            return;
        }
        localStorage.devTrace = traceText;
        this._loadLocalTrace(traceText);
    }
  
    private _loadLocalStorageTrace() {
        if (localStorage.devTrace) {
            this._loadLocalTrace(localStorage.devTrace);
        }
    }
  
    private _loadLocalTrace(traceText: string) {
        const traceInfo = JSON.parse(traceText);
        this._trace = traceInfo.trace;
    }
  
    private _showTab(ev: Event) {
        this._view = (ev.target as any).view;
    }
  
    static get styles(): CSSResultGroup {
        return [
            haStyle,
            traceTabStyles,
            css`
                .toolbar {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  font-size: 20px;
                  height: var(--header-height);
                  padding: 0 16px;
                  background-color: var(--primary-background-color);
                  font-weight: 400;
                  color: var(--app-header-text-color, white);
                  border-bottom: var(--app-header-border-bottom, none);
                  box-sizing: border-box;
                }
        
                .toolbar > * {
                  display: flex;
                  align-items: center;
                }
        
                :host([narrow]) .toolbar > * {
                  display: contents;
                }
        
                .main {
                  height: calc(100% - 56px);
                  display: flex;
                  background-color: var(--card-background-color);
                }
        
                :host([narrow]) .main {
                  height: auto;
                  flex-direction: column;
                }
        
                .container {
                  padding: 16px;
                }
        
                .graph {
                  border-right: 1px solid var(--divider-color);
                  overflow-x: auto;
                  max-width: 50%;
                  padding-bottom: 16px;
                }
                :host([narrow]) .graph {
                  max-width: 100%;
                  justify-content: center;
                  display: flex;
                }
        
                .info {
                  flex: 1;
                  background-color: var(--card-background-color);
                }
        
                .linkButton {
                  color: var(--primary-text-color);
                }
              `,
          ];
      }
  }
  
  declare global {
      interface HTMLElementTagNameMap {
          "react-workflow-trace": ReactWorkflowTrace;
      }
  }
  