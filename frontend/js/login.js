'use strict';

document.addEventListener('DOMContentLoaded', () => {
  inizializzaForm();
});

function qs(sel) { return document.querySelector(sel); }

function inizializzaForm() {
  const formLogin = qs('#formLogin');
  const formRegister = qs('#formRegister');

  formLogin?.addEventListener('submit', onLoginSubmit);
  formRegister?.addEventListener('submit', onRegisterSubmit);

  qs('#btnShowRegister')?.addEventListener('click', (e) => { e.preventDefault(); mostraRegistrazione(); });
  qs('#btnShowLogin')?.addEventListener('click', (e) => { e.preventDefault(); mostraLogin(); });

  try {
    if (typeof isLoggato === 'function' && isLoggato()) {
      window.location.href = 'index.html';
    }
  } catch (_) {}
}

async function onLoginSubmit(e) {
  e.preventDefault();
  const email = qs('#loginEmail')?.value.trim() || '';
  const password = qs('#loginPassword')?.value || '';
  const btn = qs('#btnLogin');

  if (!validaEmail(email)) return mostraMessaggio('Inserisci un’email valida.', 'error');
  if (password.length < 6) return mostraMessaggio('La password deve avere almeno 6 caratteri.', 'error');

  setLoading(btn, true);

  try {
    const baseUrl = (typeof CONFIG !== 'undefined' && CONFIG?.API_URL) ? CONFIG.API_URL : 'http://localhost:3005';
    const resp = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await safeJson(resp);

    if (resp.ok) {
      try { localStorage.setItem('token', data.token); } catch(_) {}
      try { localStorage.setItem('user', JSON.stringify(data.user)); } catch(_) {}
      mostraMessaggio('Accesso effettuato. Reindirizzamento…', 'success');
      window.location.href = 'index.html';
    } else {
      mostraMessaggio(data?.error || 'Credenziali non valide.', 'error');
    }
  } catch (err) {
    mostraMessaggio('Errore di connessione al server.', 'error');
  } finally {
    setLoading(btn, false);
  }
}

async function onRegisterSubmit(e) {
  e.preventDefault();
  const name = qs('#registerName')?.value.trim() || '';
  const email = qs('#registerEmail')?.value.trim() || '';
  const password = qs('#registerPassword')?.value || '';
  const btn = qs('#btnRegister');

  if (name.length < 2) return mostraMessaggio('Inserisci un nome valido.', 'error');
  if (!validaEmail(email)) return mostraMessaggio('Inserisci un’email valida.', 'error');
  if (password.length < 6) return mostraMessaggio('La password deve avere almeno 6 caratteri.', 'error');

  setLoading(btn, true);

  try {
    const baseUrl = (typeof CONFIG !== 'undefined' && CONFIG?.API_URL) ? CONFIG.API_URL : 'http://localhost:3005';
    const resp = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await safeJson(resp);

    if (resp.ok) {
      mostraMessaggio('Registrazione completata! Ora puoi accedere.', 'success');
      setTimeout(mostraLogin, 1200);
    } else {
      mostraMessaggio(data?.error || 'Errore nella registrazione.', 'error');
    }
  } catch (err) {
    mostraMessaggio('Errore di connessione al server.', 'error');
  } finally {
    setLoading(btn, false);
  }
}

function mostraRegistrazione() {
  qs('#loginForm')?.setAttribute('style', 'display:none;');
  qs('#registerForm')?.setAttribute('style', 'display:block;');
  const msg = qs('#message'); if (msg) msg.style.display = 'none';
}

function mostraLogin() {
  qs('#registerForm')?.setAttribute('style', 'display:none;');
  qs('#loginForm')?.setAttribute('style', 'display:block;');
  const msg = qs('#message'); if (msg) msg.style.display = 'none';
}

function mostraMessaggio(testo, tipo) {
  const box = qs('#message'); if (!box) return;
  box.className = `message message-${tipo}`;
  box.innerText = testo;
  box.style.display = 'block';
}

function setLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.dataset._label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Attendere…';
  } else {
    btn.disabled = false;
    if (btn.dataset._label) {
      btn.textContent = btn.dataset._label;
      delete btn.dataset._label;
    }
  }
}

function validaEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
async function safeJson(resp){ try{ return await resp.json(); } catch { return null; } }

// (facoltative, se usi altrove)
function isLoggato(){ try { return !!localStorage.getItem('token'); } catch { return false; } }
function logout(){ try { localStorage.removeItem('token'); localStorage.removeItem('user'); } catch {} }
