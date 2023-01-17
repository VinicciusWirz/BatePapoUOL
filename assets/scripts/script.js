const server = 'https://mock-api.driven.com.br/api/v6/uol/participants';
let sessionName = '';
let question = 'Insira seu nome de login:';
// login();
function login(){
    const nameRequest = prompt(question);
    const name = {name:nameRequest};
    const promise = axios.post(server, name);
    promise.then(success);
    promise.catch(failed);
}

function failed(){
    question = 'Este nome já está em uso, insira outro nome';
    login();
}

function success(answer){
    sessionName = JSON.parse(answer.config.data).name;
    console.log(answer)
}