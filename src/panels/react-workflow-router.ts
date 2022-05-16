import { HassEntities } from "home-assistant-js-websocket";
import { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators";
import memoizeOne from "memoize-one";
import { computeStateDomain } from "../../homeassistant-frontend/src/common/entity/compute_state_domain";
import { debounce } from "../../homeassistant-frontend/src/common/util/debounce";
import { HassRouterPage, RouterOptions } from "../../homeassistant-frontend/src/layouts/hass-router-page";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import { WorkflowEntity } from "../data/entities";
import "./react-workflow-panel";
import {React} from "../data/react"

const equal = (a: WorkflowEntity[], b: WorkflowEntity[]): boolean => {
if (a.length !== b.length) {
return false;
}
return a.every((workflow, index) => workflow === b[index]);
};

@customElement("react-workflow-router")
class ReactWorkflowRouter extends HassRouterPage {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public react!: React;

    @property() public route!: Route;
    
    @property() public isWide!: boolean;
    
    @property() public narrow!: boolean;

    @property() public showAdvanced!: boolean;

    private _debouncedUpdateWorkflows = debounce((pageEl) => {
        const newWorkflows = this._getWorkflows(this.hass.states);
        if (!equal(newWorkflows, pageEl.workflows)) {
            pageEl.workflows = newWorkflows;
        }
    }, 10);

    protected routerOptions: RouterOptions = {
        defaultPage: "dashboard",
        routes: {
            dashboard: {
                tag: "react-workflow-panel",
                load: () => import("./react-workflow-panel"),
            },
            //   edit: {
            //     tag: "ha-automation-editor",
            //   },
              trace: {
                tag: "react-workflow-trace",
                load: () => import("./react-workflow-trace"),
              },
            },
    };

    private _getWorkflows = memoizeOne(
        (states: HassEntities): WorkflowEntity[] =>
            Object.values(states).filter(
            (entity) =>
                computeStateDomain(entity) === "react" &&
                !entity.attributes.restored
            ) as WorkflowEntity[]
    );

    protected firstUpdated(changedProps) {
        super.firstUpdated(changedProps);
        this.hass.loadBackendTranslation("device_automation");
    }

    protected updatePageEl(pageEl, changedProps: PropertyValues) {
        pageEl.hass = this.hass;
        pageEl.react = this.react;
        pageEl.route = this.routeTail;
        pageEl.narrow = this.narrow;
        pageEl.isWide = this.isWide;
        pageEl.showAdvanced = this.showAdvanced;

        if (this.hass) {
            if (!pageEl.workflows || !changedProps) {
                pageEl.workflows = this._getWorkflows(this.hass.states);
            } else if (changedProps.has("hass")) {
                this._debouncedUpdateWorkflows(pageEl);
            }
        }

        if (
            (!changedProps || changedProps.has("route")) &&
            this._currentPage !== "dashboard"
        ) {
            const workflowId = decodeURIComponent(this.routeTail.path.substr(1));
            pageEl.workflowId = workflowId === "new" ? null : workflowId;
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "react-workflow-router": ReactWorkflowRouter;
    }
}
