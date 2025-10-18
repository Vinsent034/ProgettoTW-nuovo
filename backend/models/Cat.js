const mongoose = require('mongoose');

//da qui ho creo il modello sb per mongose , questa e solo los chema del gatto , per una questione di comodità ho messo direttamente i controlli degli errori quin invece del
// front end , perche è piu facile anticiparli 

const SchemaGatto = new mongoose.Schema({

name : {  type : String , required: [true , 'Devi mettere il nome del gatto'], trim : true , minlength: [2, 'Nome troopo piccolo , minimo metti 2 caratteri '], maxlength : [80, 'Nome troppo lungo , massimo 80 caratteri']},
description : {type : String , required: [true, 'La descrizion è obligatoria '], trim: true , minlength:[10, 'almeno 10 caratteri'], maxlength:[500, 'il massimo e di 500 caratteri']},
location : { // location dovra essere inserita cliccando la mappa nel frontend , attualemnte su thunder client devo mettere le coordinate a amno
    lat :{type : Number , required: [true, 'La latitudine è obligatoria']},
    lng : {type : Number , required: [true, 'La longitudie è obligatoria']}
},
image : { type : String , required: [true, 'L immagine è obligatoria']},
author : { type : mongoose.Schema.Types.ObjectId , ref : 'User' , required: true}, // aythor aggiunto perchè quando cerco di cancellare il gatto posso recuperare direttametne l'utente 
date: { type: Date, default: Date.now }// data di creazione del post

}, {
    timestamps: true
});

module.exports = mongoose.model('Cat', SchemaGatto);