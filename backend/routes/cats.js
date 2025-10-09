const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/upload');

router.get('/', async(req, res) => {
  try {
    console.log("Sto recuperando la lista di gatti");
    const gatti = await Cat.find().populate('author', 'name email');
    console.log('ok gatti recuperati -> ', gatti.length);
    res.json(gatti);
  }
  catch(error) {
    console.error('Non sono riuscito a recuperare i gatti ce un problema ', error);
    res.status(500).json({ error: 'Si è verificato un errore durante il recupero dei gatti' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    console.log('DELETE /cats/:id - Richiesta eliminazione');
    console.log('ID gatto:', req.params.id);
    console.log('User ID richiedente:', req.user._id);

    const gatto = await Cat.findById(req.params.id);

    if (!gatto) {
      console.log('Gatto non trovato con ID:', req.params.id);
      return res.status(404).json({ error: 'Gatto non trovato' });
    }

    console.log('Gatto trovato:', gatto.name);
    console.log('Author del gatto:', gatto.author.toString());
    console.log('User loggato:', req.user._id.toString());

    if (gatto.author.toString() !== req.user._id.toString()) {
      console.log('Utente non autorizzato a eliminare questo gatto');
      return res.status(403).json({ error: 'Non sei autorizzato a eliminare questo gatto' });
    }

    await Cat.findByIdAndDelete(req.params.id);
    console.log('Gatto eliminato con successo');
    res.json({ message: 'Gatto eliminato con successo' });

  }
  catch(error) {
    console.error('Errore durante l eliminazione del gatto', error);
    res.status(500).json({ error: 'Si è verificato un errore durante l eliminazione del gatto' });
  }
});

router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    console.log('\n========== POST /cats ==========');
    console.log('User autenticato:', req.user._id, '-', req.user.name);
    
    // Controlla se c'è l'immagine
    if (!req.file) {
      console.log('❌ Nessun file immagine ricevuto');
      console.log('req.file:', req.file);
      return res.status(400).json({ error: 'Immagine del gatto è obbligatoria' });
    }
    console.log('✅ Immagine ricevuta:', req.file.filename, 'size:', req.file.size);

    // Estrai i dati dal body
    const { name, description, lat, lng } = req.body;
    
    console.log('Dati ricevuti dal body:');
    console.log('  name:', name, 'tipo:', typeof name);
    console.log('  description:', description, 'tipo:', typeof description, 'lunghezza:', description?.length);
    console.log('  lat:', lat, 'tipo:', typeof lat);
    console.log('  lng:', lng, 'tipo:', typeof lng);
    console.log('  image filename:', req.file.filename);

    // Validazione campi
    if (!name || !description || !lat || !lng) {
      console.log('❌ Campi mancanti!');
      console.log('name?', !!name, 'description?', !!description, 'lat?', !!lat, 'lng?', !!lng);
      return res.status(400).json({ error: 'Tutti i campi sono obbligatori (name, description, lat, lng)' });
    }

    // Validazione lunghezza nome
    if (name.trim().length < 2) {
      console.log('❌ Nome troppo corto:', name.trim().length);
      return res.status(400).json({ error: 'Il nome deve essere di almeno 2 caratteri' });
    }

    // Validazione lunghezza descrizione
    if (description.trim().length < 10) {
      console.log('❌ Descrizione troppo corta:', description.trim().length);
      return res.status(400).json({ error: 'La descrizione deve essere di almeno 10 caratteri' });
    }

    console.log('✅ Validazioni di base passate');

    // Converti coordinate in numeri
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    console.log('Coordinate convertite:');
    console.log('  latNum:', latNum, 'isNaN?', isNaN(latNum));
    console.log('  lngNum:', lngNum, 'isNaN?', isNaN(lngNum));

    // Validazione coordinate
    if (isNaN(latNum) || isNaN(lngNum)) {
      console.log('❌ Coordinate non valide!');
      return res.status(400).json({ 
        error: 'Le coordinate di latitudine e longitudine devono essere numeri validi',
        received: { lat, lng, latNum, lngNum }
      });
    }

    console.log('✅ Coordinate valide');
    console.log('Gatto aggiunto da:', req.user.name, '(', req.user._id, ')');

    // Crea nuovo gatto
    const nuovoGatto = new Cat({
      name: name.trim(), 
      description: description.trim(), 
      location: { 
        lat: latNum, 
        lng: lngNum 
      }, 
      image: req.file.filename, 
      author: req.user._id
    });

    console.log('Oggetto gatto creato (pre-save):');
    console.log(JSON.stringify(nuovoGatto, null, 2));

    // Salva nel database
    console.log('💾 Tentativo salvataggio...');
    const gattoSalvato = await nuovoGatto.save();
    console.log('✅ Gatto salvato con successo! ID:', gattoSalvato._id);

    // Popola author
    await gattoSalvato.populate('author', 'name email');

    console.log('✅ Author popolato');
    console.log('========== FINE POST /cats ==========\n');

    res.status(201).json(gattoSalvato);

  }
  catch(error) {
    console.error('❌❌❌ ERRORE DURANTE SALVATAGGIO GATTO ❌❌❌');
    console.error('Tipo errore:', error.name);
    console.error('Messaggio:', error.message);
    console.error('Stack:', error.stack);
    
    // Errori di validazione Mongoose
    if (error.name === 'ValidationError') {
      console.error('Dettagli validazione:', error.errors);
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        error: 'Errore di validazione: ' + messages.join(', '),
        details: error.errors
      });
    }
    
    res.status(400).json({ 
      error: 'Si è verificato un errore durante il salvataggio del gatto',
      message: error.message 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    console.log('Sto cercando il gatto con id -> ', req.params.id);
    const gatto = await Cat.findById(req.params.id).populate('author', 'name email');

    if (!gatto) {
      console.log('Gatto non trovato con id -> ', req.params.id);
      return res.status(404).json({ error: 'Gatto non trovato' });
    }

    console.log('Gatto trovato, nome: -> ', gatto.name);
    res.json(gatto);
  }
  catch(error) {
    console.error('Errore durante il recupero del gatto', error);
    res.status(500).json({ error: 'Si è verificato un errore durante il recupero del gatto' });
  }
});

module.exports = router;