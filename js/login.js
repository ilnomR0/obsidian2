const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('name');

if(username || localStorage.getItem("name")){
    localStorage.setItem("name",username);
    location.href = "./home"
}


