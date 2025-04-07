import { connectToSocket } from "./requests.js";

let fileMenu = document.getElementById("files");
let markdownEditor = document.getElementById("markdown");
window.serverContentMd;
let navbar = document.getElementById("navbar");
let connectToSpaceBtn = document.getElementById("connectToSpaceBtn");
let confirmSpaceBtn = document.getElementById("confirmSpaceBtn");
let spaceServerLocation = document.getElementById("spaceServerLocation");
let spaceSelectionError = document.getElementById("error");
let notConnected = document.getElementById("notConnected");

let spaceServer;
/**
 * @type {WebSocket}
 */
let ws;
/**
 * @type {HTMLDialogElement}
 */
let openSpaceDialog = document.getElementById("openSpaceDialog");

connectToSpaceBtn.addEventListener("click", e=>openSpaceDialog.showModal())

openSpaceDialog.addEventListener("close",(e)=>{
    spaceServer = openSpaceDialog.returnValue;
    console.log(`space server: ${spaceServer}`);

    if(spaceServer){
        notConnected.style.display = "none";
        ws = connectToSocket(spaceServer);
    }
});

confirmSpaceBtn.addEventListener("click", (e)=>{
    e.preventDefault();
    console.log(spaceServerLocation.value);
    if(!spaceServerLocation.value){
        spaceSelectionError.style.display = "block";
        spaceSelectionError.innerText = "you have not put in a space.";
        return;
    }
    spaceSelectionError.style.display = "none";
    openSpaceDialog.close(spaceServerLocation.value);
});

function updateFile(){
    markdownEditor = document.getElementById("markdown").innerHTML;
    if((String(window.serverContentMd) != String(markdownEditor)) && window.selectedFileLocation){
        console.log("sending...")
        window.serverContentMd = markdownEditor;
    ws.send(JSON.stringify({
        "SEND":"FILECHANGE",
        "LOCATION":window.selectedFileLocation,
        "FILECONTENTS":markdownEditor,
        "FROM":window.UID}))
    }
}

setInterval(updateFile, 1000);
