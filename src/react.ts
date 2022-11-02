import { LitElement, PropertyValues } from "lit";
import { property } from "lit/decorators";
import { showDialog } from "../homeassistant-frontend/src/dialogs/make-dialog-manager";
import { HomeAssistant } from "../homeassistant-frontend/src/types";
import { React } from "./data/react";
import { localize } from "./localize/localize";
import { sectionsEnabled } from "./panels/react-sections";
import { ReactLogger } from "./tools/react-logger";
import { computeRTLDirection, setDirectionStyles } from "../homeassistant-frontend/src/common/util/compute_rtl";

export class ReactElement extends LitElement {
    private _customElementsDefine: ((name: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions) => void) = function() {}

    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public react!: React;

    private __provideHass: HTMLElement[] = [];
    
    protected firstUpdated(changedProps: PropertyValues) {
        super.firstUpdated(changedProps);
        this.addEventListener("hass-more-info", (ev) => this._handleMoreInfo(ev));
        
        // Load it once we are having the initial rendering done.
        import("./dialogs/react-details-dialog")
    }
    
    private async _handleMoreInfo(ev) {
        showDialog(
            this,
            this.shadowRoot!,
            "react-details-dialog",
            {
                entityId: ev.detail.entityId,
                react: this.react
            },
            () => import("./dialogs/react-details-dialog")
        );
    }
        
    public disconnectedCallback(): void {
        super.disconnectedCallback() 
        
        // Recover the original define method
        window.customElements.define = this._customElementsDefine      
    }
    
    public connectedCallback() {
        super.connectedCallback();
        
        // For some reason the default 'define' method used for registering
        // modules breaks when the same module is registered twice. Replace
        // the default implementation with one that checks this.
        this._customElementsDefine = window.customElements.define;
        const that = this
        window.customElements.define = function(name, clazz, config) {
            if (!customElements.get(name)) {
                if (that._customElementsDefine)
                that._customElementsDefine.call(window.customElements, name, clazz, config);
            }
        }
        
        if (this.react === undefined) {
            this.react = {
                language: "en",
                sections: [],
                configuration: {} as any,
                status: {} as any,
                localize: (string: string, replace?: Record<string, any>) =>
                    localize(this.react?.language || "en", string, replace),
                log: new ReactLogger(),
            };
        }
        
        // this.addEventListener("update-react", (e) =>
        //     this._updateReact((e as any).detail as Partial<React>)
        // );
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
        
        // Implements 'provide-hass' behavior as required by showDialog method
        if (changedProps.has("hass")) {
            this.__provideHass.forEach((el) => {
                (el as any).hass = this.hass;
            });

            this.setRtl()
        }
        
        if (this.react.language && this.react.configuration) {
            this.react.sections = sectionsEnabled(this.react.language, this.react.configuration);
        }
    }

    private setRtl() {
        document.querySelector("html")!.setAttribute("lang", this.hass.language);
        const direction = computeRTLDirection(this.hass);
        document.dir = direction;
        setDirectionStyles(direction, this);
    }

    // Implements 'provide-hass' behavior as required by showDialog method
    public provideHass(el) {
        this.__provideHass.push(el);
        el.hass = this.hass;
    }
}
