const IndirizzoBackend = 'http://localhost:3005';






//funzione tipo main del c++
document.addEventListener('DOMContentLoaded', function() {
    console.log("Pagina login caricata");
    
    const formLogin = document.getElementById('loginForm'); 
    
    formLogin.addEventListener('submit', function(evento) {
        evento.preventDefault();  // Impedisce il reload della pagina, per evitare il bag di prima 
        VerificaCredenziali();    // Chiamo la funzione per prendere le credenziali dal db
    });


    // acesso ad usare la registrazione 
    const formRegistrazione = document.getElementById('registrazioneForm');
    formRegistrazione.addEventListener('submit', function(evento) {
        evento.preventDefault();
        CreaAccaunt();
    });


});








async function VerificaCredenziali(){
    console.log("Entrato nella funzione VerificaCredenziali");

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    console.log('Email :', email, 'password: ', password);

    if(!email || !password){
        console.log("Errore non sono corretti")
        return;
    }

    try {
        const risposta = await fetch(`${IndirizzoBackend}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });

        const dati = await risposta.json();

        if (risposta.ok) {
            console.log("Login OK!", dati);
            
            //salvo il token dell utnte 
            localStorage.setItem('token', dati.token);
            localStorage.setItem('user', JSON.stringify(dati.user));
            
            alert("Login effettuato!");
            
            // vado alla pagina inizale 
            window.location.href = 'index.html';
            
        } else {
            console.log("Login fallito");
            alert("Errore: " + dati.error);
        }

    } catch (errore) {
        console.log("Errore connessione:", errore);
        alert("Impossibile connettersi al server");
    }
}




// funzione che mostra il login , se premo Registati nasconde il login e mette la registrazione
function mostraLogin(){
    console.log("entrato in accedi");
    document.getElementById('form-registrazione').classList.add('hidden');
    document.getElementById('form-login').classList.remove('hidden');
}


// funzione che fa l'opposto della precedente
function mostraRegistrazione(){
    console.log("Rntrato in registra");
    document.getElementById("form-login").classList.add('hidden');
    document.getElementById("form-registrazione").classList.remove('hidden');
}



async function CreaAccaunt() {
    console.log("Entrato nella funzione crea accaunt");


    //estraggo i valori messi nell'html della refistrazione
    const nome = document.getElementById('reg-nome').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    console.log("Nome : ", nome , "Email : ", email);

    // verifico se i campi siano stati riempiti 
    if(!nome || !email || !password){
        console.log("Errore: campi vuoti");
        alert("Compila tutti i campi!");
        return;
    }


    try {
        const risposta = await fetch(`${IndirizzoBackend}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nome, email: email, password: password })
        });

        const dati = await risposta.json(); 
        if (risposta.ok) {
            alert("Registrazione effettuata con sucesso");
        } 
        else{
            alert(dati.error);
        }
    }
    catch (errore) {
        console.log("Errore connessione:", errore);
        alert("Impossibile connettersi al server");
    }



}


// funzione per salvare il token dopo il login per visualiare ka il bottone
