const IndirizzoBackend = 'http://localhost:3005';




// quando la pagina si carica parte questa funzione
document.addEventListener('DOMContentLoaded', function() {
    console.log('ok la pagina detail cat si è caricata');
    
    // devo prendere l'id del gatto dall'url
    const url = window.location.search; // prendo la parte dopo il ?
    console.log('url completo:', url);
    
    const params = new URLSearchParams(url);
    const idGatto = params.get('id'); // prendo il valore di id
    
    console.log('id del gatto:', idGatto);
    
    // se non c'è l'id qualcosa è andato storto
    if (!idGatto) {
        alert('errore non trovo il gatto');
        window.location.href = 'index.html';
        return;
    }
    
    // ok adesso carico i dati del gatto
    CaricaGatto(idGatto);
    
    // carico anche i commenti
    CaricaCommenti(idGatto);
    
    // vedo se l'utente è loggato
    const token = localStorage.getItem('token');
    if (token) {
        console.log('ok utente loggato');
        document.getElementById('AggiungiCommento').classList.remove('hidden');
    } else {
        console.log('utente non loggato non può commentare');
    }
});




// funzione che carica i dati del gatto
function CaricaGatto(id) {
    console.log('carico il gatto con id:', id);
    
    // chiamo il backend
    fetch(IndirizzoBackend + '/cats/' + id) .then(function(risposta) {
         return risposta.json();
    }).then(function(gatto) {
        console.log('gatto ricevuto:', gatto);
            
        // metto il nome
         document.getElementById('NomeGatto').textContent = gatto.name;
            
         // metto la foto
         const foto = document.getElementById('cat-photo');
         foto.src = IndirizzoBackend + '/uploads/' + gatto.image;
            
         // metto la descrizione
         document.getElementById('DescrizioneGatto').innerHTML = marked.parse(gatto.description);
            
            // vedo se posso eliminare il gatto
         const token = localStorage.getItem('token');
         if (token) {
             const userData = localStorage.getItem('user');
             if (userData) {
                 const user = JSON.parse(userData);
                    
                 // se sono l'autore mostro il bottone elimina
                 if (gatto.author._id === user.id) {
                     console.log('sei l autore puoi eliminare');
                     document.getElementById('BottoneElimina').classList.remove('hidden');
                    }
                }
            }
        }) .catch(function(errore) {

           // console.log('errore nel caricamento:', errore);
            alert('errore non riesco a caricare il gatto');

        });
}




// funzione per caricare i commenti
function CaricaCommenti(idGatto) {
    console.log('carico i commenti del gatto:', idGatto);
    
    fetch(IndirizzoBackend + '/comments/' + idGatto)
        .then(function(risposta) {
            return risposta.json();
        })
        .then(function(commenti) {
            console.log('ho ricevuto', commenti.length, 'commenti');
            
            const contenitore = document.getElementById('ListaCommenti');
            
            // se non ci sono commenti
            if (commenti.length === 0) {
                contenitore.innerHTML = '<p style="text-align: center; color: #999;">Nessun commento ancora</p>';
                return;
            }
            
            // vedo se l'utente è loggato per sapere se può eliminare
            const userData = localStorage.getItem('user');
            let idUtenteLoggato = null;
            if (userData) {
                const user = JSON.parse(userData);
                idUtenteLoggato = user.id;
            }
            
            // creo l'html per i commenti
            let html = '';
            
            for (let i = 0; i < commenti.length; i++) {
                const commento = commenti[i];
                
                // formatto la data
                const data = new Date(commento.date);
                const dataFormattata = data.getDate() + '/' +   (data.getMonth() + 1) + '/' + data.getFullYear() + ' ' +data.getHours() + ':' +  data.getMinutes();
                
                html += '<div style="padding: 10px; margin-bottom: 10px; background: #f0f0f0; border-radius: 5px; position: relative;">';
                html += '<p style="margin: 0; font-weight: bold;">' + commento.author.name + '</p>';
                html += '<p style="margin: 5px 0;">' + commento.text + '</p>';
                html += '<p style="margin: 0; font-size: 11px; color: #666;">' + dataFormattata + '</p>';
                
                // se sono l'autore del commento mostro il bottone elimina
                if (idUtenteLoggato && commento.author._id === idUtenteLoggato) {
                    html += '<button onclick="EliminaCommento(\'' + commento._id + '\')" ';
                    html += 'style="position: absolute; top: 10px; right: 10px; ';
                    html += 'background: #f44336; color: white; border: none; ';
                    html += 'padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">';
                    html += 'Elimina</button>';
                }
                
                html += '</div>';
            }
            
            contenitore.innerHTML = html;
        })
        .catch(function(errore) {
            console.log('errore caricamento commenti:', errore);
        });
}




