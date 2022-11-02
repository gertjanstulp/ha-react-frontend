import { ActionTraceStep } from "../../homeassistant-frontend/src/data/trace";
import { Context } from "../../homeassistant-frontend/src/types";
import { Reaction } from "./entities";

export interface WorkflowConfig {
    id?: string;
    actor: ActorConfig[]
    reactor: ReactorConfig[]
    parallel: ParallelConfig
}

export interface ActorConfig {
    index: number,
    trigger: CtorConfig,
    condition: ConditionConfig;
}

export interface CtorConfig {
    id: string;
    entity: string;
    type: string;
    action: string;
    enabled: boolean;
    data: DataConfig;
}

export interface DispatchConfig extends CtorConfig {
    // timing: string;
}

export interface ReactorConfig {
    dispatch: DispatchConfig;
    condition: ConditionConfig;
    state: StateConfig;
    delay: DelayConfig;
    schedule: ScheduleConfig;
    reset: ResetConfig;
}

export interface DataConfig {
    [key: string] : string;
}

export interface ParallelConfig {
    // enabled: boolean;
}

export interface ConditionConfig {
    template: string;
}

export interface StateConfig {
    condition: string;
}

export interface DelayConfig {
    seconds: number;
}

export interface ScheduleConfig {
    at: string;
}

export interface ResetConfig {
    reset_workflow: string;
}

interface BaseTrace {
    domain: string;
    item_id: string;
    last_step: string | null;
    run_id: string;
    state: "running" | "stopped" | "debugged";
    timestamp: {
      start: string;
      finish: string | null;
    };
}
  
interface BaseTraceExtended {
    trace: Record<string, ActionTraceStep[]>;
    context: Context;
    error?: string;
}
  
export interface WorkflowTrace extends BaseTrace {
    domain: "react";
    trigger: string;
}

export interface WorkflowTraceExtended extends WorkflowTrace, BaseTraceExtended {
    config: WorkflowConfig
}

export interface EventTraceStep {
    result?: { reaction: Reaction };
    path: string;
}

export const getDataFromPath = (
    config: WorkflowTraceExtended["config"],
    path: string
): any => {
    const parts = path.split("/").reverse();
  
    let result: any = config;
  
    while (parts.length) {
        const raw = parts.pop()!;
        const asNumber = Number(raw);
    
        if (isNaN(asNumber)) {
            result = result[raw];
            continue;
        }
    
        if (Array.isArray(result)) {
            result = result.find(i => i.index === asNumber);
            continue;
        }
    
        if (asNumber !== 0) {
            throw new Error("If config is not an array, can only return index 0");
        }
    }
  
    return result;
};