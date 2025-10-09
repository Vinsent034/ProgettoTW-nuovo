const express = require('express');

const bcryptjs = require('bcryptjs');

const jwt = require('jsonwebtoken');

const User = require('../models/User'); // importo il modello utente

const router = express.Router(); // creo il router per le varie rotte



// Qui e dove mi occupo della registrazione , dove in ogni campo effettuo controlli per i vari campi

router.post('/register', async (req, res) => {

    try {
        const {email, password, name} = req.body; // prendo i dati che mi arrivano dal body



        if(!email || !password || !name){
            return res.status(400).json({ error: 'Tutti i campi sono obbligatori li devi necessariamente inserire '});
        }   

        const UtenteEsistente = await User.findOne({ email: email }); // cerco se l'utente esiste gia nel database, con await evito di andare avanti se non finisco

        if (UtenteEsistente) {
            return res.status(400).json({
                error : 'L email che hia inserito e gia registrata , mettine un altra'
            });
        }



        const PaswordCriptatta = await bcryptjs.hash(password, 10); // cripto la password con 10 cicli di salting

        const NuovoUtente = new User({  
            email, password : PaswordCriptatta, name : name 
        });






        const utenteSalvato = await NuovoUtente.save(); // salvo l'utente nel database

        res.status(201).json({
            message: 'Utente salvato con sucesso',
            userId : utenteSalvato._id
        });

    } catch(error) {
        res.status(500).json({
            error: 'Si è verificato un errore durante la registrazione dell utente'
        });
    }

}); 




//Qui invece e dove mi occupo del login , da parte dell'utente 

router.post('/login', async (req, res) => {

    try{
        const { email, password } = req.body; // prendo i dati che mi arrivano dal body

        if(!email || !password){
            return res.status(400).json({ error: 'Tutti i campi sono obbligatori li devi necessariamente inserire '});
        }

        const utente = await User.findOne({ email: email }); // RIGA MANCANTE - cerco l'utente nel database

        if (!utente){
            return res.status(401).json({ error: 'Credenziali non valide email o password errate' });
        }

        const passwordValida = await bcryptjs.compare(password, utente.password); // confronto la password che mi arriva con quella criptata
        if (!passwordValida){
            return res.status(401).json({
                error: 'Le credeziali non sono giuste riprova a reinserirle'
            });
        }

        const token = jwt.sign({
               userId : utente._id,  email : utente.email  }, 
                process.env.JWT_SECRET, { expiresIn : '1h' } // creo il token con la chiave segreta che ho messo nel file .env
        );
        
        res.json ({
            message: 'Login effettuato con successo', token, user :{ id : utente._id, name : utente.name, email : utente.email }
        });

    }
    catch(error){
        console.error('Errore nel login : ', error);
        res.status(500).json({ error: 'Si è verificato un errore durante il login dell utente' });
    }

});

module.exports = router;