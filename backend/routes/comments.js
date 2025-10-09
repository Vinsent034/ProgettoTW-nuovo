const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Cat = require('../models/Cat');
const authenticate = require('../middleware/authenticate'); 

// GET - Recupera tutti i commenti di un gatto
router.get('/:catId', async (req, res) => {
  try {
    console.log('Richiesta commenti per il micio:', req.params.catId);
    
    const commenti = await Comment.find({ cat: req.params.catId })
      .populate('author', 'name email')
      .sort({ date: -1 });

    console.log(`Micione trovato, commenti: ${commenti.length}`);
    res.json(commenti);
    
  } catch (error) {
    console.error('Errore nel recupero dei commenti del micio:', error);
    res.status(500).json({ error: 'Errore nel recupero dei commenti del micio' });
  }
});

// POST - Aggiungi un nuovo commento
router.post('/:catId', authenticate, async (req, res) => {
  try {
    const { text } = req.body;

    // Controllo per vedere se il tizio ha messo correttamente il commento
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Il commento non può essere vuoto, inserisci qualcosa' 
      });
    }

    // Controllo per assicurarsi che il micio esista
    const gatto = await Cat.findById(req.params.catId);
    if (!gatto) {
      return res.status(404).json({ error: 'Micio non trovato' });
    }

    console.log('Commento aggiunto da:', req.user._id, 'al micio:', req.params.catId);

    // Adesso posso creare il commento dopo che i controlli sono finiti
    const nuovoCommento = new Comment({
      text: text.trim(),
      author: req.user._id,
      cat: req.params.catId
    });

    const commentoSalvato = await nuovoCommento.save();
    
    await commentoSalvato.populate('author', 'name email');
    res.status(201).json(commentoSalvato);

  } catch (error) {
    console.error('Errore nell\'aggiunta del commento:', error);
    res.status(400).json({ error: 'Errore nell\'aggiunta del commento' });
  }
});

// DELETE - Elimina un commento (FUORI dal router.post!)
router.delete('/:commentId', authenticate, async (req, res) => {
  try {
    const commento = await Comment.findById(req.params.commentId);
    
    if (!commento) {
      return res.status(404).json({ error: 'Commento non trovato' });
    }

    if (commento.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'Non sei autorizzato a eliminare questo commento' 
      });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ message: 'Commento eliminato con successo' });

  } catch (error) {
    console.error('Errore nell\'eliminazione del commento:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione del commento' });
  }
});

module.exports = router;