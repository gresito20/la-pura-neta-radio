/**
 * LA PURA NETA RADIO - Native Streaming App Logic (Light & Dark Mode)
 */

// Configurable Remote Endpoint URL (Points to your live server or hosting)
// You can change this URL in your hosting panel anytime!
const REMOTE_CONFIG_URL = "data/station-config.json";

let TOP_SONGS = [
  { id: 1, title: "Primera Cita", artist: "Carín León", votes: 14205, trend: "👑 #1", cover: "assets/images/artist_carin.jpg", youtubeId: "5jU6tN7lF88", duration: "3:04" },
  { id: 2, title: "No Se Va", artist: "Grupo Frontera", votes: 13940, trend: "🔥 +2", cover: "assets/images/artist_norteno.jpg", youtubeId: "Q1gqH8Y8oXg", duration: "3:15" },
  { id: 3, title: "Como Quieras Quiero", artist: "Edén Muñoz", votes: 12890, trend: "⭐ Top 3", cover: "assets/images/artist_carin.jpg", youtubeId: "8Uj_uOq36qg", duration: "2:50" },
  { id: 4, title: "Según Quién", artist: "Carín León & Maluma", votes: 11520, trend: "💥 En Ascenso", cover: "assets/images/artist_carin.jpg", youtubeId: "qg64f3eN6aY", duration: "2:55" },
  { id: 5, title: "Un x100to", artist: "Grupo Frontera & Bad Bunny", votes: 10430, trend: "🔥 Hit", cover: "assets/images/artist_norteno.jpg", youtubeId: "b_pXNyWc8g4", duration: "3:14" },
  { id: 6, title: "Chale", artist: "Edén Muñoz", votes: 9840, trend: "❤️ Clásico", cover: "assets/images/artist_carin.jpg", youtubeId: "4_M5x5l7h9Y", duration: "3:12" },
  { id: 7, title: "TULUM", artist: "Grupo Frontera & Peso Pluma", votes: 9320, trend: "🪕 Favorita", cover: "assets/images/artist_corridos.jpg", youtubeId: "6E8Jz3L-57A", duration: "3:29" },
  { id: 8, title: "CCC", artist: "Edén Muñoz & Michelle Maciel", votes: 8750, trend: "📻 En Rotación", cover: "assets/images/artist_norteno.jpg", youtubeId: "R5j2V4e1L7Q", duration: "3:05" },
  { id: 9, title: "Ya No Somos Ni Seremos", artist: "Christian Nodal", votes: 8120, trend: "🚀 Éxito", cover: "assets/images/hero_concert.jpg", youtubeId: "1j6fF-9U7X4", duration: "3:05" },
  { id: 10, title: "Alch Si", artist: "Carín León & Grupo Frontera", votes: 7640, trend: "🔥 Pura Calidad", cover: "assets/images/artist_carin.jpg", youtubeId: "L9pW8z4V2kE", duration: "2:48" }
];

let SCHEDULE_DATA = {
  weekday: [
    { time: "06:00 AM - 10:00 AM", title: "El Desmadre Matutino", hosts: "Don Chepe & La Vale", desc: "El mejor cotorreo, chistes, noticias virales y los éxitos más prendidos para despertar.", image: "assets/images/radio_hosts.jpg", isLive: true },
    { time: "10:00 AM - 02:00 PM", title: "Las Más Perronas del Mediodía", hosts: "El Compa Beto", desc: "4 horas de pura banda sinaloense, norteño pesado y los WhatsAppazos con la música que pides al aire.", image: "assets/images/artist_norteno.jpg", isLive: false },
    { time: "02:00 PM - 07:00 PM", title: "Tardes Pesadas: Corridos & Sierreño", hosts: "Checo 'El Patrón'", desc: "Lo más nuevo del movimiento regional moderno, sierreño fino y entrevistas exclusivas.", image: "assets/images/artist_corridos.jpg", isLive: false },
    { time: "07:00 PM - 12:00 AM", title: "Noches de Cantina & Bohemias", hosts: "Paloma Solís", desc: "Sierreño romántico, norteñitas de oro y complacencias para los compas.", image: "assets/images/artist_female.jpg", isLive: false },
    { time: "12:00 AM - 06:00 AM", title: "La Madrugada Pesada (Sin Cortes)", hosts: "Transmisión Digital HD", desc: "6 horas ininterrumpidas con pura música de calidad.", image: "assets/images/hero_concert.jpg", isLive: false }
  ],
  saturday: [
    { time: "08:00 AM - 12:00 PM", title: "Calentamiento de Fin de Semana", hosts: "Don Chepe", desc: "Cumbias norteñas, huapangos y zapateados para arrancar el sábado.", image: "assets/images/radio_hosts.jpg", isLive: false },
    { time: "12:00 PM - 06:00 PM", title: "Top 20 Perronas de la Semana", hosts: "El Compa Beto", desc: "El conteo oficial de las 20 canciones más votadas.", image: "assets/images/artist_carin.jpg", isLive: false },
    { time: "06:00 PM - 02:00 AM", title: "La Peda Oficial: Mix en Vivo", hosts: "DJ Fuego & Checo", desc: "Mezclas de banda y corridos en vivo directo desde cabina.", image: "assets/images/hero_concert.jpg", isLive: false }
  ],
  sunday: [
    { time: "08:00 AM - 01:00 PM", title: "Domingos de Cruda y Clásicos", hosts: "Don Ramón 'El Profe'", desc: "Puro Ramón Ayala, Tigres del Norte, Invasores de NL y Cadetes de Linares.", image: "assets/images/artist_norteno.jpg", isLive: false },
    { time: "01:00 PM - 07:00 PM", title: "Carne Asada & Puro Corrido", hosts: "El Compa Beto", desc: "La banda sonora perfecta para el asador familiar con lo mejor del Regional.", image: "assets/images/artist_corridos.jpg", isLive: false },
    { time: "07:00 PM - 12:00 AM", title: "Noche Íntima: Bohemias del Alma", hosts: "Paloma Solís", desc: "Canciones acústicas, recuerdos y serenatas para cerrar el fin de semana.", image: "assets/images/artist_female.jpg", isLive: false }
  ]
};

