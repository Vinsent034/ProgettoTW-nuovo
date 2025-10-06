const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const authenticate = require('../middleware/auth');
const upload = require('../middleware/upload');

// il meccanismo dove recupero i gatti

router.get('/', async(req, res) => {

try {
    console.log("Sto recupernao la lista di gatti");

    const gatti = await Cat.find().populate('author', 'name email'); // Popola il campo author con i dati dell'utente (name e email)
    console.log('ok gatti recuperati -> ', gatti.length);
    


    res.json(gatti);

}
catch(error) {

    console.error('Nin sono riuscito arecuperare i gatti ce un problema ', error);
    res.status(500).json({ error: 'Si è verificato un errore durante il recupero dei gatti' });
}

});

// il meccanismo dove posso eliminare un gatto (fatto solo da chi lo publica)

router.delete('/:id', authenticate, async (req, res) => {

try{

    const gatto = await Cat.findById(req.params.id);

    if (!gatto) {
        return res.status(404).json({ error: 'Gatto non trovato' });
    }

    if (gatto.author.toString() !== req.user._id.toString()) {
        console.log('Utente non autorizzato a eliminare questo gatto');
        return res.status(403).json({ error: 'Non sei autorizzato a eliminare questo gatto' });
    }

    await Cat.findByIdAndDelete(req.params.id);
    console.log('Gatto eliminato con successo');
    res.json({ message: 'Gatto eliminato con successo' });

}
catch(error){
    console.error('Errore durante l eliminazione del gatto', error);
    res.status(500).json({ error: 'Si è verificato un errore durante l eliminazione del gatto' });
}

});




router.post('/', authenticate, upload.single('image'), async (req, res) => {

try {
    if (!req.file) {
        console.log('Devi aggiungere l immagine del gatto')
        return res.status(400).json({ error: 'Immagine del gatto è obbligatoria' });
    }

    console.log('Ok immeagine presa', req.file.filename);
    const { name, description, lat,     lng       } = req.body;

    if (!name  || !description || !lat || !lng) {
        return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
    }


    console.log('Gatto aggiunto da  : ', req.user.name);


    const nuovoGatto = new Cat({
        name : name.trim(), description : description.trim(), location :{ lat : parseFloat(lat), lng : parseFloat(lng) }, image : req.file.filename, author : req.user._id
    });








    if (isNaN(nuovoGatto.location.lat) || isNaN(nuovoGatto.location.lng)) {
        return res.status(400).json({ error: 'Le coordinate di latitudine e longitudine devono essere numeri validi' });
    }

    const gattoSalvato = await nuovoGatto.save();
    console.log('Gatto salvato con successo nel database con ID : ', gattoSalvato._id);

    await gattoSalvato.populate('author', 'name email');

    res.status(201).json(gattoSalvato);


}
catch(error){
    console.error('Errore durante il salvataggio del gatto', error);
    res.status(400).json({ error: 'Si è verificato un errore durante il salvataggio del gatto' });
}


});



router.get('/:id', async (req, res) => {



try{
    console.log('Sto cercando il gatto con id -> ', req.params.id);
    const gatto = await Cat.findById(req.params.id).populate('author', 'name email');


    if (!gatto) {
        console.log('Gatto non trovato con id -> ', req.params.id);
        return res.status(404).json({ error: 'Gatto non trovato' });
    }



    console.log('Gatto trovato , nome : -> ', gatto.name);
    res.json(gatto);


}
catch(error){
    console.error('Errore durante il recupero del gatto', error);
    res.status(500).json({ error: 'Si è verificato un errore durante il recupero del gatto' });
}


});

























module.exports = router;