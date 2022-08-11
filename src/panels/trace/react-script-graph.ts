import {
    mdiAbTesting,
    mdiAsterisk,
    mdiExclamation,
    mdiChevronDown,
    mdiChevronUp,
    mdiClose,
    mdiMathNorm,
    mdiTimerOutline,
} from "@mdi/js";
import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators";
import { fireEvent } from "../../../homeassistant-frontend/src/common/dom/fire_event";
import { BRANCH_HEIGHT, NODE_SIZE, SPACING } from "../../../homeassistant-frontend/src/components/trace/hat-graph-const";
import { ActorConfig, ConditionConfig, ParallelConfig, ReactorConfig, WorkflowTraceExtended } from "../../data/trace";
import "../../../homeassistant-frontend/src/components/ha-icon-button"
import "../../../homeassistant-frontend/src/components/trace/hat-graph-branch";
import "../../../homeassistant-frontend/src/components/trace/hat-graph-node";
import "../../../homeassistant-frontend/src/components/trace/hat-graph-spacer";
import { ensureArray } from "../../../homeassistant-frontend/src/common/ensure-array";
import { ConditionTraceStep } from "../../../homeassistant-frontend/src/data/trace";

export interface NodeInfo {
    path: string;
    config: any;
}

declare global {
    interface HASSDomEvents {
        "graph-node-selected": NodeInfo;
    }
}

@customElement("react-script-graph")
export class ReactScriptGraph extends LitElement {
    @property({ attribute: false }) public trace!: WorkflowTraceExtended;

    @property({ attribute: false }) public selected?: string;

    public renderedNodes: Record<string, NodeInfo> = {};

    public trackedNodes: Record<string, NodeInfo> = {};

    private selectNode(config, path) {
        return () => {
            fireEvent(this, "graph-node-selected", { config, path });
        };
    }

    private render_actor(config: ActorConfig, idx: number) {
        const basePath = `actor/${idx}`;
        const triggerPath = `${basePath}/trigger`
        const conditionPath = `${basePath}/condition`
        const track = this.trace && triggerPath in this.trace.trace;
        this.renderedNodes[triggerPath] = { config: config.trigger, path: triggerPath };
        if (track) {
            this.trackedNodes[triggerPath] = this.renderedNodes[triggerPath];
        }
        const condition_info = this.get_condition_info(conditionPath)
        if (config.condition) {
            return html`
                <div ?track=${track && (condition_info.track && condition_info.trackPass)}>
                    ${this.render_actor_node(config, track, triggerPath)}
                    ${this.render_condition_node(config.condition, `${conditionPath}`, false, config.trigger.enabled === false)}
                </div>
            `;
        } else{
            return this.render_actor_node(config, track, triggerPath)
        }
    }

    private render_actor_node(
        config: ActorConfig,
        track: boolean,
        triggerPath: string
    ) {
        return html`
            <hat-graph-node
                graphStart
                ?track=${track}
                @focus=${this.selectNode(config, triggerPath)}
                ?active=${this.selected === triggerPath}
                .iconPath=${mdiAsterisk}
                .notEnabled=${config.trigger.enabled === false}
                tabindex=${track ? "0" : "-1"}
            ></hat-graph-node>`
    }

    private render_reactor(
        config: ReactorConfig, 
        idx: number, 
        disabled = false
    ) {
        const basePath = `reactor/${idx}`;
        const eventPath = `${basePath}/event`
        const conditionPath = `${basePath}/condition`
        const track = this.trace && eventPath in this.trace.trace;
        this.renderedNodes[eventPath] = { config: config.event, path: eventPath };
        if (track) {
            this.trackedNodes[eventPath] = this.renderedNodes[eventPath];
        }
        const condition_info = this.get_condition_info(conditionPath)
        if (config.condition) {
            return html`
                <div ?track=${track || (condition_info.has_condition && condition_info.trackFailed)}>
                    ${this.render_condition_node(config.condition, conditionPath, false, config.event.enabled === false)}
                    ${this.render_reactor_node(config, track, eventPath, disabled)}
                </div>
            `;
        } else {
            return this.render_reactor_node(config, track, eventPath, disabled)
        }
    }