const SHOUTOUTS = [
  { name: "Carlos Mendoza", city: "Queens, NY", message: "¡Saludos a toda la raza en Nueva York! Puro rolón de calidad en La Pura Neta.", time: "Hace 2 min" },
  { name: "Lucía Morales", city: "Brooklyn, NY", message: "¡Échense la de Carín León o Grupo Frontera para cantar con todo!", time: "Hace 7 min" },
  { name: "Javier 'El Güero'", city: "Manhattan, NY", message: "Reportándome en sintonía, con pura música de calidad desde NY!", time: "Hace 12 min" },
  { name: "Marcos Sandoval", city: "Bronx, NY", message: "Un saludo para todos los compas en la chamba, siempre al 100 con la estación.", time: "Hace 18 min" }
];

document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  setupPromoSlider();
  initRemoteConfig();
  renderTopSongs();
  initNewsFeed();
  renderSchedule("weekday");
  renderShoutouts();
  setupScheduleTabs();
  setupVoiceRecorder();
  setupSearch();
  calculateRealTimeLiveShow();
  initEntranceScreen();
});

// ================= ENTRANCE SPLASH SCREEN REVEAL =================
function initEntranceScreen() {
  const entrance = document.getElementById('app-entrance-screen');
  if (!entrance) return;

  // Let the logo and equalizer shine for a brief cinematic moment (~1.1s)
  setTimeout(() => {
    entrance.classList.add('entrance-hidden');
    setTimeout(() => {
      entrance.remove();
    }, 800);
  }, 1100);
}

// ================= REMOTE STATION CONFIG ENGINE =================
async function initRemoteConfig() {
  // 1. First, check if we have cached remote config from previous session
  try {
    const cached = localStorage.getItem("lpn_station_config");
    if (cached) {
      const parsed = JSON.parse(cached);
      applyStationConfig(parsed, false);
    }
  } catch (e) {
    console.warn("Error reading cached station config:", e);
  }

  // 2. Fetch fresh remote config over network
  fetchLiveStationConfig();
}

async function fetchLiveStationConfig() {
  try {
    // Add timestamp to prevent browser cache
    const url = `${REMOTE_CONFIG_URL}?_t=${Date.now()}`;
    const response = await fetch(url, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      applyStationConfig(data, true);
      localStorage.setItem("lpn_station_config", JSON.stringify(data));
      console.log("⚡ Configuración remota de la emisora actualizada en vivo!");
    }
  } catch (err) {
    console.log("Using local/cached station configuration:", err.message);
  }
}

