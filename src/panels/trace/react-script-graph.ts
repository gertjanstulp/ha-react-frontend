import {
    mdiAbTesting,
    mdiAsterisk,
    mdiExclamation,
    mdiChevronDown,
    mdiChevronUp,
    mdiClose,
    mdiPauseCircleOutline,
    mdiCalendarRemove,
    mdiArrowAll,
    mdiTimerOutline,
    mdiUndo,
    mdiArrowULeftTop,
    mdiArrowULeftBottom,
    mdiUndoVariant,
    mdiGestureDoubleTap,
    mdiCodeBraces,
    mdiShuffleDisabled,
    mdiRefresh,
} from "@mdi/js";
import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators";
import { fireEvent } from "../../../homeassistant-frontend/src/common/dom/fire_event";
import { BRANCH_HEIGHT, NODE_SIZE, SPACING } from "../../../homeassistant-frontend/src/components/trace/hat-graph-const";
import { ActorConfig, ConditionConfig, DelayConfig, ParallelConfig, ReactorConfig, DispatchConfig, ResetConfig, ScheduleConfig, StateConfig, WorkflowTraceExtended } from "../../data/trace";
import "../../../homeassistant-frontend/src/components/ha-icon-button"
import "../../../homeassistant-frontend/src/components/trace/hat-graph-node";
import "../../../homeassistant-frontend/src/components/trace/hat-graph-spacer";
import { ensureArray } from "../../../homeassistant-frontend/src/common/ensure-array";
import { ConditionTraceStep } from "../../../homeassistant-frontend/src/data/trace";

