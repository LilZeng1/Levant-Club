const ChillMusic = new Audio('./lofi-chill-track-1.mp3');
const ClickSound = new Audio('./click-sound-1.mp3');
ChillMusic.loop = true;

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
    PlayClick();
});

const MusicBtn = document.getElementById('music-toggle-btn');
if (MusicBtn) {
    MusicBtn.onclick = (E) => {
        E.stopPropagation();
        ToggleMusic();
    };
}
