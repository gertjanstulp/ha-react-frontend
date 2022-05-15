import { ActionTraceStep } from "../../homeassistant-frontend/src/data/trace";
import { Context } from "../../homeassistant-frontend/src/types";

export interface WorkflowConfig {
    id?: string;
    actor: ActorConfig[]
    reactor: ReactorConfig[]
    parallel: ParallelConfig
}

export interface ActorConfig {
    trigger: CtorConfig,
    condition: ConditionConfig;
}

export interface CtorConfig {
    id: string;
    entity: string;
    type: string;
    action: string;
    enabled: boolean;
}

export interface ReactorConfig {
    event: CtorConfig;
    condition: ConditionConfig;
    timing: string;
}

export interface ParallelConfig {
    // enabled: boolean;
}

export interface ConditionConfig {
    enabled: boolean;
    template: string;
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
            result = result[asNumber];
            continue;
        }
    
        if (asNumber !== 0) {
            throw new Error("If config is not an array, can only return index 0");
        }
    }
  
    return result;
};