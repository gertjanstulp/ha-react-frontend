export class ReactLogger {
    prefix: string;

    constructor(name?: string) {
        if (name) {
            this.prefix = `[React.${name}]`;
        } else {
            this.prefix = `[React]`;
        }
    }

    public info(content: string | unknown) {
        this.log(content);
    }

    public log(content: string | unknown) {
        console.log(this.prefix, content);
    }

    public debug(content: string | unknown) {
        console.debug(this.prefix, content);
    }

    public warn(content: string | unknown) {
        console.warn(this.prefix, content);
    }

    public error(content: string | unknown) {
        console.error(this.prefix, content);
    }
}
