const jwt = require('jsonwebtoken'); // mi prendo le librerie da javasp
const User = require('../models/User'); // mi prendo il modello user perche devo verifcare dopo l'auetnticazione


const autenticazione = async (req, res, next) => {

    try {
        const AuthHeader = req.header('Authorization'); // prendo l'header che mi serve per fare l'autenticazione
        if (!AuthHeader) {
            return res.status(401).json({ message: 'L autenticazion e fallita , manca il token' });
        }

        const token = AuthHeader.replace('Bearer ', ''); // tolgo la parola bearer perche mi serve solo il token

        if (!token) {
            return res.status(401).json({ message: 'Il token non va bene ' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // verifico il token con la chiave segreta
        
        const user = await User.findById(decoded.userId).select('-password'); // cerco l'utente nel database
    
        if (!user) {
            return res.status(401).json({ message: 'Utente non trovato, anche il token non è stato trovato' });


        }

        req.user = user; // aggiungo l'utente alla richiesta perche poi mi serve dopo

        next(); // se tutto va bene passo al prossimo middleware o alla route handler




    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token non valido' });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token scaduto, devi rieffettuare il login' });
        }

        console.error('Errore nell autenticazione', error);
        res.status(500).json({ message: 'Errore del server nell autenticazione' });


    }

}; // creo una funzione che mi permette di fare l'autenticazione

module.exports = autenticazione;




