import "@material/mwc-button/mwc-button";
import "@material/mwc-list/mwc-list";
import { mdiInformation } from "@mdi/js";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import "../../homeassistant-frontend/src/components/ha-alert";
import "../../homeassistant-frontend/src/components/ha-card";
import "../../homeassistant-frontend/src/components/ha-clickable-list-item";
import "../../homeassistant-frontend/src/components/ha-menu-button";
import "../../homeassistant-frontend/src/components/ha-svg-icon";
import "../../homeassistant-frontend/src/layouts/ha-app-layout";
import "../../homeassistant-frontend/src/panels/config/dashboard/ha-config-navigation";
import "../../homeassistant-frontend/src/panels/config/ha-config-section";
import { haStyle } from "../../homeassistant-frontend/src/resources/styles";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import { showDialogAbout } from "../dialogs/react-about-dialog";
import "../custom/ha-top-app-bar-fixed-custom"

import { React } from "../data/react"
// import { reactSections } from "../react-router";
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
        return html`
            <ha-top-app-bar-fixed-custom>
                <div slot="title">${this.narrow ? "React" : "React simplified automations"}</div>
                <ha-config-section .narrow=${this.narrow} .isWide=${this.isWide} full-width>
                    <ha-card outlined>
                        <mwc-list>
                            ${this.react.sections.map(
                                (page) => html`
                                    <ha-clickable-list-item
                                        graphic="avatar"
                                        twoline
                                        .hasMeta=${!this.narrow}
                                        href=${page.path}>
                                        <div
                                            slot="graphic"
                                            class=${page.iconColor ? "icon-background" : ""}
                                            .style="background-color: ${page.iconColor || "undefined"}">
                                            <ha-svg-icon .path=${page.iconPath}></ha-svg-icon>
                                        </div>
                                        <span>${page.name}</span>
                                        <span slot="secondary">${page.description}</span>
                                        ${!this.narrow ? html`<ha-icon-next slot="meta"></ha-icon-next>` : ""}
                                    </ha-clickable-list-item>
                                `
                            )}
                            <ha-clickable-list-item
                                graphic="avatar"
                                twoline
                                @click=${this._openAboutDialog}
                                disableHref>
                                <div
                                    class="icon-background"
                                    slot="graphic"
                                    style="background-color: rgb(74, 89, 99)">
                                    <ha-svg-icon .path=${mdiInformation}></ha-svg-icon>
                                </div>
                                <span>${this.react.localize(`sections.about.title`)}</span>
                                <span slot="secondary">${this.react.localize(`sections.about.description`)}</span>
                            </ha-clickable-list-item>
                        </mwc-list>
                    </ha-card>
                </ha-config-section>
          </ha-top-app-bar-fixed-custom>
        `;
    }

    private async _openAboutDialog() {
        showDialogAbout(this, this.react);
    }

    static get styles(): CSSResultGroup {
        return [
            haStyle,
            ReactStyles,
            css`
                :host {
                  --mdc-list-vertical-padding: 0;
                }
                ha-card:last-child {
                  margin-bottom: env(safe-area-inset-bottom);
                }
                :host(:not([narrow])) ha-card:last-child {
                  margin-bottom: max(24px, env(safe-area-inset-bottom));
                }
                ha-config-section {
                  margin: auto;
                  margin-top: -32px;
                  max-width: 600px;
                }
                ha-card {
                  overflow: hidden;
                }
                ha-card a {
                  text-decoration: none;
                  color: var(--primary-text-color);
                }
                a.button {
                  display: block;
                  color: var(--primary-color);
                  padding: 16px;
                }
                .title {
                  font-size: 16px;
                  padding: 16px;
                  padding-bottom: 0;
                }

                @media all and (max-width: 600px) {
                  ha-card {
                    border-width: 1px 0;
                    border-radius: 0;
                    box-shadow: unset;
                  }
                  ha-config-section {
                    margin-top: -42px;
                  }
                }

                ha-svg-icon,
                ha-icon-next {
                  color: var(--secondary-text-color);
                  height: 24px;
                  width: 24px;
                  display: block;
                }
                ha-svg-icon {
                  padding: 8px;
                }
                .icon-background {
                  border-radius: 50%;
                }
                .icon-background ha-svg-icon {
                  color: #fff;
                }
                ha-clickable-list-item {
                  cursor: pointer;
                  font-size: 16px;
                  padding: 0;
                }
            `,
        ];
    }
}
