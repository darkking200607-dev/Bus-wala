const audio = document.getElementById("audio");

const playButton = document.getElementById("playButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const shuffleButton = document.getElementById("shuffleButton");
const soundButton = document.getElementById("soundButton");

const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");
const cover = document.getElementById("cover");

const progress = document.getElementById("progress");
const progressBar = document.querySelector(".progress-bar");

const currentTimeElement = document.getElementById("currentTime");
const durationElement = document.getElementById("duration");

const quote = document.getElementById("quote");

/*
====================================================
  TEMPORARY PLAYLIST
  Later this will come from the Admin Panel/database.
====================================================
*/

const playlist = [
  {
    title: "Safar",
    artist: "Bus Wala",
    audio: "",
    cover: "",
  },
  {
    title: "Highway",
    artist: "Bus Wala",
    audio: "",
    cover: "",
  },
  {
    title: "Raat Ka Safar",
    artist: "Bus Wala",
    audio: "",
    cover: "",
  },
];

let currentSong = 0;
let isPlaying = false;
let shuffle = false;

/*
====================================================
  LOAD SONG
====================================================
*/

function loadSong(index) {
  if (!playlist.length) return;

  currentSong = index;

  const song = playlist[currentSong];

  songTitle.textContent = song.title;
  artistName.textContent = song.artist;

  if (song.cover) {
    cover.innerHTML = `
      <img
        src="${song.cover}"
        alt="${escapeHTML(song.title)}"
      />
    `;
  } else {
    cover.innerHTML = "<span>♪</span>";
  }

  if (song.audio) {
    audio.src = song.audio;
  } else {
    audio.removeAttribute("src");
    audio.load();
  }

  progress.style.width = "0%";
  currentTimeElement.textContent = "0:00";
  durationElement.textContent = "0:00";

  updatePlayButton();
}

/*
====================================================
  PLAY / PAUSE
====================================================
*/

async function togglePlay() {
  if (!playlist.length) return;

  const song = playlist[currentSong];

  if (!song.audio) {
    artistName.textContent = "Song coming soon...";
    return;
  }

  try {
    if (audio.paused) {
      await audio.play();
      isPlaying = true;
    } else {
      audio.pause();
      isPlaying = false;
    }

    updatePlayButton();
  } catch (error) {
    console.error("Audio playback error:", error);
  }
}

function updatePlayButton() {
  playButton.textContent = audio.paused ? "▶" : "Ⅱ";
}

/*
====================================================
  NEXT SONG
====================================================
*/

function nextSong() {
  if (!playlist.length) return;

  if (shuffle && playlist.length > 1) {
    let nextIndex;

    do {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } while (nextIndex === currentSong);

    currentSong = nextIndex;
  } else {
    currentSong = (currentSong + 1) % playlist.length;
  }

  loadSong(currentSong);

  if (playlist[currentSong].audio) {
    audio.play()
      .then(() => {
        isPlaying = true;
        updatePlayButton();
      })
      .catch(() => {});
  }
}

/*
====================================================
  PREVIOUS SONG
====================================================
*/

function previousSong() {
  if (!playlist.length) return;

  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  currentSong =
    (currentSong - 1 + playlist.length) % playlist.length;

  loadSong(currentSong);

  if (playlist[currentSong].audio) {
    audio.play()
      .then(() => {
        isPlaying = true;
        updatePlayButton();
      })
      .catch(() => {});
  }
}

/*
====================================================
  SHUFFLE
====================================================
*/

shuffleButton.addEventListener("click", () => {
  shuffle = !shuffle;

  shuffleButton.style.opacity = shuffle ? "1" : "0.55";
});

/*
====================================================
  PROGRESS UPDATE
====================================================
*/

audio.addEventListener("timeupdate", () => {
  if (!audio.duration || Number.isNaN(audio.duration)) return;

  const percentage =
    (audio.currentTime / audio.duration) * 100;

  progress.style.width = `${percentage}%`;

  currentTimeElement.textContent =
    formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  durationElement.textContent =
    formatTime(audio.duration);
});

/*
====================================================
  CLICK PROGRESS BAR
====================================================
*/

progressBar.addEventListener("click", (event) => {
  if (!audio.duration) return;

  const rect = progressBar.getBoundingClientRect();

  const clickPosition =
    event.clientX - rect.left;

  const percentage =
    clickPosition / rect.width;

  audio.currentTime =
    percentage * audio.duration;
});

/*
====================================================
  SONG ENDED
====================================================
*/

audio.addEventListener("ended", () => {
  nextSong();
});

/*
====================================================
  SOUND BUTTON
====================================================
*/

soundButton.addEventListener("click", () => {
  audio.muted = !audio.muted;

  soundButton.textContent =
    audio.muted ? "◌" : "◉";
});

/*
====================================================
  BUTTON EVENTS
====================================================
*/

playButton.addEventListener("click", togglePlay);

nextButton.addEventListener("click", nextSong);

previousButton.addEventListener(
  "click",
  previousSong
);

/*
====================================================
  KEYBOARD CONTROLS
====================================================
*/

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    togglePlay();
  }

  if (event.code === "ArrowRight") {
    nextSong();
  }

  if (event.code === "ArrowLeft") {
    previousSong();
  }
});

/*
====================================================
  HELPERS
====================================================
*/

function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);

  const remainingSeconds =
    Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/*
====================================================
  START
====================================================
*/

loadSong(0);
