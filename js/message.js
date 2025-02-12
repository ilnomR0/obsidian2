window.localChat = [];

function sendMessage(){
    fetch('/message.json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: localStorage.getItem("name"), message: document.getElementById("message").value })
    })
    .then(response => response.json())
    .then(data => {
        //console.log('Server Response:', data.return.chat);
        window.localChat = data.return.chat;
        document.getElementById("chat").innerHTML = "";
        localChat.forEach(element => {
            let message = document.createElement("div");
            message.className = "msg";
            message.innerText = element.username + " | " + element.message;
            document.getElementById("chat").appendChild(message);
        });
    })
    .catch(error => console.error('Error:', error));
}
function searchMessage(){
    fetch('/check.json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({currentChat:window.localChat})
    })
    .then(response => response.json())
    .then(data => {
        //console.log('Server Response:', data.return.chat);
        //console.log("saved chat pre", window.localChat);
        window.localChat = data.return.chat;
        //console.log("saved chat aft", window.localChat);

        document.getElementById("chat").innerHTML = "";
        localChat.forEach(element => {
            let message = document.createElement("div");
            message.className = "msg";
            message.innerText = element.username + " | " + element.message;
            document.getElementById("chat").appendChild(message);
        });
    })
    .catch(error => console.error('Error:', error));
}
searchMessage();
setInterval(searchMessage, 1000);

