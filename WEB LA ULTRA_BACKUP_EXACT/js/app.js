/**
 * LA ULTRA RADIO ONLINE - UI Controller & Application Orchestrator
 * High-End Glassmorphism Console, Tabs, Native Audio & Social Actions
 */

document.addEventListener('DOMContentLoaded', () => {
  // Primary Elements
  const playBtn = document.getElementById('main-play-btn');
  const playIcon = document.getElementById('play-icon-svg');
  const pauseIcon = document.getElementById('pause-icon-svg');
  const bufferSpinner = document.getElementById('buffer-spinner-svg');

  const volSlider = document.getElementById('vol-slider-horizontal');
  const volPercentLabel = document.getElementById('vol-percent-label');
  const volIconHigh = document.getElementById('vol-icon-high');
  const volIconMuted = document.getElementById('vol-icon-muted');

  const shareBtn = document.getElementById('share-station-btn');
  const fullscreenBtn = document.getElementById('fullscreen-toggle-btn');
  const coverImg = document.getElementById('main-cover-image');
  const headerLogoImg = document.getElementById('header-logo-img');

  // Initialize crisp brand logo
  if (window.ULTRA_LOGO_DATA) {
    if (coverImg && (!coverImg.src || coverImg.src.includes('logo-ultra.png'))) {
      coverImg.src = window.ULTRA_LOGO_DATA;
    }
    if (headerLogoImg) {
      headerLogoImg.src = window.ULTRA_LOGO_DATA;
    }
  }

  // Subscribe to Audio Engine State Changes
  if (window.ultraAudio) {
    window.ultraAudio.subscribe((state) => {
      // Play / Pause Icon toggles
      if (state.isBuffering) {
        if (bufferSpinner) bufferSpinner.classList.remove('hidden');
        if (playIcon) playIcon.classList.add('hidden');
        if (pauseIcon) pauseIcon.classList.add('hidden');
      } else if (state.isPlaying) {
        if (bufferSpinner) bufferSpinner.classList.add('hidden');
        if (playIcon) playIcon.classList.add('hidden');
        if (pauseIcon) pauseIcon.classList.remove('hidden');
      } else {
        if (bufferSpinner) bufferSpinner.classList.add('hidden');
        if (playIcon) playIcon.classList.remove('hidden');
        if (pauseIcon) pauseIcon.classList.add('hidden');
      }

      // Volume & Mute UI
      const currentVol = state.isMuted ? 0 : state.volume;
      if (volSlider) volSlider.value = currentVol * 100;
      if (volPercentLabel) volPercentLabel.textContent = `${Math.round(currentVol * 100)}%`;

      if (volIconHigh && volIconMuted) {
        if (currentVol === 0 || state.isMuted) {
          volIconHigh.classList.add('hidden');
          volIconMuted.classList.remove('hidden');
        } else {
          volIconHigh.classList.remove('hidden');
          volIconMuted.classList.add('hidden');
        }
      }
    });
  }

  // Play Button Click Listener
  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.ultraAudio) {
        window.ultraAudio.togglePlay();
      }
    });
  }

  // Volume Slider Listener
  if (volSlider) {
    volSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      if (window.ultraAudio) {
        window.ultraAudio.setVolume(val);
      }
    });
  }

  // Share Station Listener
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const currentSong = window.jazlerSync ? window.jazlerSync.currentTrack.display : 'Música en Vivo';
      const shareData = {
        title: 'LA ULTRA - RADIO ONLINE',
        text: `Escuchando en vivo LA ULTRA • Hay niveles de niveles. Sonando ahora: ${currentSong}`,
        url: window.location.href
      };

      if (navigator.share) {
        navigator.share(shareData).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast('¡Enlace de la radio copiado al portapapeles!');
        }).catch(() => {
          showToast('Enlace: ' + window.location.href);
        });
      }
    });
  }

  // Fullscreen Mode Toggle
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    });
  }
});

/* ================= TAB CONTROLLER ================= */
function switchTab(tabId) {
  // Hide all tab panes
  const panes = document.querySelectorAll('.tab-pane');
  panes.forEach(p => p.classList.add('hidden'));

  // Show selected tab pane
  const activePane = document.getElementById(tabId);
  if (activePane) activePane.classList.remove('hidden');

  // Deactivate all tab buttons
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(b => b.classList.remove('active'));

  // Activate selected button
  const activeBtn = document.getElementById(`btn-${tabId}`);
  if (activeBtn) activeBtn.classList.add('active');
}

/* ================= DEDICATIONS TO WHATSAPP ================= */
function sendDedicationWhatsApp() {
  const nameInput = document.getElementById('dedication-name');
  const msgInput = document.getElementById('dedication-msg');

  const name = nameInput ? nameInput.value.trim() : '';
  const message = msgInput ? msgInput.value.trim() : '';

  if (!message && !name) {
    showToast('Por favor escribe tu nombre o mensaje para cabina.');
    return;
  }

  const sender = name || 'Un oyente de LA ULTRA';
  const text = encodeURIComponent(`📻 *Dedicatoria para LA ULTRA Radio Online*\n\n👤 *De:* ${sender}\n💬 *Mensaje:* ${message || '¡Saludos a toda la audiencia de LA ULTRA! Hay niveles de niveles.'}\n\n✨ _Enviado desde el Web Player Interactivo_`);

  window.open(`https://wa.me/?text=${text}`, '_blank');
  showToast('¡Abriendo WhatsApp para enviar dedicatoria!');

  if (nameInput) nameInput.value = '';
  if (msgInput) msgInput.value = '';
}

/* ================= MODAL & BOTTOM SHEET SYSTEM ================= */
function openSheet(sheetId) {
  const sheet = document.getElementById(sheetId);
  if (!sheet) return;
  sheet.classList.remove('hidden');
  setTimeout(() => {
    sheet.querySelector('.sheet-backdrop')?.classList.remove('opacity-0');
    sheet.querySelector('.bottom-sheet-panel')?.classList.remove('translate-y-full');
  }, 10);
}

function closeSheet(sheetId) {
  const sheet = document.getElementById(sheetId);
  if (!sheet) return;
  sheet.querySelector('.sheet-backdrop')?.classList.add('opacity-0');
  sheet.querySelector('.bottom-sheet-panel')?.classList.add('translate-y-full');
  setTimeout(() => {
    sheet.classList.add('hidden');
  }, 350);
}

/* ================= SLEEP TIMER ================= */
function setSleepTimer(minutes) {
  if (window.sleepTimeout) clearTimeout(window.sleepTimeout);
  
  showToast(`Temporizador activado: la radio se apagará en ${minutes} minutos`);
  closeSheet('sheet-sleep');

  window.sleepTimeout = setTimeout(() => {
    if (window.ultraAudio && window.ultraAudio.isPlaying) {
      window.ultraAudio.pause();
      showToast('Temporizador completado: Radio en pausa.');
    }
  }, minutes * 60 * 1000);
}

function cancelSleepTimer() {
  if (window.sleepTimeout) {
    clearTimeout(window.sleepTimeout);
    window.sleepTimeout = null;
    showToast('Temporizador de apagado cancelado');
  }
  closeSheet('sheet-sleep');
}

/* ================= TOAST NOTIFICATIONS ================= */
function showToast(message) {
  const toast = document.getElementById('global-toast');
  const toastText = document.getElementById('toast-text');
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.remove('opacity-0');
  toast.classList.add('opacity-100');

  setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 3500);
}
