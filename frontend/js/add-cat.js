const form = document.getElementById('addCatForm');
const msg  = document.getElementById('formMsg');
const resetBtn = document.getElementById('resetBtn');

function setMsg(text, ok = true){ msg.textContent = text; msg.className = 'msg ' + (ok ? 'ok' : 'ko'); }
function clearErrors(){ form.querySelectorAll('.error').forEach(el => el.classList.remove('error')); setMsg(''); }

resetBtn.addEventListener('click', () => { form.reset(); clearErrors(); });

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const name = form.name.value.trim();
  const description = form.description.value.trim();
  const lat = parseFloat(form.lat.value);
  const lng = parseFloat(form.lng.value);
  const file = form.image.files[0];

  const markError = (el) => { el.classList.add('error'); el.focus(); };

  if (name.length < 2){ markError(form.name); return setMsg('Il nome deve avere almeno 2 caratteri.', false); }
  if (description.length < 10){ markError(form.description); return setMsg('La descrizione deve avere almeno 10 caratteri.', false); }
  if (!Number.isFinite(lat) || lat < -90 || lat > 90){ markError(form.lat); return setMsg('Latitudine non valida (–90…90).', false); }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180){ markError(form.lng); return setMsg('Longitudine non valida (–180…180).', false); }
  if (!file){ markError(form.image); return setMsg('L\'immagine è obbligatoria.', false); }

  const fd = new FormData(form);

  try{
    const token = localStorage.getItem('token');
    const res = await fetch('/cats', {
      method: 'POST',
      headers: token ? { 'Authorization': 'Bearer ' + token } : undefined,
      body: fd
    });

    if (!res.ok){
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.message || 'Errore di salvataggio.');
    }

    setMsg('Gatto salvato con successo.');
    form.reset();
  }catch(err){
    setMsg(err.message || 'Errore imprevisto.', false);
  }
});
