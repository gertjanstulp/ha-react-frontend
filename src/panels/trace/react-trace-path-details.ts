import { dump } from "js-yaml";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import { classMap } from "lit/directives/class-map";
import { formatDateTimeWithSeconds } from "../../../homeassistant-frontend/src/common/datetime/format_date_time";
import { traceTabStyles } from "../../../homeassistant-frontend/src/components/trace/trace-tab-styles";
import { HomeAssistant } from "../../../homeassistant-frontend/src/types";
import { getDataFromPath, WorkflowTraceExtended } from "../../data/trace";

import "../../../homeassistant-frontend/src/components/ha-code-editor";
import "../../../homeassistant-frontend/src/components/ha-icon-button";

import { NodeInfo } from "./react-script-graph";
import { ActionTraceStep } from "../../../homeassistant-frontend/src/data/trace";

@customElement("react-trace-path-details")
export class ReactTracePathDetails extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ type: Boolean, reflect: true }) public narrow!: boolean;

    @property({ attribute: false }) public trace!: WorkflowTraceExtended;

    @property({ attribute: false }) public selected!: NodeInfo;

    @property() public renderedNodes: Record<string, any> = {};

    @property() public trackedNodes!: Record<string, any>;

    @state() private _view: "config" | "changed_variables" = "config";

    protected render(): TemplateResult {
        return html`
            <div class="padded-box trace-info">
                ${this._renderSelectedTraceInfo()}
            </div>

            <div class="tabs top">
                ${[
                    ["config", "Step Config"],
                    ["changed_variables", "Changed Variables"],
                ].map(
                ([view, label]) => html`
                    <button
                        .view=${view}
                        class=${classMap({ active: this._view === view })}
                        @click=${this._showTab}
                    >
                        ${label}
                    </button>
                `
                )}
            </div>
            ${this._view === "config"
                ? this._renderSelectedConfig()
                : this._renderChangedVars()}
        `;
    }

    private _renderSelectedTraceInfo() {
        const paths = this.trace.trace;

        if (!this.selected?.path) {
            return "Select a node on the left for more information.";
        }

        if (!(this.selected.path in paths)) {
            return "This node was not executed and so no further trace information is available.";
        }

        const parts: TemplateResult[][] = [];

        let active = false;

        for (const curPath of Object.keys(this.trace.trace)) {
            // Include all trace results until the next rendered node.
            // Rendered nodes also include non-chosen choose paths.
            if (active) {
                if (curPath in this.renderedNodes) {
                    break;
                }
            } else if (curPath === this.selected.path) {
                active = true;
            } else {
                continue;
            }

            const data: ActionTraceStep[] = paths[curPath];

            parts.push(
                data.map((trace, idx) => {
                const { path, timestamp, result, error, changed_variables, ...rest } = trace as any;
                
                if (result?.enabled === false) {
                    return html`This node was disabled and skipped during execution so
                    no further trace information is available.`;
                }
                      
                return html`
                    ${curPath === this.selected.path
                        ? ""
                        : html`<h2>${curPath.substr(this.selected.path.length + 1)}</h2>`
                    }
                    ${data.length === 1 ? "" : html`<h3>Iteration ${idx + 1}</h3>`}
                    Executed:
                    ${formatDateTimeWithSeconds(
                        new Date(timestamp),
                        this.hass.locale
                    )}
                    <br />
                    ${result
                        ? html`Result:
                            <pre>${dump(result)}</pre>`
                        : error
                        ? html`<div class="error">Error: ${error}</div>`
                        : ""
                    }
                    ${Object.keys(rest).length === 0
                        ? ""
                        : html`<pre>${dump(rest)}</pre>`}
                `;
                })
            );
        }

        return parts;
    }

    private _renderSelectedConfig() {
        if (!this.selected?.path) {
            return "";
        }
        const config = getDataFromPath(this.trace!.config, this.selected.path);
        return config
            ? html`
                <ha-code-editor
                    .value=${dump(config).trimRight()}
                    readOnly
                    dir="ltr"
                ></ha-code-editor>`
            : "Unable to find config";
    }

    private _renderChangedVars() {
        const paths = this.trace.trace;
        const data: ActionTraceStep[] = paths[this.selected.path];

        return html`
        <div class="padded-box">
            ${data 
                ? data.map(
                    (trace, idx) => html`
                        ${idx > 0 ? html`<p>Iteration ${idx + 1}</p>` : ""}
                        ${Object.keys(trace.changed_variables || {}).length === 0
                        ? "No variables changed"
                        : html`<pre>${dump(trace.changed_variables).trimRight()}</pre>`}
                    `
                    ) 
                : ''
            }
        </div>
        `;
    }

    private _showTab(ev) {
        this._view = ev.target.view;
    }

    static get styles(): CSSResultGroup {
        return [
            traceTabStyles,
            css`
                .padded-box {
                    margin: 16px;
                }

                :host(:not([narrow])) .trace-info {
                    min-height: 250px;
                }

                pre {
                    margin: 0;
                }

                .error {
                    color: var(--error-color);
                }
            `,
        ];
    }
}

declare global {
  interface HTMLElementTagNameMap {
    "react-trace-path-details": ReactTracePathDetails;
  }
}
