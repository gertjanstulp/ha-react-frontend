import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import { Workflow, Configuration, Status, Message } from "./common";

export interface React {
    language: string;
    messages: Message[];
    updates: any[];
    resources: any[];
    workflows: Workflow[];
    removed: any[];
    sections: any;
    configuration: Configuration;
    status: Status;
    localize(string: string, replace?: Record<string, any>): string;
    log: any;
}

export const triggerWorkflow = (
    hass: HomeAssistant,
    entityId: string
) => {
    hass.callService("react", "trigger_workflow", {
        entity_id: entityId,
    });
};

export const triggerReaction = (
    hass: HomeAssistant,
    entityId: string
) => {
    hass.callService("react", "trigger_reaction", {
        entity_id: entityId,
    });
};

export const deleteReaction = (
    hass: HomeAssistant,
    entityId: string
) => {
    hass.callService("react", "delete_reaction", {
        entity_id: entityId,
    });
};

export const reactNow = (
    hass: HomeAssistant,
    entityId: string
) => {
    hass.callService("react", "react_now", {
        entity_id: entityId,
    });
};
