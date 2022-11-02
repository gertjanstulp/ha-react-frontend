import { UnsubscribeFunc } from "home-assistant-js-websocket";
import { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators";
import { HassRouterPage, RouterOptions } from "../../homeassistant-frontend/src/layouts/hass-router-page";
import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import "./react-run-panel";
import {React} from "../data/react"
import { subscribeRunRegistry } from "../data/websocket";
import { Run } from "../data/entities";

@customElement("react-run-router")
class ReactRunRouter extends HassRouterPage {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public react!: React;

    @property() public isWide!: boolean;
    
    @property() public narrow!: boolean;

    @state()
    private _runs: Run[] = [];

    private _unsubs?: UnsubscribeFunc[];
    
    protected routerOptions: RouterOptions = {
        defaultPage: "dashboard",
        routes: {
            dashboard: {
                tag: "react-run-panel",
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
        pageEl.runs = this._runs;
        pageEl.route = this.routeTail;
        pageEl.narrow = this.narrow;
        pageEl.isWide = this.isWide;
    }
    
    private _loadData() {
        if (this._unsubs) {
            return;
        }
        this._unsubs = [
            subscribeRunRegistry(this.hass.connection, (entries) => {
                this._runs = entries;
            }),
        ];
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "react-run-router": ReactRunRouter;
    }
}
