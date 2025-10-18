const mongoose = require ('mongoose');
// qui è la struttura di mongo per i commenti lasciati dagli utenti loggati 
const SchemaCommento = new mongoose.Schema({
    text : {type : String , required : [true, 'il commento e obligatorio'], trim : true, minlenght : [1, 'almeno 4 una parola '], maxlenght : [500, 'troppo lungo il massimo e 500']},
    author: {type : mongoose.Schema.Types.ObjectId, ref : 'User', required : true}, // stesso metodo di cat cosi posso confrontare l'utente loggato enlla pagina di eliminazione gatto
    cat : {type : mongoose.Schema.Types.ObjectId, ref : 'Cat', required : true},
    date :{type : Date, default :  Date.now }
},
{
    timestamps : true 

});

module.exports = mongoose.model('Comment', SchemaCommento);