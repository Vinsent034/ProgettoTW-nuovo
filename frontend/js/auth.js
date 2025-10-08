function SalvaToken(token){ // funzione in cui salvo uk token dopo il login cosi che lo posso dutilizare dorpo per il gatto
    localStorage.setItem('GONFIG.TOKEN_KWY', token);
}


function getToken() { // funzione che restituisce il token dopo averlo presp
  return localStorage.getItem(CONFIG.TOKEN_KEY);
}



function salvaUtente(userData) { // funzione che salva l'utnete specificandeone la data 
  localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(userData));
}


function getUtente() { // funzione per il recupero utente , quindi i dati relativi a esso
  const data = localStorage.getItem(CONFIG.USER_KEY);
  return data ? JSON.parse(data) : null;
}



function isLoggato() { // funzione per verificare se è realmente loggatop
  return getToken() !== null;
}



function logout() { // funzione per il logatu rimuove il token e la chiave utente 
  localStorage.removeItem(CONFIG.TOKEN_KEY);
  localStorage.removeItem(CONFIG.USER_KEY);
  window.location.href = 'index.html';
}




function richiedeLogin() { // funzione di verifca login 
  if (!isLoggato()) {
    window.location.href = 'login.html';
  }
}