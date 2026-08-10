/* =========================================================
   बस वाला — Truck driver playlist site
   Replace / extend the PLAYLIST array with your own songs.
   youtubeId = the 11-character id from a YouTube URL
   e.g. https://www.youtube.com/watch?v=XXXXXXXXXXX
                                        ^^^^^^^^^^^ yeh part
   ========================================================= */

const PLAYLIST = [
  {
    title: "ट्रक ड्राइवर",
    artist: "Shivmangal Raja, Goldi Yadav",
    youtubeId: "NL9R1mNSG4U",
    emoji: "🚛"
  },
  {
    title: "करेजवा में धँसेलु",
    artist: "Ritesh Pandey — Truck Driver 2",
    youtubeId: "CZ_DEZ4zhj0",
    emoji: "❤️"
  },
  {
    title: "ना लाली ना पाउडर",
    artist: "Ritesh Pandey — Truck Driver 2",
    youtubeId: "Y9B9Y0CKagg",
    emoji: "💄"
  },
  {
    title: "ड्राइवरवा मारे हैंडल",
    artist: "Pawan Singh",
    youtubeId: "PxquvUyBrXw",
    emoji: "🛞"
  },
  {
    title: "कईसन बलम बा",
    artist: "Chintu & Nidhi Jha — Truck Driver 2",
    youtubeId: "ExhzdQU9uxU",
    emoji: "🎶"
  },
  {
    title: "राजा रतिया में चोली खोले",
    artist: "Indu Sonali — Truck Driver 2",
    youtubeId: "fTggqmDuq_I",
    emoji: "🌙"
  }
];

let currentIndex = 0;
let player = null;
let isPlaying = false;
let progressTimer = null;

/* ---------- DOM refs ---------- */
const $ = (id) => document.getElementById(id);
const songTitleEl = $("songTitleHindi");
const songArtistEl = $("songArtist");
const dockTitleEl = $("dockTitle");
const dockArtistEl = $("dockArtist");
const dockArtEl = $("dockArt");
const playBtn = $("playBtn");
const prevBtn = $("prevBtn");
const nextBtn = $("nextBtn");
const progressFill = $("progressFill");
const songListEl = $("songList");
const songCountEl = $("songCount");
const openPlaylistBtn = $("openPlaylist");
const playlistSheet = $("playlistSheet");
const sheetBackdrop = $("sheetBackdrop");
const hornBtn = $("hornBtn");
const hornToast = $("hornToast");
const truckSvg = $("truckSvg");
const clockEl = $("clock");
const listenerCountEl = $("listenerCount");

/* ---------- Clock ---------- */
function tickClock(){
  const d = new Date();
  const h = d.getHours().toString().padStart(2,"0");
  const m = d.getMinutes().toString().padStart(2,"0");
  clockEl.textContent = `${h}:${m}`;
}
tickClock();
setInterval(tickClock, 1000 * 15);

/* fake ambient listener count, purely cosmetic */
setInterval(() => {
  const base = 800;
  listenerCountEl.textContent = base + Math.floor(Math.random() * 60);
}, 4000);

/* ---------- Build playlist UI ---------- */
function renderPlaylist(){
  songCountEl.textContent = `(${PLAYLIST.length})`;
  songListEl.innerHTML = "";
  PLAYLIST.forEach((song, i) => {
    const li = document.createElement("li");
    li.className = "song-item" + (i === currentIndex ? " active" : "");
    li.innerHTML = `
      <div class="song-item-emoji">${song.emoji || "🎵"}</div>
      <div class="song-item-text">
        <p class="song-item-title">${song.title}</p>
        <p class="song-item-artist">${song.artist}</p>
      </div>
      <div class="song-item-play">${i === currentIndex && isPlaying ? "⏸" : "▶"}</div>
    `;
    li.addEventListener("click", () => {
      loadSong(i, true);
      closeSheet();
    });
    songListEl.appendChild(li);
  });
}

/* ---------- Update now-playing UI ---------- */
function updateNowPlayingUI(){
  const song = PLAYLIST[currentIndex];
  songTitleEl.textContent = song.title;
  songArtistEl.textContent = song.artist;
  dockTitleEl.textContent = song.title;
  dockArtistEl.textContent = song.artist;
  dockArtEl.textContent = song.emoji || "🚛";
  playBtn.textContent = isPlaying ? "⏸" : "▶";
  renderPlaylist();
}

/* ---------- YouTube IFrame API ---------- */
function onYouTubeIframeAPIReady(){
  player = new YT.Player("yt-player-container", {
    height: "0",
    width: "0",
    videoId: PLAYLIST[currentIndex].youtubeId,
    playerVars: { playsinline: 1, controls: 0, rel: 0 },
    events: {
      onReady: () => { updateNowPlayingUI(); },
      onStateChange: onPlayerStateChange
    }
  });
}
// YT API calls this global function by name — must stay on window
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

function onPlayerStateChange(e){
  if (e.data === YT.PlayerState.PLAYING){
    isPlaying = true;
    startProgressLoop();
  } else if (e.data === YT.PlayerState.PAUSED){
    isPlaying = false;
    stopProgressLoop();
  } else if (e.data === YT.PlayerState.ENDED){
    nextSong();
  }
  updateNowPlayingUI();
}

function loadSong(index, autoplay){
  currentIndex = (index + PLAYLIST.length) % PLAYLIST.length;
  if (!player || !player.loadVideoById) return;
  if (autoplay){
    player.loadVideoById(PLAYLIST[currentIndex].youtubeId);
  } else {
    player.cueVideoById(PLAYLIST[currentIndex].youtubeId);
  }
  updateNowPlayingUI();
}

function togglePlay(){
  if (!player) return;
  if (isPlaying){
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function nextSong(){ loadSong(currentIndex + 1, true); }
function prevSong(){ loadSong(currentIndex - 1, true); }

/* ---------- Progress bar ---------- */
function startProgressLoop(){
  stopProgressLoop();
  progressTimer = setInterval(() => {
    if (!player || !player.getDuration) return;
    const dur = player.getDuration();
    const cur = player.getCurrentTime();
    if (dur > 0){
      progressFill.style.width = `${(cur / dur) * 100}%`;
    }
  }, 500);
}
function stopProgressLoop(){
  if (progressTimer) clearInterval(progressTimer);
}

/* ---------- Controls ---------- */
playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

/* ---------- Playlist sheet open/close ---------- */
function openSheet(){
  playlistSheet.classList.add("open");
  sheetBackdrop.classList.add("open");
}
function closeSheet(){
  playlistSheet.classList.remove("open");
  sheetBackdrop.classList.remove("open");
}
openPlaylistBtn.addEventListener("click", openSheet);
sheetBackdrop.addEventListener("click", closeSheet);

/* ---------- Horn button: WebAudio honk + toast + truck bounce ---------- */
function playHonk(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    function tone(freq, start, dur){
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.25, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    }
    // classic two-tone truck horn
    tone(330, 0, 0.35);
    tone(262, 0.32, 0.4);
  } catch(err){
    // audio not available — silently ignore
  }
}

hornBtn.addEventListener("click", () => {
  playHonk();
  truckSvg.classList.remove("honking");
  void truckSvg.offsetWidth; // restart animation
  truckSvg.classList.add("honking");
  hornToast.classList.add("show");
  clearTimeout(hornBtn._toastTimer);
  hornBtn._toastTimer = setTimeout(() => hornToast.classList.remove("show"), 1400);
});

/* ---------- Init playlist list before player is ready ---------- */
renderPlaylist();

