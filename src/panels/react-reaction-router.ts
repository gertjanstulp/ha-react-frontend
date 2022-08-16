import { HassEntities } from "home-assistant-js-websocket";
import { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators";
import memoizeOne from "memoize-one";
import { computeStateDomain } from "../../homeassistant-frontend/src/common/entity/compute_state_domain";
import { debounce } from "../../homeassistant-frontend/src/common/util/debounce";
import { HassRouterPage, RouterOptions } from "../../homeassistant-frontend/src/layouts/hass-router-page";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import { ReactionEntity } from "../data/entities";
import "./react-reaction-panel";
import {React} from "../data/react"

const equal = (a: ReactionEntity[], b: ReactionEntity[]): boolean => {
    if (a.length !== b.length) {
        return false;
    }
    return a.every((reaction, index) => reaction === b[index]);
};

@customElement("react-reaction-router")
class ReactReactionRouter extends HassRouterPage {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public react!: React;

    @property() public isWide!: boolean;
    
    @property() public narrow!: boolean;

    private _debouncedUpdateReactions = debounce((pageEl) => {
        const newReactions = this._getReactions(this.hass.states);
        if (!equal(newReactions, pageEl.reactions)) {
            pageEl.reactions = newReactions;
        }
    }, 10);

    protected routerOptions: RouterOptions = {
        defaultPage: "dashboard",
        routes: {
            dashboard: {
                tag: "react-reaction-panel",
                cache: true,
            },
        },
    };

    private _getReactions = memoizeOne(
        (states: HassEntities): ReactionEntity[] =>
            Object.values(states).filter(
            (entity) =>
                computeStateDomain(entity) === "sensor" &&
                !entity.attributes.restored &&
                "workflow_id" in entity.attributes
            ) as ReactionEntity[]
    );

    protected updatePageEl(pageEl, changedProps: PropertyValues) {
        pageEl.hass = this.hass;
        pageEl.react = this.react;
        pageEl.route = this.routeTail;
        pageEl.narrow = this.narrow;
        pageEl.isWide = this.isWide;

        if (this.hass) {
            if (!pageEl.reactions || !changedProps) {
                pageEl.reactions = this._getReactions(this.hass.states);
            } else if (changedProps.has("hass")) {
                this._debouncedUpdateReactions(pageEl);
            }
        }

        if (
            (!changedProps || changedProps.has("route")) &&
            this._currentPage !== "dashboard"
        ) {
            const reactionId = decodeURIComponent(this.routeTail.path.substr(1));
            pageEl.reactionId = reactionId === "new" ? null : reactionId;
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "react-reaction-router": ReactReactionRouter;
    }
}