import "./react-graph-branch"

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
        const dispatchPath = `${basePath}/dispatch`
        const conditionPath = `${basePath}/condition`
        const delayPath = `${basePath}/delay`
        const schedulePath = `${basePath}/schedule`
        const statePath = `${basePath}/state`
        const resetPath = `${basePath}/reset`

        const condition_info = this.get_condition_info(conditionPath)
        
        const track_dispatch = this.trace && dispatchPath in this.trace.trace
        const track_reset = this.trace && resetPath in this.trace.trace
        const track_state = this.trace && statePath in this.trace.trace
        const track_delay = this.trace && delayPath in this.trace.trace
        const track_schedule = this.trace && schedulePath in this.trace.trace

        return html`
            <div notail ?track=${track_dispatch || track_reset || track_state || track_delay || track_schedule || (condition_info.has_condition && condition_info.trackFailed)}>
                ${config.condition
                    ? html`${this.render_condition_node(config.condition, conditionPath, false, config.dispatch.enabled === false)}` : ''
                }
                ${config.state
                    ? html`${this.render_wait_node(config.state, track_state, statePath, disabled)}` : ''
                }
                ${config.delay
                    ? html `${this.render_delay_node(config.delay, track_delay, delayPath, disabled)}` : ''
                }
                ${config.schedule
                    ? html `${this.render_schedule_node(config.schedule, track_schedule, schedulePath, disabled)}` : ''
                }

                ${config.reset
                    ? html`${this.render_reset_node(config.reset, track_reset, resetPath, disabled)}` 
                    : html`${this.render_reactor_node(config.dispatch, track_dispatch, dispatchPath, disabled)}`
                }
            </div>
            `;
    }

    private render_reactor_node(
        config: DispatchConfig, 
        track: boolean, 
        path: string, 
        disabled: boolean,
    ) {
        this.renderedNodes[path] = { config: config, path: path };
        if (track) {
            this.trackedNodes[path] = this.renderedNodes[path];
        }
        return html`
            <hat-graph-node
                .iconPath=${mdiGestureDoubleTap}
                @focus=${this.selectNode(config, path)}
                ?track=${track}
                ?active=${this.selected === path}
                .notEnabled=${disabled || config.enabled === false}
                tabindex=${this.trace && path in this.trace.trace ? "0" : "-1"}
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
            <react-graph-branch
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
            </react-graph-branch>
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
            <react-graph-branch
                tabindex=${trace === undefined ? "-1" : "0"}
                @focus=${this.selectNode(config, path)}
                ?track=${track}
                ?active=${this.selected === path}
                .notEnabled=${disabled}
                short
            >
                <hat-graph-node
                    .graphStart=${graphStart}
                    .iconPath=${mdiShuffleDisabled}
                    ?track=${track}
                    ?active=${this.selected === path}
                    .notEnabled=${disabled}
                    slot="head"
                    nofocus
                ></hat-graph-node>
                ${ensureArray(this.trace.config.reactor).map((reactor, idx) =>
                    this.render_reactor(reactor, idx)
                )}
                
            </react-graph-branch>
        `;
    }
    
    private render_wait_node(
        config: StateConfig,
        track: boolean,
        path: string,
        disabled: boolean,
    ) {
        this.renderedNodes[path] = { config: config, path: path };
        if (this.trace && path in this.trace.trace) {
            this.trackedNodes[path] = this.renderedNodes[path];
        }
        return html`
            <hat-graph-node
                .iconPath=${mdiCodeBraces}
                @focus=${this.selectNode(config, path)}
                ?track=${track}
                ?active=${this.selected === path}
                .notEnabled=${disabled}
                tabindex=${this.trace && path in this.trace.trace ? "0" : "-1"}
            ></hat-graph-node>`
    }

    private render_delay_node(
        config: DelayConfig, 
        track: boolean, 
        path: string,
        disabled: boolean,
    ) {
        this.renderedNodes[path] = { config: config, path: path };
        if (this.trace && path in this.trace.trace) {
            this.trackedNodes[path] = this.renderedNodes[path];
        }
        return html`
            <hat-graph-node
                .iconPath=${mdiTimerOutline}
                @focus=${this.selectNode(config, path)}
                ?track=${track}
                ?active=${this.selected === path}
                .notEnabled=${disabled}
                tabindex=${this.trace && path in this.trace.trace ? "0" : "-1"}
            ></hat-graph-node>`
    }

    private render_schedule_node(
        config: ScheduleConfig, 
        track: boolean, 
        path: string,
        disabled: boolean,
    ) {
        this.renderedNodes[path] = { config: config, path: path };
        if (this.trace && path in this.trace.trace) {
            this.trackedNodes[path] = this.renderedNodes[path];
        }return html`
            <hat-graph-node
                .iconPath=${mdiTimerOutline}
                @focus=${this.selectNode(config, path)}
                ?track=${track}
                ?active=${this.selected === path}
                .notEnabled=${disabled}
                tabindex=${this.trace && path in this.trace.trace ? "0" : "-1"}
            ></hat-graph-node>`
    }

    private render_reset_node(
        config: ResetConfig, 
        track: boolean, 
        path: string,
        disabled: boolean,
    ) {
        this.renderedNodes[path] = { config: config, path: path };
        if (this.trace && path in this.trace.trace) {
            this.trackedNodes[path] = this.renderedNodes[path];
        }return html`
            <hat-graph-node
                .iconPath=${mdiRefresh}
                @focus=${this.selectNode(config, path)}
                ?track=${track}
                ?active=${this.selected === path}
                .notEnabled=${disabled}
                tabindex=${this.trace && path in this.trace.trace ? "0" : "-1"}
                graphEnd 
            ></hat-graph-node>`
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

    // private get_wait_info(path: string) {
    //     let is_waiting = false
    //     const trace = this.trace.trace[path] as EventTraceStep[];
    //     if (trace) {
    //         for (const trc of trace) {
    //             if (trc.result) {
    //                 let reaction = trc.result.reaction
    //                 if (reaction) {
    //                     is_waiting = reaction.waiting
    //                 }
    //             }
    //         }
    //     }

    //     return {
    //         is_waiting: is_waiting
    //     } 
    // }

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
                        <react-graph-branch start .short=${actor_nodes.length < 2}>
                            ${actor_nodes}
                        </react-graph-branch>`
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
            const keys = Object.keys(this.renderedNodes).sort(
                (a, b) => {
                    const a_parts = a.split("/")
                    const b_parts = b.split("/")
                    if (a_parts[0] < b_parts[0] || (a_parts[0] == b_parts[0] && a_parts[1] < b_parts[1]))
                        return -1
                    return 1
                }
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
