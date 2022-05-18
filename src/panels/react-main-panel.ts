import {
    mdiRobot,
    mdiScriptText,
} from "@mdi/js";
import { PolymerElement } from "@polymer/polymer";
import { css, CSSResultGroup, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators";
import { listenMediaQuery } from "../../homeassistant-frontend/src/common/dom/media_query";
import { HassRouterPage, RouterOptions } from "../../homeassistant-frontend/src/layouts/hass-router-page";
import { PageNavigation } from "../../homeassistant-frontend/src/layouts/hass-tabs-subpage";
import { haStyle } from "../../homeassistant-frontend/src/resources/styles";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import { React } from "../data/react";

export const reactSections: { [name: string]: PageNavigation[] } = {
    react: [
        {
            path: "/react/workflow",
            name: "workflows",
            iconPath: mdiRobot,
            iconColor: "#518C43",
        },
        {
            path: "/react/reaction",
            name: "reactions",
            iconPath: mdiScriptText,
            iconColor: "#518C43",
        },
    ],
};

@customElement("react-main-panel")
class ReactMainPanel extends HassRouterPage {
    @property({ attribute: false }) public react?: React;

    @property({ attribute: false }) public hass!: HomeAssistant;
  
    @property({ attribute: false }) public route!: Route;
  
    @property({ type: Boolean }) public narrow!: boolean;
    
    protected routerOptions: RouterOptions = {
        defaultPage: "workflow",
            routes: {
            workflow: {
                tag: "react-workflow-router",
                load: () => import("./react-workflow-router"),
            },
            reaction: {
                tag: "react-reaction-router",
                load: () => import("./react-reaction-router"),
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
        
        this.style.setProperty(
            "--app-header-background-color",
            "var(--sidebar-background-color)"
        );
        this.style.setProperty(
            "--app-header-text-color",
            "var(--sidebar-text-color)"
        );
        this.style.setProperty(
            "--app-header-border-bottom",
            "1px solid var(--divider-color)"
        );
    }

    protected updatePageEl(el) {
        const isWide =
            this.hass.dockedSidebar === "docked" ? this._wideSidebar : this._wide;
        if ("setProperties" in el) {
            // As long as we have Polymer panels
            (el as PolymerElement).setProperties({
                hass: this.hass,
                react: this.react,
                route: this.routeTail,
                isWide,
                narrow: this.narrow,
                showAdvanced: Boolean(this.hass.userData?.showAdvanced),
            });
        } else {
            el.hass = this.hass;
            el.react = this.react;
            el.route = this.routeTail;
            el.isWide = isWide;
            el.narrow = this.narrow;
            el.showAdvanced = Boolean(this.hass.userData?.showAdvanced);
        }
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
        "react-main-panel": ReactMainPanel;
    }
}
  