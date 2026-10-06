/**
 * LA PURA NETA RADIO - Audio Player & Shoutcast v2 Streaming Engine
 * Stream URL: http://radios.mipanel.stream:6952/ (with SSL https://radios.mipanel.stream:6952/)
 */

const STATIONS_DATA = [
  {
    id: "principal",
    name: "La Pura Neta Radio HD",
    tagline: "Con pura música de calidad",
    genre: "Regional Mexicano",
    frequency: "Transmitiendo en Vivo • HD Online",
    streamUrl: "https://radios.mipanel.stream:6952/;?type=http",
    backupUrl: "https://radios.mipanel.stream:6952/;",
    statsUrl: "https://radios.mipanel.stream:6952/stats?sid=1&json=1",
    currentTrack: {
      title: "Sintonizando señal en vivo...",
      artist: "La Pura Neta Radio",
      album: "Pura Música de Calidad",
      cover: "assets/images/logo.png"
    }
  }
];

class RadioPlayerEngine {
  constructor() {
    this.audio = new Audio();
    this.audio.preload = "none";
    this.currentStationIndex = 0;
    this.isPlaying = false;
    this.isMuted = false;
    this.volume = parseFloat(localStorage.getItem("lpn_volume")) || 0.85;
    this.audio.volume = this.volume;

    // Current Live Track state
    this.currentMetadata = {
      title: "La Pura Neta Radio",
      artist: "Transmitiendo en Vivo",
      album: "Pura Música de Calidad",
      cover: "assets/images/logo.png",
      rawTitle: ""
    };

    this.pollInterval = null;
    this.canvasContext = null;
    this.animationFrameId = null;

    this.init();
  }

  init() {
    this.setupAudioListeners();
    this.setupUIControls();
    this.setupMediaSession();
    this.updateVolumeUI(this.volume);
    this.initCanvasVisualizer();
    this.renderPlayedHistory();
    
    // Start metadata polling immediately (every 3.5 seconds)
    this.fetchLiveMetadata();
    this.startMetadataPolling();
  }

  setupAudioListeners() {
    this.audio.addEventListener("play", () => {
      this.isPlaying = true;
      this.isManualPause = false;
      this.updatePlayState(true);
      this.startVisualizer();
    });

    this.audio.addEventListener("pause", () => {
      this.isPlaying = false;
      this.updatePlayState(false);
      this.stopVisualizer();
    });

    this.audio.addEventListener("waiting", () => {
      this.setBuffering(true);
    });

    this.audio.addEventListener("playing", () => {
      this.setBuffering(false);
    });

    this.audio.addEventListener("error", (e) => {
      if (this.isManualPause || !this.isPlaying) {
        this.setBuffering(false);
        return;
      }
      console.warn("Stream reconectando...", e);
      const station = STATIONS_DATA[this.currentStationIndex];
      // Try fallback URL if main failed
      if (this.audio.src !== station.backupUrl) {
        this.audio.src = station.backupUrl;
        this.audio.play().catch(console.error);
      }
      this.setBuffering(false);
    });
  }

