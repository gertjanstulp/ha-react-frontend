import "../homeassistant-frontend/src/resources/ha-style";
import "./panels/react-main-panel";

import { html, PropertyValues, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { navigate } from "../homeassistant-frontend/src/common/navigate";
import { ReactElement } from "./react";
import { LocationChangedEvent, ReactDispatchEvent } from "./data/common";
import { reactStyleVariables } from "./styles/variables";
import { ReactStyles } from "./styles/react-common-style";
import { mainWindow } from "../homeassistant-frontend/src/common/dom/get_main_window";
import { isNavigationClick } from "../homeassistant-frontend/src/common/dom/is-navigation-click";
import { getStatus, websocketSubscription } from "./data/websocket";
import { applyThemesOnElement } from "../homeassistant-frontend/src/common/dom/apply_themes_on_element";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import { PolymerElement } from "@polymer/polymer";
import { makeDialogManager } from "../homeassistant-frontend/src/dialogs/make-dialog-manager";

@customElement("react-frontend")
class ReactFrontend extends ReactElement {
    @property({ attribute: false }) public narrow!: boolean;

    @property({ attribute: false }) public route!: Route;

    protected firstUpdated(changedProps) {
        super.firstUpdated(changedProps);
        
        this._applyTheme();

        this.react.language = this.hass.language;
        this.addEventListener("react-location-changed", (e) =>
            this._setRoute(e as LocationChangedEvent)
        );
        
        websocketSubscription(
            this.hass,
            () => this._updateProperties("status"),
            ReactDispatchEvent.STATUS
        );
        
        this.hass.connection.subscribeEvents(
            async () => this._updateProperties("lovelace"),
                "lovelace_updated"
        );
        this._updateProperties();
        if (this.route.path === "") {
            navigate("/react/workflows", { replace: true });
        }
   
        window.addEventListener("haptic", (ev) => {
            // @ts-ignore
            fireEvent(window.parent, ev.type, ev.detail, {
            bubbles: false,
            });
        });
  
        document.body.addEventListener("click", (ev) => {
            const href = isNavigationClick(ev);
            if (href) {
                navigate(href);
            }
        });
  
        mainWindow.addEventListener("location-changed", (ev) =>
            // @ts-ignore
            fireEvent(this, ev.type, ev.detail, {
            bubbles: false,
            })
        );

        makeDialogManager(this, this.shadowRoot!);
    }
    
    protected updated(changedProps: PropertyValues) {
        super.updated(changedProps);
        const oldHass = changedProps.get("hass") as HomeAssistant | undefined;
        if (!oldHass) {
            return;
        }
        if (oldHass.themes !== this.hass.themes) {
            this._applyTheme();
        }
    }

    private async _updateProperties(prop = "all") {
        const _updates: any = {};
        const _fetch: any = {};

        if (prop === "all") {
            [
                _fetch.status,
            ] = await Promise.all([
                getStatus(this.hass),
            ]);
        } else if (prop === "status") {
            _fetch.status = await getStatus(this.hass);
        }

        Object.keys(_fetch).forEach((update) => {
            if (_fetch[update] !== undefined) {
                _updates[update] = _fetch[update];
            }
        });
        if (_updates) {
            this._updateReact(_updates);
        }
    }

    protected render(): TemplateResult | void {
        if (!this.hass || !this.react) {
            return html``;
        }

        return html`
            <react-main-panel
                .hass=${this.hass}
                .react=${this.react}
                .route=${this.route}
                .narrow=${this.narrow}
            ></react-main-panel>
        `;
    }
    
    protected updatePageEl(el) {
        const hass = this.hass;

        if ("setProperties" in el) {
            // As long as we have Polymer panels
            (el as PolymerElement).setProperties({
                hass: this.hass,
                react: this.react,
                route: this.route,
                narrow: this.narrow,
            });
        } else {
            el.hass = hass;
            el.react = this.react;
            el.route = this.route;
            el.narrow = this.narrow;
        }
    }

    static get styles() {
        return [ReactStyles, reactStyleVariables];
    }

    private _setRoute(ev: LocationChangedEvent): void {
        if (!ev.detail?.route) {
            return;
        }
        this.route = ev.detail.route;
        navigate(this.route.path, { replace: true });
        this.requestUpdate();
    }

    private _applyTheme() {
        let options: Partial<HomeAssistant["selectedTheme"]> | undefined;
        
        const themeName =
            this.hass.selectedTheme?.theme ||
            (this.hass.themes.darkMode && this.hass.themes.default_dark_theme
                ? this.hass.themes.default_dark_theme!
                : this.hass.themes.default_theme);
        console.log(themeName)
        options = this.hass.selectedTheme;
        if (themeName === "default" && options?.dark === undefined) {
            options = {
                ...this.hass.selectedTheme,
            };
        }
    
        if (this.parentElement) {
            console.log("apply theme")
            applyThemesOnElement(this.parentElement, this.hass.themes, themeName, {
                ...options,
                dark: this.hass.themes.darkMode,
            });
            this.parentElement.style.backgroundColor = "var(--primary-background-color)";
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "react-frontend": ReactFrontend;
    }
}
  