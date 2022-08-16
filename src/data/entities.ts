import { HassEntityAttributeBase, HassEntityBase } from "home-assistant-js-websocket";

export interface WorkflowEntity extends HassEntityBase {
    attributes: HassEntityAttributeBase & {
        workflow_id?: string;
        last_triggered: string;
    };
}


export interface ReactionEntity extends HassEntityBase {
    attributes: HassEntityAttributeBase & {
        id: string;
        workflow_id: string
        entity: string
        type: string
        action: string
        reset_workflow: string
        overwrite: boolean
        forward_action: boolean
    };
}


export interface Action {
    id: string;
    entity: string;
    type: string;
    action: string;
}

export interface Reaction{
    id: string;
    entity: string;
    type: string;
    action: string
}