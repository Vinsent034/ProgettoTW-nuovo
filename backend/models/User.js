const mongoose = require('mongoose');

const SchemaUtente = new mongoose.Schema({
    name: { 
        type: String,
        required: [true, 'Il nome è obbligatorio'],
        trim: true,
        minlength: [2, 'Il nome deve essere di almeno 2 caratteri'],
        maxlength: [80, 'Il nome non può superare 80 caratteri']
    },
    
    email: { 
        type: String,
        required: [true, 'L\'email è obbligatoria'],
        unique: true,
        trim: true,
        lowercase: true, // Converte automaticamente in minuscolo
        match: [
            /^\S+@\S+\.\S+$/, 
            'Formato email non valido'
        ]
    },
    
    password: { 
        type: String,
        required: [true, 'La password è obbligatoria']
        // NOTA: NON mettiamo minlength qui perché la password viene hashata
        // La validazione della lunghezza va fatta PRIMA dell'hashing (nel controller)
    }
    
}, { 
    timestamps: true  // Aggiunge automaticamente createdAt e updatedAt
});

// Index per ricerche più veloci
SchemaUtente.index({ email: 1 });

module.exports = mongoose.model('User', SchemaUtente);