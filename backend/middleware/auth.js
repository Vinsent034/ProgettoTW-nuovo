// auth.routes.js   <-- boh, mettilo dove ti pare

const express   = require('express')
const bcryptjs  = require('bcryptjs')          // si scrive bc.. vabbè
const jwt       = require('jsonwebtoken')
const User      = require('../models/User')
const router    = express.Router()

//  regisrazioneee  (spero funzioni)
router.post('/register', async (req, res) => {
  try {
    // ok provo a leggere 'sti dati... (non stampo la pass intera)
    const { email, password, name } = req.body || {}
    // controllo basico, niente di che,  boh
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'mancano dei campi (name, email, password)' })
    }

    // la pass che sia almeno lunga un pò… se no erroraccio
    if (password.length < 6) {
      return res.status(400).json({ error: 'password corta (min 6)' })
    }

    // il nome non lo voglio vuoto  o 1 char
    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'nome troppo corto' })
    }

    // controllo se l’email esiste gia (minuscole va)
    const ex = await User.findOne({ email: String(email).toLowerCase() })
    if (ex) {
      return res.status(400).json({ error: 'email gia registrata, fai login' })
    }

    // ok, hasho la pass (round 10 che va bene)
    const passHash = await bcryptjs.hash(password, 10)

    // preparo user nuovo (pulisco un pelo il nome)
    const nuovo = new User({
      name : name.trim(),
      email: String(email).toLowerCase(),
      password: passHash
    })

    // salvo sul db . se esplode pazienza
    const salvato = await nuovo.save()

    // ritorno una cosa semplice (niente token qui, lo dai col login)
    return res.status(201).json({
      message: 'registrato',
      userId : salvato._id
    })

  } catch (err) {
    // duplicate key su email (classico 11000)
    if (err && err.code === 11000) {
      return res.status(400).json({ error: 'email gia in uso (db)' })
    }
    // validazioni mongoose che sbraitano
    if (err && err.name === 'ValidationError') {
      return res.status(400).json({ error: 'dati non validi: ' + err.message })
    }
    // boh, errore generico
    return res.status(500).json({ error: 'errore server durante registrazione' })
  }
})


//  login  (incrociamo le dita)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}

    // se manca qualcosa niente
    if (!email || !password) {
      return res.status(400).json({ error: 'metti email e password' })
    }

    // prendo utente x email (sempre minuscole, dai)
    const utente = await User.findOne({ email: String(email).toLowerCase() })
    if (!utente) {
      // non dico quale dei 2 è sbg per non dare hint
      return res.status(401).json({ error: 'credenziali non valide' })
    }

    // confronto pass (hash vs plain)
    const ok = await bcryptjs.compare(password, utente.password)
    if (!ok) {
      return res.status(401).json({ error: 'credenziali non valide' })
    }

    // prendo la secret . se manca metto un fallback (non fatelo in prod pls)
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_cambiala'
    // creo token con scadenza 24h  (va bene per ora)
    const token = jwt.sign(
      { userId: utente._id, email: utente.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // mando giu token + dati base user
    return res.json({
      message: 'ok',
      token,
      user: {
        id   : utente._id,
        name : utente.name,
        email: utente.email
      }
    })

  } catch (err) {
    // boh qualche crash strano
    return res.status(500).json({ error: 'errore server durante login' })
  }
})

module.exports = router
