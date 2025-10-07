const mongose = require ('mongose');

const SchemaCommento = new mongose.Schema({
    text : {type : String , required : [true, 'il commento e obligatorio'], trim : true, minlenght : [1, 'almeno 4 una parola '], maxlenght : [500, 'troppo lungo il massimo e 500']},
    author: {type : mongose.Schema.Types.ObjectId, ref : 'User', required : true},
    cat : {type : mongose.Schema.Types.ObjectId, ref : 'Cat', required : true},
    date :{type : Date, default :  Date.now }
},
{
    timestamps : true 

});

module.exports = mongose.model('Comment', SchemaCommento);