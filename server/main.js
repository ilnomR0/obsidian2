let connectedUsers = new Set();
let exeption = ""

function createFileTree(folder){
    let fileTree = [];
    for(let dirEntry of Deno.readDirSync(`./space/${folder}`)){
        if(dirEntry.isDirectory){
            fileTree.push({type: "folder", name:dirEntry.name, files:createFileTree(`${folder}/${dirEntry.name}`)})
        }else if(dirEntry.isFile){
            fileTree.push({type:"file", name:dirEntry.name});
        }
    }
    return fileTree;
}

function updateFilesGlobal(){

        for(const user of connectedUsers){

            if(!user.CURRENTFILE || exeption!="") return;

            console.log("current file for user", user.CURRENTFILE);
                let time = new Date();

                 if(String(Deno.statSync("./space/"+user.CURRENTFILE).mtime) != String(time.toDateString() + " " + time.toTimeString())) return;
                 console.log((
                    "modified date:"+ Deno.statSync("./space/"+user.CURRENTFILE).mtime +
                 "\n current date:" + (time.toDateString() + " " + time.toTimeString())))
                user.send(JSON.stringify({
                REASON:"FILECHANGE",
                UPDATE:Deno.readTextFileSync("./space/"+user.CURRENTFILE),
                LOCATION:user.CURRENTFILE,
                EXCEPTION:exeption}));
                exeption = "";
        }
}

import { parseArgs } from "jsr:@std/cli/parse-args";


const flags = parseArgs(Deno.args, {
    default: {port:80},
    string:["port"]
})

Deno.serve({
    port: flags.port,
    handler: async (request) => {
      // If the request is a websocket upgrade,
      // we need to use the Deno.upgradeWebSocket helper
      if (request.headers.get("upgrade") === "websocket") {
        const { socket, response } = Deno.upgradeWebSocket(request);
  
        socket.onopen = async () => {
            console.log("CONNECTED");

            socket.CURRENTFILE = "";

            connectedUsers.add(socket);

            setInterval(updateFilesGlobal, 1000);
        };
        socket.onmessage = async (event) => {
          console.log(`RECEIVED: ${event.data}`);
          const data = JSON.parse(event.data);
          console.log(data);
          if(data.GET=="FILES"){

            let files = createFileTree("");

            console.log(JSON.stringify(files));
            socket.send(JSON.stringify({
                REASON:"FILESREQUEST",
                FILES:files}));
          }else if (data.GET=="FILECONTENTS"){
            socket.CURRENTFILE = data.LOCATION;

            socket.send(JSON.stringify({
                REASON:"CONTENTSREQUEST",
                FILECONTENTS:Deno.readTextFileSync("./space/"+data.LOCATION)
            }));
          }else if (data.SEND == "FILECHANGE"){
            Deno.writeTextFileSync("./space/"+data.LOCATION,data.FILECONTENTS);
            exeption = data.FROM;

            for(const user of connectedUsers){
                user.send(JSON.stringify({
                REASON:"FILECHANGE",
                UPDATE:Deno.readTextFileSync("./space/"+user.CURRENTFILE),
                LOCATION:user.CURRENTFILE,
                EXCEPTION:exeption}));
            }
          }
        };
        socket.onclose = (event) => {
            console.log("DISCONNECTED")
            connectedUsers.delete(socket);
        };
        socket.onerror = (error) => console.error("ERROR:", error);
  
        return response;
      } else {
        return new Response(`this is NOT how u use this server\nthis is used as a space connection. To access files here, please go to the client area instead`);
      }
    },
  });
  