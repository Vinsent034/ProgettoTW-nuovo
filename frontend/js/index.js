'use strict';

let map;
let listaGatti = [];

document.addEventListener('DOMContentLoaded', () => {
  aggiornaNavbar();
  inizializzaMappa();
  wireUI();
  caricaGatti();
});

function wireUI() {
  const btn = document.getElementById('btnPublish');
  btn?.addEventListener('click', onPublishClick);
}

function onPublishClick() {
  const token = localStorage.getItem('token');
  if (token) {
    window.location.href = 'add-cat.html';
  } else {
    alert('Devi fare il login per pubblicare un gatto!');
    window.location.href = 'login.html';
  }
}

function aggiornaNavbar() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const token = localStorage.getItem('token');
  if (token) {
    const user = safeParse(localStorage.getItem('user')) || {};
    nav.innerHTML = `
      <span style="position:absolute; right:120px; top:50%; transform:translateY(-50%); color:#6b7280;">
        Ciao, ${escapeHtml(user.name || 'Utente')}
      </span>
      <a class="login" href="#" id="btnLogout">Logout</a>
    `;
    document.getElementById('btnLogout')?.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    });
  } else {
    nav.innerHTML = `<a class="login" href="login.html">Login</a>`;
  }
}

function inizializzaMappa() {
  const el = document.getElementById('map');
  if (!el) return;
  try {
    map = L.map('map', { scrollWheelZoom: true }).setView([40.8518, 14.2681], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    // Marker centrale (facoltativo)
    // L.marker([40.8518, 14.2681]).addTo(map).bindPopup('Napoli');
  } catch (err) {
    el.innerHTML = '<p style="padding:12px;color:#b00020;">Impossibile caricare la mappa.</p>';
  }
}

async function caricaGatti() {
  mostra(document.getElementById('loading'));
  nascondi(document.getElementById('message'));

  const base = (typeof CONFIG !== 'undefined' && CONFIG?.API_URL) ? CONFIG.API_URL : 'http://localhost:3005';
  try {
    const r = await fetch(`${base}/cats`, { headers: { 'Accept': 'application/json' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    listaGatti = await r.json();

    if (Array.isArray(listaGatti) && listaGatti.length > 0) {
      renderMarkers(listaGatti);
    } else {
      const msg = document.getElementById('message');
      msg.className = 'message message-info';
      msg.innerHTML = `Nessun gatto segnalato. <a href="login.html">Accedi</a> e aggiungi il primo!`;
      mostra(msg);
    }
  } catch (err) {
    const msg = document.getElementById('message');
    msg.className = 'message message-error';
    msg.innerHTML = `
      <strong>Impossibile connettersi al server.</strong><br>
      Verifica che il backend sia su <code>http://localhost:3005</code> e in esecuzione.
    `;
    mostra(msg);
  } finally {
    nascondi(document.getElementById('loading'));
  }
}

function renderMarkers(gatti) {
  if (!map) return;
  const bounds = [];
  gatti.forEach(g => {
    const lat = g?.location?.lat;
    const lng = g?.location?.lng;
    if (typeof lat !== 'number' || typeof lng !== 'number') return;

    const marker = L.marker([lat, lng]).addTo(map);
    const nome = escapeHtml(g?.name || 'Senza nome');
    const id = g?._id;

    marker.bindPopup(`
      <div style="text-align:center; min-width:160px;">
        <strong>${nome}</strong><br>
        ${id ? `<a href="cat-detail.html?id=${encodeURIComponent(id)}" style="color:#2c3e50;">Vedi dettagli</a>` : ''}
      </div>
    `);
    bounds.push([lat, lng]);
  });

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50] });
  } else {
    map.setView([40.8518, 14.2681], 12);
  }
}

/* Utils */
function mostra(el){ if (el) el.style.display = ''; }
function nascondi(el){ if (el) el.style.display = 'none'; }
function safeParse(s){ try{ return JSON.parse(s); } catch { return null; } }
function escapeHtml(s){
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;')
    .replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;");
}
