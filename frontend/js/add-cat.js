'use strict';

let map, marker;
let selectedLat = null;
let selectedLng = null;

const form = document.getElementById('addCatForm');
const msg = document.getElementById('formMsg');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('imagePreview');
const latInput = document.getElementById('lat');
const lngInput = document.getElementById('lng');

function showMsg(text, type) { 
  msg.textContent = text; 
  msg.className = type;
  msg.style.display = 'block';
}

function hideMsg() {
  msg.style.display = 'none';
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  submitBtn.textContent = loading ? 'Caricamento...' : 'Pubblica';
}

function initMap() {
  try {
    map = L.map('map').setView([40.8518, 14.2681], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    map.on('click', function(e) {
      selectedLat = e.latlng.lat;
      selectedLng = e.latlng.lng;
      
      latInput.value = selectedLat;
      lngInput.value = selectedLng;
      
      if (marker) {
        map.removeLayer(marker);
      }
      
      marker = L.marker([selectedLat, selectedLng]).addTo(map);
      marker.bindPopup('Gatto qui').openPopup();
      
      document.getElementById('map').classList.remove('error-field');
    });
  } catch (err) {
    console.error('Errore mappa:', err);
    document.getElementById('map').innerHTML = 
      '<p style="padding:20px;text-align:center;color:red;">Errore caricamento mappa</p>';
  }
}

imageInput.addEventListener('change', function() {
  imagePreview.innerHTML = '';
  
  if (this.files && this.files[0]) {
    const file = this.files[0];
    
    if (file.size > 5 * 1024 * 1024) {
      showMsg('Immagine troppo grande (max 5MB)', 'error');
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

cancelBtn.addEventListener('click', function() {
  if (confirm('Vuoi annullare? Perderai tutti i dati.')) {
    window.location.href = 'index.html';
  }
});

form.addEventListener('submit', async function(e) {
  e.preventDefault();
  hideMsg();
  
  const name = form.name.value.trim();
  const description = form.description.value.trim();
  const file = imageInput.files[0];

  // validazioni
  if (name.length < 2) {
    form.name.classList.add('error-field');
    showMsg('Il nome deve avere almeno 2 caratteri', 'error');
    return;
  }
  form.name.classList.remove('error-field');
  
  if (description.length < 10) {
    form.description.classList.add('error-field');
    showMsg('La descrizione deve avere almeno 10 caratteri', 'error');
    return;
  }
  form.description.classList.remove('error-field');
  
  if (!selectedLat || !selectedLng) {
    document.getElementById('map').classList.add('error-field');
    showMsg('Seleziona una posizione sulla mappa', 'error');
    return;
  }
  
  if (!file) {
    imageInput.classList.add('error-field');
    showMsg('Carica una foto del gatto', 'error');
    return;
  }
  imageInput.classList.remove('error-field');
  
  const token = localStorage.getItem('token');
  if (!token) {
    showMsg('Devi fare il login', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }

  const fd = new FormData();
  fd.append('name', name);
  fd.append('description', description);
  fd.append('lat', selectedLat);
  fd.append('lng', selectedLng);
  fd.append('image', file);

  setLoading(true);

  try {
    const baseUrl = window.CONFIG?.API_URL || 'http://localhost:3005';
    const url = `${baseUrl}/cats`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: fd
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        showMsg('Sessione scaduta. Effettua il login.', 'error');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = 'login.html';
        }, 2000);
        return;
      }
      throw new Error(data.error || 'Errore durante il salvataggio');
    }

    showMsg('Gatto pubblicato! Reindirizzamento...', 'success');
    
    form.reset();
    imagePreview.innerHTML = '';
    if (marker) {
      map.removeLayer(marker);
    }
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);

  } catch (err) {
    console.error('Errore:', err);
    showMsg(err.message || 'Errore di connessione', 'error');
  } finally {
    setLoading(false);
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Devi fare il login!');
    window.location.href = 'login.html';
    return;
  }
  
  initMap();
});