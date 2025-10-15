const backend = 'http://localhost:3005';
let map;



document.addEventListener('DOMContentLoaded', function() {
  console.log('PaginaCaricata');
  CreaMappa();
  AggiungiBottoneLoggato();
  CaricaGatti();
  
});


function CaricaGatti() {
  // Mostro il messaggio di caricamento
  document.getElementById('loading').style.display = 'block';

   // Chiedo i gatti al backend
  fetch(backend + '/cats')
    .then(response => response.json())
    .then(gatti => {
    // Nascondo il caricamento
    document.getElementById('loading').style.display = 'none';

   // if (gatti.length === 0) {
   //document.getElementById('message').textContent = 'Nessun gatto ancora. Sii il primo!';
   //document.getElementById('message').className = 'message info';
   //document.getElementById('message').style.display = 'block';
   //return;
   // }

  // contrasegni ogni fatto con un amker 
   gatti.forEach(function(gatto) {
   //mi creo il marker per il gatto
    const marker = L.marker([gatto.location.lat, gatto.location.lng]).addTo(map);

   // finseta pee vedere il gatto , per l'omeno esternamente nome , imagine ecc
   const popupContent = `
        <div style="text-align: center;">
            <h3 style="margin: 5px 0;">${gatto.name}</h3>
            <img src="${backend}/uploads/${gatto.image}" 
                 style="width: 200px; height: 150px; object-fit: cover; border-radius: 5px; margin: 10px 0;">
            <p style="margin: 5px 0; font-size: 12px;">
                ${gatto.description.substring(0, 50)}...
            </p>
            <p style="font-size: 11px; color: #666;">
                Pubblicato da: ${gatto.author.name}
            </p>
            <button onclick="window.location.href='detail-cat.html?id=${gatto._id}'" 
                    style="background: #2196F3; color: white; border: none; 
                           padding: 8px 15px; border-radius: 5px; cursor: pointer; 
                           margin-top: 10px; font-size: 14px;">
                Vedi dettagli
            </button>
        </div>
    `;
    marker.bindPopup(popupContent);



   });

   // Mostro messaggio di successo
  // document.getElementById('message').textContent = 'Caricati ' + gatti.length + ' gatti!';
  // document.getElementById('message').className = 'message success';
  // document.getElementById('message').style.display = 'block';
            
  // // Nascondo il messaggio dopo 3 secondi
  // setTimeout(function() {
  // document.getElementById('message').style.display = 'none';
  // }, 3000);
  })
  .catch(error => {
  // document.getElementById('loading').style.display = 'none';
  document.getElementById('message').textContent = 'Errore nel caricamento dei gatti!';
  // document.getElementById('message').className = 'message error';
  // document.getElementById('message').style.display = 'block';
  console.log(error);
   });
}















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
      map = L.map('map').setView([40.8518, 14.2681], 13); // e la posizione di napoli

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);
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