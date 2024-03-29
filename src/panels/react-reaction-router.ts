import { UnsubscribeFunc } from "home-assistant-js-websocket";
import { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators";
import { HassRouterPage, RouterOptions } from "../../homeassistant-frontend/src/layouts/hass-router-page";
import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import "./react-reaction-panel";
import {React} from "../data/react"
import { subscribeReactionRegistry } from "../data/websocket";
import { Reaction } from "../data/entities";

@customElement("react-reaction-router")
class ReactReactionRouter extends HassRouterPage {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public react!: React;

    @property() public isWide!: boolean;
    
    @property() public narrow!: boolean;

    @state()
    private _reactions: Reaction[] = [];

    private _unsubs?: UnsubscribeFunc[];
    
    protected routerOptions: RouterOptions = {
        defaultPage: "dashboard",
        routes: {
            dashboard: {
                tag: "react-reaction-panel",
                cache: true,
            },
        },
    };

    public connectedCallback() {
        super.connectedCallback();
    
        if (!this.hass) {
            return;
        }
        this._loadData();
    }
    
    public disconnectedCallback() {
        super.disconnectedCallback();
        if (this._unsubs) {
            while (this._unsubs.length) {
                this._unsubs.pop()!();
            }
            this._unsubs = undefined;
        }
    }
    
    protected firstUpdated(changedProps) {
        super.firstUpdated(changedProps);
        this.addEventListener("hass-reload-entries", () => {
            this._loadData();
        });
    }
    
    protected updated(changedProps: PropertyValues) {
        super.updated(changedProps);
        if (!this._unsubs && changedProps.has("hass")) {
            this._loadData();
        }
    }
    
    protected updatePageEl(pageEl, changedProps: PropertyValues) {
        pageEl.hass = this.hass;
        pageEl.react = this.react;
        pageEl.reactions = this._reactions;
        pageEl.route = this.routeTail;
        pageEl.narrow = this.narrow;
        pageEl.isWide = this.isWide;
    }
    
    private _loadData() {
        if (this._unsubs) {
            return;
        }
        this._unsubs = [
            subscribeReactionRegistry(this.hass.connection, (entries) => {
                this._reactions = entries;
            }),
        ];
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "react-reaction-router": ReactReactionRouter;
    }
}
