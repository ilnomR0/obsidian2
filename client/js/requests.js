import { MdToHTML, createRange, setPosition } from "./parse.js";

//recursively goes through the element structure, to find the path of the selected file.
function getRootElement(startElement, endElement, storeSteps) {
    let element = startElement.parentElement;
    if (element != endElement) {
        return getRootElement(element, endElement, `${storeSteps}/${element.querySelector("summary").innerText}`);
    } else if (storeSteps != "") {
        return `${storeSteps}`;
    } else {
        return ``;
    }
}

export function connectToSocket(url) {
    //get's the files, then displays them in a file tree
    function displayTree(array, mainElement) {
        for (let fileItem of array) {
            if (fileItem.type == "file") {

                let fileButton = document.createElement("button");
                fileButton.className = "fileButton";
                fileButton.innerText = fileItem.name;

                fileButton.addEventListener("click", (e) => {
                    if (window.selectedFile) {
                        window.selectedFile.style.backgroundColor = "";
                    }
                    window.selectedFile = e.target;

                    window.selectedFileLocation = getRootElement(window.selectedFile, document.getElementById("files"), "").split("/").reverse().join("/") +
                        `${window.selectedFile.innerText}`
                    window.selectedFile.style.backgroundColor = "#888";
                    console.log(selectedFile.innerText, window.selectedFileLocation);

                    ws.send(JSON.stringify({
                        "GET": "FILECONTENTS",
                        "LOCATION": window.selectedFileLocation,
                        "FROM": window.UID
                    }));
                });
                mainElement.appendChild(fileButton);

            } else if (fileItem.type == "folder") {

                let folderGroup = document.createElement("details");
                let folderName = document.createElement("summary");
                folderName.innerText = fileItem.name;
                folderGroup.appendChild(folderName);

                displayTree(fileItem.files, folderGroup);
                mainElement.appendChild(folderGroup);
            }
        }
    }
    let ws;

    /**
    * @type {HTMLDialogElement}
    */
    let errorDialog = document.getElementById("errorDialog");
    let errorDialogMessage = document.getElementById("errorMessage");


        ws = new WebSocket(url);



    ws.onopen = (e) => {
        window.UID = Math.round(Math.random() * 100000);
        ws.send(JSON.stringify({
            "GET": "FILES",
            "FROM": window.UID
        }));
    }

    ws.onmessage = (e) => {
        //console.log(`RECEIVED: ${e.data}`);
        const data = JSON.parse(e.data);
        console.log("INCOMING FROM SERVER: ", data.REASON);

        if (data.REASON == "FILESREQUEST") {
            console.log(data.FILES);

            displayTree(data.FILES, document.getElementById("files"));

        } else if (data.REASON == "CONTENTSREQUEST") {

            console.log(data.FILECONTENTS);

            document.getElementById("markdown").innerText = data.FILECONTENTS;

            

            //document.getElementById("markdown").innerText = MdToHTML("markdown");

        } else if (data.REASON == "FILECHANGE" && window.selectedFileLocation == data.LOCATION) {
            console.log(window.UID, data.EXCEPTION, data.UPDATE);
            if (window.UID != data.EXCEPTION) {
                window.serverContentMd = data.UPDATE;


                let obj = window.getSelection();
                let selectionRange = obj.getRangeAt(0);
                let clonedRange = selectionRange.cloneRange();
            
                clonedRange.selectNodeContents(document.getElementById("markdown"));
                clonedRange.setEnd(selectionRange.endContainer, selectionRange.endOffset);
                const cursorLocation = clonedRange.toString().length;

                
                document.getElementById("markdown").innerText = data.UPDATE;


                setPosition(document.getElementById("markdown"), cursorLocation);
                //document.getElementById("markdown").innerText = MdToHTML("markdown");
            }
        }
    };

    ws.onerror = (e) => {
        console.error(`ERROR: ${e.data}`);

            //errorDialogMessage.innerText = "there has been an error. That is all we can say";
            //errorDialog.showModal();
    };
    return ws;
}