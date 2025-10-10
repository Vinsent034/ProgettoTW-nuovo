'use strict';

// Variabili globali
let map;
let marker;
let selectedLat = null;
let selectedLng = null;

// Elementi DOM
const form = document.getElementById('addCatForm');
const msg = document.getElementById('formMsg');
const resetBtn = document.getElementById('resetBtn');
const submitBtn = document.getElementById('submitBtn');
const latInput = document.getElementById('lat');
const lngInput = document.getElementById('lng');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('imagePreview');

// Funzioni di utilità
function setMsg(text, ok = true) { 
  msg.textContent = text; 
  msg.className = 'msg ' + (ok ? 'ok' : 'ko');
  msg.style.display = 'block';
}

function hideMsg() {
  msg.style.display = 'none';
}

function clearErrors() { 
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error')); 
  hideMsg();
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  submitBtn.textContent = loading ? 'Caricamento...' : 'Pubblica Gatto';
}

// Inizializza la mappa
function initMap() {
  console.log('Inizializzo mappa...');
  
  try {
    // Centra su Napoli
    map = L.map('map', { scrollWheelZoom: true }).setView([40.8518, 14.2681], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Click sulla mappa per selezionare posizione
    map.on('click', function(e) {
      selectedLat = e.latlng.lat;
      selectedLng = e.latlng.lng;
      
      console.log('Posizione selezionata:', selectedLat, selectedLng);
      
      // Aggiorna gli input nascosti
      latInput.value = selectedLat;
      lngInput.value = selectedLng;
      
      // Rimuovi marker precedente
      if (marker) {
        map.removeLayer(marker);
      }
      
      // Aggiungi nuovo marker
      marker = L.marker([selectedLat, selectedLng]).addTo(map);
      marker.bindPopup('Gatto avvistato qui').openPopup();
      
      // Rimuovi errore se presente
      document.getElementById('map').classList.remove('error');
    });

    console.log('✅ Mappa inizializzata');
  } catch (err) {
    console.error('❌ Errore inizializzazione mappa:', err);
    document.getElementById('map').innerHTML = 
      '<p style="padding:20px;text-align:center;color:#ef4444;">Errore caricamento mappa</p>';
  }
}

// Preview immagine
imageInput.addEventListener('change', function() {
  imagePreview.innerHTML = '';
  
  if (this.files && this.files[0]) {
    const file = this.files[0];
    
    // Controlla dimensione (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMsg('L\'immagine è troppo grande. Massimo 5MB.', false);
      this.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement('img');
      img.src = e.target.result;
      imagePreview.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
});

// Reset form
resetBtn.addEventListener('click', () => { 
  if (confirm('Sei sicuro di voler annullare? Tutti i dati inseriti andranno persi.')) {
    form.reset();
    imagePreview.innerHTML = '';
    clearErrors();
    
    // Rimuovi marker dalla mappa
    if (marker) {
      map.removeLayer(marker);
      marker = null;
    }
    selectedLat = null;
    selectedLng = null;
    latInput.value = '';
    lngInput.value = '';
  }
});

// Submit form
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();
  
  console.log('\n=== 🐱 INIZIO AGGIUNTA GATTO ===');

  const name = form.name.value.trim();
  const description = form.description.value.trim();
  const file = imageInput.files[0];

  console.log('📝 Dati form:');
  console.log('  Nome:', name);
  console.log('  Descrizione:', description.substring(0, 50) + '...');
  console.log('  Lat:', selectedLat);
  console.log('  Lng:', selectedLng);
  console.log('  File:', file ? file.name + ' (' + (file.size/1024).toFixed(2) + ' KB)' : 'NESSUNO');

  const markError = (el) => { 
    el.classList.add('error'); 
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.focus(); 
  };

  // ========== VALIDAZIONI ==========
  
  // Nome
  if (name.length < 2) { 
    markError(form.name); 
    return setMsg('❌ Il nome deve avere almeno 2 caratteri.', false); 
  }
  
  // Descrizione
  if (description.length < 10) { 
    markError(form.description); 
    return setMsg('❌ La descrizione deve avere almeno 10 caratteri.', false); 
  }
  
  // Posizione
  if (!selectedLat || !selectedLng) { 
    document.getElementById('map').classList.add('error');
    document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return setMsg('❌ Seleziona una posizione sulla mappa cliccandoci sopra.', false); 
  }
  
  // Immagine
  if (!file) { 
    markError(imageInput); 
    return setMsg('❌ L\'immagine è obbligatoria.', false); 
  }

  console.log('✅ Tutte le validazioni passate');

  // ========== PREPARAZIONE DATI ==========
  
  const fd = new FormData();
  fd.append('name', name);
  fd.append('description', description);
  fd.append('lat', selectedLat);
  fd.append('lng', selectedLng);
  fd.append('image', file);

  console.log('📦 FormData preparato');

  // ========== CONTROLLO TOKEN ==========
  
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error('❌ Token mancante!');
    setMsg('⚠️ Devi fare il login per aggiungere un gatto!', false);
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
    return;
  }

  console.log('✅ Token trovato:', token.substring(0, 30) + '...');

  // ========== INVIO RICHIESTA ==========
  
  setLoading(true);

  try {
    const baseUrl = (typeof CONFIG !== 'undefined' && CONFIG?.API_URL) 
      ? CONFIG.API_URL 
      : 'http://localhost:3005';
    
    const url = `${baseUrl}/cats`;
    
    console.log('🌐 URL richiesta:', url);
    console.log('📤 Invio richiesta POST...');

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: fd
    });

    console.log('📥 Risposta ricevuta');
    console.log('   Status:', res.status);
    console.log('   Status Text:', res.statusText);
    console.log('   OK:', res.ok);

    const data = await res.json();
    console.log('   Data:', data);

    if (!res.ok) {
      console.error('❌ Errore dal server:', data);
      
      // Gestisci errori specifici
      if (res.status === 401) {
        setMsg('⚠️ Sessione scaduta. Effettua nuovamente il login.', false);
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = 'login.html';
        }, 2000);
        return;
      }
      
      throw new Error(data.error || data.message || 'Errore durante il salvataggio.');
    }

    console.log('✅ Gatto salvato con successo!');
    console.log('   ID:', data._id);
    console.log('   Nome:', data.name);

    setMsg('✅ Gatto pubblicato con successo! Reindirizzamento alla mappa...', true);
    
    // Reset form
    form.reset();
    imagePreview.innerHTML = '';
    if (marker) {
      map.removeLayer(marker);
    }
    
    // Reindirizza dopo 2 secondi
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);

  } catch (err) {
    console.error('❌ ERRORE:', err);
    console.error('   Messaggio:', err.message);
    console.error('   Stack:', err.stack);
    
    setMsg('❌ ' + (err.message || 'Errore di connessione al server. Verifica che il backend sia attivo.'), false);
  } finally {
    setLoading(false);
  }
  
  console.log('=== FINE AGGIUNTA GATTO ===\n');
});

// ========== INIZIALIZZAZIONE ==========

document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 Pagina add-cat caricata');
  
  // Controlla se l'utente è loggato
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('⚠️ Utente non loggato, reindirizzo a login');
    alert('Devi effettuare il login per aggiungere un gatto!');
    window.location.href = 'login.html';
    return;
  }
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  console.log('✅ Utente loggato:', user.name, '(' + user.email + ')');
  
  // Inizializza mappa
  initMap();
});

console.log('✅ Script add-cat.js caricato');