function applyStationConfig(config, shouldReRender = true) {
  if (!config) return;

  if (config.schedule) {
    SCHEDULE_DATA = config.schedule;
  }
  if (config.topSongs && Array.isArray(config.topSongs)) {
    TOP_SONGS = config.topSongs;
  }

  // Update contact links if provided
  if (config.contact) {
    if (config.contact.whatsappNumber) {
      const waLinks = document.querySelectorAll('a[href*="wa.me"]');
      const msg = encodeURIComponent(config.contact.whatsappMessage || "¡Saludos a La Pura Neta Radio!");
      waLinks.forEach(link => {
        link.href = `https://wa.me/${config.contact.whatsappNumber.replace(/[^0-9]/g, "")}?text=${msg}`;
      });
    }
    if (config.contact.phoneNumber) {
      const telLinks = document.querySelectorAll('a[href*="tel:"]');
      telLinks.forEach(link => {
        link.href = `tel:${config.contact.phoneNumber.replace(/[^0-9+]/g, "")}`;
      });
    }
    if (config.contact.instagramUrl) {
      const igLinks = document.querySelectorAll('a[href*="instagram.com"]');
      igLinks.forEach(link => {
        link.href = config.contact.instagramUrl;
      });
    }
  }

  // Re-render UI components if requested
  if (shouldReRender) {
    renderTopSongs();
    const activeTab = document.querySelector('[id^="sch-tab-"].bg-red-600');
    const dayKey = activeTab ? activeTab.id.replace('sch-tab-', '') : 'weekday';
    renderSchedule(dayKey);
    calculateRealTimeLiveShow();
  }
}
window.applyStationConfig = applyStationConfig;
window.fetchLiveStationConfig = fetchLiveStationConfig;

// ================= THEME TOGGLE (DARK / LIGHT MODE) =================
function setupThemeToggle() {
  const isDark = document.documentElement.classList.contains("dark");
  updateLogoSources(isDark);

  const toggleBtns = document.querySelectorAll(".theme-toggle-btn");
  toggleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const willBeDark = !document.documentElement.classList.contains("dark");
      if (willBeDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      updateLogoSources(willBeDark);
      showToast(willBeDark ? "Modo Oscuro activado" : "Modo Claro activado", "theme");
    });
  });
}

function updateLogoSources(isDark) {
  const logos = document.querySelectorAll(".site-logo");
  const logoSrc = isDark ? "assets/images/logo.png" : "assets/images/logo_light.png";
  logos.forEach(logo => {
    logo.src = logoSrc;
  });
}

// ================= TOP SONGS (APPLE MUSIC / SHAZAM STYLE) =================
let selectedTopSongId = 1;

function renderTopSongs() {
  const container = document.getElementById("top-songs-list");
  if (!container) return;

  container.innerHTML = TOP_SONGS.map((song) => {
    const isSelected = song.id === selectedTopSongId;
    return `
      <div onclick="selectTopSong(${song.id}, true)" 
        id="top-row-${song.id}" 
        class="top-song-row px-4 py-3.5 flex items-center justify-between transition-all cursor-pointer group ${isSelected ? 'bg-zinc-100/90 dark:bg-zinc-800/90 border-l-4 border-red-600' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border-l-4 border-transparent'}">
        
        <div class="flex items-center gap-4 min-w-0 flex-1">
          <!-- Rank Number -->
          <span class="w-6 text-center text-sm sm:text-base font-black ${song.id <= 3 ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'} flex-shrink-0">
            ${song.id}
          </span>

          <!-- Cover with Play Icon Overlay -->
          <div class="relative w-12 h-12 rounded-lg bg-zinc-200 dark:bg-zinc-950 overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <img src="${song.cover}" alt="${song.title}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-black/40 group-hover:bg-black/60 flex items-center justify-center text-white transition-all">
              <div class="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                <svg class="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>

          <!-- Song & Artist Details -->
          <div class="truncate min-w-0 pr-2">
            <h4 class="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
              ${song.title}
            </h4>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              ${song.artist}
            </p>
          </div>
        </div>
        
        <!-- Right side badge / button -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${isSelected ? 'bg-red-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white'} transition-colors">
            ${isSelected ? '▶ En Pantalla' : song.duration}
          </span>
        </div>

      </div>
    `;
  }).join("");

  // Initialize right-side video player with song #1
  updateTopVideoPlayer(TOP_SONGS.find(s => s.id === selectedTopSongId) || TOP_SONGS[0], false);
}

window.selectTopSong = function(songId, playImmediately = false) {
  selectedTopSongId = songId;
  const song = TOP_SONGS.find(s => s.id === songId);
  if (!song) return;

  // Update rows highlight
  document.querySelectorAll(".top-song-row").forEach(row => {
    row.className = "top-song-row px-4 py-3.5 flex items-center justify-between transition-all cursor-pointer group hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border-l-4 border-transparent";
  });
  const activeRow = document.getElementById(`top-row-${songId}`);
  if (activeRow) {
    activeRow.className = "top-song-row px-4 py-3.5 flex items-center justify-between transition-all cursor-pointer group bg-zinc-100/90 dark:bg-zinc-800/90 border-l-4 border-red-600";
  }

  // Update video player
  updateTopVideoPlayer(song, playImmediately);
};

