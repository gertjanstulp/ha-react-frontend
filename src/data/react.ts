import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import { Configuration, Status } from "./common";

export interface React {
    language: string;
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

export const runNow = (
    hass: HomeAssistant,
    runId: string
) => {
    hass.callService("react", "run_now", {
        run_id: runId,
    });
};

export const deleteRun = (
    hass: HomeAssistant,
    runId: string
) => {
    hass.callService("react", "delete_run", {
        run_id: runId,
    });
};

export const reactNow = (
    hass: HomeAssistant,
    reactionId: string
) => {
    hass.callService("react", "react_now", {
        reaction_id: reactionId,
    });
};

export const deleteReaction = (
    hass: HomeAssistant,
    reactionId: string
) => {
    hass.callService("react", "delete_reaction", {
        reaction_id: reactionId,
    });
};