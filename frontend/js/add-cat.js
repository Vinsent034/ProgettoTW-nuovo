'use strict';

// aspeto che la pagina e leaflet siano pronti
document.addEventListener('DOMContentLoaded', () => {
  console.log('pagina caricata ok');
  
  // controllo se leaflet è caricato
  if (typeof L === 'undefined') {
    console.error('LEAFLET NON CARICATO! aspetto...');
    // aspetto un po e riprovo
    setTimeout(() => {
      if (typeof L === 'undefined') {
        console.error('LEAFLET ANCORA NON CARICATO!');
        document.getElementById('map').innerHTML = '<p style="padding:20px;color:red;">Errore: Leaflet non caricato</p>';
        return;
      }
      console.log('leaflet caricato dopo attesa');
      initMap();
      wireForm();
    }, 500);
    return;
  }
  
  console.log('leaflet ok');
  initMap();
  wireForm();
});

// devo fare la mappa con leflet per segnare dove sta il micio
function initMap() {
  console.log('--- INIZIO initMap ---');
  
  const el = document.getElementById('map');
  if (!el) {
    console.error('elemento #map NON TROVATO nel DOM!');
    return;
  }
  console.log('elemento #map trovato:', el);

  // controllo che leaflet sia disponibile
  if (typeof L === 'undefined') {
    console.error('L (Leaflet) non è definito!');
    el.innerHTML = '<p style="padding:20px;color:red;">Leaflet non caricato</p>';
    return;
  }
  console.log('Leaflet disponibile, versione:', L.version);

  try {
    console.log('creo la mappa...');
    // creo la mapa centrata su napoli
    window.map = L.map('map', { scrollWheelZoom:true }).setView([40.8518, 14.2681], 12);
    console.log('oggetto mappa creato');
    
    // aggiungo il layer con le immaggini della mappa
    console.log('aggiungo tile layer...');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom:19, 
      attribution:'© OpenStreetMap contributors'
    }).addTo(window.map);
    console.log('tile layer aggiunto');

    let pickMarker = null;  // questo mi serve per mettere il marker dove cliko
    const latI = document.getElementById('lat');
    const lngI = document.getElementById('lng');

    if (!latI || !lngI) {
      console.error('campi lat/lng non trovati!');
      return;
    }
    console.log('campi lat/lng trovati');

    // quando clicco sulla mapa devo mettere il pin
    window.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      console.log('hai cliccato su', lat, lng);
      
      // metto le cordinate nei campi nascosti
      latI.value = lat.toFixed(6);
      lngI.value = lng.toFixed(6);
      
      console.log('coordinate salvate:', latI.value, lngI.value);
      
      // se c'e gia il marker lo sposto senno lo creo
      if (pickMarker) {
        pickMarker.setLatLng(e.latlng);
        console.log('marker spostato');
      } else {
        pickMarker = L.marker(e.latlng).addTo(window.map);
        console.log('marker creato');
      }
    });
    
    console.log('✅ mappa OK e funzionante!');
    console.log('--- FINE initMap ---');
  } catch (e) {
    console.error('ERRORE nella creazione mappa:', e);
    console.error('Stack:', e.stack);
    el.innerHTML = '<p style="padding:12px;color:#b00020;">Imposibile caricare la mappa: ' + e.message + '</p>';
  }
}


// funzoine per gestire il form quando invio
function wireForm() {
  const form = document.getElementById('formAddCat');
  const nameI = document.getElementById('catName');
  const descI = document.getElementById('catDescription');
  const imgI  = document.getElementById('catImage');
  const latI  = document.getElementById('lat');
  const lngI  = document.getElementById('lng');
  const btn   = document.getElementById('btnPublish');
  const msg   = document.getElementById('message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();  // seno mi ricarica la pagina
    
    console.log('form inviato');

    // controllo se c'è il token senò non puo pubblicare
    const token = localStorage.getItem('token');
    if (!token) {
      showMsg('Devi fare il login prima', 'error', msg);
      setTimeout(() => { window.location.href = 'login.html'; }, 1000);
      return;
    }

    // validazoni dei campi
    if (!nameI.value.trim()) {
      showMsg('Metti il nome del gatto', 'error', msg);
      return;
    }
    
    if (!descI.value.trim() || descI.value.trim().length < 10) {
      showMsg('La descrizoine deve essere almeno di 10 caratteri', 'error', msg);
      return;
    }
    
    // controllo se ha cliccato sulla mappa
    if (!latI.value || !lngI.value) {
      showMsg('Clicca sulla mappa per dire dove hai visto il gatto', 'error', msg);
      return;
    }
    
    // controllo se c'è la foto
    if (!imgI.files || !imgI.files[0]) {
      showMsg('Devi mettere una foto', 'error', msg);
      return;
    }

    console.log('validazioni ok');

    // preparo i dati da inviare con FormData perche devo mandare anche limmagine
    const fd = new FormData();
    fd.append('image', imgI.files[0]);
    fd.append('name', nameI.value.trim());
    fd.append('description', descI.value.trim());
    // IMPORTANTE: il backend si aspeta lat e lng non location.lat
    fd.append('lat', String(latI.value));
    fd.append('lng', String(lngI.value));

    console.log('dati preparati:', {
      nome: nameI.value.trim(),
      desc_lunghezza: descI.value.trim().length,
      lat: latI.value,
      lng: lngI.value,
      foto: imgI.files[0].name
    });

    try {
      setLoading(btn, true);  // disabilito il botone mentre carica
      
      const baseUrl = (typeof CONFIG !== 'undefined' && CONFIG?.API_URL) ? CONFIG.API_URL : 'http://localhost:3005';
      
      console.log('mando richiesta a', baseUrl + '/cats');

      // mando la richiesta al server
      const resp = await fetch(`${baseUrl}/cats`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`
          // NON metto Content-Type perche con FormData lo fa da solo
        },
        body: fd
      });

      console.log('risposta ricevuta, status:', resp.status);

      const data = await safeJson(resp);
      console.log('dati risposta:', data);

      if (!resp.ok) {
        // c'è stato un erore
        showMsg(data?.error || `Errore: ${resp.status}`, 'error', msg);
        return;
      }

      // tutto ok!
      console.log('gatto publicato!');
      showMsg('Gatto publicato con succeso!', 'success', msg);
      
      // dopo 1 secondo torno alla home
      setTimeout(() => { 
        window.location.href = 'index.html'; 
      }, 1000);
      
    } catch (err) {
      console.error('erorre:', err);
      showMsg('Errore di conessione al server', 'error', msg);
    } finally {
      setLoading(btn, false);  // riabilito il bottone
    }
  });
}


// funzone per mostrare i messaggi di errore o succeso
function showMsg(text, type, box) {
  if (!box) {
    console.log('box messagio non trovato');
    return;
  }
  box.className = `message message-${type}`;
  box.textContent = text;
  box.style.display = 'block';
  
  // vado verso il messaggio cosi lutente lo vede
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// questa funzoine cambia il testo del botone mentre carica
function setLoading(btn, on) {
  if (!btn) return;
  btn.disabled = on;
  btn.textContent = on ? 'Pubblico…' : 'Pubblica';
}

// parse sicuro del json sennò va in errore
async function safeJson(r){ 
  try{ 
    return await r.json(); 
  } catch { 
    console.log('errore nel parse json');
    return null; 
  } 
}