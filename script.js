let products = JSON.parse(localStorage.getItem('mkt_abidjant_v4')) || [];
let tempImages = []; 
let tempVid = "";

const list = document.getElementById('productList');
const form = document.getElementById('productForm');
const imgPreviewContainer = document.getElementById('imgPreviewContainer');

// --- PHOTOS CUMULÉES ---
document.getElementById('pImgInput').onchange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
            tempImages.push(reader.result);
            const img = document.createElement('img');
            img.src = reader.result;
            imgPreviewContainer.appendChild(img);
            document.getElementById('clearPhotos').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    });
};

document.getElementById('clearPhotos').onclick = () => {
    tempImages = []; imgPreviewContainer.innerHTML = "";
    document.getElementById('clearPhotos').classList.add('hidden');
};

// --- VIDÉO ---
document.getElementById('pVidInput').onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
        tempVid = reader.result;
        document.getElementById('vidPreview').innerHTML = `<video src="${tempVid}" controls style="width:100%; border-radius:12px; margin-top:10px;"></video>`;
    };
    if(file) reader.readAsDataURL(file);
};

// --- AFFICHAGE ---
function render(data = products) {
    list.innerHTML = "";
    if (data.length === 0) document.getElementById('noResults').classList.remove('hidden');
    else {
        document.getElementById('noResults').classList.add('hidden');
        data.forEach(p => {
            list.innerHTML += `
                <div class="card" onclick="openDetails(${p.id})">
                    <img src="${p.imgs[0]}">
                    <div class="card-body">
                        <p class="card-price">${Number(p.price).toLocaleString()} FCFA</p>
                        <p class="card-title">${p.name}</p>
                        <p class="card-loc">📍 ${p.loc}</p>
                    </div>
                </div>`;
        });
    }
    updateFilters();
}

form.onsubmit = (e) => {
    e.preventDefault();
    if(tempImages.length === 0) return alert("Photo obligatoire !");

    const newProd = {
        id: Date.now(),
        name: document.getElementById('pName').value,
        desc: document.getElementById('pDesc').value,
        price: document.getElementById('pPrice').value,
        loc: document.getElementById('pQuartier').value,
        wa: document.getElementById('pWhatsapp').value,
        pin: document.getElementById('pPin').value, 
        imgs: tempImages,
        vid: tempVid
    };

    products.unshift(newProd);
    localStorage.setItem('mkt_abidjant_v4', JSON.stringify(products));
    render();
    closeAll();
    form.reset();
    tempImages = []; imgPreviewContainer.innerHTML = "";
};

function openDetails(id) {
    const p = products.find(i => i.id === id);
    const container = document.getElementById('detailData');
    
    let sliderHtml = '<div class="slider">';
    p.imgs.forEach(img => sliderHtml += `<img src="${img}">`);
    sliderHtml += '</div>';

    container.innerHTML = `
        ${sliderHtml}
        <p style="font-size:0.7rem; color:#999; text-align:center; margin-bottom:10px;">⬅️ Glissez les photos ➡️</p>
        <h2>${p.name}</h2>
        <p class="card-price" style="font-size:1.8rem; margin:10px 0;">${Number(p.price).toLocaleString()} FCFA</p>
        <div style="background:#fff3cd; padding:12px; border-radius:10px; font-size:0.85rem; color:#856404; margin-bottom:15px; border-left:4px solid #e74c3c;">
            <strong>SÉCURITÉ :</strong> Payez seulement à la livraison après avoir testé.
        </div>
        <p>📍 <strong>Lieu : ${p.loc} (Abidjan)</strong></p>
        <p style="margin:15px 0; color:#444; line-height:1.6; white-space:pre-wrap;">${p.desc}</p>
        ${p.vid ? `<video src="${p.vid}" controls style="width:100%; border-radius:15px; margin-bottom:15px;"></video>` : ''}
        <a href="https://wa.me/${p.wa}?text=Bonjour, je vous contacte depuis Marché entre nous abidjant pour : ${p.name}" target="_blank" class="btn-full" style="display:block; text-align:center; text-decoration:none; background:#25D366;">Discuter sur WhatsApp</a>
        <button onclick="checkDelete(${p.id})" style="width:100%; background:none; border:none; color:#e74c3c; margin-top:25px; cursor:pointer; font-weight:600;">🗑️ Supprimer mon annonce</button>
    `;
    document.getElementById('detailModal').classList.remove('hidden');
}

function checkDelete(id) {
    const p = products.find(i => i.id === id);
    const userPin = prompt("Entrez votre code secret (4 chiffres) :");
    if (userPin === p.pin) {
        if(confirm("Confirmer la suppression ?")) {
            products = products.filter(item => item.id !== id);
            localStorage.setItem('mkt_abidjant_v4', JSON.stringify(products));
            render(); closeAll();
        }
    } else { alert("Code incorrect !"); }
}

function closeAll() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }
document.getElementById('btnOpenForm').onclick = () => document.getElementById('productModal').classList.remove('hidden');
document.querySelector('.close-modal').onclick = closeAll;
document.querySelector('.close-detail').onclick = closeAll;

document.getElementById('searchInput').oninput = (e) => {
    const val = e.target.value.toLowerCase();
    render(products.filter(p => p.name.toLowerCase().includes(val) || p.loc.toLowerCase().includes(val)));
};

function updateFilters() {
    const select = document.getElementById('filterQuartier');
    const locs = [...new Set(products.map(p => p.loc))];
    select.innerHTML = '<option value="">Tous les quartiers</option>';
    locs.forEach(l => select.innerHTML += `<option value="${l}">${l}</option>`);
}

function openPage(p) { alert("Page en cours de création..."); } // À personnaliser si besoin

render();