    private render_reactor_node(
        config: ReactorConfig, 
        track: boolean, 
        eventPath: string, 
        disabled: boolean
    ) {
        return html`
            <hat-graph-node
                .iconPath=${config.event.timing === "immediate" ? mdiExclamation : mdiTimerOutline}
                @focus=${this.selectNode(config, eventPath)}
                ?track=${track}
                ?active=${this.selected === eventPath}
                .notEnabled=${disabled || config.event.enabled === false}
                tabindex=${this.trace && eventPath in this.trace.trace ? "0" : "-1"}
                graphEnd 
            ></hat-graph-node>`
    }

    private render_condition_node(
        config: ConditionConfig,
        path: string,
        graphStart = false,
        disabled = false
    ) {
        this.renderedNodes[path] = { config: config, path: path };
        if (this.trace && path in this.trace.trace) {
            this.trackedNodes[path] = this.renderedNodes[path];
        }
        const condition_info = this.get_condition_info(path)
        
        return html`
            <hat-graph-branch
                @focus=${this.selectNode(config, path)}
                ?track=${condition_info.track}
                ?active=${this.selected === path}
                .notEnabled=${disabled}
                tabindex=${condition_info.trace === undefined ? "-1" : "0"}
                short
            >
                <hat-graph-node
                    .graphStart=${graphStart}
                    slot="head"
                    ?track=${condition_info.track}
                    ?active=${this.selected === path}
                    .notEnabled=${disabled}
                    .iconPath=${mdiAbTesting}
                    nofocus
                ></hat-graph-node>
                <div
                    style=${`width: ${NODE_SIZE + SPACING}px;`}
                    graphStart
                    graphEnd
                ></div>
                <div ?track=${condition_info.trackPass}></div>
                <hat-graph-node
                    .iconPath=${mdiClose}
                    nofocus
                    ?track=${condition_info.trackFailed}
                    ?active=${this.selected === path}
                    .notEnabled=${disabled}
                ></hat-graph-node>
            </hat-graph-branch>
        `;
    }

    private render_parallel_node(
        config: ParallelConfig,
        path: string,
        graphStart = false,
        disabled = false
    ) {
        const track = this.trace && path in this.trace.trace;
        this.renderedNodes[path] = { config, path };
        if (track) {
            this.trackedNodes[path] = this.renderedNodes[path];
        }
        const trace: any = this.trace.trace[path];
        return html`
            <hat-graph-branch
                tabindex=${trace === undefined ? "-1" : "0"}
                @focus=${this.selectNode(config, path)}
                ?track=${track}
                ?active=${this.selected === path}
                .notEnabled=${disabled}
                short
            >
                <hat-graph-node
                    .graphStart=${graphStart}
                    .iconPath=${mdiMathNorm}
                    ?track=${track}
                    ?active=${this.selected === path}
                    .notEnabled=${disabled}
                    slot="head"
                    nofocus
                ></hat-graph-node>
                ${ensureArray(this.trace.config.reactor).map((reactor, idx) =>
                    this.render_reactor(reactor, idx)
                )}
                
            </hat-graph-branch>
        `;
    }
    
    private get_condition_info(path: string) {
        const trace = this.trace.trace[path] as ConditionTraceStep[] | undefined;
        let track = false;
        let has_condition = false
        let trackPass = false;
        let trackFailed = false;
        if (trace) {
            has_condition = true
            for (const trc of trace) {
                if (trc.result) {
                    track = true;
                    if (trc.result.result) {
                        trackPass = true;
                    } else {
                        trackFailed = true;
                    }
                }
                if (trackPass && trackFailed) {
                    break;
                }
            }
        }
        return {
            trace: trace,
            track: track,
            has_condition: has_condition,
            trackPass: trackPass,
            trackFailed: trackFailed
        }
    }

