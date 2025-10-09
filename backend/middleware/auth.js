const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const AuthHeader = req.header('Authorization');
    
    if (!AuthHeader) {
      return res.status(401).json({ 
        error: 'Accesso negato. Token mancante.' 
      });
    }

    const token = AuthHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: 'Formato token non valido. Usa: Bearer <token>' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_per_sviluppo');
    
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ 
        error: 'Token non valido. Utente non trovato.' 
      });
    }

    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token non valido.' 
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token scaduto. Effettua nuovamente il login.' 
      });
    }

    console.error('Errore middleware auth:', error);
    res.status(500).json({ 
      error: 'Errore interno del server durante l\'autenticazione.' 
    });
  }
};

module.exports = authenticate;