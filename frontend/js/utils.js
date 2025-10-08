function formattaData(dataString) { // dato che odio l'inglese e mi sono limitato solo con le varibbili , quelloc che vedro ovviamente  è tradotto in italiano
  const data = new Date(dataString);
  const giorno = String(data.getDate()).padStart(2, '0');
  const mese = String(data.getMonth() + 1).padStart(2, '0');
  const anno = data.getFullYear();
  return giorno + '/' + mese + '/' + anno;
}


function mostraErrore(messaggio) { // se fallisce un operazioje mando il messaggio di alelte
  alert('Errore: ' + messaggio);
}


function mostraSuccesso(messaggio) { // in caso di sucesso mi dice che che va bene 
  alert(messaggio);
}






async function apiCall(endpoint, metodo, body) { // la funzione usa LE API con autentiacioni
  const options = {method: metodo,headers: {   'Content-Type': 'application/json'  }};






const token = getToken();
  if (token) { options.headers['Authorization'] = 'Bearer ' + token;}

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(CONFIG.API_URL + endpoint, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Errore nella richiesta');
  }

  return data;
}





async function apiUpload(endpoint, formData) {  // la funzione si occupa di effettuare un uload tramite FormData , usato per le immagini
  const token = getToken();
  
  const options = { method: 'POST', headers: {  'Authorization': 'Bearer ' + token }, body: formData};

  const response = await fetch(CONFIG.API_URL + endpoint, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Errore nell\'upload');
  }

  return data;
}


