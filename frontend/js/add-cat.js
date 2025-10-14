const IndirizzoBackend = 'http://localhost:3005';

let mappa = null;
let marker = null;
let coordinateSelezionate = null;









document.addEventListener('DOMContentLoaded', function() {
    console.log('Pagina add-cat caricata');
    
    // Verifico se l'utente è loggato
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Devi effettuare il login per pubblicare un gatto!');
        window.location.href = 'login.html';
        return;
    }
    
    // Inizializzo la mappa
    InizializzaMappa();
    
    // Gestisco l'anteprima della foto
    const inputFoto = document.getElementById('foto-gatto');
    inputFoto.addEventListener('change', MostraAnteprimaFoto);
    
    // Gestisco il submit del form
    const form = document.getElementById('FormAddCat');
    form.addEventListener('submit', function(evento) {
        evento.preventDefault();
        pubblicaGatto();
    });
});












// funzione per posizionare la langitudine a ltitudine 
function SelezionaPosizione(latlng) {
    console.log('Posizione cliccata:', latlng);
    
    // Salvo le coordinate
    coordinateSelezionate = latlng;



    
    // Aggiorno i campi nascosti presi 
    document.getElementById('latitudine').value = latlng.lat;
    document.getElementById('longitudine').value = latlng.lng;
    

    //console.log("Controllo 1 funzione posizione ");

    // Rimuovo il marker precedente se esiste
    if (marker) {
        mappa.removeLayer(marker);
    }
    
    // Aggiungo un nuovo marker
    marker = L.marker([latlng.lat, latlng.lng]).addTo(mappa);
    marker.bindPopup('Posizione del gatto').openPopup();
    
   // console.log("Controllo 1 funzione posizione ");

}






function MostraAnteprimaFoto(e) {
  // ok vediamo che file hai scelto
  const file = e.target.files[0];
  const box = document.getElementById('preview-foto');

  if (!file) return; // niente file termina
  // giusto per sicurezza
  if (!file.type.startsWith('image/')) {
    alert('Deve mettere un immagine per andare avanti!');
    e.target.value = ''; 
    return;
  }

  const r = new FileReader();
  r.onload = x => {
    //carico l'immagine
    box.innerHTML = `<img src="${x.target.result}" alt="foto">`;
  };
  r.readAsDataURL(file);
}









// funzione della creazione della mappa 
function InizializzaMappa() {
    console.log('entrano nella funzione mappa add-cat');
    
    // posizione precisa di napoo
    mappa = L.map('map').setView([40.8518, 14.2681], 13);
    
    
    //console.log('passo 1 completo');

    // Aggiungo le tile
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {   maxZoom: 19,   attribution: '© OpenStreetMap'}).addTo(mappa);
    
   // console.log('passo 2 completo');


    // al clicka ggiungo il posizionatore
    mappa.on('click', function(evento) {
        SelezionaPosizione(evento.latlng);
    });

   // console.log('passo 3 completo');
    
   
}












async function pubblicaGatto() {
  

  const foto = document.getElementById('foto-gatto').files[0];
  const nome = document.getElementById('nome-gatto').value;
  const desc = document.getElementById('descrizione-gatto').value;

  const lat = document.getElementById('latitudine').value;
  const lon = document.getElementById('longitudine').value;

//   // controlli test
//   if (!foto) return MostraMessaggio('Serve una foto ', 'error');
//   if (!lat || !lon) return MostraMessaggio('Clicca sulla mappa', 'error');
//   if (!nome || !desc) return MostraMessaggio('Devi riempire i campi ', 'error');




  const fd = new FormData();
  fd.append('foto', foto);
  fd.append('nome', nome);
  fd.append('descrizione', desc);
  fd.append('latitudine', lat);
  fd.append('longitudine', lon);

  const token = localStorage.getItem('token');

  try {
    // incrociamo le dita
    const r = await fetch(`${IndirizzoBackend}/cats`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` },body: fd});

    const data = await r.json();

    if (r.ok) {
    //   MostraMessaggio('success0');
      setTimeout(() => (window.location.href = 'index.html'), 2000);
    } else {
    
      MostraMessaggio('Errore: ' + data.error, 'error');
    }
  } catch (err) {
    MostraMessaggio('Server non risponde ', 'error');
  }
}




function MostraMessaggio(t, tipo) {
  const box = document.getElementById('messaggio');
  box.textContent = t;
  box.className = 'messaggio ' + tipo;
  box.classList.remove('hidden');

  // sparisce dopo un po', perché sì
  setTimeout(() => box.classList.add('hidden'), 5000);
}