function updateTopVideoPlayer(song, autoplay = false) {
  const container = document.getElementById("top-video-container");
  if (!container) return;

  if (autoplay && song.youtubeId) {
    container.innerHTML = `
      <iframe class="w-full h-full rounded-xl" 
        src="https://www.youtube.com/embed/${song.youtubeId}?autoplay=1&rel=0&modestbranding=1" 
        title="${song.title} - ${song.artist}" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        allowfullscreen>
      </iframe>
    `;
    showToast(`Reproduciendo video: ${song.title} - ${song.artist}`, "music");
  } else {
    // Elegant Poster UI matching the screenshot
    container.innerHTML = `
      <div class="relative w-full h-full rounded-xl overflow-hidden bg-zinc-950 flex flex-col justify-between p-6 sm:p-8">
        <!-- Background blurred artwork -->
        <img src="${song.cover}" alt="${song.title}" class="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125">
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30"></div>

        <!-- Top Header Info -->
        <div class="relative z-10 flex items-center justify-between">
          <span class="px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
            #${song.id} en el Top 10
          </span>
          <span class="text-xs text-white/80 font-medium">La Pura Neta Radio</span>
        </div>

        <!-- Center Floating Card with Large Play Button -->
        <div class="relative z-10 flex flex-col items-center justify-center my-auto py-4 cursor-pointer group" onclick="selectTopSong(${song.id}, true)">
          <div class="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 group-hover:scale-105 transition-transform">
            <img src="${song.cover}" alt="${song.title}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
              <div class="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>
          <span class="mt-3 text-xs text-white/90 font-semibold tracking-wider uppercase flex items-center gap-1.5 group-hover:text-white transition-colors">
            <svg class="w-3.5 h-3.5 fill-red-500" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            Clic para reproducir video
          </span>
        </div>

        <!-- Bottom Track Details & Action Button -->
        <div class="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-2 border-t border-white/10">
          <div class="min-w-0 truncate">
            <h3 class="text-lg sm:text-xl font-black text-white truncate leading-tight">${song.title}</h3>
            <p class="text-xs sm:text-sm text-zinc-300 truncate">${song.artist}</p>
          </div>
          
          <button onclick="selectTopSong(${song.id}, true)" 
            class="px-4 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-bold transition-all shadow-lg flex-shrink-0 flex items-center gap-2 active:scale-95 cursor-pointer">
            <svg class="w-4 h-4 fill-red-600" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            <span>Ver Vídeo</span>
          </button>
        </div>
      </div>
    `;
  }
}

function setupScheduleTabs() {
  const tabs = document.querySelectorAll(".schedule-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => {
        t.className = "schedule-tab px-3 py-1.5 rounded text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors";
      });
      tab.className = "schedule-tab active px-3 py-1.5 rounded text-xs font-semibold bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-white transition-colors";
      
      const dayKey = tab.getAttribute("data-day");
      renderSchedule(dayKey);
    });
  });
}

function renderSchedule(dayKey) {
  const container = document.getElementById("schedule-cards-container");
  if (!container) return;

  const items = SCHEDULE_DATA[dayKey] || SCHEDULE_DATA.weekday;

  container.innerHTML = items.map(show => `
    <div class="bg-white dark:bg-zinc-900 border ${show.isLive ? 'border-red-600/60' : 'border-zinc-200 dark:border-zinc-800'} rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-colors shadow-sm">
      <div class="flex items-center gap-3.5 min-w-0">
        <img src="${show.image}" alt="${show.title}" class="w-14 h-14 rounded-md object-cover flex-shrink-0 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        <div>
          <div class="flex items-center gap-2 mb-0.5">
            <span class="text-[11px] font-semibold px-2 py-0.5 rounded ${show.isLive ? 'bg-red-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}">
              ${show.time}
            </span>
            ${show.isLive ? '<span class="text-[10px] font-bold text-red-600 dark:text-red-500 uppercase tracking-wider">● En Vivo</span>' : ''}
          </div>
          <h4 class="text-sm font-bold text-zinc-900 dark:text-white">${show.title}</h4>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Con ${show.hosts}</p>
        </div>
      </div>
      
      <div class="flex items-center gap-2.5 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800">
        <button onclick="openDedicationModal('${show.title}', '${show.hosts}')" 
          class="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-colors border border-zinc-200 dark:border-transparent">
          Mandar Saludo
        </button>
        <a href="https://wa.me/13472850530?text=¡WhatsAppazo%20para%20La%20Pura%20Neta%20Radio!" target="_blank"
          class="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1">
          WhatsAppazo
        </a>
      </div>
    </div>
  `).join("");
}

function calculateRealTimeLiveShow() {
  const now = new Date();
  const hour = now.getHours();
  let liveIndex = 0;

  if (hour >= 6 && hour < 10) liveIndex = 0;
  else if (hour >= 10 && hour < 14) liveIndex = 1;
  else if (hour >= 14 && hour < 19) liveIndex = 2;
  else if (hour >= 19 && hour < 24) liveIndex = 3;
  else liveIndex = 4;

  SCHEDULE_DATA.weekday.forEach((s, idx) => {
    s.isLive = (idx === liveIndex);
  });
}

