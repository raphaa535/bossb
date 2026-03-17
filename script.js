// =====================================================
// VERT RAIKA - JAVASCRIPT MARINA (Namboarina tsara)
// =====================================================

// Fonctions de calcul
function formatHeure(secondes) {
    const h = Math.floor(secondes / 3600);
    const m = Math.floor((secondes % 3600) / 60);
    const s = secondes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function calculerIntervalle(heure, type) {
    const parts = heure.split(':');
    const heures = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const secondes = parseInt(parts[2] || '0');
    
    const totalSecondes = heures * 3600 + minutes * 60 + secondes;
    
    let a;
    if (type === 'ratsy' || type === 'bleu') {
        a = 20;
    } else if (type === 'tsara' || type === 'violet') {
        a = 40;
    } else {
        a = 50;
    }
    
    const debut = ((totalSecondes - a) % 86400 + 86400) % 86400;
    const fin = (totalSecondes + a) % 86400;
    
    return `🔥Entre ${formatHeure(debut)} à ${formatHeure(fin)}`;
}

function createLCG(seed) {
    let state = seed;
    return function(max) {
        state = (state * 1103515245 + 12345) & 2147483647;
        return state % max;
    };
}

function calculerVertRaika(heureStr, multiplicateur) {
    // Validation
    if (!heureStr || heureStr.length < 5) return null;
    if (isNaN(multiplicateur) || multiplicateur < 5) return null;
    
    const parts = heureStr.split(':');
    if (parts.length !== 2) return null;
    
    const heures = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    
    if (isNaN(heures) || isNaN(minutes) || heures > 23 || minutes > 59) return null;
    
    // Calculs
    const secondesBase = heures * 3600 + minutes * 60;
    const multiplicateurArrondi = Math.round(multiplicateur * 100);
    const seedInitial = multiplicateurArrondi ^ (secondesBase * 31);
    
    const lcg = createLCG(seedInitial);
    
    // Horaires
    const delai1 = 4 * 60 + lcg(60);
    const heure1 = (secondesBase + delai1) % 86400;
    
    const delai2 = 5 * 60 + 40 + lcg(140);
    const heure2 = (secondesBase + delai2) % 86400;
    
    const delai3 = 8 * 60 + lcg(120);
    const heure3 = (secondesBase + delai3) % 86400;
    
    const horaires = [heure1, heure2, heure3];
    const predictions = [];
    
    // Types et multiplicateurs
    for (let i = 0; i < 3; i++) {
        const h = horaires[i];
        const timeStr = formatHeure(h);
        
        const rand = lcg(100);
        let type, emoji, typeName, colorVar;
        
        if (rand < 30) {
            type = 'ratsy';
            emoji = '🚨';
            typeName = 'TOUR RATSY';
            colorVar = '--tour-ratsy';
        } else if (rand < 55) {
            type = 'tsara';
            emoji = '🤍';
            typeName = 'TOUR TSARA';
            colorVar = '--tour-tsara';
        } else if (rand < 75) {
            type = 'vert';
            emoji = '💚';
            typeName = 'TOUR VERT';
            colorVar = '--tour-vert';
        } else if (rand < 90) {
            type = 'bleu';
            emoji = '💙';
            typeName = 'RAFALE BLEU';
            colorVar = '--tour-bleu';
        } else {
            type = 'violet';
            emoji = '💜';
            typeName = 'RAFALE VIOLET';
            colorVar = '--tour-violet';
        }
        
        const isRatsyOrBleu = (type === 'ratsy' || type === 'bleu');
        let target, risk, danger;
        
        if (isRatsyOrBleu) {
            target = 1.5 + lcg(600) / 100;
            risk = target + 0.5 + lcg(200) / 100;
            if (risk > 9.99) risk = 9.99;
            danger = 10 + lcg(15);
        } else {
            target = 2.5 + lcg(1250) / 100;
            risk = target + 0.5 + lcg(300) / 100;
            if (risk > 15) risk = 15;
            danger = 25 + lcg(76);
        }
        
        const intervalle = calculerIntervalle(timeStr, type);
        
        predictions.push({
            numero: i + 1,
            time: timeStr,
            target: target.toFixed(2),
            risk: risk.toFixed(2),
            danger: danger.toFixed(2),
            typeName: typeName,
            emoji: emoji,
            colorVar: colorVar,
            intervalle: intervalle
        });
    }
    
    return predictions;
}

// Affichage
function afficherPredictions(predictions) {
    const list = document.getElementById('predictionsList');
    if (!predictions || predictions.length === 0) {
        list.innerHTML = '';
        return;
    }
    
    let html = '';
    
    predictions.forEach(pred => {
        const colorValue = pred.colorVar.replace('--tour-', '');
        const bgColor = `hsla(${colorValue}, 0.15)`;
        
        html += `
            <div class="prediction-card">
                <div class="card-header">
                    <span class="time-badge">#${pred.numero} — ${pred.time}</span>
                    <span class="tour-badge" style="color: hsl(${pred.colorVar}); background: ${bgColor}; border: 1px solid hsla(${colorValue}, 0.3);">
                        ${pred.emoji} ${pred.typeName}
                    </span>
                </div>
                
                <div class="multipliers">
                    <div class="multiplier-item">
                        <span class="multiplier-label">TARGET</span>
                        <span class="multiplier-value target-value">❤️ ${pred.target}x</span>
                    </div>
                    <div class="multiplier-item">
                        <span class="multiplier-label">RISK</span>
                        <span class="multiplier-value risk-value">🖤 ${pred.risk}x</span>
                    </div>
                    <div class="multiplier-item">
                        <span class="multiplier-label">DANGER</span>
                        <span class="multiplier-value danger-value">💘 ${pred.danger}x</span>
                    </div>
                </div>
                
                <div class="interval">${pred.intervalle}</div>
            </div>
        `;
    });
    
    list.innerHTML = html;
}

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ VERT RAIKA - Script chargé');
    
    const heureInput = document.getElementById('heureInput');
    const multiplicateurInput = document.getElementById('multiplicateurInput');
    const predictBtn = document.getElementById('predictBtn');
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    
    // Vérification que tous les éléments existent
    if (!heureInput || !multiplicateurInput || !predictBtn || !loadingDiv || !resultsDiv) {
        console.error('❌ Erreur: Éléments HTML manquants');
        return;
    }
    
    // Format heure automatique
    heureInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length >= 2) {
            value = value.slice(0, 2) + ':' + value.slice(2);
        }
        e.target.value = value;
    });
    
    // Prédiction au clic
    predictBtn.addEventListener('click', function() {
        const heure = heureInput.value;
        const multiplicateur = parseFloat(multiplicateurInput.value);
        
        if (!heure || heure.length < 5) {
            alert('⛔ Entrez une heure valide (HH:MM)');
            return;
        }
        
        if (isNaN(multiplicateur) || multiplicateur < 5) {
            alert('⛔ Entrez un multiplicateur ≥ 5');
            return;
        }
        
        loadingDiv.classList.remove('hidden');
        resultsDiv.classList.add('hidden');
        predictBtn.disabled = true;
        
        setTimeout(function() {
            const predictions = calculerVertRaika(heure, multiplicateur);
            
            loadingDiv.classList.add('hidden');
            predictBtn.disabled = false;
            
            if (predictions && predictions.length > 0) {
                afficherPredictions(predictions);
                resultsDiv.classList.remove('hidden');
                console.log('✅ Prédictions:', predictions);
            } else {
                alert('❌ Erreur de calcul');
            }
        }, 2000);
    });
    
    // Touche Entrée
    [heureInput, multiplicateurInput].forEach(function(input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                predictBtn.click();
            }
        });
    });
});
