const server = 'https://mock-api.driven.com.br/api/v6/uol/participants';
let sessionName = '';
let question = 'Insira seu nome de login:';


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
    }
}

function failed(answer) {
    const serverStatus = answer.response.status;
    if (serverStatus === 400) {
        alert('Este nome de usuário já está em uso, Por favor escolha outro');
        window.location.reload();
    } else {
        alert('Erro de conexão');
    }
}
