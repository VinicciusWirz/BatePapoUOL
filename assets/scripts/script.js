const viewer = document.querySelector('.chatRender');
const msgInput = document.querySelector('footer>input');
const loginInput = document.querySelector('.login>.signin>input');
const serverMessages = 'https://mock-api.driven.com.br/api/v6/uol/messages';
const serverUser = 'https://mock-api.driven.com.br/api/v6/uol/participants';
const serverStatusLink = 'https://mock-api.driven.com.br/api/v6/uol/status';
const participantsUl = document.querySelector('.participants');
let keepSession = '';
let chatSession = '';
let msgBuild = {
    from: '',
    to: "Todos",
    text: '',
    type: "message"
};

loginInput.addEventListener('keypress', function (keyPush) {
    if (keyPush.key === 'Enter') {
        login();
    }
})
loginInput.parentElement.querySelector('button').addEventListener('click', (press) => {
    press.preventDefault();
})

function login() {
    const nameRequest = loginInput.value;
    if (nameRequest !== '' && nameRequest !== null && nameRequest !== 'Todos') {
        document.querySelector('.signin').innerHTML = `<img src = "./assets/imgs/Quarter-Circle-Loading-Image-1.gif">`;
        const name = { name: nameRequest };
        const promise = axios.post(serverUser, name);
        promise.then(success);
        promise.catch(failed);
    } else {
        alert('Digite um nome de usuário válido');
    }
}

function success(answer) {
    const serverResponse = answer.status;
    const successStatus = 200;
    if (serverResponse === successStatus) {
        const updateTime = 3000;
        const sendStatusTime = 5000;
        document.querySelector('.login').classList.add('hide');
        msgBuild.from = JSON.parse(answer.config.data).name;
        updateChat();
        updateParticipants();
        chatSession = setInterval(() => {
            updateChat();
            updateParticipants();
        }, updateTime);
        keepSession = setInterval(() => {
            const promise = axios.post(serverStatusLink, JSON.parse(answer.config.data));
            promise.catch(lostConnection);
        }, sendStatusTime);
    }
}

function lostConnection() {
    clearInterval(keepSession);
    clearInterval(chatSession);
}

function failed(answer) {
    const serverResponse = answer.response.status;
    const errorNameAlreadyExists = 400;
    if (serverResponse === errorNameAlreadyExists) {
        alert('Este nome de usuário já está em uso, Por favor escolha outro');
        window.location.reload();
    } else {
        alert('Connection Error');
        window.location.reload();
    }
}

function updateChat() {
    const promise = axios.get(serverMessages)
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
    viewer.querySelector('li:last-child').scrollIntoView();
}

function chatPlacing(time, sender, type, msg, receiver) {
    const userInPM = msgBuild.from === sender || msgBuild.from === receiver;
    if (type === 'status') {
        viewer.innerHTML += `<li id="status" data-test="message">
        <p><span class="time">(${time})</span> <b>${sender}</b> ${msg}</p>
    </li>`
    }
    if (type === 'message') {
        viewer.innerHTML += `<li id="message" data-test="message">
        <p><span class="time">(${time})</span> <b>${sender}</b> para <b>${receiver}</b>: ${msg}</p>
    </li>`
    }
    if (type === 'private_message' && userInPM) {
        viewer.innerHTML += `<li id="pm" data-test="message">
        <p><span class="time">(${time})</span> <b>${sender}</b> reservadamente para <b>${receiver}</b>: ${msg}</p>
    </li>`
    }
}

msgInput.addEventListener('keypress', function (keyPush) {
    if (keyPush.key === 'Enter') {
        sendMsg();
    }
})

function sendMsg() {
    if (msgInput.value === '' || msgInput.value === null) {
        return;
    }
    msgBuild.text = msgInput.value;
    const promise = axios.post(serverMessages, msgBuild);
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

function ToggleParticipants() {
    document.querySelector('.overlay').classList.toggle('hide');
}

function updateParticipants() {
    const promise = axios.get(serverUser);
    promise.then(renderParticipants)
}

function renderParticipants(answer) {
    const participantsList = answer.data;

    participantsUl.innerHTML = '';
    participantsUl.innerHTML = `<li class="everyone" onclick="selectTarget(this)" id="Todos" data-test="all">
    <div><ion-icon name="people"></ion-icon><span class="user">Todos</span></div><ion-icon
        class="checkmark hide" name="checkmark-outline" data-test="check"></ion-icon>
</li>`;
    for (let i = 0; i < participantsList.length; i++) {
        participantsUl.innerHTML += `<li onclick="selectTarget(this)" id="${participantsList[i].name}" data-test="participant">
        <div><ion-icon name="person-circle"></ion-icon><span class="user">${participantsList[i].name}</span></div><ion-icon
            class="checkmark hide" name="checkmark-outline" data-test="check"></ion-icon>
        </li>`;
    }
    if (document.getElementById(`${msgBuild.to}`) === null) {
        msgBuild.to = 'Todos';
        const everyoneLi = document.querySelector(`.everyone`);
        everyoneLi.classList.add('selected');
        everyoneLi.querySelector('.checkmark').classList.remove('hide');
        sendingTo();
        selectPrivacy(document.querySelector('.public'));
    } else {
        document.getElementById(`${msgBuild.to}`).classList.add('selected');
        document.getElementById(`${msgBuild.to}`).querySelector('.checkmark').classList.remove('hide');
        sendingTo();
    }
}

function selectTarget(item) {
    participantsUl.querySelector('.selected>.checkmark').classList.add('hide');
    participantsUl.querySelector('.selected').classList.remove('selected');
    item.classList.add('selected');
    item.querySelector('.checkmark').classList.remove('hide');
    msgBuild.to = item.id;
    if (item.classList.contains('everyone')) {
        selectPrivacy(item);
    }
    sendingTo();
}

function selectPrivacy(item) {
    const publicMsg = document.querySelector('.public');
    const publicMsgCheck = publicMsg.querySelector('.checkmark');
    const privateMsg = document.querySelector('.private');
    const privateMsgCheck = privateMsg.querySelector('.checkmark');
    const everyoneAndPrivate = item.querySelector('span').innerHTML === 'Todos' && privateMsg.classList.contains('selected');

    if (item.querySelector('span').innerHTML === 'Público' || everyoneAndPrivate) {
        publicMsg.classList.add('selected')
        publicMsgCheck.classList.remove('hide');
        privateMsg.classList.remove('selected')
        privateMsgCheck.classList.add('hide');
        msgBuild.type = 'message';
        sendingTo();
        return;
    }
    if (item.querySelector('span').innerHTML === 'Reservadamente') {
        if (document.querySelector(`.everyone`).classList.contains('selected')) {
            return;
        }
        publicMsg.classList.remove('selected')
        publicMsgCheck.classList.add('hide');
        privateMsg.classList.add('selected')
        privateMsgCheck.classList.remove('hide');
        msgBuild.type = 'private_message';
        sendingTo();
    }
}

function sendingTo() {
    const sending = document.querySelector('footer>span');
    if (msgBuild.type === 'message') {
        sending.innerHTML = `Enviando para ${msgBuild.to}`
    }
    if (msgBuild.type === 'private_message') {
        sending.innerHTML = `Enviando reservadamente para ${msgBuild.to}`
    }
}