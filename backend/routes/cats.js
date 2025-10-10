const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/upload');

// GET /cats - Recupera tutti i gatti
router.get('/', async(req, res) => {
  try {
    console.log('\n=== GET /cats - Recupero lista gatti ===');
    const gatti = await Cat.find()
      .populate('author', 'name email')
      .sort({ date: -1 }); // Più recenti prima
    
    console.log(`✅ Trovati ${gatti.length} gatti`);
    res.json(gatti);
  }
  catch(error) {
    console.error('❌ Errore recupero gatti:', error);
    res.status(500).json({ 
      error: 'Errore durante il recupero dei gatti',
      message: error.message 
    });
  }
});

// GET /cats/:id - Recupera un singolo gatto
router.get('/:id', async (req, res) => {
  try {
    console.log('\n=== GET /cats/:id ===');
    console.log('ID richiesto:', req.params.id);
    
    const gatto = await Cat.findById(req.params.id)
      .populate('author', 'name email');

    if (!gatto) {
      console.log('❌ Gatto non trovato');
      return res.status(404).json({ error: 'Gatto non trovato' });
    }

    console.log('✅ Gatto trovato:', gatto.name);
    res.json(gatto);
  }
  catch(error) {
    console.error('❌ Errore recupero gatto:', error);
    
    // Errore di ID non valido
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'ID non valido',
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Errore durante il recupero del gatto',
      message: error.message 
    });
  }
});

