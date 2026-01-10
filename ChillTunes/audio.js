// LoFiMusicTracks
const LoFiMusicTracks = [
    "./ChillTunes/lofi-chill-track-1.mp3"
];

// Non-Copyright Mouse Click Sounds
const MouseClickSounds = [
    "./ChillTunes/click-sound-1.mp3"
];

let BackgroundMusic = null;
let IsMusicPlaying = false;
let CurrentTrackIndex = 0;
const ClickSound = new Audio();

document.addEventListener('DOMContentLoaded', () => {
    const MusicToggleButton = document.getElementById('music-toggle-btn');
    if (!MusicToggleButton) return;

    const SavedMusicState = localStorage.getItem('isMusicPlaying');
    if (SavedMusicState === 'true') {
        InitializeAndPlayMusic();
    } else {
        MusicToggleButton.classList.add('muted');
        MusicToggleButton.innerHTML = '<i class="ph-bold ph-speaker-slash"></i>';
    }

    MusicToggleButton.addEventListener('click', () => {
        if (IsMusicPlaying) {
            PauseMusic();
        } else {
            InitializeAndPlayMusic();
        }
    });

    document.querySelectorAll('button, a.discord-btn, .bento-card').forEach(Element => {
        Element.addEventListener('click', (Event) => {
            if (Event.target.tagName === 'BUTTON' || Event.target.tagName === 'A') {
                PlayClickSound();
            } else if (Event.target.closest('.bento-card')) {
                PlayClickSound();
            }
        });
    });

    document.body.addEventListener('click', HandleUserInteraction, { once: true });
    document.body.addEventListener('keydown', HandleUserInteraction, { once: true });
});

function HandleUserInteraction() {
    if (localStorage.getItem('isMusicPlaying') === 'true') {
        InitializeAndPlayMusic();
    }
}

function InitializeAndPlayMusic() {
    const MusicToggleButton = document.getElementById('music-toggle-btn');

    if (!BackgroundMusic) {
        BackgroundMusic = new Audio(LoFiMusicTracks[0]);
        BackgroundMusic.loop = true;
        BackgroundMusic.volume = 0.3;
    }

    BackgroundMusic.play().then(() => {
        IsMusicPlaying = true;
        localStorage.setItem('isMusicPlaying', 'true');
        MusicToggleButton.classList.remove('muted');
        MusicToggleButton.innerHTML = '<i class="ph-bold ph-speaker-high"></i>';
    }).catch(error => {
        console.warn("Müzik otomatik başlatılamadı:", error);
        IsMusicPlaying = false;
        localStorage.setItem('isMusicPlaying', 'false');
        MusicToggleButton.classList.add('muted');
        MusicToggleButton.innerHTML = '<i class="ph-bold ph-speaker-slash"></i>';
    });
}

function PauseMusic() {
    const MusicToggleButton = document.getElementById('music-toggle-btn');
    if (BackgroundMusic) {
        BackgroundMusic.pause();
    }
    IsMusicPlaying = false;
    localStorage.setItem('isMusicPlaying', 'false');
    MusicToggleButton.classList.add('muted');
    MusicToggleButton.innerHTML = '<i class="ph-bold ph-speaker-slash"></i>';
}

function PlayClickSound() {
    if (ClickSound) {
        ClickSound.pause();
        ClickSound.currentTime = 0;
        ClickSound.play().catch(err => console.warn("Ses çalma engellendi:", err));
    }
}