function renderShoutouts() {
  const container = document.getElementById("shoutouts-feed");
  if (!container) return;

  container.innerHTML = SHOUTOUTS.map(shout => `
    <div class="bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-3 flex gap-3 items-start text-xs transition-colors">
      <div class="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
        ${shout.name.charAt(0)}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <h5 class="font-semibold text-zinc-900 dark:text-white truncate">${shout.name}</h5>
          <span class="text-[10px] text-zinc-400 dark:text-zinc-500">${shout.time}</span>
        </div>
        <span class="text-[11px] text-red-600 dark:text-red-400 font-medium block">${shout.city}</span>
        <p class="text-zinc-600 dark:text-zinc-300 mt-1">"${shout.message}"</p>
      </div>
    </div>
  `).join("");
}

let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

function setupVoiceRecorder() {
  const btnRecord = document.getElementById("btn-record-audio");
  const recordStatus = document.getElementById("record-status-text");
  const recordWave = document.getElementById("record-waveform");

  if (!btnRecord) return;

  btnRecord.addEventListener("click", async () => {
    if (!isRecording) {
      try {
        isRecording = true;
        btnRecord.textContent = "⏹ Detener Grabación";
        btnRecord.className = "px-4 py-2 rounded-md bg-red-600 text-xs font-semibold text-white transition-colors";
        if (recordStatus) recordStatus.textContent = "🎙️ Grabando saludo para cabina...";
        if (recordWave) recordWave.classList.remove("hidden");

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
          if (stream) {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
            mediaRecorder.start();
          }
        }
      } catch (err) {
        console.log("Mic mode");
      }
    } else {
      isRecording = false;
      btnRecord.textContent = "🎙️ Grabar de Nuevo";
      btnRecord.className = "px-4 py-2 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-white border border-zinc-200 dark:border-zinc-700 transition-colors";
      if (recordStatus) recordStatus.textContent = "✅ Audio listo para enviar a cabina";
      if (recordWave) recordWave.classList.add("hidden");

      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }

      showToast("¡Nota de voz grabada con éxito!", "mic");
    }
  });

  const formShout = document.getElementById("form-send-shoutout");
  if (formShout) {
    formShout.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("input-shout-name").value || "Oyente";
      const city = document.getElementById("input-shout-city").value || "New York, NY";
      const msg = document.getElementById("input-shout-msg").value || "¡Saludos a todos!";

      SHOUTOUTS.unshift({ name, city, message: msg, time: "Justo ahora" });
      renderShoutouts();
      formShout.reset();
      if (recordStatus) recordStatus.textContent = "Graba una nota de voz para que los locutores la reproduzcan al aire";

      showToast("¡Tu saludo fue enviado a cabina!", "send");
    });
  }
}

window.openDedicationModal = function(showTitle, hosts) {
  const modal = document.getElementById("dedication-modal");
  if (!modal) return;
  const targetShow = document.getElementById("modal-target-show");
  if (targetShow) targetShow.textContent = `${showTitle} (Con ${hosts})`;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
};

window.closeDedicationModal = function() {
  const modal = document.getElementById("dedication-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
};

function setupSearch() {
  const searchInput = document.getElementById("site-search-input");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (q.length > 1) {
      const matched = TOP_SONGS.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q));
      if (matched.length > 0) {
        showToast(`${matched.length} coincidencias encontradas para "${q}"`, "search");
      }
    }
  });
}

window.showToast = function(message, type = "info") {
  const toast = document.getElementById("global-toast");
  const toastText = document.getElementById("toast-text");
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 200);
  }, 3500);
};

// ================= PROMO SLIDER / CAROUSEL (SMOOTH & RANDOM) =================
function setupPromoSlider() {
  const slides = document.querySelectorAll(".promo-slide");
  const dots = document.querySelectorAll(".slider-dot");
  const prevBtn = document.getElementById("slider-prev-btn");
  const nextBtn = document.getElementById("slider-next-btn");
  const sliderContainer = document.getElementById("promo-slider");

  if (!slides.length) return;

  let currentIndex = 0;
  let autoPlayTimer = null;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      if (i === currentIndex) {
        slide.classList.remove("opacity-0", "z-0");
        slide.classList.add("opacity-100", "z-10");
      } else {
        slide.classList.remove("opacity-100", "z-10");
        slide.classList.add("opacity-0", "z-0");
      }
    });

    dots.forEach((dot, i) => {
      if (i === currentIndex) {
        dot.className = "slider-dot w-6 h-1.5 rounded-full bg-red-600 transition-all cursor-pointer";
      } else {
        dot.className = "slider-dot w-2 h-1.5 rounded-full bg-white/50 hover:bg-white transition-all cursor-pointer";
      }
    });
  }

  function randomNextSlide() {
    if (slides.length <= 1) return;
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * slides.length);
    } while (nextIndex === currentIndex);
    showSlide(nextIndex);
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function prevSlide() {
    showSlide(currentIndex - 1);
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(randomNextSlide, 4500);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  if (nextBtn) nextBtn.addEventListener("click", () => { nextSlide(); startAutoPlay(); });
  if (prevBtn) prevBtn.addEventListener("click", () => { prevSlide(); startAutoPlay(); });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      showSlide(i);
      startAutoPlay();
    });
  });

  if (sliderContainer) {
    sliderContainer.addEventListener("mouseenter", stopAutoPlay);
    sliderContainer.addEventListener("mouseleave", startAutoPlay);
  }

  // Start auto play with random transitions
  startAutoPlay();
}

