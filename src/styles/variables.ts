import { css } from "lit";

export const reactStyleVariables = css`
  :host {
    --hcv-color-error: var(--react-error-color, var(--error-color));
    --hcv-color-warning: var(--react-warning-color, var(--warning-color));
    --hcv-color-update: var(--react-update-color, var(--info-color));
    --hcv-color-new: var(--react-new-color, var(--success-color));
    --hcv-color-icon: var(--react--default-icon-color, var(--sidebar-icon-color));

    --hcv-color-markdown-background: var(--markdown-code-background-color, #f6f8fa);

    --hcv-text-color-primary: var(--primary-text-color);
    --hcv-text-color-on-background: var(--text-primary-color);
    --hcv-text-color-secondary: var(--secondary-text-color);
    --hcv-text-color-link: var(--link-text-color, var(--accent-color));

    --mdc-dialog-heading-ink-color: var(--hcv-text-color-primary);
    --mdc-dialog-content-ink-color: var(--hcv-text-color-primary);

    /*react-link*/
    --hcv-text-decoration-link: var(--react-link-text-decoration, none);
  }
`;
