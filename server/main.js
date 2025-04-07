let connectedUsers = new Set();

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



Deno.serve({
    port: 80,
    handler: async (request) => {
      // If the request is a websocket upgrade,
      // we need to use the Deno.upgradeWebSocket helper
      if (request.headers.get("upgrade") === "websocket") {
        const { socket, response } = Deno.upgradeWebSocket(request);
  
        socket.onopen = () => {
            console.log("CONNECTED");

            connectedUsers.add(socket);
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
            socket.send(JSON.stringify({
                REASON:"CONTENTSREQUEST",
                FILECONTENTS:Deno.readTextFileSync("./space/"+data.LOCATION)
            }));
          }else if (data.SEND == "FILECHANGE"){
            Deno.writeTextFileSync("./space/"+data.LOCATION,data.FILECONTENTS);

            for(const user of connectedUsers){
                user.send(JSON.stringify({
                REASON:"FILECHANGE",
                UPDATE:data.FILECONTENTS,
                LOCATION:data.LOCATION,
                EXCEPTION:data.FROM}));
            }
        }
        };
        socket.onclose = (event) => console.log("DISCONNECTED");
        socket.onerror = (error) => console.error("ERROR:", error);
  
        return response;
      } else {
        return new Response(`<h1>this is NOT how u use this server</h1><br>this is used as a space connection. To access files here, please go to the client area instead`);
      }
    },
  });
  