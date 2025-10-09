'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  wireForm();
});

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
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      showMsg('Devi effettuare il login per pubblicare un gatto.', 'error', msg);
      return window.location.href = 'login.html';
    }

    if (!nameI.value.trim()) return showMsg('Inserisci il nome.', 'error', msg);
    if (!latI.value || !lngI.value) return showMsg('Clicca sulla mappa per impostare la posizione.', 'error', msg);
    if (!imgI.files || !imgI.files[0]) return showMsg('Seleziona una foto.', 'error', msg);

    const fd = new FormData();
    fd.append('image', imgI.files[0]); // multer.single('image')
    fd.append('name', nameI.value.trim());
    fd.append('description', descI.value.trim());
    fd.append('location.lat', String(latI.value));
    fd.append('location.lng', String(lngI.value));

    try {
      setLoading(btn, true);
      const baseUrl = (typeof CONFIG !== 'undefined' && CONFIG?.API_URL) ? CONFIG.API_URL : 'http://localhost:3005';

      const resp = await fetch(`${baseUrl}/cats`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });

      const data = await safeJson(resp);

      if (!resp.ok) {
        return showMsg(data?.error || `Errore: ${resp.status}`, 'error', msg);
      }

      showMsg('Gatto pubblicato con successo!', 'success', msg);
      setTimeout(() => { window.location.href = 'index.html'; }, 800);
    } catch (err) {
      showMsg('Errore di connessione al server.', 'error', msg);
    } finally {
      setLoading(btn, false);
    }
  });
}

/* MAPPA */
function initMap() {
  const el = document.getElementById('map');
  if (!el) return;

  try {
    window.map = L.map('map', { scrollWheelZoom:true }).setView([40.8518, 14.2681], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom:19, attribution:'© OpenStreetMap contributors'
    }).addTo(window.map);

    let pickMarker = null;
    const latI = document.getElementById('lat');
    const lngI = document.getElementById('lng');

    window.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      latI.value = lat.toFixed(6);
      lngI.value = lng.toFixed(6);
      if (pickMarker) pickMarker.setLatLng(e.latlng);
      else pickMarker = L.marker(e.latlng).addTo(window.map);
    });
  } catch (e) {
    el.innerHTML = '<p style="padding:12px;color:#b00020;">Impossibile caricare la mappa.</p>';
  }
}

/* UI utils */
function showMsg(text, type, box) {
  if (!box) return;
  box.className = `message message-${type}`;
  box.textContent = text;
  box.style.display = 'block';
}
function setLoading(btn, on) {
  if (!btn) return;
  btn.disabled = on;
  btn.textContent = on ? 'Pubblico…' : 'Pubblica';
}
async function safeJson(r){ try{ return await r.json(); }catch{ return null; } }
