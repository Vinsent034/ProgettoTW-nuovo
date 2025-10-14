




document.addEventListener('DOMContentLoaded', function() {
  console.log('PaginaCaricata');
  CreaMappa();
  AggiungiBottoneLoggato();
  
});


















function goToLogin(){ // funzione legata all'index del tasto Login
  //  alert('Premuto il tasto login');
    window.location.href = 'login.html'

}

function TastoPublicaGatto(){ // funzione legata all'index del tasto Login
    //alert('Premuto il tasto Publica Gatto');
   // console.log('Premuto')
    const token = localStorage.getItem('token');

    if (token){
      window.location.href = 'add-cat.html';
    }
    else{
      alert('Mi dispiace ma solo gli utrnti loggati possono fare la bublicazione');
      window.location.href = 'login.html';
    }

}



function CreaMappa(){
    const  mappa = L.map('map').setView([40, 14], 12); // e la posizione di napoli

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(mappa);
}



function AggiungiBottoneLoggato() {
  
  const navbar = document.getElementById('navbar');
  const token = localStorage.getItem('token');



  if (token){
    const NomeUtente = localStorage.getItem('user');
    const user = JSON.parse(NomeUtente);


    console.log("Nome utente : ", user.name);

    // in hatml mi da errore percio lo devo mettre qua inq uanto dinamico
    navbar.innerHTML = `
      <span style="margin-right: 15px; color: #666;">
        Ciao, ${user.name}
      </span>
      <button class="nav-btn" onclick="Logout()">Logout</button>
    `;




  }
  else 
  {
    console.log("Errore");

    navbar.innerHTML = `
      <button class="nav-btn" onclick="goToLogin()">Login</button>
    `;
  }
}



//funzione per il logaut 
function Logout() {
   // console.log("Logout effetutato");
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();  // Ricarica la pagina visto che esco
}


// funzione per andare nella pagina di publicazione gatto
// function TastoBublicaGatto(){
//   const token = localStorage.getItem('token');

//   if (token){
//     console.log('conferma Utente Loggato per publicare ');
//     window.location.href = 'add-cat.html';

//   }
//   else {
//     allert('Non sei loggato devo fare il login');
//     window.location.href = 'login.html';
//   }
// }