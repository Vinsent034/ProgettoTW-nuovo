require('dotenv').config(); // pratiecamnte mi sto caricando i file di .env


const express = require('express'); // sta recuperando il mareriale dal web 
const mongoose = require('mongoose'); // sto prendondo il collegamento da mongose
const cors = require('cors'); // parte cehe si occupad do fare richiesta al frontend per il backend

const authRoutes = require('./routes/auth'); //prendo il collegamento ad auth


const app = express(); // da qui mi creo un applicazione , che mi permtte di suare i metodi get e post 


const Porta =  3005

app.use(cors()); // gestisce le varie richieste da parte di alte porte
app.use(express.json()); // uso il json per convertire i file che ricebìvi in javas
app.use('/auth', authRoutes) // posso usare authRoutes



console.log('La connessione a MONGOOOOOOOOOOOOOOOOO');


mongoose.connect(process.env.MONGODB_URI) // da qui tento la connessione
.then(()=>{

console.log('OKKKKKKKKKKKK La connessione è andta')
console.log('Nome del data base ->  ',mongoose.connection.name)
console.log('Nome del Host -> ', mongoose.connection.host);
})

.catch((err)=>{

console.log('Nono Risco a connetermi ecco l errore -> ', err.message);
process.exit(1); // esco dal processo visto che non si conette 

})



app.get('/', (req, res)=>{
    res.json({
        message: 'Ci Troviamo in stretcat benvenuto',
        status : 'tutto a posto',
        database: mongoose.connection.readyState === 1 ? 'Connesso' : 'Non Connesso',
        timestamp : new Date()
    });
 });


app.listen(Porta, ()=>{
    console.log(`Il server è in ascolto sulla porta ${Porta}`);
    console.log(`http://localhost:${Porta}`);
     console.log(`http://localhost:${Porta}/auth/register`);

});