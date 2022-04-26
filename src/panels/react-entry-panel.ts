import "@material/mwc-button/mwc-button";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import "../../homeassistant-frontend/src/components/ha-alert";
import "../../homeassistant-frontend/src/components/ha-card";
import "../../homeassistant-frontend/src/components/ha-menu-button";
import "../../homeassistant-frontend/src/components/ha-svg-icon";
import "../../homeassistant-frontend/src/layouts/ha-app-layout";
import "../../homeassistant-frontend/src/panels/config/dashboard/ha-config-navigation";
import "../../homeassistant-frontend/src/panels/config/ha-config-section";

import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { haStyle } from "../../homeassistant-frontend/src/resources/styles";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import { React } from "../data/react";
import { ReactStyles } from "../styles/react-common-style";

@customElement("react-entry-panel")
export class ReactEntryPanel extends LitElement {
    @property({ attribute: false }) public react!: React;

    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public route!: Route;

    @property({ type: Boolean, reflect: true })
    public narrow!: boolean;

    @property({ type: Boolean }) public isWide!: boolean;

    protected render(): TemplateResult | void {
        // const updates: Repository[] = [];
        // const messages: Message[] = [];
    
        this.dispatchEvent(
            new CustomEvent("update-react", {
                detail: {  },
                bubbles: true,
                composed: true,
            })
        );

        return html`
            <ha-app-layout>
                <app-header fixed slot="header">
                    <app-toolbar>
                        <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
                        <div main-title>${this.narrow ? "React" : "Reactive automation framework"}</div>
                    </app-toolbar>
                </app-header>
            </ha-app-layout>
        `;  
    }

    static get styles(): CSSResultGroup {
        return [
            haStyle,
            ReactStyles,
            css`
                :host(:not([narrow])) ha-card:last-child {
                    margin-bottom: 24px;
                }
                ha-config-section {
                    margin: auto;
                    margin-top: -32px;
                    max-width: 600px;
                    color: var(--secondary-text-color);
                }
                ha-card {
                    overflow: hidden;
                }
                ha-card a {
                    text-decoration: none;
                    color: var(--primary-text-color);
                }
                .title {
                    font-size: 16px;
                    padding: 16px;
                    padding-bottom: 0;
                }
                :host([narrow]) ha-card {
                    border-radius: 0;
                    box-shadow: unset;
                }
        
                :host([narrow]) ha-config-section {
                    margin-top: -42px;
                }
                .icon-background {
                    border-radius: 50%;
                }
                .icon-background ha-svg-icon {
                    color: #fff;
                }
                .title {
                    font-size: 16px;
                    padding: 16px;
                    padding-bottom: 0;
                }
                ha-svg-icon,
                ha-icon-next {
                    color: var(--secondary-text-color);
                    height: 24px;
                    width: 24px;
                }
                ha-svg-icon {
                    padding: 8px;
                }
        
                .list-item-icon > * {
                    height: 40px;
                    width: 40px;
                    padding: 0;
                }
                img {
                    border-radius: 50%;
                }
                .list-item {
                    width: 100%;
                    cursor: pointer;
                    display: flex;
                    padding: 16px;
                }
                .list-item-icon {
                    margin-right: 16px;
                }
                .list-item-header {
                    font-size: 16px;
                }
                .list-item-description {
                    color: var(--secondary-text-color);
                    margin-right: 16px;
                }
                .list-item ha-icon-next,
                .list-item ha-svg-icon[right] {
                    right: 0;
                    padding: 16px;
                    position: absolute;
                }
          `,
        ]
    }
}