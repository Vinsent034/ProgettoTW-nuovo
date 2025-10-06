const mongoose = require('mongoose'); // mongose → mongoose

const SchemaUtente = new mongoose.Schema({ // mongose → mongoose
    name : { type : String , required : true , trim : true , minlength : 2, maxlength : 80}, 
    email : { type: String, required : true , unique : true , trim : true , match : [/^\S+@\S+\.\S+$/, 'Formato email non valido hai messo caratteri mateatici eliminali'], lowercase : true },
    password : { type : String , required : true  , minlength : 6}, 

}, { 
    timestamps: true  //  crea createdAt e updatedAt in maniera automantica cosi non me ne occupo io 
});


module.exports = mongoose.model('User', SchemaUtente); // esporata il modello al database id mingo 