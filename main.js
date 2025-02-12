var http = require('http');
var url = require('url');
var fs = require('fs');


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
//get's the data in web.json

var web = require("./web.json");
var messages = require("./back/messages.json");


    http.createServer(function (req, res) {
        var q = url.parse(req.url, true);
        var filename = "." + q.pathname;
        fs.readFile(filename, function(err, data) {

        console.log(`webpage being read from port 8080, accessing ${filename}`);


        if (req.method === 'POST' && req.url === '/message.json') {
            let body = '';
    
            // Read incoming data
            req.on('data', chunk => { body += chunk.toString(); });
    
            req.on('end', () => {
                try {
                    let data = JSON.parse(body);
                    console.log("Received Data:", data);
                    messages.chat.push(data)
                    fs.writeFileSync("./back/messages.json", JSON.stringify(messages));
                    messages = require("./back/messages.json");
                    console.log(messages);
                    // Send a response
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Data received successfully!', return: messages }));
                } catch (error) {
                    console.log(error);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON data' }));
                }
            });
    
            return 0;
        }else if (req.method === 'POST' && req.url === '/check.json') {
            let body = '';
    
            // Read incoming data
            req.on('data', chunk => { body += chunk.toString(); });
    
            req.on('end', () => {
                try {
                    let data = JSON.parse(body);
                    console.log("Received Data:", data);
                    
                    // Send a response
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Data received successfully!', return: messages }));
                } catch (error) {
                    console.log(error);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON data' }));
                }
            });
    
            return 0;
        }

        //checks if it's in 'hidden', returns 403

        if(web.hidden.includes(filename.replace("./",""))){
          res.writeHead(403, {'Content-Type': 'text/html'});
          console.log("\x1b[31m%s\x1b[0m", `error 403 accessing ${filename}, returning ${web.errors[403]}`)
          return res.end(fs.readFileSync(web.errors[403]));
        }

        //checks for aliases

        for(var i = 0; i<web.aliases.length; i++){
           let alias = web.aliases[i];
            if(alias.alias == filename.replace("./","")){
                console.log(alias.location.split(".")[alias.location.split(".").length-1]);
                res.writeHead(200, {'Content-Type': mimeTypes["."+alias.location.split(".")[alias.location.split(".").length-1]]});
                console.log("\x1b[32m%s\x1b[0m", `found alias "${alias.alias}"! changing ${filename} to ${alias.location}`);
                res.write(fs.readFileSync(alias.location));
                i=web.aliases.length;
                return res.end();
            }
        }

        //when you go to just the webpage

        if(filename == "./"){
            console.log("\x1b[32m%s\x1b[0m",`wants root, returning ${web.index}`);
            res.writeHead(200, {'Content-Type': mimeTypes["."+web.index.split(".")[web.index.split(".").length-1]]});
            res.write(fs.readFileSync(web.index));
            return res.end();
        }
        if (err) {

            //404 error handling
          res.writeHead(404, {'Content-Type': "text/html"});
          console.log("\x1b[31m%s\x1b[0m", `error 404 accessing ${filename}, returning ${web.errors[404]}`)
          return res.end(fs.readFileSync(web.errors[404]));
        } 

        //if you don't go to a root webpage
        res.writeHead(200, {'Content-Type': mimeTypes["."+filename.split(".")[filename.split(".").length-1]]});
        console.log("\x1b[32m%s\x1b[0m", `returning ${filename}`);
        res.write(data);
        return res.end();
    });
  



}).listen(8080); 
console.log("listening from https://localhost:8080");