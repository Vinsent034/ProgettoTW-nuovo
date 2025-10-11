const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/upload');

// prende tutti i gatti 
router.get('/', async(req, res) => {
  try {
    console.log('Aspetta un mento sto caricando i gatti');
    const gatti = await Cat.find().populate('author', 'name email').sort({ date: -1 }); 
    
    console.log('ok trovati ' + gatti.length);
    res.json(gatti);
  }
  catch(error) {
    console.error('errore get gatti:', error);
    res.status(500).json({   error: 'Errore durante il recupero dei gatti',message: error.message   });
  }
});

// Qui mi ocucpo del singolo gatto , qi recuperos le credenzialo del gatto come id ecc, per falo vedere nella foto della mappa 
router.get('/:id', async (req, res) => {
  try {
    console.log('Ricerca del micione : ', req.params.id); 
    
    const gatto = await Cat.findById(req.params.id) .populate('author', 'name email'); // qui recupero in CAt le informazioni relative a che lo ha messo 

    if (!gatto) { // se il gatto dovesse ssere non trovato almeno so il percje 
      console.log('AHhhhhhhhhh , micione non trovato ');
      return res.status(404).json({ error: 'Micio non trovato' });
    }

    console.log('Ok ecco il micio si chiama :', gatto.name);
    res.json(gatto); // conveto in json
  }
  catch(error) { // in caso qualcosa andasse storto  con cavolo di db , non
    console.error('errore:', error);
    
    if (error.name === 'CastError') { // dato che se non trovo il gatot lo nomino col nome dell erroere a
      return res.status(400).json({  error: 'ID non valido',   message: error.message  }); // problemi con ide del mico
    }
    
    res.status(500).json({  error: 'Errore durante il recupero del gatto', message: error.message  });
  }
});

// Implementare la funzione che pfa bublicare il micio ma solo se logagto
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    console.log('nuovo micio da:', req.user.name);
    
    // controllo immagine, non mi parte capire dopo perche sto cavolo di problema
    if (!req.file) {
      console.log('manca file');
      return res.status(400).json({ error: 'L\'immagine del gatto è obbligatoria' });
    }
    console.log('file ok:', req.file.filename);

    const { name, description, lat, lng } = req.body;
    
    // controllo per le informazioni relative al gatto 
    if (!name || !description || lat === undefined || lng === undefined) {
      console.log('campi mancanti');
      return res.status(400).json({ 
        error: 'Tutti i campi sono obbligatori', received: { hasName: !!name, hasDescription: !!description,  hasLat: lat !== undefined,hasLng: lng !== undefined}
      });
    }

    // mi assicuro ache almeno il nome sia esitente 
    const nomePulito = name.trim(); // mi assicuro che non contenga spazzi 
    if (nomePulito.length < 2) {
      return res.status(400).json({   error: 'Il nome deve essere di almeno 2 caratteri', received: nomePulito }); // minimo di caratteri 
    }
    if (nomePulito.length > 80) {
      return res.status(400).json({ error: 'Il nome non può superare 80 caratteri' }); // massimo di caratteri 
    }

    // il testo ci deve essere quando metto il micio come da traccia
    const descPulita = description.trim();
    if (descPulita.length < 10) { // lunghezza minima 
      return res.status(400).json({   error: 'La descrizione deve essere di almeno 10 caratteri', received: descPulita.length + ' caratteri'  });
    }
    if (descPulita.length > 500) { // lunghezza massima 
      return res.status(400).json({ error: 'La descrizione non può superare 500 caratteri' });
    }

    //daro che uso la mappa espoetata dal sito , devo converitle le coridanta dal puntatore 
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) { // controllo che siano entrambe valide 
      console.log('coordinate sbagliate');
      return res.status(400).json({  error: 'Le coordinate devono essere numeri validi',  received: { lat, lng, latNum, lngNum }});
    }



    // controlli da vedere se sono necessari 
    // check range
    if (latNum < -90 || latNum > 90) {
      return res.status(400).json({ 
        error: 'La latitudine deve essere tra -90 e 90',
        received: latNum
      });
    }

    if (lngNum < -180 || lngNum > 180) {
      return res.status(400).json({ 
        error: 'La longitudine deve essere tra -180 e 180',
        received: lngNum
      });
    }

    console.log('ok long e lt salvate');

    // Posso occuparemi del salvataggio del miione 
    const nuovoGatto = new Cat({
      name: nomePulito, 
      description: descPulita, 
      location: { 
        lat: latNum, 
        lng: lngNum 
      }, 
      image: req.file.filename, 
      author: req.user._id
    });

    const gattoSalvato = await nuovoGatto.save();
    console.log('salvato! id:', gattoSalvato._id);

    await gattoSalvato.populate('author', 'name email');

    res.status(201).json(gattoSalvato);

  }
  catch(error) {
    console.error('ERRORE salvataggio:', error);
    
    // errori mongoose
    if (error.name === 'ValidationError') {
      console.error('validazione fallita:', error.errors);
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        error: 'Errore di validazione',
        details: messages.join(', ')
      });
    }
    
    res.status(500).json({ 
      error: 'Errore durante il salvataggio del gatto',
      message: error.message 
    });
  }
});

// funzione che deve eliminare il gatto 
router.delete('/:id', authenticate, async (req, res) => {
  try {
    console.log('elimino:', req.params.id);
    console.log('utente:', req.user._id);

    const gatto = await Cat.findById(req.params.id); // recupero le credenziali del gatto 


    // capire eprche il gatto non è recuperato 
    if (!gatto) {
      console.log('gatto non esiste');
      return res.status(404).json({ error: 'Gatto non trovato' });
    }

    console.log('gatto:', gatto.name, '- owner:', gatto.author.toString()); // finelmente recuperato 

    // controllo epr ver verificare se l'autore del fatto coincide con l'ide dell'utente 
    if (gatto.author.toString() !== req.user._id.toString()) {
      console.log('non autorizzato');
      return res.status(403).json({   error: 'Non sei autorizzato a eliminare questo gatto' });
    }

    await Cat.findByIdAndDelete(req.params.id); // ok await necesaria altriemnti mi da errore 
    console.log('eliminato ok');
    
    res.json({   message: 'Gatto rimosso con successo',deletedId: req.params.id 
    });

  } // errori 
  catch(error) {
    console.error('errore eliminazione:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({   error: 'ID non valido', message: error.message });
    }
    
    res.status(500).json({ 
      error: 'Errore durante l\'eliminazione del gatto',   message: error.message 
    });
  }
});

module.exports = router;