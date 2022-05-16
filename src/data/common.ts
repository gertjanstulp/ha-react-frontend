export interface Message {
    name: string;
    info: string;
    secondary?: string;
    severity?: "info" | "warning" | "error" | "success";
    path?: string;
    iconPath?: string;
    dialog?: string;
    workflow?: Workflow;
}

export interface Workflow {
    id: string;
}
  
export interface Configuration {
    categories: [string];
    country: string;
    debug: boolean;
    dev: string;
    experimental: boolean;
    frontend_compact: boolean;
    frontend_expected: string;
    frontend_mode: string;
    frontend_running: string;
    onboarding_done: boolean;
    version: string;
}

export interface Status {
    background_task: boolean;
    disabled: boolean;
    disabled_reason?: string;
    lovelace_mode: "storage" | "yaml" | "auto-gen";
    stage: "startup" | "waiting" | "running" | "setup";
    reloading_data: boolean;
    startup: boolean;
    manage_mode: boolean;
    upgrading_all: boolean;
    has_pending_tasks: boolean;
}

export interface Route {
    path: string;
    prefix: string;
}

export interface LocationChangedEvent {
    detail?: { route: Route; force?: boolean };
}

export enum ReactDispatchEvent {
    // CONFIG = "react_dispatch_config",
    // ERROR = "react_dispatch_error",
    // RELOAD = "react_dispatch_reload",
    // REPOSITORY = "react_dispatch_repository",
    // STAGE = "react_dispatch_stage",
    // STARTUP = "react_dispatch_startup",
    STATUS = "react_dispatch_status",
  }
  