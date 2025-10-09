const form = document.getElementById('addCatForm');
const msg = document.getElementById('formMsg');
const resetBtn = document.getElementById('resetBtn');

function setMsg(text, ok = true) { 
  msg.textContent = text; 
  msg.className = 'msg ' + (ok ? 'ok' : 'ko'); 
}

function clearErrors() { 
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error')); 
  setMsg(''); 
}

resetBtn.addEventListener('click', () => { 
  form.reset(); 
  clearErrors(); 
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();
  
  console.log('\n=== INIZIO SUBMIT FORM ===');

  const name = form.name.value.trim();
  const description = form.description.value.trim();
  const lat = parseFloat(form.lat.value);
  const lng = parseFloat(form.lng.value);
  const file = form.image.files[0];

  console.log('Dati form:');
  console.log('  name:', name);
  console.log('  description:', description.substring(0, 30) + '...');
  console.log('  lat:', lat);
  console.log('  lng:', lng);
  console.log('  file:', file ? file.name : 'NESSUNO');

  const markError = (el) => { el.classList.add('error'); el.focus(); };

  // Validazioni
  if (name.length < 2) { 
    markError(form.name); 
    return setMsg('Il nome deve avere almeno 2 caratteri.', false); 
  }
  
  if (description.length < 10) { 
    markError(form.description); 
    return setMsg('La descrizione deve avere almeno 10 caratteri.', false); 
  }
  
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) { 
    markError(form.lat); 
    return setMsg('Latitudine non valida (–90…90).', false); 
  }
  
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) { 
    markError(form.lng); 
    return setMsg('Longitudine non valida (–180…180).', false); 
  }
  
  if (!file) { 
    markError(form.image); 
    return setMsg('L\'immagine è obbligatoria.', false); 
  }

  console.log('✅ Validazioni passate');

  // Crea FormData
  const fd = new FormData();
  fd.append('name', name);
  fd.append('description', description);
  fd.append('lat', lat);
  fd.append('lng', lng);
  fd.append('image', file);

  console.log('FormData creato');

  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('❌ Token mancante!');
      setMsg('Devi fare il login per aggiungere un gatto!', false);
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
      return;
    }

    console.log('✅ Token trovato:', token.substring(0, 20) + '...');

    // ✅ URL COMPLETO del backend
    const baseUrl = (typeof CONFIG !== 'undefined' && CONFIG?.API_URL) 
      ? CONFIG.API_URL 
      : 'http://localhost:3005';
    
    const url = `${baseUrl}/cats`;
    
    console.log('URL richiesta:', url);
    console.log('Invio richiesta POST...');

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: fd
    });

    console.log('Risposta ricevuta');
    console.log('Status:', res.status);
    console.log('OK:', res.ok);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error('❌ Errore dal server:', data);
      throw new Error(data.error || data.message || 'Errore di salvataggio.');
    }

    const data = await res.json();
    console.log('✅ Gatto salvato:', data);

    setMsg('Gatto salvato con successo! Reindirizzamento...', true);
    form.reset();
    
    // Reindirizza alla home dopo 1.5 secondi
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);

  } catch (err) {
    console.error('❌ ERRORE:', err);
    setMsg(err.message || 'Errore imprevisto.', false);
  }
  
  console.log('=== FINE SUBMIT FORM ===\n');
});