  setupUIControls() {
    const playBtns = document.querySelectorAll(".btn-hero-play, .btn-bottom-play");
    playBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.togglePlay();
      });
    });

    const volumeSliders = document.querySelectorAll(".volume-slider");
    volumeSliders.forEach(slider => {
      slider.value = this.volume * 100;
      slider.addEventListener("input", (e) => {
        this.setVolume(e.target.value / 100);
      });
    });

    const muteBtns = document.querySelectorAll(".btn-mute");
    muteBtns.forEach(btn => {
      btn.addEventListener("click", () => this.toggleMute());
    });
  }

  setupMediaSession() {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("play", () => this.togglePlay());
      navigator.mediaSession.setActionHandler("pause", () => this.togglePlay());
      navigator.mediaSession.setActionHandler("stop", () => this.togglePlay());
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.isManualPause = true;
      this.isPlaying = false;
      this.audio.pause();
      this.audio.removeAttribute("src");
      this.audio.load();
      this.updatePlayState(false);
      this.stopVisualizer();
    } else {
      this.isManualPause = false;
      const station = STATIONS_DATA[this.currentStationIndex];
      const streamUrl = station.streamUrl + (station.streamUrl.includes("?") ? "&" : "?") + "_t=" + Date.now();
      this.audio.src = streamUrl;
      this.audio.load();
      
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isPlaying = true;
          this.updatePlayState(true);
        }).catch(err => {
          if (this.isManualPause) return;
          console.warn("Intento secundario de reproducción...", err);
          this.audio.src = station.backupUrl;
          this.audio.play().then(() => {
            this.isPlaying = true;
            this.updatePlayState(true);
          }).catch(console.error);
        });
      }
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    this.audio.volume = this.volume;
    localStorage.setItem("lpn_volume", this.volume);
    this.updateVolumeUI(this.volume);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;
    this.updateVolumeUI(this.isMuted ? 0 : this.volume);
  }

  updatePlayState(isPlaying) {
    const playIcons = document.querySelectorAll(".play-icon");
    const pauseIcons = document.querySelectorAll(".pause-icon");
    const eqContainers = document.querySelectorAll(".eq-animation-container");
    const albumVinyls = document.querySelectorAll(".album-art-vinyl, #vinyl-disc");

    playIcons.forEach(el => el.classList.toggle("hidden", isPlaying));
    pauseIcons.forEach(el => el.classList.toggle("hidden", !isPlaying));
    eqContainers.forEach(el => el.classList.toggle("eq-active", isPlaying));
    albumVinyls.forEach(el => el.classList.toggle("spin-paused", !isPlaying));

    const circularEq = document.getElementById("circular-eq");
    if (circularEq) circularEq.classList.toggle("hidden", !isPlaying);

    const glowRing = document.getElementById("glow-ring");
    if (glowRing) glowRing.classList.toggle("glow-active", isPlaying);

    const liveDot = document.getElementById("live-stream-badge");
    if (liveDot) {
      liveDot.classList.toggle("bg-red-600", isPlaying);
      liveDot.classList.toggle("pulse-dot", isPlaying);
    }
  }

  setBuffering(isBuffering) {
    const bufferSpins = document.querySelectorAll(".buffer-spinner");
    bufferSpins.forEach(el => el.classList.toggle("hidden", !isBuffering));
  }

  updateVolumeUI(vol) {
    const sliders = document.querySelectorAll(".volume-slider");
    sliders.forEach(slider => {
      slider.value = vol * 100;
    });

    const volPercent = document.getElementById("vol-percent");
    if (volPercent) {
      volPercent.textContent = `${Math.round(vol * 100)}%`;
    }

    const volPercentPop = document.getElementById("vol-percent-pop");
    if (volPercentPop) {
      volPercentPop.textContent = `${Math.round(vol * 100)}%`;
    }

    const highIcons = document.querySelectorAll(".vol-icon-high");
    const muteIcons = document.querySelectorAll(".vol-icon-muted");

    highIcons.forEach(el => el.classList.toggle("hidden", vol === 0));
    muteIcons.forEach(el => el.classList.toggle("hidden", vol > 0));
  }

  /* ================= LIVE METADATA & COVER ART ENGINE ================= */

  startMetadataPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    // Poll every 3.5 seconds
    this.pollInterval = setInterval(() => {
      this.fetchLiveMetadata();
    }, 3500);
  }

  async fetchLiveMetadata() {
    // 1. Try internal API proxy (Vercel)
    try {
      const res = await fetch("/api/stream-meta?t=" + Date.now(), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.title) {
          this.applyMetadata(data);
          return;
        }
      }
    } catch (e) {
      // Continue to JSONP fallback
    }

    // 2. Direct JSONP fallback to Shoutcast (Works in all browsers, local dev, and native mobile apps without CORS errors)
    try {
      const stats = await this.fetchShoutcastJSONP();
      const rawTitle = (stats && stats.songtitle ? stats.songtitle : "").trim();
      
      if (rawTitle && rawTitle !== this.currentMetadata.rawTitle) {
        let artist = "La Pura Neta Radio";
        let title = rawTitle;
        if (rawTitle.includes(" - ")) {
          const parts = rawTitle.split(" - ");
          artist = parts[0].trim();
          title = parts.slice(1).join(" - ").trim();
        }

        // Fetch album cover from iTunes API
        const coverInfo = await this.searchCoverClient(artist, title);
        this.applyMetadata({
          artist,
          title,
          album: coverInfo.album || "La Pura Neta Radio",
          cover: coverInfo.cover || "assets/images/logo.png",
          rawTitle
        });
      }
    } catch (err) {
      console.warn("Error obteniendo metadata de transmisión:", err);
    }
  }

  fetchShoutcastJSONP() {
    return new Promise((resolve, reject) => {
      const callbackName = "lpn_sc_cb_" + Math.floor(Math.random() * 1000000);
      const script = document.createElement("script");
      let isDone = false;

      const cleanup = () => {
        isDone = true;
        try { delete window[callbackName]; } catch (e) { window[callbackName] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      };

      window[callbackName] = (data) => {
        if (!isDone) {
          cleanup();
          resolve(data);
        }
      };

      script.src = `https://radios.mipanel.stream:6952/stats?sid=1&json=1&callback=${callbackName}&_t=${Date.now()}`;
      script.onerror = () => {
        if (!isDone) {
          cleanup();
          reject(new Error("Shoutcast JSONP connection error"));
        }
      };

      // Timeout safety (4 seconds)
      setTimeout(() => {
        if (!isDone) {
          cleanup();
          reject(new Error("Shoutcast JSONP timeout"));
        }
      }, 4000);

      document.head.appendChild(script);
    });
  }

  async searchCoverClient(artist, title) {
    const clean = (s) => (s || "").replace(/[\(\)\[\]]/g, " ").replace(/\s+/g, " ").trim();
    const cArtist = clean(artist);
    const cTitle = clean(title);

    // Try iTunes
    try {
      const q = encodeURIComponent(`${cArtist} ${cTitle}`);
      const res = await fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0 && data.results[0].artworkUrl100) {
          return {
            cover: data.results[0].artworkUrl100.replace("100x100bb.jpg", "600x600bb.jpg"),
            album: data.results[0].collectionName || ""
          };
        }
      }
    } catch (e) {}

    // Fallback search artist only
    try {
      const q2 = encodeURIComponent(cArtist);
      const res2 = await fetch(`https://itunes.apple.com/search?term=${q2}&media=music&limit=1`);
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2.results && data2.results.length > 0 && data2.results[0].artworkUrl100) {
          return {
            cover: data2.results[0].artworkUrl100.replace("100x100bb.jpg", "600x600bb.jpg"),
            album: data2.results[0].collectionName || ""
          };
        }
      }
    } catch (e) {}

    return {
      cover: "assets/images/logo.png",
      album: "La Pura Neta Radio"
    };
  }

  applyMetadata(data) {
    const { artist, title, album, cover, rawTitle } = data;
    
    // Check if song changed
    const hasChanged = this.currentMetadata.rawTitle !== rawTitle || 
                       this.currentMetadata.title !== title || 
                       this.currentMetadata.artist !== artist ||
                       this.currentMetadata.cover !== cover;

    if (!hasChanged) return;

    this.currentMetadata = {
      artist: artist || "La Pura Neta Radio",
      title: title || "Música en Vivo",
      album: album || "Pura Música de Calidad",
      cover: cover || "assets/images/logo.png",
      rawTitle: rawTitle || ""
    };

    // Update DOM Text
    const titleEls = document.querySelectorAll(".now-playing-title");
    const artistEls = document.querySelectorAll(".now-playing-artist");
    const albumEls = document.querySelectorAll(".now-playing-album");

    titleEls.forEach(el => { el.textContent = this.currentMetadata.title; });
    artistEls.forEach(el => { el.textContent = this.currentMetadata.artist; });
    albumEls.forEach(el => { el.textContent = this.currentMetadata.album; });

    // Update Cover Art
    const coverEls = document.querySelectorAll(".now-playing-cover");
    const newCover = this.currentMetadata.cover;

    coverEls.forEach(img => {
      if (img.tagName === "IMG") {
        img.onerror = () => {
          img.src = "assets/images/logo.png";
        };
        img.src = newCover;
      }
    });

    // Update Navigator MediaSession (Lockscreen & Bluetooth displays)
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: this.currentMetadata.title,
        artist: this.currentMetadata.artist,
        album: this.currentMetadata.album,
        artwork: [
          { src: this.currentMetadata.cover, sizes: "96x96", type: "image/jpeg" },
          { src: this.currentMetadata.cover, sizes: "128x128", type: "image/jpeg" },
          { src: this.currentMetadata.cover, sizes: "256x256", type: "image/jpeg" },
          { src: this.currentMetadata.cover, sizes: "512x512", type: "image/jpeg" }
        ]
      });
    }

    // Update Dynamic Real Played History
    this.updatePlayedHistory(this.currentMetadata);
  }

  updatePlayedHistory(entry) {
    if (!entry.title || entry.title.includes("Sintonizando") || entry.title === "Música en Vivo") return;

    let history = [];
    try {
      history = JSON.parse(localStorage.getItem("lpn_real_history")) || [];
    } catch (e) {
      history = [];
    }

    // Check if duplicate of the most recent entry
    if (history.length > 0 && history[0].title === entry.title && history[0].artist === entry.artist) {
      this.renderPlayedHistory(history);
      return;
    }

    history.unshift({
      title: entry.title,
      artist: entry.artist,
      cover: entry.cover || "assets/images/logo.png",
      time: Date.now()
    });

    // Keep top 6 items
    history = history.slice(0, 6);
    try {
      localStorage.setItem("lpn_real_history", JSON.stringify(history));
    } catch (e) {}

    this.renderPlayedHistory(history);
  }

  renderPlayedHistory(history) {
    const container = document.getElementById("recent-tracks-container");
    if (!container) return;

    if (!history || history.length === 0) {
      try {
        history = JSON.parse(localStorage.getItem("lpn_real_history")) || [];
      } catch (e) {
        history = [];
      }
    }

    if (history.length === 0) return;

    const timeAgo = (timestamp) => {
      const diffSec = Math.floor((Date.now() - timestamp) / 1000);
      if (diffSec < 60) return "Ahora";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `Hace ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      return `Hace ${diffHours} h`;
    };

    container.innerHTML = history.map((track, i) => `
      <div class="flex items-center justify-between text-xs p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/80 transition-all hover:border-red-500/30">
        <div class="flex items-center gap-3 min-w-0">
          <img src="${track.cover}" alt="${track.title}" onerror="this.src='assets/images/logo.png'" class="w-10 h-10 rounded-md object-cover flex-shrink-0 bg-black border border-zinc-200 dark:border-zinc-700">
          <div class="truncate">
            <p class="font-semibold text-zinc-900 dark:text-white truncate">${track.title}</p>
            <p class="text-zinc-500 dark:text-zinc-400 truncate">${track.artist}</p>
          </div>
        </div>
        <span class="text-zinc-400 dark:text-zinc-500 text-[11px] whitespace-nowrap ml-2 font-medium">
          ${i === 0 ? '<span class="text-red-600 dark:text-red-500 font-bold">Sonando</span>' : timeAgo(track.time)}
        </span>
      </div>
    `).join("");
  }

  /* ================= VISUALIZER ================= */

  initCanvasVisualizer() {
    const canvas = document.getElementById("hero-eq-canvas");
    if (!canvas) return;
    this.canvasContext = canvas.getContext("2d");
  }

  startVisualizer() {
    const canvas = document.getElementById("hero-eq-canvas");
    if (!canvas || !this.canvasContext) return;

    const ctx = this.canvasContext;
    const numBars = 32;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / numBars) - 2;

      for (let i = 0; i < numBars; i++) {
        const baseHeight = Math.sin(Date.now() * 0.005 + i * 0.3) * 0.5 + 0.5;
        const randomSpike = Math.random() * 0.4;
        const height = (baseHeight * 0.6 + randomSpike * 0.4) * (canvas.height * 0.85);

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, "#b3000e");
        gradient.addColorStop(0.6, "#E60012");
        gradient.addColorStop(1, "#ff6b6b");

        ctx.fillStyle = gradient;
        ctx.fillRect(i * (barWidth + 2), canvas.height - height, barWidth, height);
      }

      if (this.isPlaying) {
        this.animationFrameId = requestAnimationFrame(draw);
      }
    };
    draw();
  }

  stopVisualizer() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.canvasContext) {
      const canvas = document.getElementById("hero-eq-canvas");
      if (canvas) this.canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}

// Instantiate player engine globally
window.radioPlayer = new RadioPlayerEngine();
