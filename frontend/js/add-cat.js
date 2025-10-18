const backend = 'http://localhost:3005';

let map;
let marker;


document.addEventListener('DOMContentLoaded', function() {


const token = localStorage.getItem('token');
if (!token){
    alert('Per publicare devi fare il login');
    window.location.href = 'login.html';
    return;
}

map = L.map('map').setView([40.8518, 14.2681], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

map.on('click', function(e){

    if (marker){
        map.removeLayer(marker);
    }

    marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
    
    document.getElementById('latitudine').value = e.latlng.lat;
    document.getElementById('longitudine').value = e.latlng.lng;
});


document.getElementById('foto-gatto').addEventListener('change',function(e){
    const file = e.target.files[0];
    if (file){
        const reader = new FileReader();
        reader.onload = function(event){
            document.getElementById('preview-foto').innerHTML = 
            '<img src="' + event.target.result + '" alt="foto">';
        };
        reader.readAsDataURL(file);
    }
});


// Bottoni formattazione grassetto e corsivo
const btnBold = document.getElementById('btn-bold');
const btnItalic = document.getElementById('btn-italic');
const textarea = document.getElementById('descrizione-gatto');

if (btnBold) {
    btnBold.addEventListener('click', function() {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        if (selectedText) {
            const before = textarea.value.substring(0, start);
            const after = textarea.value.substring(end);
            textarea.value = before + '**' + selectedText + '**' + after;
            textarea.focus();
            textarea.setSelectionRange(start + 2, end + 2);
        } else {
            const before = textarea.value.substring(0, start);
            const after = textarea.value.substring(start);
            textarea.value = before + '****' + after;
            textarea.focus();
            textarea.setSelectionRange(start + 2, start + 2);
        }
    });
}

if (btnItalic) {
    btnItalic.addEventListener('click', function() {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        if (selectedText) {
            const before = textarea.value.substring(0, start);
            const after = textarea.value.substring(end);
            textarea.value = before + '*' + selectedText + '*' + after;
            textarea.focus();
            textarea.setSelectionRange(start + 1, end + 1);
        } else {
            const before = textarea.value.substring(0, start);
            const after = textarea.value.substring(start);
            textarea.value = before + '**' + after;
            textarea.focus();
            textarea.setSelectionRange(start + 1, start + 1);
        }
    });
}


document.getElementById('FormAddCat').addEventListener('submit', function(e) {
    e.preventDefault();

    const photo = document.getElementById('foto-gatto').files[0];
    const name = document.getElementById('nome-gatto').value;
    const description = document.getElementById('descrizione-gatto').value;
    const lat = document.getElementById('latitudine').value;
    const lng = document.getElementById('longitudine').value;

    if (!photo || !name || !description || !lat || !lng) {
        alert('Devi compilare tutti i campi!');
        return;
    }

    const formData = new FormData();
    formData.append('image', photo);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('lat', lat);
    formData.append('lng', lng);

    const token = localStorage.getItem('token');

    fetch(backend + '/cats', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data._id) {
            alert('Gatto pubblicato!');
            window.location.href = 'index.html';
        } else {
            alert('Errore: ' + (data.error || 'Qualcosa è andato storto'));
        }
    })
    .catch(error => {
        alert('Errore di connessione!');
        console.log(error);
    });
});

});