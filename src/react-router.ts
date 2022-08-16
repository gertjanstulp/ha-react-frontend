import { css, CSSResultGroup, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators";
import { listenMediaQuery } from "../homeassistant-frontend/src/common/dom/media_query";
import { HassRouterPage, RouterOptions } from "../homeassistant-frontend/src/layouts/hass-router-page";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { React } from "./data/react";

@customElement("react-router")
class ReactRouter extends HassRouterPage {
    @property({ attribute: false }) public react?: React;

    @property({ attribute: false }) public hass!: HomeAssistant;
  
    @property({ attribute: false }) public route!: Route;
  
    @property({ type: Boolean }) public narrow!: boolean;
    
    protected routerOptions: RouterOptions = {
        defaultPage: "entry",
        routes: {
            entry: {
                tag: "react-entry-panel",
                load: () => import("./panels/react-entry-panel"),
            },
            workflow: {
                tag: "react-workflow-router",
                load: () => import("./panels/react-workflow-router"),
            },
            reaction: {
                tag: "react-reaction-router",
                load: () => import("./panels/react-reaction-router"),
            },
        },
    };

    @state() private _wideSidebar = false;

    @state() private _wide = false;

    private _listeners: Array<() => void> = [];

    public connectedCallback() {
        super.connectedCallback();
        this._listeners.push(
            listenMediaQuery("(min-width: 1040px)", (matches) => {
                this._wide = matches;
            })
        );
        this._listeners.push(
            listenMediaQuery("(min-width: 1296px)", (matches) => {
                this._wideSidebar = matches;
            })
        );
    }

    public disconnectedCallback() {
        super.disconnectedCallback();
        while (this._listeners.length) {
            this._listeners.pop()!();
        }
    }
    
    protected firstUpdated(changedProps: PropertyValues) {
        super.firstUpdated(changedProps);
        this.hass.loadBackendTranslation("title");
        
        this.style.setProperty("--app-header-background-color", "var(--sidebar-background-color)");
        this.style.setProperty("--app-header-text-color", "var(--sidebar-text-color)");
        this.style.setProperty("--app-header-border-bottom", "1px solid var(--divider-color)");
        this.style.setProperty("--ha-card-border-radius", "var(--ha-config-card-border-radius, 8px)");
    }

    protected updatePageEl(el) {
        const isWide = this.hass.dockedSidebar === "docked" ? this._wideSidebar : this._wide;
        el.hass = this.hass;
        el.react = this.react;
        el.route = this.routeTail;
        el.isWide = isWide;
        el.narrow = this.narrow;
    }

    static get styles(): CSSResultGroup {
        return [
            haStyle,
            css`
                <style>
                    app-drawer {
                        --app-drawer-content-container: {
                            background-color: var(--primary-background-color, #fff);
                        }
                    }
                </style>`
        ]
    }    
}

declare global {
    interface HTMLElementTagNameMap {
        "react-router": ReactRouter;
    }
}
  