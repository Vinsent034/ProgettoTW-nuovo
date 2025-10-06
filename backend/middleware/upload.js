const multer = require('multer');
const path = require('path');
const fs = require('fs');


//dove andro a salvare i le immagini ch egli utenti posteranno
const storage = multer.diskStorage({destination: function(req, file, cb){
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath,{ recursive : true });
    }
    cb(null, uploadPath);
},
filename: function(req, file, cb){
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // cosi mantengo l'estensione del file originale
}



});



const fileFilter = (req, file, cb) => {
if (file.mimetype.startsWith('image/')) {
    cb(null, true);

}
else{
    cb(new Error('Il file non è un immagine'), false);
}

};







const upload = multer({
    storage : storage,
    fileFilter : fileFliter,
    limits : { fileSize : 5 * 1024 * 1024 } // 5 MB seno mi si scassa il pc
});

module.exports = upload;







