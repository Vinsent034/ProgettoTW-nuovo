const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware per verificare il token JWT
async function authenticate(req, res, next) {
  try {
    console.log('\n=== MIDDLEWARE AUTHENTICATE ===');
    
    // Prendi il token dall'header Authorization
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Token mancante o formato errato');
      return res.status(401).json({ 
        error: 'Accesso negato. Token mancante.' 
      });
    }

    // Estrai il token (rimuovi "Bearer ")
    const token = authHeader.substring(7);
    console.log('Token estratto:', token.substring(0, 20) + '...');

    // Verifica il token
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_cambiala';
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token valido. User ID:', decoded.userId);

      // Trova l'utente nel database
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        console.log('❌ Utente non trovato nel database');
        return res.status(401).json({ 
          error: 'Utente non trovato.' 
        });
      }

      console.log('✅ Utente trovato:', user.name);
      
      // Aggiungi l'utente alla request
      req.user = user;
      
      console.log('=== FINE AUTHENTICATE ===\n');
      next();

    } catch (jwtError) {
      console.error('❌ Errore JWT:', jwtError.message);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token scaduto. Effettua nuovamente il login.' 
        });
      }
      
      return res.status(401).json({ 
        error: 'Token non valido.' 
      });
    }

  } catch (error) {
    console.error('❌ Errore nel middleware authenticate:', error);
    return res.status(500).json({ 
      error: 'Errore del server durante l\'autenticazione.' 
    });
  }
}

module.exports = authenticate;