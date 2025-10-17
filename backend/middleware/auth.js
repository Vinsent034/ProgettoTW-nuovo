

const express   = require('express')
const bcryptjs  = require('bcryptjs')         
const jwt       = require('jsonwebtoken')
const User      = require('../models/User')
const router    = express.Router()

//  regisrazione
router.post('/register', async (req, res) => {
  try {
    // prendo i dato 
    const { email, password, name } = req.body || {}

    // controllo che non siano vuoti
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'mancano dei campi (name, email, password)' })
    }

    
    if (password.length < 6) {
      return res.status(400).json({ error: 'password corta (min 6)' })
    }

    
    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'nome troppo corto' })
    }

    // controllo se l’email esiste gia
    const ex = await User.findOne({ email: String(email).toLowerCase() })
    if (ex) {
      return res.status(400).json({ error: 'email gia registrata, fai login' })
    }

    // ok, hasho la pass 
    const passHash = await bcryptjs.hash(password, 10)

    // preparo user nuovo 
    const nuovo = new User({
      name : name.trim(),
      email: String(email).toLowerCase(),
      password: passHash
    })

    // salvo sul db 
    const salvato = await nuovo.save()

    // ritorno infine i dati inseriti
    return res.status(201).json({
      message: 'registrato',
      userId : salvato._id
    })



  } 
  
  
  
  catch (err) {
    // duplicate key su email
    if (err && err.code === 11000) {
      return res.status(400).json({ error: 'email gia in uso (db)' })
    }


    // validazioni mongoose
    if (err && err.name === 'ValidationError') {
      return res.status(400).json({ error: 'dati non validi: ' + err.message })
    }
    
    
  }
})


//  login 
router.post('/login', async (req, res) => {
  try {


    const { email, password } = req.body || {}

    
    if (!email || !password) {
      return res.status(400).json({ error: 'metti email e password' })
    }

   
    const utente = await User.findOne({ email: String(email).toLowerCase() })
    if (!utente) {
      
      return res.status(401).json({ error: 'credenziali non valide' })
    }



    // confronto pass (hash vs plain)
    const ok = await bcryptjs.compare(password, utente.password)
    if (!ok) {
      return res.status(401).json({ error: 'credenziali non valide' })
    }



    // prendo la secret . se manca metto un fallback 
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_cambiala'
    // creo token con scadenza 24
    const token = jwt.sign(  { userId: utente._id, email: utente.email },  JWT_SECRET,  { expiresIn: '24h' } )

    // mando giu token + dati base user
    return res.json({ message: 'ok',  token,  user: { id   : utente._id, name : utente.name, email: utente.email }})

  } catch (err) {
    
    return res.status(500).json({ error: 'errore server durante login' })
  }
})

module.exports = router
