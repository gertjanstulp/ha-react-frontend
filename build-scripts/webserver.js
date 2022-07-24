const http = require("http");
const handler = require("serve-handler");
const log = require("fancy-log");

const createServer = function() {
    const server = http.createServer((request, response) => {
        return handler(request, response, {
            public: "./react_frontend/",
        });
    });

    server.listen(5000, true, () => {
        log.info("File will be served to http://127.0.0.1:5000/entrypoint.js");
    });
}

module.exports = {
    create_server: createServer
}