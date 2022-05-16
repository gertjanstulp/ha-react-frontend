import { LitElement, PropertyValues } from "lit";
import { property } from "lit/decorators";
import { HASSDomEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import { showDialog } from "../homeassistant-frontend/src/dialogs/make-dialog-manager";
import { MoreInfoDialogParams } from "../homeassistant-frontend/src/dialogs/more-info/ha-more-info-dialog";
import { ProvideHassLitMixin } from "../homeassistant-frontend/src/mixins/provide-hass-lit-mixin";
import { React } from "./data/react";
import { localize } from "./localize/localize";
import { ReactLogger } from "./tools/react-logger";

export class ReactElement extends ProvideHassLitMixin(LitElement) {
    @property({ attribute: false }) public react!: React;

    protected firstUpdated(changedProps: PropertyValues) {
        super.firstUpdated(changedProps);
        this.addEventListener("hass-more-info", (ev) => this._handleMoreInfo(ev));
  
        // Load it once we are having the initial rendering done.
        import("../homeassistant-frontend/src/dialogs/more-info/ha-more-info-dialog");
    }

    private async _handleMoreInfo(ev) {
        showDialog(
            this,
            this.shadowRoot!,
            "ha-more-info-dialog",
            {
                entityId: ev.detail.entityId,
            },
            () => import("../homeassistant-frontend/src/dialogs/more-info/ha-more-info-dialog")
        );
    }

    public connectedCallback() {
        super.connectedCallback();

        if (this.react === undefined) {
            this.react = {
                language: "en",
                messages: [],
                updates: [],
                resources: [],
                workflows: [],
                removed: [],
                configuration: {} as any,
                status: {} as any,
                localize: (string: string, replace?: Record<string, any>) =>
                    localize(this.react?.language || "en", string, replace),
                log: new ReactLogger(),
            };
        }

        this.addEventListener("update-react", (e) =>
            this._updateReact((e as any).detail as Partial<React>)
        );
    }

    protected _updateReact(obj: Partial<React>) {
        let shouldUpdate = false;

        Object.keys(obj).forEach((key) => {
            if (JSON.stringify(this.react[key]) !== JSON.stringify(obj[key])) {
                shouldUpdate = true;
            }
        });

        if (shouldUpdate) {
            this.react = { ...this.react, ...obj };
        }
    }

    protected updated(changedProps: PropertyValues) {
        super.updated(changedProps);
        if (this.react.language && this.react.configuration) {
        }
    }
}
