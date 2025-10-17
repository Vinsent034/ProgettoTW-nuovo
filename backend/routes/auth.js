const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const User = require('../models/User'); // revupero i dati dal db di mongo per User
const router = express.Router(); 
// ok parte del codice cje si occupa del login e registazione , riordarsi di testaeròa alla fine su thinder client 

// Funzione dei registrazione 
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body; // mi procuro i valori 

        //controllo per vedeere se cè tutto richeisto 
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Non possiamo andare avanti i campi sono obligatori ' });
        }

        // Controllo della pasword , cin caratteri minimi 
        if (password.length < 6) {
            return res.status(400).json({ error: 'La password deve avere almeno 6 caratteri' });
        }



        // il nome non deve essere vuoto 
        if (name.trim().length < 2) {
            return res.status(400).json({ error: 'Il nome deve avere almeno 2 caratteri' });
        }

        // controllo se esiste gia questa email 
        const utenteEsiste = await User.findOne({ email: email.toLowerCase() });
        // non aprete capire perchè non funziona 
       
        

        if (utenteEsiste) { // controllo per capire se riguarda essitenza omeno
            return res.status(400).json({ error: "L'account esiste già" });
        }



        //modicico la paword criptandola 
        const passCriptata = await bcryptjs.hash(password, 10);
        
        // finalemtne tutto va bene , quindi posso creare l'utente 
        const nuovoUtente = new User({   email: email.toLowerCase(),  password: passCriptata, name: name.trim() });

        // salvo sul db 
        const salvato = await nuovoUtente.save();
        
        console.log('utente registrato:', salvato.email);
    // ultimo conterollo estenuante di sicurezza



    
        res.status(201).json({  message: 'Registrazione completata con successo',  userId: salvato._id  });

    } 
    catch (error) {
        console.error('errore registrazione:', error);
        
        // capire se l'email è registrata
        if (error.code === 11000) {  
                return res.status(400).json({ error: 'Email giÃ  registrata' });
        }
        


        // errori dal databasee
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: 'Dati non validi: ' + error.message });
        }
        // essore final bomb
        res.status(500).json({ error: 'Errore del server durante la registrazione' });
    }
});















// login utente 
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body; // recupero i dati dai campi 

       // console.log('login richiesto per:', email); // ok , email 

        // controllo che ci siano email e password 
        if (!email || !password) { // verifico se sono coretti 
            return res.status(400).json({ error: 'Email e password sono obbligatori' });
        }

        // cerco utente nel db 
        const utente = await User.findOne({ email: email.toLowerCase() });

       // console.log('utente trovato?', utente ? 'si' : 'no');

        // se non esiste 
        if (!utente) {
            console.log('utente non trovato');
            return res.status(401).json({ error: 'Credenziali non valide' });
        }

        // confronto password 
        const passOk = await bcryptjs.compare(password, utente.password); // mi asicuro ce coincidano le credenzilai con decriptazione 

    // console.log('password corretta?', passOk ? 'si' : 'no'); // 

        if (!passOk) {  // se dovesse essere sbaglaita cìè il cntrollo


            console.log('password sbagliata');
            return res.status(401).json({ error: 'Credenziali non valide' });

        }

        // genero token jwt 
        const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';
        
        const token = jwt.sign( {    userId: utente._id,     email: utente.email     },    JWT_SECRET,   { expiresIn: '24h' }  );

      //  console.log('login ok, token generato');

        // risposta con token e dati 
        res.json({message: 'Login effettuato con successo',  token,user: {    id: utente._id,    name: utente.name,    email: utente.email  } });

    } catch (error) {
        console.error('errore login:', error);
        res.status(500).json({ error: 'Errore del server durante il login' });
    }
});

module.exports = router;