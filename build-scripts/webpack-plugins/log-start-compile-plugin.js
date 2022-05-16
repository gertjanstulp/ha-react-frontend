const log = require("fancy-log");

class LogStartCompilePlugin {
    ignoredFirst = false;

    apply(compiler) {
        compiler.hooks.beforeCompile.tap("LogStartCompilePlugin", () => {
            if (!this.ignoredFirst) {
                this.ignoredFirst = true;
                return;
            }
            log("Changes detected. Starting compilation");
        });
    }
}

module.exports = {
    LogStartCompilePlugin: LogStartCompilePlugin
}