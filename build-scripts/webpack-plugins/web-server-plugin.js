const webserver = require("../webserver");

class WebServerPlugin {
    apply(compiler) {
        if (compiler.hooks && compiler.hooks.done) {
            compiler.hooks.done.tap('StartWebServer', () => {
                webserver.create_server()
            });
        }
    }
}

module.exports = {
    WebServerPlugin: WebServerPlugin
}