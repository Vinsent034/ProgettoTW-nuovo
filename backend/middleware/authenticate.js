const jwt = require('jsonwebtoken');
const User = require('../models/User');

// middleware per verificare token jwt
async function authenticate(req, res, next) {
  try {
    console.log('Ok vediamo prima il token');
    
    // prendo token dall'header
    const authHeader = req.headers.authorization;
    // console.log('header:', authHeader); // debug
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {// vadao a vedere se manca o sia errato
      console.log('token mancante o sbagliato');
      return res.status(401).json({  error: 'Accesso negato. Token mancante.'  });
    }

    // estraggo il token , diminuzuone della stringa percehe ci aggiungo sempre la criptazione
    const token = authHeader.substring(7);
    // console.log('token:', token.substring(0, 20) + '...'); // debug



// piu tardi completare le parti di verifica 






    // controllo del token
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_cambiala';
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('token ok, user:', decoded.userId);

      // accedere al bd e recuperare dati 
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        console.log('utente non trovato');
        return res.status(401).json({  error: 'Utente non trovato.' });
      }

      console.log('utente trovato:', user.name);
      
      //ok adesso posso aggiungere l'utente  utente alla request
      req.user = user;
      
      next();

    } catch (jwtError) {
      console.error('errore jwt:', jwtError.message);
      
      if (jwtError.name === 'TokenExpiredError') { // se il toeken avesse il nome dell erreore , ok errore , problemi col server devo rifare il login
        return res.status(401).json({   error: 'Token scaduto. Effettua nuovamente il login.'  });
      }
      
      return res.status(401).json({  error: 'Token non valido.' });
    }

  } catch (error) {

// dopo finire la cath

    console.error('errore authenticate:', error);
    return res.status(500).json({   error: 'Errore del server durante l\'autenticazione.'   });
  }
}

module.exports = authenticate;