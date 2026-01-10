const ChillMusic = new Audio('./ChillTunes/lofi-chill-track-1.mp3');
const ClickSound = new Audio('./ChillTunes/click-sound-1.mp3');
ChillMusic.loop = true;
let IsMuted = false;

function PlayMusic() {
    ChillMusic.play().catch(() => {});
}

function ToggleMusic() {
    const Btn = document.getElementById('music-toggle-btn');
    const Icon = Btn.querySelector('i');
    if (ChillMusic.paused) {
        ChillMusic.play().catch(() => {});
        Icon.className = "ph-bold ph-speaker-high";
        Btn.classList.remove('muted');
    } else {
        ChillMusic.pause();
        Icon.className = "ph-bold ph-speaker-slash";
        Btn.classList.add('muted');
    }
}

function PlayClick() {
    ClickSound.currentTime = 0;
    ClickSound.play().catch(() => {});
}

document.addEventListener('click', () => {
    if (ChillMusic.paused && !IsMuted) {
        PlayMusic();
    }
    PlayClick();
});

const MusicBtn = document.getElementById('music-toggle-btn');
if (MusicBtn) {
    MusicBtn.onclick = (e) => {
        e.stopPropagation();
        ToggleMusic();
    };
}
