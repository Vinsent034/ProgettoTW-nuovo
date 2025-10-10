const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Cat = require('../models/Cat');
const authenticate = require('../middleware/authenticate'); 

// recupero commenti del gatto 
router.get('/:catId', async (req, res) => {
  try {
    console.log('Ricerco comemento micio:', req.params.catId);
    
    const commenti = await Comment.find({ cat: req.params.catId }).populate('author', 'name email').sort({ date: -1 }); // recupero della'utore ed emaol, e aggiungerlo epr comemnto

    //console.log('eccoti ' + commenti.length + ' commenti');
    res.json(commenti);
    
  } catch (error) {
    console.error('errore get commenti:', error);
    res.status(500).json({ error: 'Errore nel recupero dei commenti del micio' });
  }
});

// funzionlita cje deve emttere il coemmento solo se ce log 
router.post('/:catId', authenticate, async (req, res) => {
  try {
    const { text } = req.body;

    // il testo deve esserico per forza
    if (!text || text.trim().length === 0) {
      return res.status(400).json({   error: 'Il commento non può essere vuoto, inserisci qualcosa' });
    }

    // verifico che il micio esista 
    const gatto = await Cat.findById(req.params.catId);
    if (!gatto) {
      return res.status(404).json({ error: 'Micio non trovato' });
    }

    console.log('nuovo commento da:', req.user._id, 'per gatto:', req.params.catId);

    // crezione finale 
    const nuovoCommento = new Comment({ text: text.trim(), author: req.user._id, cat: req.params.catId});
    // NON va ebene nel front end dopo finire le modificej



    // salvatagio finale del comenteo 
    const salvato = await nuovoCommento.save();
    
    //aggiungere infirmazioni 
    await salvato.populate('author', 'name email');
    res.status(201).json(salvato);

  } catch (error) {
    console.error('errore aggiunta commento:', error);
    res.status(400).json({ error: 'Errore nell\'aggiunta del commento' });
  }
});

// implementazione del progetto dove si rimuove il gatto solo se tuo
router.delete('/:commentId', authenticate, async (req, res) => {
  try {
    const commento = await Comment.findById(req.params.commentId);
    
    if (!commento) {
      return res.status(404).json({ error: 'Commento non trovato' });
    }

    // controllo per il commento per vedere se è dell'utente loggatp
    if (commento.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({  error: 'Non sei autorizzato a eliminare questo commento' });
    }

    // in caso lo fosse procede con l'eelimonazione 
    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ message: 'Commento eliminato con successo' });

  } catch (error) {
    console.error('errore eliminazione commento:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione del commento' });
  }
});

module.exports = router;