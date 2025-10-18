require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const CatRoutes = require('./routes/cats');
const commentRoutes = require('./routes/comments');

const app = express();
const Porta = 3005;


// CORS configurato correttamente per supportare DELETE
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/auth', authRoutes);
app.use('/cats', CatRoutes);
app.use('/comments', commentRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Ci Troviamo in streetcat benvenuto',
    status: 'è andato beme ',
    database: mongoose.connection.readyState === 1 ? 'Connesso' : 'Non Connesso',
    timestamp: new Date()
  });
});



console.log('La connessione a MONGO');



mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('OK La connessione è andata');
    console.log('Nome del database -> ', mongoose.connection.name);
    console.log('Nome del Host -> ', mongoose.connection.host);
  })
  .catch((err) => {
    console.log('Nono Riesco a connettermi ecco l errore -> ', err.message);
    process.exit(1);
  });

app.listen(Porta, () => {
  console.log(`Il server è in ascolto sulla porta ${Porta}`);
  console.log(`http://localhost:${Porta}`);
  console.log(`http://localhost:${Porta}/auth/register`);
  console.log(`http://localhost:${Porta}/cats`);
  console.log(`http://localhost:${Porta}/comments`);
});