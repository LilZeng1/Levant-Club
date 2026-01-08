// LoFiMusicTracks
const LoFiMusicTracks = [
    "./ChillTunes/lofi-chill-track-1.mp3",
    "./ChillTunes/lofi-chill-track-2.mp3"
];

// Non-Copyright Mouse Click Sounds
const MouseClickSounds = [
    "./ChillTunes/click-sound-1.mp3",
    "./ChillTunes/click-sound-2.mp3"
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
        BackgroundMusic = new Audio(LoFiMusicTracks[CurrentTrackIndex]);
        BackgroundMusic.loop = true;
        BackgroundMusic.volume = 0.3;
        BackgroundMusic.addEventListener('ended', PlayNextTrack);
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

function PlayNextTrack() {
    CurrentTrackIndex = (CurrentTrackIndex + 1) % LoFiMusicTracks.length;
    BackgroundMusic.src = LoFiMusicTracks[CurrentTrackIndex];
    BackgroundMusic.play();
}

function PlayClickSound() {
    const RandomSoundIndex = Math.floor(Math.random() * MouseClickSounds.length);
    ClickSound.src = MouseClickSounds[RandomSoundIndex];
    ClickSound.volume = 0.4;
    ClickSound.currentTime = 0;
    ClickSound.play().catch(e => console.log("Click sesi çalınamadı:", e));
}
