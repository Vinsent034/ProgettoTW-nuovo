const mongoose = require('mongoose');

// schema  dell'utente , per quando deve fare la registrazione e il login
const SchemaUtente = new mongoose.Schema({
    name: { // questo campo per come struturato nel frontend esce solo con la registrazione, nel login viene recuperato dopo email e pasword
        type: String, required: [true, 'Il nome è obbligatorio'],  trim: true, minlength: [2, 'Il nome deve essere di almeno 2 caratteri'], maxlength: [80, 'Il nome non può superare 80 caratteri']},
    
    email: {   type: String,  required: [true, 'L\'email è obbligatoria'],  unique: true, trim: true, lowercase: true,  match: [  /^\S+@\S+\.\S+$/,   'Formato email non valido'   ]},
    
    password: {  type: String,  required: [true, 'La password è obbligatoria'] // non metto minlength qui perche la password viene hashata
 }
    
}, { 
    timestamps: true
});

// index per cercare piu veloce
SchemaUtente.index({ email: 1 });

module.exports = mongoose.model('User', SchemaUtente);