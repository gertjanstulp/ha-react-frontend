const webserver = require("../webserver");

class WebServerPlugin {
    server = null;

    apply(compiler) {
        if (compiler.hooks && compiler.hooks.done) {
            compiler.hooks.done.tap('StartWebServer', () => {
                this.server = webserver.create_server()
            });
        }
        if (compiler.hooks && compiler.hooks.beforeCompile) {
            compiler.hooks.beforeCompile.tap('StopWebServer', () => {
                if (this.server != null) {
                    this.server.close()
                }
            });
        }
    }
}

module.exports = {
    WebServerPlugin: WebServerPlugin
}