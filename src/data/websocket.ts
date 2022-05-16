import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import { ReactDispatchEvent, Status } from "./common";
import { WorkflowTrace, WorkflowTraceExtended } from "./trace";

export const getStatus = async (hass: HomeAssistant) => {
    const response = await hass.connection.sendMessagePromise<Status>({
        type: "react/status",
    });
    return response;
};

export const websocketSubscription = (
    hass: HomeAssistant,
    onChange: (result: Record<any, any> | null) => void,
    event: ReactDispatchEvent
) =>
    hass.connection.subscribeMessage(onChange, {
    type: "react/subscribe",
    signal: event,
});


interface TraceTypes {
    short: WorkflowTrace;
    extended: WorkflowTraceExtended;
}

export const loadTrace = (
    hass: HomeAssistant,
    workflow_id: string,
    run_id: string
): Promise<TraceTypes["extended"]> =>
    hass.callWS({
    type: "react/trace/get",
    workflow_id,
    run_id,
});

export const loadTraces = (
    hass: HomeAssistant,
    workflow_id: string
): Promise<Array<TraceTypes["short"]>> =>
    hass.callWS({
    type: "react/trace/list",
    workflow_id,
});