// ================= NOTICIAS AL DÍA (FUENTE: EL DIARIO NY) =================
let currentNewsCategory = 'all';
let allNewsData = [];

async function initNewsFeed() {
  const container = document.getElementById("news-grid-container");
  if (!container) return;

  setupNewsCategoryTabs();
  await loadNewsCategory('all');
}

function formatNewsDate(dateStr) {
  if (!dateStr) return "Hoy";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return `Hace ${diffMins} min`;
    }
    if (diffHours < 24) {
      return `Hace ${diffHours} h`;
    }
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  } catch {
    return "Hoy";
  }
}

async function loadNewsCategory(category = 'all') {
  currentNewsCategory = category;
  const container = document.getElementById("news-grid-container");
  if (!container) return;

  // Render Skeleton Loading
  container.innerHTML = Array(6).fill(0).map(() => `
    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm animate-pulse flex flex-col justify-between">
      <div class="w-full aspect-[16/10] bg-zinc-200 dark:bg-zinc-800"></div>
      <div class="p-4 space-y-2.5">
        <div class="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
        <div class="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
        <div class="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
      </div>
    </div>
  `).join("");

  // 1. Try internal serverless proxy (/api/news?category=...)
  try {
    const response = await fetch(`/api/news?category=${category}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.items && data.items.length > 0) {
        allNewsData = data.items;
        renderNewsGrid(allNewsData);
        return;
      }
    }
  } catch (err) {
    console.log("Local serverless route fallback");
  }

  // 2. Fallback to direct public RSS-to-JSON
  try {
    let rssUrl = 'https://eldiariony.com/categoria/nueva-york/feed/';
    if (category === 'entretenimiento' || category === 'musica' || category === 'farandula') {
      rssUrl = 'https://eldiariony.com/categoria/entretenimiento/feed/';
    } else if (category === 'politica' || category === 'inmigracion') {
      rssUrl = 'https://eldiariony.com/categoria/politica/feed/';
    } else if (category === 'nueva-york' || category === 'ny') {
      rssUrl = 'https://eldiariony.com/categoria/nueva-york/feed/';
    }
    const r2j = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const resp2 = await fetch(r2j);
    if (resp2.ok) {
      const data2 = await resp2.json();
      if (data2 && data2.items && data2.items.length > 0) {
        allNewsData = data2.items.map(item => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          description: item.description ? item.description.replace(/<[^>]*>?/gm, '').slice(0, 150) + '...' : '',
          image: item.thumbnail || (item.enclosure && item.enclosure.link) || 'assets/images/slide_calidad.jpg',
          categories: item.categories || ['El Diario NY'],
          source: 'El Diario NY'
        }));
        renderNewsGrid(allNewsData);
        return;
      }
    }
  } catch (e) {
    console.error("News fetch error:", e);
  }

  // 3. Fallback message if both fail
  container.innerHTML = `
    <div class="col-span-full text-center py-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
      <p class="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No se pudieron sincronizar las noticias en este instante.</p>
      <a href="https://eldiariony.com" target="_blank" rel="noopener noreferrer" class="mt-3 inline-block px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors">
        Ver noticias en El Diario NY ↗
      </a>
    </div>
  `;
}

function renderNewsGrid(items) {
  const container = document.getElementById("news-grid-container");
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `<p class="col-span-full text-center text-xs text-zinc-500 py-8">No hay noticias disponibles en esta sección.</p>`;
    return;
  }

  container.innerHTML = items.slice(0, 12).map((item, idx) => {
    const timeFormatted = formatNewsDate(item.pubDate);
    const mainCategory = (item.categories && item.categories.length > 0) ? item.categories[0] : "Noticias";
    const isFeatured = idx === 0;

    return `
      <article class="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${isFeatured ? 'md:col-span-2 lg:col-span-2' : ''}">
        <div>
          <!-- Thumbnail Image -->
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="block relative w-full ${isFeatured ? 'aspect-[16/9]' : 'aspect-[16/10]'} overflow-hidden bg-zinc-950">
            <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" onerror="this.src='assets/images/slide_calidad.jpg'">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            <!-- Category & Source Badges -->
            <div class="absolute top-3 left-3 flex items-center gap-1.5 z-10">
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-red-600 text-white shadow-sm">
                ${mainCategory}
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 backdrop-blur-sm text-white/90 border border-white/10">
                El Diario NY
              </span>
            </div>

            <span class="absolute bottom-2.5 right-3 text-[11px] font-medium text-white/80 z-10">
              🕒 ${timeFormatted}
            </span>
          </a>

          <!-- Content -->
          <div class="p-4 space-y-2">
            <h3 class="${isFeatured ? 'text-base sm:text-lg' : 'text-sm'} font-bold text-zinc-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-2 leading-snug">
              <a href="${item.link}" target="_blank" rel="noopener noreferrer">
                ${item.title}
              </a>
            </h3>
            <p class="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              ${item.description || 'Lee la cobertura completa en El Diario NY.'}
            </p>
          </div>
        </div>

        <!-- Footer link -->
        <div class="px-4 pb-4 pt-1 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
          <span class="text-zinc-400 dark:text-zinc-500 font-medium text-[11px]">eldiariony.com</span>
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" 
            class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold flex items-center gap-1 group/btn">
            <span>Leer nota</span>
            <svg class="w-3.5 h-3.5 transform group-hover/btn:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </a>
        </div>
      </article>
    `;
  }).join("");
}

function setupNewsCategoryTabs() {
  const tabs = document.querySelectorAll(".news-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => {
        t.className = "news-tab px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer";
      });
      tab.className = "news-tab active px-3.5 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white transition-colors cursor-pointer shadow-sm";
      const cat = tab.getAttribute("data-category");
      loadNewsCategory(cat);
    });
  });
}

/* ================= NATIVE APP CONTROLLERS (SHEETS, DRAWER, SLEEP TIMER) ================= */

let sleepTimerId = null;

function openSheet(sheetId) {
  // Close any open sheet first
  document.querySelectorAll('[id^="sheet-"]').forEach(el => {
    el.classList.add('hidden');
    el.classList.remove('flex');
  });

  const sheet = document.getElementById(`sheet-${sheetId}`);
  if (sheet) {
    sheet.classList.remove('hidden');
    sheet.classList.add('flex');
    
    // Auto render dynamic content
    if (sheetId === 'history' && window.radioPlayer) {
      window.radioPlayer.renderPlayedHistory();
    } else if (sheetId === 'shows') {
      filterScheduleDay('weekday');
    } else if (sheetId === 'top10') {
      renderTopSongs();
    }
  }
}

function closeSheet(sheetId) {
  const sheet = document.getElementById(`sheet-${sheetId}`);
  if (sheet) {
    sheet.classList.add('hidden');
    sheet.classList.remove('flex');
  }
}

// Radial Action Hub Toggle
function toggleRadialMenu(forceState) {
  const container = document.getElementById('radial-action-hub');
  if (!container) return;
  if (typeof forceState === 'boolean') {
    if (forceState) container.classList.add('open');
    else container.classList.remove('open');
  } else {
    container.classList.toggle('open');
  }
}
window.toggleRadialMenu = toggleRadialMenu;

// Volume Popover Toggle
function toggleVolumePopover(forceState) {
  const popover = document.getElementById('vertical-vol-popover');
  if (!popover) return;
  if (typeof forceState === 'boolean') {
    if (forceState) popover.classList.remove('hidden');
    else popover.classList.add('hidden');
  } else {
    popover.classList.toggle('hidden');
  }
}
window.toggleVolumePopover = toggleVolumePopover;

// Close volume popover when clicking outside
document.addEventListener('click', (e) => {
  const popover = document.getElementById('vertical-vol-popover');
  const volBtn = e.target.closest('button[onclick*="toggleVolumePopover"]');
  if (popover && !popover.classList.contains('hidden') && !popover.contains(e.target) && !volBtn) {
    popover.classList.add('hidden');
  }
});

// Share App Handler
async function shareApp() {
  const shareData = {
    title: 'La Pura Neta Radio',
    text: '📻 ¡Escucha La Pura Neta Radio en vivo! Transmitiendo los mejores éxitos de la Música Regional Mexicana desde NY.',
    url: window.location.href || 'https://lapuraneta.com'
  };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      // User aborted share
    }
  } else if (navigator.clipboard) {
    await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
    if (typeof showToast === 'function') {
      showToast('¡Enlace de la radio copiado al portapapeles!', 'info');
    }
  }
}
window.shareApp = shareApp;

// Side Drawer
function toggleDrawer(show) {
  const drawer = document.getElementById('side-drawer');
  const panel = document.getElementById('drawer-panel');
  if (!drawer || !panel) return;

  if (show) {
    drawer.classList.remove('hidden');
    setTimeout(() => {
      panel.classList.remove('-translate-x-full');
    }, 10);
  } else {
    panel.classList.add('-translate-x-full');
    setTimeout(() => {
      drawer.classList.add('hidden');
    }, 250);
  }
}

// Schedule day filter
function filterScheduleDay(dayKey) {
  const days = ['weekday', 'saturday', 'sunday'];
  days.forEach(k => {
    const btn = document.getElementById(`sch-tab-${k}`);
    if (btn) {
      if (k === dayKey) {
        btn.className = "flex-1 py-2 rounded-lg bg-red-600 text-white shadow font-bold";
      } else {
        btn.className = "flex-1 py-2 rounded-lg text-zinc-400 hover:text-white";
      }
    }
  });

  const container = document.getElementById('schedule-cards-container');
  if (!container) return;

  const shows = SCHEDULE_DATA[dayKey] || [];
  container.innerHTML = shows.map((show, idx) => `
    <div class="p-3.5 rounded-2xl bg-zinc-900 border ${show.isLive ? 'border-red-600/60 bg-red-950/20' : 'border-zinc-800'} flex items-center justify-between gap-3 transition-all">
      <div class="flex items-center gap-3 min-w-0">
        <img src="${show.image}" alt="${show.title}" class="w-12 h-12 rounded-xl object-cover bg-black border border-zinc-700 flex-shrink-0">
        <div class="truncate">
          <div class="flex items-center gap-1.5">
            <h4 class="text-xs font-bold text-white truncate">${show.title}</h4>
            ${show.isLive ? '<span class="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-black uppercase animate-pulse">AL AIRE</span>' : ''}
          </div>
          <p class="text-[11px] text-zinc-400 truncate">Con ${show.hosts}</p>
          <span class="text-[10px] text-red-500 font-semibold">${show.time}</span>
        </div>
      </div>
      <a href="https://wa.me/13472850530?text=¡Saludos%20para%20el%20show%20${encodeURIComponent(show.title)}!" target="_blank" class="p-2 rounded-xl bg-zinc-800 text-emerald-400 hover:bg-zinc-700 flex-shrink-0">
        💬
      </a>
    </div>
  `).join("");
}

// Dedication Modal
function openDedicationModal() {
  const modal = document.getElementById('dedication-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeDedicationModal() {
  const modal = document.getElementById('dedication-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleSendDedication(e) {
  e.preventDefault();
  const name = document.getElementById('ded-input-name').value;
  const msg = document.getElementById('ded-input-msg').value;

  showToast(`¡Dedicatoria enviada de parte de ${name}!`, 'check');
  closeDedicationModal();
  document.getElementById('ded-input-name').value = '';
  document.getElementById('ded-input-msg').value = '';
}

// Sleep Timer
function openSleepTimerModal() {
  const modal = document.getElementById('sleep-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeSleepTimerModal() {
  const modal = document.getElementById('sleep-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function setSleepTimer(minutes) {
  if (sleepTimerId) clearTimeout(sleepTimerId);

  sleepTimerId = setTimeout(() => {
    if (window.radioPlayer && window.radioPlayer.isPlaying) {
      window.radioPlayer.togglePlay();
      showToast("La radio se apagó por el temporizador.", "timer");
    }
  }, minutes * 60 * 1000);

  closeSleepTimerModal();
  showToast(`Temporizador activado: apagando en ${minutes} min.`, "timer");
}

function cancelSleepTimer() {
  if (sleepTimerId) {
    clearTimeout(sleepTimerId);
    sleepTimerId = null;
    showToast("Temporizador cancelado.", "timer");
  }
  closeSleepTimerModal();
}

// Share App
function shareApp() {
  if (navigator.share) {
    navigator.share({
      title: 'La Pura Neta Radio',
      text: '¡Escucha La Pura Neta Radio con pura música de calidad transmitiendo en vivo desde NY!',
      url: window.location.href
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href);
    showToast("Enlace de la app copiado al portapapeles.", "copy");
  }
}

// Toggle Dark / Light Theme
function toggleThemeMode() {
  const isDark = document.documentElement.classList.contains("dark");
  if (isDark) {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
    showToast("Modo Claro activado", "theme");
  } else {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
    showToast("Modo Oscuro activado", "theme");
  }
}

// Toast notification helper
function showToast(message, type = "info") {
  const toast = document.getElementById("global-toast");
  const text = document.getElementById("toast-text");
  if (!toast || !text) return;

  text.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 300);
  }, 3500);
}


