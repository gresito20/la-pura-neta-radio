/**
 * LA ULTRA RADIO ONLINE - Bulletproof Audio Streaming Engine
 * Stream URL: https://stream.zeno.fm/9twysru6hfhvv (Zeno Radio Icecast)
 */

class AudioEngine {
  constructor() {
    this.streamUrl = 'https://stream.zeno.fm/9twysru6hfhvv';
    this.audio = new Audio();
    this.audio.preload = 'none';

    this.isPlaying = false;
    this.isBuffering = false;
    this.isMuted = false;
    this.volume = parseFloat(localStorage.getItem('ultra_volume')) || 0.9;
    this.audio.volume = this.volume;

    // Web Audio API Elements (for audio analysis when CORS permits)
    this.audioCtx = null;
    this.analyser = null;
    this.sourceNode = null;
    this.frequencyData = new Uint8Array(128);
    this.hasWebAudio = false;

    this.listeners = new Set();
    this.setupListeners();
    this.setupMediaSession();
  }

  setupListeners() {
    this.audio.addEventListener('playing', () => {
      this.isPlaying = true;
      this.isBuffering = false;
      this.notifyState();
    });

    this.audio.addEventListener('waiting', () => {
      this.isBuffering = true;
      this.notifyState();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.isBuffering = false;
      this.notifyState();
    });

    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.isBuffering = false;
      this.notifyState();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('[AudioEngine] Error en stream, reintentando...', e);
      if (this.isPlaying) {
        setTimeout(() => {
          this.audio.src = `${this.streamUrl}?_t=${Date.now()}`;
          this.audio.play().catch(console.error);
        }, 1000);
      }
      this.isBuffering = false;
      this.notifyState();
    });
  }

  tryInitWebAudio() {
    if (this.hasWebAudio) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.audioCtx = new AudioCtx();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.75;
      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
      this.hasWebAudio = true;
    } catch (err) {
      // CORS or browser restriction -> Will use organic pulse generator
      this.hasWebAudio = false;
    }
  }

  async play() {
    this.isBuffering = true;
    this.notifyState();

    // Cache-busting stream URL to ensure fresh live chunk
    const liveSrc = `${this.streamUrl}?_t=${Date.now()}`;
    this.audio.src = liveSrc;
    this.audio.load();

    try {
      // User gesture triggered
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      await this.audio.play();
      this.isPlaying = true;
      this.isBuffering = false;
      this.notifyState();

      // Attempt Web Audio hook safely after initial playback start
      this.tryInitWebAudio();
    } catch (err) {
      console.error('[AudioEngine] Error al iniciar reproducción:', err);
      this.isBuffering = false;
      this.isPlaying = false;
      this.notifyState();
    }
  }

  pause() {
    this.isPlaying = false;
    this.isBuffering = false;
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
    this.notifyState();
  }

  togglePlay() {
    if (this.isPlaying || this.isBuffering) {
      this.pause();
    } else {
      this.play();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    this.audio.volume = this.volume;
    localStorage.setItem('ultra_volume', this.volume);
    this.notifyState();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;
    this.notifyState();
  }

  getBassEnergy() {
    if (!this.isPlaying) return 0;

    if (this.hasWebAudio && this.analyser) {
      this.analyser.getByteFrequencyData(this.frequencyData);
      let sum = 0;
      for (let i = 0; i < 4; i++) sum += this.frequencyData[i];
      const val = (sum / 4) / 255;
      if (val > 0.05) return val;
    }

    // High fidelity organic bass pulse generator (simulating ~128 BPM pulse rhythm)
    const time = Date.now() * 0.006;
    const kick = Math.pow(Math.sin(time * 2.2), 4);
    const sub = Math.sin(time * 1.1) * 0.3 + 0.3;
    return (kick * 0.6 + sub * 0.4);
  }

  getFrequencyData() {
    if (!this.isPlaying) return null;

    if (this.hasWebAudio && this.analyser) {
      this.analyser.getByteFrequencyData(this.frequencyData);
      return this.frequencyData;
    }
    return null;
  }

  setupMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('stop', () => this.pause());
    }
  }

  updateMediaSession(meta) {
    if ('mediaSession' in navigator && meta) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: meta.title || 'LA ULTRA RADIO ONLINE',
        artist: meta.artist || 'Hay niveles de niveles',
        album: 'LA ULTRA HD STREAM',
        artwork: [
          { src: meta.cover || 'assets/images/logo-ultra.png', sizes: '512x512', type: 'image/jpeg' }
        ]
      });
    }
  }

  subscribe(cb) {
    this.listeners.add(cb);
    cb({
      isPlaying: this.isPlaying,
      isBuffering: this.isBuffering,
      volume: this.volume,
      isMuted: this.isMuted
    });
  }

  notifyState() {
    const state = {
      isPlaying: this.isPlaying,
      isBuffering: this.isBuffering,
      volume: this.volume,
      isMuted: this.isMuted
    };
    this.listeners.forEach(cb => cb(state));
  }
}

window.ultraAudio = new AudioEngine();
