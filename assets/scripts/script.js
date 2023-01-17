const server = 'https://mock-api.driven.com.br/api/v6/uol/participants';
let sessionName = '';
let question = 'Insira seu nome de login:';
const viewer = document.querySelector('ul');

login();
function login() {
    const nameRequest = prompt(question);
    if (nameRequest !== '') {
        const name = { name: nameRequest };
        const promise = axios.post(server, name);
        promise.then(success);
        promise.catch(failed);
    }
}

function success(answer) {
    const serverStatus = answer.status;
    if (serverStatus === 200) {
        sessionName = JSON.parse(answer.config.data).name;
        updateChat();
        setInterval(function () {
            updateChat();
        }, 3000);
        dcFromChat();
    }
}

function failed(answer) {
    const serverStatus = answer.response.status;
    if (serverStatus === 400) {
        alert('Este nome de usuário já está em uso, Por favor escolha outro');
    } else {
        alert('Erro de conexção ')
    }
}

function updateChat() {
    const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages')
    promise.then(chatRender);
}

function chatRender(answer) {
    const chatInfo = answer.data;
    let lastMsgTime = document.querySelector('ul li:last-child');

    for (let i = 0; i < 100; i++) {
        console.log(i);
        if (lastMsgTime !== null) {
            lastMsgTime = lastMsgTime.querySelector('.time').innerHTML.replace('(', '').replace(')', '');
            i = 99;
        } else if (lastMsgTime === null) {
            lastMsgTime === 0;
        }
        const time = chatInfo[i].time;
        const sender = chatInfo[i].from;
        const type = chatInfo[i].type;
        const msg = chatInfo[i].text;
        console.log(lastMsgTime, chatInfo[99].time, lastMsgTime === chatInfo[99].time);
        if (lastMsgTime === chatInfo[99].time) {
            return;
        }
        chatPlacing(time, sender, type, msg, chatInfo[i].to);
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
        <p><span class="time">(${time})</span> <b>${sender}</b> reservadamente para <b>${receiver}</b>: Oi!!!
            Tudo bem?</p>
    </li>`
        viewer.querySelector('li:last-child').scrollIntoView();
    }
}

function dcFromChat() {
    setInterval(() => {
        window.location.reload();
    }, 5000);
}