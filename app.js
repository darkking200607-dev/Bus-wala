const audio = document.getElementById("audio");

const playButton = document.getElementById("playButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");

const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");
const cover = document.getElementById("cover");

const progress = document.getElementById("progress");
const progressBar = document.getElementById("progressBar");

const currentTimeElement = document.getElementById("currentTime");
const durationElement = document.getElementById("duration");

const quote = document.getElementById("quote");
const hornButton = document.getElementById("hornButton");


/* ================================
   SHAYARI
================================ */

const shayariList = [
  "बुरी नज़र वाले तेरा भी भला हो",
  "सफ़र में मिले लोग अक्सर याद रह जाते हैं",
  "मंज़िल से ज़्यादा मज़ा तो रास्तों में है",
  "कुछ सफ़र मंज़िल के लिए नहीं, यादों के लिए होते हैं",
  "रास्ते बदलते रहे, किस्से बनते रहे",
  "दिल साफ़ हो तो सफ़र भी खूबसूरत लगता है",
  "चलते रहो, रास्ते खुद बनते जाएंगे",
  "हर सफ़र अपने साथ एक कहानी लाता है",
  "ज़िंदगी भी एक सफ़र है",
  "कुछ रास्ते अकेले ही तय करने पड़ते हैं",
  "रास्ता कोई भी हो, सफ़र अपना होना चाहिए",
  "हर मोड़ एक नई कहानी है",
  "कभी रास्तों से भी मोहब्बत हो जाती है",
  "जो सफ़र याद रह जाए, वही असली सफ़र है"
];

let shayariIndex = 0;

function changeShayari() {
  quote.style.opacity = "0";

  setTimeout(() => {
    quote.textContent = shayariList[shayariIndex];
    quote.style.opacity = "1";

    shayariIndex =
      (shayariIndex + 1) % shayariList.length;
  }, 300);
}

changeShayari();
setInterval(changeShayari, 4500);


/* ================================
   PLAYLIST
================================ */

const playlist = [
  {
    title: "Safar",
    artist: "Bus Wala",
    audio: "",
    cover: ""
  },
  {
    title: "Highway",
    artist: "Bus Wala",
    audio: "",
    cover: ""
  },
  {
    title: "Raat Ka Safar",
    artist: "Bus Wala",
    audio: "",
    cover: ""
  }
];

let currentSong = 0;


/* ================================
   LOAD SONG
================================ */

function loadSong(index) {
  currentSong = index;

  const song = playlist[currentSong];

  songTitle.textContent = song.title;
  artistName.textContent = "Song coming soon...";

  cover.innerHTML = "<span>♪</span>";

  if (song.audio) {
    audio.src = song.audio;
    artistName.textContent = song.artist;
  } else {
    audio.removeAttribute("src");
    audio.load();
  }

  progress.style.width = "0%";
  currentTimeElement.textContent = "0:00";
  durationElement.textContent = "0:00";

  updatePlayButton();
}


/* ================================
   PLAY
================================ */

async function togglePlay() {
  const song = playlist[currentSong];

  if (!song.audio) {
    artistName.textContent = "Song coming soon...";
    return;
  }

  if (audio.paused) {
    await audio.play();
  } else {
    audio.pause();
  }

  updatePlayButton();
}

function updatePlayButton() {
  playButton.textContent = audio.paused ? "▶" : "Ⅱ";
}


/* ================================
   NEXT / PREVIOUS
================================ */

function nextSong() {
  currentSong =
    (currentSong + 1) % playlist.length;

  loadSong(currentSong);
}

function previousSong() {
  currentSong =
    (currentSong - 1 + playlist.length) %
    playlist.length;

  loadSong(currentSong);
}


/* ================================
   MUSIC PROGRESS
================================ */

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;

  const percent =
    (audio.currentTime / audio.duration) * 100;

  progress.style.width = `${percent}%`;

  currentTimeElement.textContent =
    formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  durationElement.textContent =
    formatTime(audio.duration);
});

audio.addEventListener("ended", nextSong);

progressBar.addEventListener("click", (event) => {
  if (!audio.duration) return;

  const rect =
    progressBar.getBoundingClientRect();

  const percentage =
    (event.clientX - rect.left) / rect.width;

  audio.currentTime =
    percentage * audio.duration;
});


/* ================================
   🔊 REAL HORN EFFECT
   No MP3 required
================================ */

let hornContext = null;

function playHorn() {

  try {

    if (!hornContext) {
      hornContext =
        new (
          window.AudioContext ||
          window.webkitAudioContext
        )();
    }

    if (hornContext.state === "suspended") {
      hornContext.resume();
    }

    const now =
      hornContext.currentTime;

    const oscillator =
      hornContext.createOscillator();

    const oscillator2 =
      hornContext.createOscillator();

    const gain =
      hornContext.createGain();

    const filter =
      hornContext.createBiquadFilter();

    /*
      Two frequencies together
      create a bus/truck horn-like tone.
    */

    oscillator.type = "sawtooth";
    oscillator2.type = "square";

    oscillator.frequency.setValueAtTime(
      185,
      now
    );

    oscillator2.frequency.setValueAtTime(
      370,
      now
    );

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(
      900,
      now
    );

    gain.gain.setValueAtTime(
      0.0001,
      now
    );

    gain.gain.exponentialRampToValueAtTime(
      0.35,
      now + 0.04
    );

    gain.gain.setValueAtTime(
      0.35,
      now + 0.28
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 0.65
    );

    oscillator.connect(filter);
    oscillator2.connect(filter);

    filter.connect(gain);
    gain.connect(hornContext.destination);

    oscillator.start(now);
    oscillator2.start(now);

    oscillator.stop(now + 0.7);
    oscillator2.stop(now + 0.7);

    hornButton.classList.add("horn-active");

    setTimeout(() => {
      hornButton.classList.remove("horn-active");
    }, 650);

  } catch (error) {
    console.error("Horn error:", error);
  }
}


/* ================================
   HORN BUTTON
================================ */

hornButton.addEventListener(
  "click",
  playHorn
);


/* ================================
   BUTTONS
================================ */

playButton.addEventListener(
  "click",
  togglePlay
);

nextButton.addEventListener(
  "click",
  nextSong
);

previousButton.addEventListener(
  "click",
  previousSong
);


/* ================================
   TIME
================================ */

function formatTime(seconds) {

  if (!seconds || isNaN(seconds)) {
    return "0:00";
  }

  const minutes =
    Math.floor(seconds / 60);

  const remaining =
    Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");

  return `${minutes}:${remaining}`;
}


/* ================================
   START
================================ */

loadSong(0);
