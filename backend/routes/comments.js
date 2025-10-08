const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Cat = require('../models/Cat');
const authenticate = require('../middleware/auth');


router.get('/:catId', async (req, res) =>{
    try{
            console.log('Richiesta per il micio  : ', req.params.catId);
            const commenti = await Comment.find({ cat: req.params.catId }).populate('author', 'name email').sort({date : -1});

             console.log(`Micione trovato, commenti -> ${commenti.length}`);
            res.json(commenti);
    }
    catch(error){
        console.error('Errore nel recupero dei commenti del micio : ', error);
        res.status(500).json({ error : 'Errore nel recupero dei commenti del micio' });
    }
});






router.post('/:catId', authenticate, async (req, res) =>{
    try{
            const { text } = req.body;

            // controllo per vedee se il tizio ha messo correttamente il comemnto
            if (!text || text.trim().length === 0){
                return res.status(400).json({ error : 'Il commento non puo essere vuoto, inserisci qualcosa' });
            }

            //controllo per assicuarsi se il micio c'è
            const gatto = await Cat.findById(req.params.catId);
            if (!gatto){
                return res.status(404).json({ error : 'Micio non trovato' });
            }

            console.log('Commento aggiunto da : ', req.user._id, ' al micio : ', req.params.catId);

            // adesso posso creare il commento dopo che  i controlli sono finiti
            const nuovoCommento = new Comment({
               text : text.trim(),
                author : req.user._id,
                 cat: req.params.catId
            });


            const commentoSalvato = await nuovoCommento.save();
            
            await commentoSalvato.populate('author', 'name email');
            res.status(201).json(commentoSalvato);





    }
    catch(error){
        console.error('Errore nell aggiunta del commento : ', error);
        res.status(400).json({ error : 'Errore nell aggiunta del commento' });
    }




    router.delete('/:commentId', authenticate, async (req, res) =>{


        try{
            const commento = await Comment.findById(req.params.commentId);
            if (!commento){
                return res.status(404).json({ error : 'Commento non trovato' });
            }


            if (commento.author.toString() !== req.user._id.toString()){
                return res.status(403).json({ error : 'Non sei autorizzato a eliminare questo commento' });
            }

            await Comment.findByIdAndDelete(req.params.commentId);
            res.json({ message : 'Commento eliminato con successo' });






        }
        catch(error){
            console.error('Errore nell eliminazione del commento : ', error);
            res.status(500).json({ error : 'Errore nell eliminazione del commento' });
        }










    });




      
});

module.exports = router;