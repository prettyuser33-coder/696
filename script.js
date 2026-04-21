// Music player functionality
let isPlaying = false;
const songs = [
    "Loneliness - Decalius",
    "Track 2 - Artist",
    "Track 3 - Artist"
];
let currentSongIndex = 0;

const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const playerInfo = document.querySelector('.player-info');

function updatePlayerInfo() {
    if (playerInfo) {
        playerInfo.textContent = `Now Playing: ${songs[currentSongIndex]}`;
    }
}

if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play / Pause';
    });
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        updatePlayerInfo();
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        updatePlayerInfo();
    });
}

// Try to load a random anime image if placeholder doesn't work
const animeImg = document.getElementById('animeImg');
if (animeImg) {
    animeImg.onerror = function() {
        this.style.display = 'none';
    };
}

