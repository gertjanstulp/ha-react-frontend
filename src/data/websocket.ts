import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import { ReactDispatchEvent, Status } from "./common";

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
  