    protected render() {
        const paths = Object.keys(this.trackedNodes);
        const actor_nodes =
            ensureArray(this.trace.config.actor).map((actor) =>
                this.render_actor(actor, actor.index)
            )
        try {
            return html`
                <div class="parent graph-container">
                    ${html`
                        <hat-graph-branch start .short=${actor_nodes.length < 2}>
                            ${actor_nodes}
                        </hat-graph-branch>`
                    }
                    ${"parallel" in this.trace.config
                        ? html`
                            ${this.render_parallel_node(this.trace.config.parallel, "parallel", false, false )}`
                        : html`
                            ${this.render_reactor(this.trace.config.reactor[0], 0)}`
                    }
                </div>
                <div class="actions">
                    <ha-icon-button
                        .disabled=${paths.length === 0 || paths[0] === this.selected}
                        @click=${this._previousTrackedNode}
                        .path=${mdiChevronUp}
                    ></ha-icon-button>
                    <ha-icon-button
                        .disabled=${paths.length === 0 ||
                        paths[paths.length - 1] === this.selected}
                        @click=${this._nextTrackedNode}
                        .path=${mdiChevronDown}
                    ></ha-icon-button>
                </div>
            `;
        } catch (err: any) {
        if (__DEV__) {
            // eslint-disable-next-line no-console
            console.log("Error creating script graph:", err);
        }
        return html`
            <div class="error">
                Error rendering graph. Please download trace and share with the
                developers.
            </div>
        `;
        }
    }

    public willUpdate(changedProps: PropertyValues<this>) {
        super.willUpdate(changedProps);
        if (changedProps.has("trace")) {
            this.renderedNodes = {};
            this.trackedNodes = {};
        }
    }

    protected updated(changedProps: PropertyValues<this>) {
        super.updated(changedProps);

        if (!changedProps.has("trace")) {
            return;
        }

        // If trace changed and we have no or an invalid selection, select first option.
        if (!this.selected || !(this.selected in this.trackedNodes)) {
            const firstNode = this.trackedNodes[Object.keys(this.trackedNodes)[0]];
            if (firstNode) {
                fireEvent(this, "graph-node-selected", firstNode);
            }
        }

        if (this.trace) {
            const sortKeys = Object.keys(this.trace.trace);
            const keys = Object.keys(this.renderedNodes).sort(
                (a, b) => sortKeys.indexOf(a) - sortKeys.indexOf(b)
            );
            const sortedTrackedNodes = {};
            const sortedRenderedNodes = {};
            for (const key of keys) {
                sortedRenderedNodes[key] = this.renderedNodes[key];
                if (key in this.trackedNodes) {
                sortedTrackedNodes[key] = this.trackedNodes[key];
                }
            }
            this.renderedNodes = sortedRenderedNodes;
            this.trackedNodes = sortedTrackedNodes;
        }
    }

    private _previousTrackedNode() {
        const nodes = Object.keys(this.trackedNodes);
        const prevIndex = nodes.indexOf(this.selected!) - 1;
        if (prevIndex >= 0) {
            fireEvent(
                this,
                "graph-node-selected",
                this.trackedNodes[nodes[prevIndex]]
            );
        }
    }

    private _nextTrackedNode() {
        const nodes = Object.keys(this.trackedNodes);
        const nextIndex = nodes.indexOf(this.selected!) + 1;
        if (nextIndex < nodes.length) {
            fireEvent(
                this,
                "graph-node-selected",
                this.trackedNodes[nodes[nextIndex]]
            );
        }
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                --stroke-clr: var(--stroke-color, var(--secondary-text-color));
                --active-clr: var(--active-color, var(--primary-color));
                --track-clr: var(--track-color, var(--accent-color));
                --hover-clr: var(--hover-color, var(--primary-color));
                --disabled-clr: var(--disabled-color, var(--disabled-text-color));
                --disabled-active-clr: rgba(var(--rgb-primary-color), 0.5);
                --disabled-hover-clr: rgba(var(--rgb-primary-color), 0.7);
                --default-trigger-color: 3, 169, 244;
                --rgb-trigger-color: var(--trigger-color, var(--default-trigger-color));
                --background-clr: var(--background-color, white);
                --default-icon-clr: var(--icon-color, black);
                --icon-clr: var(--stroke-clr);

                --hat-graph-spacing: ${SPACING}px;
                --hat-graph-node-size: ${NODE_SIZE}px;
                --hat-graph-branch-height: ${BRANCH_HEIGHT}px;
            }
            .graph-container {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .actions {
                display: flex;
                flex-direction: column;
            }
            .parent {
                margin-left: 8px;
                margin-top: 16px;
            }
            .error {
                padding: 16px;
                max-width: 300px;
            }
            `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "react-script-graph": ReactScriptGraph;
    }
}
