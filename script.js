// Initialisation des données depuis le stockage local
let products = JSON.parse(localStorage.getItem('mkt_abidjan_v5')) || [];
let tempImages = [];
let tempVideo = "";

document.addEventListener('DOMContentLoaded', () => {
    render(); // Affiche les produits au chargement
    
    const btnOpen = document.getElementById('btnOpenForm');
    if(btnOpen) {
        btnOpen.onclick = () => {
            document.getElementById('productModal').classList.remove('hidden');
            document.body.style.overflow = 'hidden'; 
        };
    }
});

function closeAll() {
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    document.body.style.overflow = 'auto';
}

// --- GESTION DU FOOTER ---
window.showInfo = function(type) {
    const modal = document.getElementById('infoModal');
    const title = document.getElementById('infoTitle');
    const body = document.getElementById('infoBody');
    
    if(type === 'about') {
        title.innerText = "À propos";
        body.innerHTML = "<strong>Marché entre nous abidjan</strong> est une plateforme locale permettant aux Ivoiriens de vendre et acheter des articles rapidement.";
    } else if(type === 'security') {
        title.innerText = "Sécurité";
        body.innerHTML = "• Ne payez jamais d'avance.<br>• Vérifiez l'article en personne.<br>• Choisissez un lieu public pour la remise.";
    } else if(type === 'contact') {
        title.innerText = "Support Client";
        body.innerHTML = `
            <div style="text-align: center; padding: 10px;">
                <p style="margin-bottom: 15px;">Besoin d'aide ? Contactez-nous par email :</p>
                <a href="mailto:marcheentrenousjunior@gmail.com" 
                   style="color: #27ae60; font-weight: 700; text-decoration: none; font-size: 1.1rem; word-break: break-all;">
                   marcheentrenousjunior@gmail.com
                </a>
            </div>
        `;
    }
    modal.classList.remove('hidden');
};

// --- COMPRESSION DES IMAGES ---
async function compressImg(base64) {
    return new Promise(resolve => {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxWidth = 500; 
            let w = img.width, h = img.height;
            if (w > maxWidth) { h *= maxWidth / w; w = maxWidth; }
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.5)); 
        };
    });
}

// --- GESTION DES FICHIERS ---
document.getElementById('pImgInput').onchange = async (e) => {
    const container = document.getElementById('imgPreviewContainer');
    for (let file of e.target.files) {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const compressed = await compressImg(reader.result);
            tempImages.push(compressed);
            const img = document.createElement('img');
            img.src = compressed;
            img.style = "width:60px; height:60px; object-fit:cover; border-radius:8px; margin-right:5px;";
            container.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
};

document.getElementById('pVidInput').onchange = function(e) {
    const file = e.target.files[0];
    const status = document.getElementById('vidPreview');
    if (file && file.size < 5 * 1024 * 1024) { 
        const reader = new FileReader();
        reader.onloadend = () => {
            tempVideo = reader.result;
            status.innerHTML = "✅ Vidéo ajoutée";
        };
        reader.readAsDataURL(file);
    } else if (file) { 
        alert("Vidéo trop lourde (max 5Mo)"); 
    }
};

// --- PUBLICATION DE L'ANNONCE (MODIFIÉ) ---
document.getElementById('productForm').onsubmit = (e) => {
    e.preventDefault();

    if(tempImages.length === 0) {
        alert("Veuillez ajouter au moins une photo !");
        return;
    }

    // --- LOGIQUE AUTOMATIQUE ABIDJAN ---
    let locSaisie = document.getElementById('pQuartier').value.trim();
    // Enlève les virgules à la fin et ajoute Abidjan si absent
    let locNettoyee = locSaisie.replace(/[, ]+$/, "");
    if (!/abidjan/i.test(locNettoyee)) {
        locNettoyee += ", Abidjan";
    }
    // ----------------------------------

    const newProduct = {
        id: Date.now(),
        name: document.getElementById('pName').value,
        desc: document.getElementById('pDesc').value,
        price: document.getElementById('pPrice').value,
        loc: locNettoyee, // Utilise la version avec ", Abidjan"
        wa: document.getElementById('pWhatsapp').value,
        pin: document.getElementById('pPin').value,
        imgs: tempImages,
        vid: tempVideo
    };

    try {
        products.unshift(newProduct);
        localStorage.setItem('mkt_abidjan_v5', JSON.stringify(products));
        
        render(); 
        closeAll();
        e.target.reset();
        tempImages = []; tempVideo = "";
        document.getElementById('imgPreviewContainer').innerHTML = "";
        document.getElementById('vidPreview').innerHTML = "";
        alert("Annonce publiée !");
    } catch (err) {
        if (products.length > 3) {
            products.splice(-2); 
            localStorage.setItem('mkt_abidjan_v5', JSON.stringify(products));
            alert("Mémoire pleine. Nous avons libéré de l'espace, réessayez !");
        } else {
            alert("Erreur : Fichiers trop lourds.");
        }
    }
};

// --- AFFICHAGE DE LA LISTE ---
function render() {
    const list = document.getElementById('productList');
    if(!list) return;
    list.innerHTML = "";
    products.forEach(p => {
        list.innerHTML += `
            <div class="card" onclick="openDetails(${p.id})">
                <img src="${p.imgs[0]}">
                <div class="card-body">
                    <p class="card-price">${Number(p.price).toLocaleString()} FCFA</p>
                    <p style="font-weight:600; margin:5px 0;">${p.name}</p>
                    <p style="font-size:0.8rem; color:#888;">📍 ${p.loc}</p>
                </div>
            </div>`;
    });
}

// --- AFFICHAGE DES DÉTAILS ---
window.openDetails = function(id) {
    const p = products.find(item => item.id === id);
    if(!p) return;

    let mediaHtml = `<img src="${p.imgs[0]}" style="width:100%; border-radius:15px; margin-bottom: 20px;">`;
    if(p.vid) mediaHtml += `<video src="${p.vid}" controls style="width:100%; margin-top:10px; border-radius:10px; margin-bottom: 20px;"></video>`;

    document.getElementById('detailData').innerHTML = `
        <div class="detail-container-centered" style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 10px;">
            ${mediaHtml}
            <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 8px;">${p.name}</h2>
            <p style="color: #27ae60; font-weight: 900; font-size: 1.5rem; margin-bottom: 20px;">${Number(p.price).toLocaleString()} FCFA</p>
            
            <div style="background: #fff5f5; color: #e74c3c; border: 1px solid #ffcccc; padding: 12px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; width: 100%; margin-bottom: 25px;">
                ⚠️ Ne payez jamais d'avance (livraison ou réservation).
            </div>
            
            <div style="width: 100%; margin-bottom: 30px;">
                <p style="font-size: 1rem; line-height: 1.6; color: #555; margin-bottom: 15px;">${p.desc}</p>
                <p style="font-size: 0.9rem; color: #888;">📍 Lieu : <strong>${p.loc}</strong></p>
            </div>
            
            <a href="https://wa.me/${p.wa}" target="_blank" style="display: block; width: 100%; padding: 18px; background: #25d366; color: white; text-decoration: none; border-radius: 15px; font-weight: 800; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.2);">
                Discuter sur WhatsApp
            </a>
        </div>
    `;
    document.getElementById('detailModal').classList.remove('hidden');
};