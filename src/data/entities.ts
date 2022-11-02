import { HassEntityAttributeBase, HassEntityBase } from "home-assistant-js-websocket";

export interface WorkflowEntity extends HassEntityBase {
    attributes: HassEntityAttributeBase & {
        workflow_id?: string;
        last_triggered: string;
    };
}

export interface Run {
    id: string;
    workflow_id: string;
    start_time: string;
}

export interface Action {
    id: string;
    entity: string;
    type: string;
    action: string;
}

export interface Reaction{
    id: string;
    workflow_id: string;
    reactor_id: string;
    created: string;
    when: string;
    wait_type: string;
}