// POST /cats - Crea nuovo gatto (AUTENTICAZIONE RICHIESTA)
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    console.log('\n========== POST /cats - NUOVO GATTO ==========');
    console.log('👤 User autenticato:', req.user.name, '(ID:', req.user._id + ')');
    
    // ===== CONTROLLO FILE IMMAGINE =====
    if (!req.file) {
      console.log('❌ Nessun file immagine ricevuto');
      return res.status(400).json({ 
        error: 'L\'immagine del gatto è obbligatoria' 
      });
    }
    console.log('✅ File ricevuto:', req.file.filename, '- Size:', (req.file.size/1024).toFixed(2), 'KB');

    // ===== ESTRAZIONE DATI =====
    const { name, description, lat, lng } = req.body;
    
    console.log('📝 Dati ricevuti:');
    console.log('   name:', name, '(type:', typeof name + ')');
    console.log('   description:', description?.substring(0, 50) + '...', '(length:', description?.length + ')');
    console.log('   lat:', lat, '(type:', typeof lat + ')');
    console.log('   lng:', lng, '(type:', typeof lng + ')');

    // ===== VALIDAZIONE CAMPI OBBLIGATORI =====
    if (!name || !description || lat === undefined || lng === undefined) {
      console.log('❌ Campi mancanti!');
      return res.status(400).json({ 
        error: 'Tutti i campi sono obbligatori',
        received: {
          hasName: !!name,
          hasDescription: !!description,
          hasLat: lat !== undefined,
          hasLng: lng !== undefined
        }
      });
    }

    // ===== VALIDAZIONE NOME =====
    const nameTrimmed = name.trim();
    if (nameTrimmed.length < 2) {
      console.log('❌ Nome troppo corto:', nameTrimmed.length, 'caratteri');
      return res.status(400).json({ 
        error: 'Il nome deve essere di almeno 2 caratteri',
        received: nameTrimmed
      });
    }
    if (nameTrimmed.length > 80) {
      console.log('❌ Nome troppo lungo:', nameTrimmed.length, 'caratteri');
      return res.status(400).json({ 
        error: 'Il nome non può superare 80 caratteri' 
      });
    }

    // ===== VALIDAZIONE DESCRIZIONE =====
    const descTrimmed = description.trim();
    if (descTrimmed.length < 10) {
      console.log('❌ Descrizione troppo corta:', descTrimmed.length, 'caratteri');
      return res.status(400).json({ 
        error: 'La descrizione deve essere di almeno 10 caratteri',
        received: descTrimmed.length + ' caratteri'
      });
    }
    if (descTrimmed.length > 500) {
      console.log('❌ Descrizione troppo lunga:', descTrimmed.length, 'caratteri');
      return res.status(400).json({ 
        error: 'La descrizione non può superare 500 caratteri' 
      });
    }

    // ===== CONVERSIONE E VALIDAZIONE COORDINATE =====
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    console.log('🌍 Coordinate convertite:');
    console.log('   latNum:', latNum, '- isNaN:', isNaN(latNum));
    console.log('   lngNum:', lngNum, '- isNaN:', isNaN(lngNum));

    if (isNaN(latNum) || isNaN(lngNum)) {
      console.log('❌ Coordinate non valide');
      return res.status(400).json({ 
        error: 'Le coordinate devono essere numeri validi',
        received: { lat, lng, latNum, lngNum }
      });
    }

    // Validazione range coordinate
    if (latNum < -90 || latNum > 90) {
      console.log('❌ Latitudine fuori range:', latNum);
      return res.status(400).json({ 
        error: 'La latitudine deve essere tra -90 e 90',
        received: latNum
      });
    }

    if (lngNum < -180 || lngNum > 180) {
      console.log('❌ Longitudine fuori range:', lngNum);
      return res.status(400).json({ 
        error: 'La longitudine deve essere tra -180 e 180',
        received: lngNum
      });
    }

    console.log('✅ Tutte le validazioni passate');

    // ===== CREAZIONE OGGETTO GATTO =====
    const nuovoGatto = new Cat({
      name: nameTrimmed, 
      description: descTrimmed, 
      location: { 
        lat: latNum, 
        lng: lngNum 
      }, 
      image: req.file.filename, 
      author: req.user._id
    });

    console.log('📦 Oggetto gatto creato (pre-save)');

    // ===== SALVATAGGIO DATABASE =====
    console.log('💾 Salvataggio in corso...');
    const gattoSalvato = await nuovoGatto.save();
    console.log('✅ Gatto salvato! ID:', gattoSalvato._id);

    // Popola l'autore per la risposta
    await gattoSalvato.populate('author', 'name email');

    console.log('========== FINE POST /cats ==========\n');

    res.status(201).json(gattoSalvato);

  }
  catch(error) {
    console.error('\n❌❌❌ ERRORE SALVATAGGIO GATTO ❌❌❌');
    console.error('Nome errore:', error.name);
    console.error('Messaggio:', error.message);
    
    // Errori di validazione Mongoose
    if (error.name === 'ValidationError') {
      console.error('Dettagli validazione:', error.errors);
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        error: 'Errore di validazione',
        details: messages.join(', ')
      });
    }
    
    // Errore generico
    res.status(500).json({ 
      error: 'Errore durante il salvataggio del gatto',
      message: error.message 
    });
  }
});

// DELETE /cats/:id - Elimina gatto (AUTENTICAZIONE RICHIESTA)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    console.log('\n=== DELETE /cats/:id ===');
    console.log('ID gatto:', req.params.id);
    console.log('User richiedente:', req.user._id, '-', req.user.name);

    const gatto = await Cat.findById(req.params.id);

    if (!gatto) {
      console.log('❌ Gatto non trovato');
      return res.status(404).json({ error: 'Gatto non trovato' });
    }

    console.log('Gatto trovato:', gatto.name);
    console.log('Author:', gatto.author.toString());

    // Verifica autorizzazione
    if (gatto.author.toString() !== req.user._id.toString()) {
      console.log('❌ Utente non autorizzato');
      return res.status(403).json({ 
        error: 'Non sei autorizzato a eliminare questo gatto' 
      });
    }

    await Cat.findByIdAndDelete(req.params.id);
    console.log('✅ Gatto eliminato con successo');
    
    res.json({ 
      message: 'Gatto eliminato con successo',
      deletedId: req.params.id 
    });

  }
  catch(error) {
    console.error('❌ Errore eliminazione:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'ID non valido',
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Errore durante l\'eliminazione del gatto',
      message: error.message 
    });
  }
});

module.exports = router;