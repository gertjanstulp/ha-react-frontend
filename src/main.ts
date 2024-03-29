import "../homeassistant-frontend/src/resources/ha-style";
import "../homeassistant-frontend/src/resources/roboto";
import "./react-router";

import { html, PropertyValues, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { navigate } from "../homeassistant-frontend/src/common/navigate";
import { ReactElement } from "./react";
import { LocationChangedEvent } from "./data/common";
import { reactStyleVariables } from "./styles/variables";
import { ReactStyles } from "./styles/react-common-style";
import { mainWindow } from "../homeassistant-frontend/src/common/dom/get_main_window";
import { isNavigationClick } from "../homeassistant-frontend/src/common/dom/is-navigation-click";
import { applyThemesOnElement } from "../homeassistant-frontend/src/common/dom/apply_themes_on_element";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
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
                
        if (this.route.path === "") {
            navigate("/react/entry", { replace: true });
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

    protected render(): TemplateResult | void {
        if (!this.hass || !this.react) {
            return html``;
        }

        return html`
            <react-router
                .hass=${this.hass}
                .react=${this.react}
                .route=${this.route}
                .narrow=${this.narrow}
            ></react-router>
        `;
    }
    
    protected updatePageEl(el) {
        const hass = this.hass;

        el.hass = hass;
        el.react = this.react;
        el.route = this.route;
        el.narrow = this.narrow;
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
        options = this.hass.selectedTheme;
        if (themeName === "default" && options?.dark === undefined) {
            options = {
                ...this.hass.selectedTheme,
            };
        }
    
        if (this.parentElement) {
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
  