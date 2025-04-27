import { connectToSocket } from "./requests.js";
import { MdToHTML } from "./parse.js";

window.MdToHTML = MdToHTML;

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


//opens the dialog for selecting the space
openSpaceDialog.addEventListener("close",(e)=>{
    spaceServer = openSpaceDialog.returnValue;
    console.log(`space server: ${spaceServer}`);
        if(spaceServer){
            notConnected.style.display = "none";
            ws = connectToSocket(spaceServer);
        }
});


//set's the space to the space URL in spaceServerLocation
confirmSpaceBtn.addEventListener("click", (e)=>{
    e.preventDefault();
    console.log(spaceServerLocation.value);
    if(!spaceServerLocation.value){
        spaceSelectionError.style.display = "block";
        spaceSelectionError.innerText = "you have not put in a space.";
        return;
    }
    spaceSelectionError.style.display = "none";
    //closes the dialog for selecting
    openSpaceDialog.close(spaceServerLocation.value);
});

//function for updating the file on the server. 
function updateFile(){
    let markdownEditorText = String(document.getElementById("markdown").innerText);

    //check's if the local server interpretation is the same as the text in the element
    //also checks if you have a file selected
    if((String(window.serverContentMd) != String(markdownEditorText)) && window.selectedFileLocation){

        //sends a filechange request, along with the location, the contents, and the unique ID of from
        console.log("sending...", {
            "SEND":"FILECHANGE",
            "LOCATION":window.selectedFileLocation,
            "FILECONTENTS":markdownEditorText,
            "FROM":window.UID});

        window.serverContentMd = markdownEditorText;
    ws.send(JSON.stringify({
        "SEND":"FILECHANGE",
        "LOCATION":window.selectedFileLocation,
        "FILECONTENTS":markdownEditorText,
        "FROM":window.UID}))
    }
}

setInterval(updateFile, 1000);


document.getElementById("markdown").addEventListener("input",(e)=>{
    //MdToHTML("markdown");
});
