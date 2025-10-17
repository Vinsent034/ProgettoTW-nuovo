const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    // Prendo il token dall'header Authorization
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Autenticazione richiesta' });
    }

    // Verifico il token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_temporanea');
    
    // Cerco l'utente nel database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Utente non trovato' });
    }

    // Aggiungo l'utente alla request
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Errore autenticazione:', error);
    res.status(401).json({ error: 'Token non valido' });
  }
};

module.exports = authenticate;