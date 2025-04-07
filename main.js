var http = require('http');
var url = require('url');
var fs = require('fs');
var serverHelper = require("./serverHelperInitializer.js");

serverHelper.newServer(8080, "./client", (port, settings, server) => {
    console.log(`the client server has been created on http://localhost:${port}`);
});