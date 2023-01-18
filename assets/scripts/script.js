const serverUser = 'https://mock-api.driven.com.br/api/v6/uol/participants';
const serverStatusLink = 'https://mock-api.driven.com.br/api/v6/uol/status';
let sessionName = '';
let question = 'Insira seu nome de login:';
const viewer = document.querySelector('ul');
const msgInput = document.querySelector('footer>input');
let keepSession = '';
let chatSession = '';
const loginInput = document.querySelector('.login>.signin>input');

loginInput.addEventListener('keypress', function (keyPush) {
    if (keyPush.key === 'Enter') {
        login();
    }
})

function login() {
    const nameRequest = loginInput.value;
    if (nameRequest !== '' && nameRequest !== null) {
        document.querySelector('.signin').innerHTML = `<img src = "./assets/imgs/Quarter-Circle-Loading-Image-1.gif">`;
        const name = { name: nameRequest };
        const promise = axios.post(serverUser, name);
        promise.then(success);
        promise.catch(failed);
    } else {
        alert('Digite um nome de usuário válido');
        loginInput.value = '';
    }
}

function success(answer) {
    const serverStatus = answer.status;
    if (serverStatus === 200) {
        document.querySelector('.login').classList.add('hide');
        sessionName = JSON.parse(answer.config.data).name;
        updateChat();
        chatSession = setInterval(() => {
            updateChat();
        }, 3000);
        keepSession = setInterval(() => {
            const promise = axios.post(serverStatusLink, JSON.parse(answer.config.data));
            promise.catch(lostConnection);
        }, 5000);
    }
}

function lostConnection() {
    clearInterval(keepSession);
    clearInterval(chatSession);
}

function failed(answer) {
    const serverStatus = answer.response.status;
    if (serverStatus === 400) {
        alert('Este nome de usuário já está em uso, Por favor escolha outro');
        window.location.reload();
    } else {
        alert('Connection Error');
        window.location.reload();
    }
}

function updateChat() {
    const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages')
    promise.then(chatRender);
}

function chatRender(answer) {
    const chatInfo = answer.data;
    viewer.innerHTML = '';
    for (let i = 0; i < chatInfo.length; i++) {
        const time = chatInfo[i].time;
        const sender = chatInfo[i].from;
        const type = chatInfo[i].type;
        const msg = chatInfo[i].text;
        const receiver = chatInfo[i].to;

        chatPlacing(time, sender, type, msg, receiver);
    }
}

function chatPlacing(time, sender, type, msg, receiver) {
    if (type === 'status') {
        viewer.innerHTML += `<li class="sign-in">
        <p><span class="time">(${time})</span> <b>${sender}</b> ${msg}</p>
    </li>`
        viewer.querySelector('li:last-child').scrollIntoView();
    }
    if (type === 'message') {
        viewer.innerHTML += `<li>
        <p><span class="time">(${time})</span> <b>${sender}</b> para <b>${receiver}</b>: ${msg}</p>
    </li>`
        viewer.querySelector('li:last-child').scrollIntoView();
    }
    if (type === 'private_message' && (sessionName === sender || sessionName === receiver)) {
        viewer.innerHTML += `<li class="pm">
        <p><span class="time">(${time})</span> <b>${sender}</b> reservadamente para <b>${receiver}</b>: ${msg}</p>
    </li>`
        viewer.querySelector('li:last-child').scrollIntoView();
    }
}

msgInput.addEventListener('keypress', function (keyPush) {
    if (keyPush.key === 'Enter') {
        sendMsg();
    }
})

function sendMsg() {
    const msgBuild = {
        from: sessionName,
        to: "Todos",
        text: msgInput.value,
        type: "message"
    }
    const promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', msgBuild);
    promise.then(validadeMsg);
    promise.catch(msgError);
    msgInput.value = '';
}

function validadeMsg() {
    updateChat();
}

function msgError() {
    alert('Você foi desconectado')
    window.location.reload();
}