// funzione per aggiungere un commento
function AggiungiCommento() {
    console.log('ok provo ad aggiungere commento');
    
    // prendo il testo del commento
    const testo = document.getElementById('Commento').value;
    
    // controllo che non sia vuoto
    if (!testo || testo.trim() === '') {
        alert('scrivi qualcosa prima di inviare');
        return;
    }
    
    // prendo il token
    const token = localStorage.getItem('token');
    if (!token) {
        alert('devi fare il login');
        window.location.href = 'login.html';
        return;
    }
    
    // prendo l'id del gatto
    const url = window.location.search;
    const params = new URLSearchParams(url);
    const idGatto = params.get('id');
    
    console.log('invio commento per gatto:', idGatto);
    
    // invio al backend
    fetch(IndirizzoBackend + '/comments/' + idGatto, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ text: testo })
    })
    .then(function(risposta) {
        return risposta.json();
    })
    .then(function(data) {
        if (data._id) {
            console.log('commento aggiunto ok');
            alert('Commento aggiunto!');
            
            // pulisco il campo
            document.getElementById('Commento').value = '';
            
            // ricarico i commenti
            CaricaCommenti(idGatto);
        } else {
            alert('errore: ' + data.error);
        }
    })
    .catch(function(errore) {
        console.log('errore invio commento:', errore);
        alert('errore non riesco a inviare il commento');
    });
}




// funzione per eliminare il gatto
function EliminaGatto() {
    console.log('provo a eliminare il gatto');
    
    // chiedo conferma
    const conferma = confirm('Sei sicuro di voler eliminare questo gatto?');
    if (!conferma) {
        console.log('utente ha annullato');
        return;
    }
    
    // prendo il token
    const token = localStorage.getItem('token');
    if (!token) {
        alert('devi fare il login');
        return;
    }
    
    // prendo l'id
    const url = window.location.search;
    const params = new URLSearchParams(url);
    const idGatto = params.get('id');
    
    console.log('elimino gatto:', idGatto);
    
    // chiamo il backend
    fetch(IndirizzoBackend + '/cats/' + idGatto, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(function(risposta) {
        return risposta.json();
    })
    .then(function(data) {
        if (data.message) {
            console.log('gatto eliminato ok');
            alert('Gatto eliminato!');
            window.location.href = 'index.html';
        } else {
            alert('errore: ' + data.error);
        }
    })
    .catch(function(errore) {
        console.log('errore eliminazione:', errore);
        alert('errore non riesco a eliminare');
    });
}




// funzione per eliminare un commento
function EliminaCommento(idCommento) {
    console.log('provo a eliminare il commento:', idCommento);
    
    // chiedo conferma
    const conferma = confirm('Sei sicuro di voler eliminare questo commento?');
    if (!conferma) {
        console.log('utente ha annullato');
        return;
    }
    
    // prendo il token
    const token = localStorage.getItem('token');
    if (!token) {
        alert('devi fare il login');
        return;
    }
    
    console.log('elimino commento:', idCommento);
    
    // chiamo il backend
    fetch(IndirizzoBackend + '/comments/' + idCommento, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(function(risposta) {
        return risposta.json();
    })
    .then(function(data) {
        if (data.message) {
            console.log('commento eliminato ok');
            alert('Commento eliminato!');
            
            // ricarico i commenti
            const url = window.location.search;
            const params = new URLSearchParams(url);
            const idGatto = params.get('id');
            CaricaCommenti(idGatto);
        } else {
            alert('errore: ' + data.error);
        }
    })
    .catch(function(errore) {
        console.log('errore eliminazione commento:', errore);
        alert('errore non riesco a eliminare il commento');
    });
}