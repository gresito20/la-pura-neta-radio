/**
 * LA ULTRA RADIO ONLINE - Real-Time Synchronizer
 * Multi-layer sync: Jazler SOHO Local Exports + Zeno FM Live SSE + Apple Music HD Covers
 */

class JazlerSyncEngine {
  constructor() {
    this.pollInterval = null;
    this.eventSource = null;
    this.zenoMount = '9twysru6hfhvv';

    this.currentTrack = {
      title: 'Hay niveles de niveles',
      artist: 'LA ULTRA RADIO ONLINE',
      display: 'LA ULTRA - Hay niveles de niveles',
      cover: window.ULTRA_LOGO_DATA || 'assets/images/logo-ultra.png',
      startTime: '',
      runTime: '',
      expireTime: ''
    };

    this.nextSongs = [];
    this.history = [];
    this.itunesCache = new Map();
    this.listeners = new Set();

    this.init();
  }

  init() {
    // 1. Start local Jazler polling (every 3 seconds)
    this.fetchLocalJazlerData();
    this.pollInterval = setInterval(() => this.fetchLocalJazlerData(), 3000);

    // 2. Start Zeno FM SSE real-time push stream listener
    this.initZenoSSE();
  }

  initZenoSSE() {
    if (typeof EventSource === 'undefined') return;

    try {
      if (this.eventSource) {
        this.eventSource.close();
      }

      const sseUrl = `https://api.zeno.fm/mounts/metadata/subscribe/${this.zenoMount}`;
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.streamTitle) {
            const rawTitle = data.streamTitle.trim();
            if (rawTitle && rawTitle !== this.currentTrack.display) {
              await this.handleNewTitle(rawTitle);
            }
          }
        } catch (e) {
          // Ignore JSON parse err
        }
      };

      this.eventSource.onerror = () => {
        // Fallback continues with local/cloud polling
      };
    } catch (err) {
      console.warn('[ZenoSSE] Init error:', err);
    }
  }

  async handleNewTitle(rawTitle) {
    let artist = 'LA ULTRA';
    let title = rawTitle;

    if (rawTitle.includes(' - ')) {
      const parts = rawTitle.split(' - ');
      artist = parts[0].trim();
      title = parts.slice(1).join(' - ').trim();
    }

    const cover = await this.searchItunesCover(artist, title);

    this.updateCurrentTrack({
      title,
      artist,
      display: rawTitle,
      cover: cover || window.ULTRA_LOGO_DATA || 'assets/images/logo-ultra.png',
      startTime: '',
      runTime: '',
      expireTime: ''
    });
  }

  async fetchLocalJazlerData() {
    try {
      const response = await fetch(`/api/live?_t=${Date.now()}`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (data && data.success && data.nowPlaying) {
          await this.processJazlerData(data);
        }
      }
    } catch (apiErr) {
      // Offline / cloud mode handled by Zeno SSE
    }
  }

  async processJazlerData(data) {
    const { nowPlaying, nextSongs, history } = data;

    let cover = nowPlaying.cover;

    // If local cover is default or empty, search iTunes HD cover
    if (!nowPlaying.hasLocalCover || !cover || cover.includes('logo-ultra.png')) {
      const itunesCover = await this.searchItunesCover(nowPlaying.artist, nowPlaying.title);
      if (itunesCover) {
        cover = itunesCover;
      } else {
        cover = window.ULTRA_LOGO_DATA || 'assets/images/logo-ultra.png';
      }
    }

    // Update upcoming and history lists
    this.nextSongs = nextSongs || [];
    this.history = history || [];

    this.enrichQueuesWithCovers();

    this.updateCurrentTrack({
      ...nowPlaying,
      cover
    });

    this.notifySubscribers();
  }

  updateCurrentTrack(track) {
    const isNewSong = this.currentTrack.display !== track.display || this.currentTrack.cover !== track.cover;
    this.currentTrack = track;

    this.renderDOM();

    if (window.ultraAudio) {
      window.ultraAudio.updateMediaSession(track);
    }

    if (isNewSong) {
      this.animateTrackChange();
    }
  }

  async searchItunesCover(artist, title) {
    if (!artist || artist === 'LA ULTRA' || artist.includes('LA ULTRA')) {
      return window.ULTRA_LOGO_DATA || 'assets/images/logo-ultra.png';
    }

    const cleanArtist = artist.replace(/[\(\)\[\]]/g, ' ').replace(/ft\..*|feat\..*/i, '').trim();
    const cleanTitle = title.replace(/[\(\)\[\]]/g, ' ').replace(/ft\..*|feat\..*/i, '').trim();
    const cacheKey = `${cleanArtist} - ${cleanTitle}`.toLowerCase();

    if (this.itunesCache.has(cacheKey)) {
      return this.itunesCache.get(cacheKey);
    }

    try {
      const q = encodeURIComponent(`${cleanArtist} ${cleanTitle}`);
      const res = await fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=1`);
      if (res.ok) {
        const json = await res.json();
        if (json.results && json.results.length > 0 && json.results[0].artworkUrl100) {
          const hdCover = json.results[0].artworkUrl100.replace('100x100bb.jpg', '1200x1200bb.jpg');
          this.itunesCache.set(cacheKey, hdCover);
          return hdCover;
        }
      }
    } catch (e) {}

    try {
      const q2 = encodeURIComponent(cleanArtist);
      const res2 = await fetch(`https://itunes.apple.com/search?term=${q2}&media=music&limit=1`);
      if (res2.ok) {
        const json2 = await res2.json();
        if (json2.results && json2.results.length > 0 && json2.results[0].artworkUrl100) {
          const hdCover2 = json2.results[0].artworkUrl100.replace('100x100bb.jpg', '1200x1200bb.jpg');
          this.itunesCache.set(cacheKey, hdCover2);
          return hdCover2;
        }
      }
    } catch (e2) {}

    return window.ULTRA_LOGO_DATA || 'assets/images/logo-ultra.png';
  }

  async enrichQueuesWithCovers() {
    for (const song of this.nextSongs) {
      if (!song.cover) {
        song.cover = await this.searchItunesCover(song.artist, song.title);
      }
    }
    for (const item of this.history) {
      if (!item.cover) {
        item.cover = await this.searchItunesCover(item.artist, item.title);
      }
    }
    this.renderQueues();
  }

  renderDOM() {
    const titleEl = document.getElementById('track-title');
    const artistEl = document.getElementById('track-artist');
    const durationEl = document.getElementById('track-duration');
    const coverImg = document.getElementById('main-cover-image');
    const bgBlur = document.getElementById('ambient-bg-blur');

    if (titleEl) titleEl.textContent = this.currentTrack.title;
    if (artistEl) artistEl.textContent = this.currentTrack.artist;
    if (durationEl && this.currentTrack.runTime) {
      durationEl.textContent = `⏱ ${this.currentTrack.runTime}`;
      durationEl.classList.remove('hidden');
    }

    const defaultImg = window.ULTRA_LOGO_DATA || 'assets/images/logo-ultra.png';
    if (coverImg && coverImg.src !== this.currentTrack.cover) {
      coverImg.onerror = () => { coverImg.src = defaultImg; };
      coverImg.src = this.currentTrack.cover || defaultImg;
    }

    if (bgBlur && this.currentTrack.cover) {
      bgBlur.style.backgroundImage = `url('${this.currentTrack.cover}')`;
    }

    this.renderQueues();
  }

  renderQueues() {
    const defaultImg = window.ULTRA_LOGO_DATA || 'assets/images/logo-ultra.png';
    const nextContainer = document.getElementById('up-next-list');
    if (nextContainer && this.nextSongs.length > 0) {
      nextContainer.innerHTML = this.nextSongs.map((song, i) => `
        <div class="glass-card flex items-center justify-between p-3 rounded-2xl gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-black/50 border border-white/10">
              <img src="${song.cover || defaultImg}" alt="${song.title}" class="w-full h-full object-cover" onerror="this.src='${defaultImg}'">
              <span class="absolute top-1 left-1 bg-black/80 text-[10px] font-bold px-1.5 py-0.5 rounded text-sun-glare" style="color: #D4FF00;">#${i + 1}</span>
            </div>
            <div class="min-w-0">
              <p class="font-bold text-sm text-white truncate">${song.title}</p>
              <p class="text-xs text-zinc-400 truncate">${song.artist}</p>
            </div>
          </div>
          <div class="text-right flex-shrink-0">
            <span class="text-[11px] font-semibold text-zinc-400 block">${song.startTime || 'En breve'}</span>
            ${song.runTime ? `<span class="text-[10px] text-zinc-500">${song.runTime}</span>` : ''}
          </div>
        </div>
      `).join('');
    }

    const historyContainer = document.getElementById('history-list');
    if (historyContainer && this.history.length > 0) {
      historyContainer.innerHTML = this.history.map((song) => `
        <div class="glass-card flex items-center justify-between p-3 rounded-2xl gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-black/50 border border-white/10">
              <img src="${song.cover || defaultImg}" alt="${song.title}" class="w-full h-full object-cover" onerror="this.src='${defaultImg}'">
            </div>
            <div class="min-w-0">
              <p class="font-bold text-sm text-white truncate">${song.title}</p>
              <p class="text-xs text-zinc-400 truncate">${song.artist}</p>
            </div>
          </div>
          <div class="text-right flex-shrink-0">
            <span class="text-[11px] font-semibold text-zinc-400">${song.startTime || 'Emitida'}</span>
          </div>
        </div>
      `).join('');
    }
  }

  animateTrackChange() {
    const wrapper = document.getElementById('cover-stage-wrapper');
    if (wrapper) {
      wrapper.classList.remove('animate-pulse');
      void wrapper.offsetWidth;
      wrapper.classList.add('animate-pulse');
    }
  }

  subscribe(cb) {
    this.listeners.add(cb);
  }

  notifySubscribers() {
    this.listeners.forEach(cb => cb(this.currentTrack));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.jazlerSync = new JazlerSyncEngine();
});
