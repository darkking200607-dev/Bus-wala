const audio = document.getElementById("audio");
const hornAudio = document.getElementById("hornAudio");

const playButton =
  document.getElementById("playButton");

const previousButton =
  document.getElementById("previousButton");

const nextButton =
  document.getElementById("nextButton");

const songTitle =
  document.getElementById("songTitle");

const artistName =
  document.getElementById("artistName");

const cover =
  document.getElementById("cover");

const progress =
  document.getElementById("progress");

const progressBar =
  document.getElementById("progressBar");

const quote =
  document.getElementById("quote");

const currentTimeElement =
  document.getElementById("currentTime");

const durationElement =
  document.getElementById("duration");

const hornButton =
  document.getElementById("hornButton");


/* =========================================
   SHAYARI
========================================= */

const shayariList = [

  "बुरी नज़र वाले तेरा भी भला हो",

  "सफ़र लंबा हो तो रास्ते याद रहते हैं",

  "मंज़िल से ज़्यादा मज़ा तो रास्तों में है",

  "कुछ सफ़र मंज़िल के लिए नहीं, यादों के लिए होते हैं",

  "रास्ते बदलते रहे, किस्से बनते रहे",

  "दिल साफ़ हो तो सफ़र भी खूबसूरत लगता है",

  "चलते रहो, रास्ते खुद बनते जाएंगे",

  "हर सफ़र अपने साथ एक कहानी लाता है",

  "ज़िंदगी भी एक सफ़र है",

  "कुछ रास्ते अकेले ही तय करने पड़ते हैं",

  "सफ़र में मिले लोग अक्सर याद रह जाते हैं",

  "रास्ता कोई भी हो, सफ़र अपना होना चाहिए",

  "जहाँ दिल लगे, वही अपना शहर है",

  "आज रास्ता है, कल यही याद बनेगा",

  "रास्ते कभी झूठ नहीं बोलते",

  "कुछ मंज़िलें रास्तों से ज्यादा खूबसूरत होती हैं",

  "चल पड़े हैं तो सफ़र पूरा करेंगे",

  "हर मोड़ एक नई कहानी है",

  "कभी रास्तों से भी मोहब्बत हो जाती है",

  "जो सफ़र याद रह जाए, वही असली सफ़र है"

];

let shayariIndex = 0;


function changeShayari() {

  if (!quote) return;

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

setInterval(
  changeShayari,
  4500
);


/* =========================================
   TEMP PLAYLIST
========================================= */

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


/* =========================================
   LOAD SONG
========================================= */

function loadSong(index) {

  if (!playlist.length) return;

  currentSong = index;

  const song =
    playlist[currentSong];

  songTitle.textContent =
    song.title;

  artistName.textContent =
    song.audio
      ? song.artist
      : "Song coming soon...";


  if (song.cover) {

    cover.innerHTML = `
      <img
        src="${escapeHTML(song.cover)}"
        alt="${escapeHTML(song.title)}"
      />
    `;

  } else {

    cover.innerHTML =
      "<span>♪</span>";

  }


  if (song.audio) {

    audio.src =
      song.audio;

  } else {

    audio.removeAttribute("src");

    audio.load();

  }


  progress.style.width =
    "0%";

  currentTimeElement.textContent =
    "0:00";

  durationElement.textContent =
    "0:00";

  updatePlayButton();
}


/* =========================================
   PLAY / PAUSE
========================================= */

async function togglePlay() {

  const song =
    playlist[currentSong];

  if (!song || !song.audio) {

    artistName.textContent =
      "Song coming soon...";

    return;
  }

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


/* =========================================
   NEXT
========================================= */

function nextSong() {

  currentSong =
    (currentSong + 1) %
    playlist.length;

  loadSong(currentSong);

  if (playlist[currentSong].audio) {

    audio.play()
      .then(updatePlayButton)
      .catch(() => {});

  }
}


/* =========================================
   PREVIOUS
========================================= */

function previousSong() {

  if (audio.currentTime > 3) {

    audio.currentTime = 0;

    return;
  }

  currentSong =
    (currentSong - 1 + playlist.length) %
    playlist.length;

  loadSong(currentSong);

  if (playlist[currentSong].audio) {

    audio.play()
      .then(updatePlayButton)
      .catch(() => {});

  }
}


/* =========================================
   PROGRESS
========================================= */

audio.addEventListener(
  "timeupdate",
  () => {

    if (!audio.duration) return;

    const percentage =
      (audio.currentTime /
        audio.duration) *
      100;

    progress.style.width =
      `${percentage}%`;

    currentTimeElement.textContent =
      formatTime(
        audio.currentTime
      );

  }
);


audio.addEventListener(
  "loadedmetadata",
  () => {

    durationElement.textContent =
      formatTime(
        audio.duration
      );

  }
);


/* =========================================
   PROGRESS CLICK
========================================= */

progressBar.addEventListener(
  "click",
  (event) => {

    if (!audio.duration) return;

    const rect =
      progressBar.getBoundingClientRect();

    const position =
      event.clientX -
      rect.left;

    const percentage =
      position /
      rect.width;

    audio.currentTime =
      percentage *
      audio.duration;

  }
);


/* =========================================
   SONG END
========================================= */

audio.addEventListener(
  "ended",
  nextSong
);


/* =========================================
   HORN
========================================= */

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

      }, 500);

    } catch (error) {

      console.error(
        "Horn error:",
        error
      );

    }

  }
);


/* =========================================
   BUTTONS
========================================= */

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


/* =========================================
   KEYBOARD
========================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.code === "Space"
    ) {

      event.preventDefault();

      togglePlay();

    }

    if (
      event.code === "ArrowRight"
    ) {

      nextSong();

    }

    if (
      event.code === "ArrowLeft"
    ) {

      previousSong();

    }

  }
);


/* =========================================
   HELPERS
========================================= */

function formatTime(seconds) {

  if (
    !seconds ||
    Number.isNaN(seconds)
  ) {

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


function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================
   START
========================================= */

loadSong(0);
