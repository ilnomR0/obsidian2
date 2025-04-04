var http = require('http');
var url = require('url');
var fs = require('fs');

/**
 * @callback serverCallback
 * @param port
 * @param settings
 * @param server
 */
/**
 * 
 * @param {number} port 
 * @param {string} rootFolder
 * @param {serverCallback} callback 
 */

function newServer(port, rootFolder, callback) {

    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };

    let web = require(`${rootFolder}/web.json`);

    let server = http.createServer(function (req, res) {

        var q = url.parse(req.url, true);
        var filename = `${rootFolder}${q.pathname}`;
        fs.readFile(filename, function (err, data) {

            console.log(`webpage being read from port ${port}, accessing ${filename}`);


            //checks if it's in 'hidden', returns 403

            if (web.hidden.includes(filename.replace(`${rootFolder}/`, ""))) {
                res.writeHead(403, { 'Content-Type': 'text/html' });
                console.log("\x1b[31m%s\x1b[0m", `error 403 accessing ${filename}, returning ${web.errors[403]}`)
                return res.end(fs.readFileSync(rootFolder + "/" + web.errors[403]));
            }

            //checks for aliases

            for (var i = 0; i < web.aliases.length; i++) {
                let alias = web.aliases[i];
                if (alias.alias == filename.replace(rootFolder + "/", "")) {
                    console.log(alias.location.split(".")[alias.location.split(".").length - 1]);
                    res.writeHead(200, { 'Content-Type': mimeTypes["." + alias.location.split(".")[alias.location.split(".").length - 1]] });
                    console.log("\x1b[32m%s\x1b[0m", `found alias "${alias.alias}"! changing ${filename} to ${alias.location}`);
                    res.write(fs.readFileSync(rootFolder + "/" +alias.location));
                    i = web.aliases.length;
                    return res.end();
                }
            }

            //when you go to just the webpage
            if (filename == rootFolder + "/") {
                console.log("\x1b[32m%s\x1b[0m", `wants root, returning ${web.index}`);
                res.writeHead(200, { 'Content-Type': mimeTypes["." + web.index.split(".")[web.index.split(".").length - 1]] });
                res.write(fs.readFileSync(rootFolder + "/" +web.index));
                return res.end();
            }
            if (err) {

                //404 error handling
                res.writeHead(404, { 'Content-Type': "text/html" });
                console.log("\x1b[31m%s\x1b[0m", `error 404 accessing ${filename}, returning ${web.errors[404]}`)
                return res.end(fs.readFileSync(rootFolder + "/" +web.errors[404]));
            }

            //if you don't go to a root webpage
            res.writeHead(200, { 'Content-Type': mimeTypes["." + filename.split(".")[filename.split(".").length - 1]] });
            console.log("\x1b[32m%s\x1b[0m", `returning ${filename}`);
            res.write(data);
            return res.end();
        });


    });
    if(callback){
        callback(port, rootFolder, server);
    }
    server.listen(port);
}

module.exports = {newServer};