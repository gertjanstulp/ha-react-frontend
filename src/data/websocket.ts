import { Connection, createCollection } from "home-assistant-js-websocket";
import { Store } from "home-assistant-js-websocket/dist/store";
import { stringCompare } from "../../homeassistant-frontend/src/common/string/compare";
import { debounce } from "../../homeassistant-frontend/src/common/util/debounce";
import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import { ReactDispatchEvent } from "./common";
import { Reaction, Run } from "./entities";
import { WorkflowTrace, WorkflowTraceExtended } from "./trace";

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
    
// Runs //
    
const fetchRunRegistry = (conn: Connection) =>
    conn.sendMessagePromise({
        type: "react/run/list",
    })
    .then((runs) =>
        (runs as Run[]).sort((ent1, ent2) =>
            stringCompare(ent1.id, ent2.id)
        )
    );

const subscribeRunRegistryUpdates = (
    conn: Connection,
    store: Store<Run[]>
) =>
    conn.subscribeEvents(
        debounce(
            () =>
                fetchRunRegistry(conn).then((runs: Run[]) =>
                    store.setState(runs, true)
                ),
            500,
            true
        ),
        "run_registry_updated"
);

export const subscribeRunRegistry = (
    conn: Connection,
    onChange: (runs: Run[]) => void
) =>
    createCollection<Run[]>(
      "_runRegistry",
      fetchRunRegistry,
      subscribeRunRegistryUpdates,
      conn,
      onChange
    );

// Reactions //

const fetchReactionRegistry = (conn: Connection) =>
    conn.sendMessagePromise({
        type: "react/reaction/list",
    })
    .then((reactions) =>
        (reactions as Reaction[]).sort((ent1, ent2) =>
            stringCompare(ent1.id, ent2.id)
        )
    );

const subscribeReactionRegistryUpdates = (
    conn: Connection,
    store: Store<Reaction[]>
) =>
    conn.subscribeEvents(
        debounce(
            () =>
                fetchReactionRegistry(conn).then((reactions: Reaction[]) =>
                    store.setState(reactions, true)
                ),
            500,
            true
        ),
        "reaction_registry_updated"
);

export const subscribeReactionRegistry = (
    conn: Connection,
    onChange: (reactions: Reaction[]) => void
) =>
    createCollection<Reaction[]>(
      "_reactionRegistry",
      fetchReactionRegistry,
      subscribeReactionRegistryUpdates,
      conn,
      onChange
    );