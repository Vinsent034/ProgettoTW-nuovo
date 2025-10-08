// document.addEventListener('DOMContentLoaded', function() {
//   console.log('Pagina caricata! Script index.js attivo');

//   const token = localStorage.getItem('token');

//   if (token) {
//     console.log('Utente loggato! Token trovato');
//     const userData = localStorage.getItem('user');
//     if (userData) {
//       const user = JSON.parse(userData);
//       console.log('Benvenuto,', user.name);
//     }
//   } else {
//     console.log('Utente NON loggato');
//   }

//   const bottonePubblica = document.querySelector('.btn');

//   bottonePubblica.addEventListener('click', function() {
//     console.log('Hai premuto il bottone Pubblica!');
//     if (token) {
//       console.log('Utente loggato, reindirizzo ad add-cat.html');
//       window.location.href = 'add-cat.html';
//     } else {
//       console.log('Utente non loggato, reindirizzo a login.html');
//       alert('Devi fare il login per pubblicare un gatto!');
//       window.location.href = 'login.html';
//     }
//   });

//   async function caricaGatti() {
//     console.log('Sto caricando i gatti dal server...');
//     try {
//       const risposta = await fetch('http://localhost:3005/cats');
//       if (!risposta.ok) {
//         console.log('Errore nel caricamento dei gatti');
//         return;
//       }
//       const gatti = await risposta.json();
//       console.log('Gatti caricati:', gatti.length);
//       gatti.forEach(function(gatto) {
//         const marker = L.marker([gatto.location.lat, gatto.location.lng]);
//         if (typeof map !== 'undefined') {
//           marker.addTo(map);
//           marker.bindPopup(`
//             <strong>${gatto.name}</strong><br>
//             ${gatto.description.substring(0, 50)}...
//           `);
//         }
//       });
//     } catch (errore) {
//       console.log('Errore durante il caricamento:', errore);
//     }
//   }

//   caricaGatti();
// });
