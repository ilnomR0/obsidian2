var http = require('http');
var url = require('url');
var fs = require('fs');
let serverHelperInitializer = require("../serverHelperInitializer");

serverHelperInitializer.createServer(8080, "./web.json", (port, settings, server) => {
    console.log("the client server has been created");
});
serverHelperInitializer.createServer(80, "./web.json", (port, settings, server) => {
    console.log("the admin server has been created");
});
