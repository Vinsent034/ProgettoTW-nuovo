const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// ========== REGISTRAZIONE ==========
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validazione campi obbligatori
        if (!email || !password || !name) {
            return res.status(400).json({ 
                error: 'Tutti i campi sono obbligatori' 
            });
        }

        // Validazione lunghezza password
        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'La password deve avere almeno 6 caratteri' 
            });
        }

        // Validazione lunghezza nome
        if (name.trim().length < 2) {
            return res.status(400).json({ 
                error: 'Il nome deve avere almeno 2 caratteri' 
            });
        }

        // Controlla se l'email esiste già
        const UtenteEsistente = await User.findOne({ 
            email: email.toLowerCase() 
        });
        
        if (UtenteEsistente) {
            return res.status(400).json({
                error: 'Email già registrata. Effettua il login.'
            });
        }

        // Cripta la password
        const PaswordCriptatta = await bcryptjs.hash(password, 10);
        
        // Crea nuovo utente
        const NuovoUtente = new User({  
            email: email.toLowerCase(),
            password: PaswordCriptatta,
            name: name.trim()
        });

        // Salva nel database
        const utenteSalvato = await NuovoUtente.save();
        
        console.log('✅ Utente registrato:', utenteSalvato.email);

        res.status(201).json({
            message: 'Registrazione completata con successo',
            userId: utenteSalvato._id
        });

    } catch (error) {
        console.error('❌ Errore registrazione:', error);
        
        // Gestione errore email duplicata (MongoDB)
        if (error.code === 11000) {
            return res.status(400).json({ 
                error: 'Email già registrata' 
            });
        }
        
        // Gestione errori di validazione Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Dati non validi: ' + error.message 
            });
        }
        
        res.status(500).json({
            error: 'Errore del server durante la registrazione'
        });
    }
});

// ========== LOGIN ==========
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('\n========== LOGIN ==========');
        console.log('📧 Email:', email);

        // Validazione campi obbligatori
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email e password sono obbligatori' 
            });
        }

        // ⭐ QUESTA ERA LA RIGA MANCANTE! ⭐
        // Cerca l'utente nel database
        const utente = await User.findOne({ 
            email: email.toLowerCase() 
        });

        console.log('👤 Utente trovato:', utente ? 'Sì' : 'No');

        // Se l'utente non esiste
        if (!utente) {
            console.log('❌ Utente non trovato');
            return res.status(401).json({ 
                error: 'Credenziali non valide' 
            });
        }

        // Confronta la password
        const passwordValida = await bcryptjs.compare(
            password, 
            utente.password
        );

        console.log('🔐 Password valida:', passwordValida ? 'Sì' : 'No');

        if (!passwordValida) {
            console.log('❌ Password errata');
            return res.status(401).json({
                error: 'Credenziali non valide'
            });
        }

        // Genera JWT token
        const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';
        
        const token = jwt.sign(
            { 
                userId: utente._id,
                email: utente.email  
            }, 
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ Login effettuato con successo');
        console.log('🎫 Token generato');
        console.log('===============================\n');

        // Risposta con token e dati utente
        res.json({
            message: 'Login effettuato con successo',
            token,
            user: {
                id: utente._id,
                name: utente.name,
                email: utente.email
            }
        });

    } catch (error) {
        console.error('❌ Errore nel login:', error);
        res.status(500).json({ 
            error: 'Errore del server durante il login' 
        });
    }
});

module.exports = router;