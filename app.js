const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const audio = document.getElementById("audio");
const hornAudio = document.getElementById("hornAudio");

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

let playlist = [];
let currentSong = 0;


/* =========================
   SHAYARI
========================= */

const shayariList = [
  "बुरी नज़र वाले तेरा भी भला हो",
  "मंज़िल से ज़्यादा मज़ा रास्तों में है",
  "कुछ सफ़र मंज़िल के लिए नहीं होते",
  "हर सफ़र अपने साथ एक कहानी लाता है",
  "रास्ते बदलते रहे, किस्से बनते रहे",
  "दिल साफ़ हो तो सफ़र भी खूबसूरत लगता है",
  "चलते रहो, रास्ते खुद बनते जाएंगे",
  "हर मोड़ एक नई कहानी है"
];

let shayariIndex = 0;

function changeShayari() {

  quote.style.opacity = "0";

  setTimeout(() => {

    quote.textContent =
      shayariList[shayariIndex];

    quote.style.opacity = "1";

    shayariIndex =
      (shayariIndex + 1) %
      shayariList.length;

  }, 300);
}

changeShayari();

setInterval(changeShayari, 4500);


/* =========================
   LOAD SONGS FROM SUPABASE
========================= */

async function loadSongs() {

  try {

    const { data, error } =
      await supabaseClient
        .from("songs")
        .select("*")
        .order("created_at", {
          ascending: false
        });

    if (error) {
      throw error;
    }

    playlist = data || [];

    if (playlist.length === 0) {

      songTitle.textContent =
        "बस वाला";

      artistName.textContent =
        "No songs yet";

      return;
    }

    loadSong(0);

  } catch (error) {

    console.error(
      "Could not load songs:",
      error
    );

    songTitle.textContent =
      "बस वाला";

    artistName.textContent =
      "Playlist unavailable";

  }
}


/* =========================
   LOAD CURRENT SONG
========================= */

function loadSong(index) {

  if (!playlist.length) return;

  currentSong = index;

  const song =
    playlist[currentSong];

  songTitle.textContent =
    song.title;

  artistName.textContent =
    song.artist || "Bus Wala";


  if (song.cover_url) {

    cover.innerHTML = `
      <img
        src="${song.cover_url}"
        alt="${song.title}"
      />
    `;

  } else {

    cover.innerHTML =
      "<span>♪</span>";

  }


  audio.src =
    song.audio_url;

  audio.load();


  progress.style.width =
    "0%";

  currentTimeElement.textContent =
    "0:00";

  durationElement.textContent =
    "0:00";

  updatePlayButton();
}


/* =========================
   PLAY / PAUSE
========================= */

async function togglePlay() {

  if (!playlist.length) return;

  try {

    if (audio.paused) {

      await audio.play();

    } else {

      audio.pause();

    }

    updatePlayButton();

  } catch (error) {

    console.error(
      "Playback error:",
      error
    );

  }
}


function updatePlayButton() {

  playButton.textContent =
    audio.paused
      ? "▶"
      : "Ⅱ";
}


/* =========================
   NEXT
========================= */

function nextSong() {

  if (!playlist.length) return;

  currentSong =
    (currentSong + 1) %
    playlist.length;

  loadSong(currentSong);

  audio.play()
    .then(updatePlayButton)
    .catch(() => {});
}


/* =========================
   PREVIOUS
========================= */

function previousSong() {

  if (!playlist.length) return;

  if (audio.currentTime > 3) {

    audio.currentTime = 0;

    return;
  }

  currentSong =
    (currentSong - 1 +
      playlist.length) %
    playlist.length;

  loadSong(currentSong);

  audio.play()
    .then(updatePlayButton)
    .catch(() => {});
}


/* =========================
   PROGRESS
========================= */

audio.addEventListener(
  "timeupdate",
  () => {

    if (!audio.duration) return;

    const percent =
      (audio.currentTime /
        audio.duration) *
      100;

    progress.style.width =
      `${percent}%`;

    currentTimeElement.textContent =
      formatTime(audio.currentTime);

  }
);


audio.addEventListener(
  "loadedmetadata",
  () => {

    durationElement.textContent =
      formatTime(audio.duration);

  }
);


audio.addEventListener(
  "ended",
  nextSong
);


progressBar.addEventListener(
  "click",
  (event) => {

    if (!audio.duration) return;

    const rect =
      progressBar.getBoundingClientRect();

    const percentage =
      (event.clientX - rect.left) /
      rect.width;

    audio.currentTime =
      percentage * audio.duration;

  }
);


/* =========================
   HORN
========================= */

hornButton.addEventListener(
  "click",
  async () => {

    try {

      hornAudio.currentTime = 0;

      await hornAudio.play();

      hornButton.classList.add(
        "horn-active"
      );

      setTimeout(() => {

        hornButton.classList.remove(
          "horn-active"
        );

      }, 650);

    } catch (error) {

      console.error(
        "Horn error:",
        error
      );

    }

  }
);


/* =========================
   BUTTONS
========================= */

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


/* =========================
   TIME FORMAT
========================= */

function formatTime(seconds) {

  if (
    !seconds ||
    Number.isNaN(seconds)
  ) {
    return "0:00";
  }

  const minutes =
    Math.floor(seconds / 60);

  const secondsLeft =
    Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");

  return `${minutes}:${secondsLeft}`;
}


/* =========================
   START
========================= */

loadSongs();
