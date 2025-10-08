// // js/registrazione.js
// 'use strict';

// document.addEventListener('DOMContentLoaded', () => {
//   const form = document.getElementById('formRegister');
//   const nameI = document.getElementById('registerName');
//   const emailI = document.getElementById('registerEmail');
//   const passI = document.getElementById('registerPassword');
//   const btn = document.getElementById('btnRegister');
//   const msg = document.getElementById('message');

//   form.addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const name = nameI.value.trim();
//     const email = emailI.value.trim();
//     const password = passI.value;

//     if (name.length < 2) return mostraMessaggio('Inserisci un nome valido.', 'error');
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return mostraMessaggio('Email non valida.', 'error');
//     if (password.length < 6) return mostraMessaggio('La password deve avere almeno 6 caratteri.', 'error');

//     setLoading(true);

//     try {
//       const baseUrl = (typeof CONFIG !== 'undefined' && CONFIG?.API_URL) ? CONFIG.API_URL : 'http://localhost:3005';
//       const resp = await fetch(`${baseUrl}/auth/register`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
//         body: JSON.stringify({ name, email, password })
//       });

//       const data = await safeJson(resp);

//       if (!resp.ok) {
//         return mostraMessaggio(data?.error || 'Errore nella registrazione.', 'error');
//       }

//       mostraMessaggio('Registrazione completata! Ora puoi accedere.', 'success');
//       setTimeout(() => { window.location.href = 'login.html'; }, 1200);
//     } catch (err) {
//       mostraMessaggio('Errore di connessione al server.', 'error');
//     } finally {
//       setLoading(false);
//     }
//   });

//   function mostraMessaggio(testo, tipo) {
//     msg.className = `message message-${tipo}`;
//     msg.textContent = testo;
//     msg.style.display = 'block';
//   }

//   function setLoading(on) {
//     btn.disabled = on;
//     btn.textContent = on ? 'Attendere…' : 'Registrazione';
//   }

//   async function safeJson(resp) {
//     try { return await resp.json(); } catch { return null; }
//   }
// });
