/* Mouse Tracking Glow Effect */
const cards = document.querySelectorAll(".bento-card");

document.addEventListener("mousemove", (e) => {
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
    });
});

/* Language Logic */
const translations = document.querySelectorAll('.translate');
const btnEn = document.getElementById('btn-en');
const btnAr = document.getElementById('btn-ar');

function setLang(lang) {
    localStorage.setItem('levant_lang', lang);

    if(lang === 'ar') {
        document.body.classList.add('rtl-mode');
        document.body.setAttribute('dir', 'rtl');
        if(btnAr) btnAr.classList.add('active');
        if(btnEn) btnEn.classList.remove('active');
    } else {
        document.body.classList.remove('rtl-mode');
        document.body.setAttribute('dir', 'ltr');
        if(btnEn) btnEn.classList.add('active');
        if(btnAr) btnAr.classList.remove('active');
    }

    translations.forEach(el => {
        el.style.opacity = '0';
        setTimeout(() => {
            el.innerText = el.getAttribute(`data-${lang}`);
            el.style.opacity = '1';
        }, 200);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('levant_lang') || 'en';
    setLang(savedLang);
    
    // Grid Animation
    const grid = document.getElementById('grid');
    if(grid) {
        grid.style.opacity = '0';
        grid.style.transform = 'translateY(20px)';
        grid.style.transition = 'all 0.8s ease';
        setTimeout(() => {
            grid.style.opacity = '1';
            grid.style.transform = 'translateY(0)';
        }, 300);
    }
});

/* Audio Logic (./ChillTunes) */
const ClickSound = new Audio("./ChillTunes/click-sound-1.mp3");
let BgMusic = null;
let isPlaying = false;

function toggleMusic() {
    const musicBtn = document.getElementById('music-toggle-btn');
    if(!BgMusic) {
        BgMusic = new Audio("./ChillTunes/lofi-chill-tracks-1.mp3");
        BgMusic.loop = true;
        BgMusic.volume = 0.2;
    }
    
    if(isPlaying) {
        BgMusic.pause();
        musicBtn.innerHTML = '<i class="ph-bold ph-speaker-slash"></i>';
    } else {
        BgMusic.play();
        musicBtn.innerHTML = '<i class="ph-bold ph-speaker-high"></i>';
    }
    isPlaying = !isPlaying;
}

// Mouse Click Sounds
document.addEventListener('click', (e) => {
    if(e.target.closest('button') || e.target.closest('a') || e.target.closest('.bento-card')) {
        ClickSound.currentTime = 0;
        ClickSound.play();
    }
});
