const mongoose = require('mongoose');


const SchemaGatto = new mongoose.Schema({

name : {  type : String , required: [true , 'Devi mettere il nome del gatto'], trim : true , minlength: [2, 'Nome troopo piccolo , minimo metti 2 caratteri '], maxlength : [80, 'Nome troppo lungo , massimo 80 caratteri']},
description : {type : String , required: [true, 'La descrizion è obligatoria '], trim: true , minlength:[10, 'almeno 10 caratteri'], maxlength:[500, 'il massimo e di 500 caratteri']},
location : { 
    lat :{type : Number , required: [true, 'La latitudine è obligatoria']},
    lng : {type : Number , required: [true, 'La longitudie è obligatoria']}
},
image : { type : String , required: [true, 'L immagine è obligatoria']},
author : { type : mongoose.Schema.Types.ObjectId , ref : 'User' , required: true}, // cosi creo la relazione tra i due modelli
date: { type: Date, default: Date.now }// data di creazione del post

}, {
    timestamps: true
});

module.exports = mongoose.model('Cat', SchemaGatto);