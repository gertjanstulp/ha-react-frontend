import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import { Workflow, Configuration, Status, Message } from "./common";

export interface React {
    language: string;
    messages: Message[];
    updates: any[];
    resources: any[];
    workflows: Workflow[];
    removed: any[];
    configuration: Configuration;
    status: Status;
    localize(string: string, replace?: Record<string, any>): string;
    log: any;
}

export const triggerWorkflow = (
    hass: HomeAssistant,
    entityId: string
  ) => {
    hass.callService("react", "trigger", {
      entity_id: entityId,
    });
  };