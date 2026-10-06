/**
 * LA PURA NETA RADIO - Native Mobile Bridge (Capacitor)
 * Handles native mobile lifecycle, status bar, hardware back button, and network states.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initCapacitorMobile();
  });

  async function initCapacitorMobile() {
    const isCapacitor = window.Capacitor !== undefined && window.Capacitor.isNativePlatform();

    if (!isCapacitor) {
      console.log('🌐 Ejecutando en entorno Web Estándar.');
      return;
    }

    console.log('📱 Inicializando Capacitor Native Bridge...');
    const { App } = window.Capacitor.Plugins || {};
    const { StatusBar } = window.Capacitor.Plugins || {};
    const { SplashScreen } = window.Capacitor.Plugins || {};
    const { Network } = window.Capacitor.Plugins || {};

    // 1. Configurar barra de estado (Status Bar)
    if (StatusBar) {
      try {
        await StatusBar.setBackgroundColor({ color: '#000000' });
        await StatusBar.setStyle({ style: 'DARK' });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (err) {
        console.warn('Status Bar no soportado en esta plataforma:', err);
      }
    }

    // 2. Ocultar Splash Screen después de que la interfaz esté lista
    if (SplashScreen) {
      setTimeout(async () => {
        try {
          await SplashScreen.hide();
        } catch (err) {
          console.warn('Error ocultando Splash Screen:', err);
        }
      }, 500);
    }

    // 3. Manejo del botón físico "Atrás" en Android
    if (App) {
      App.addListener('backButton', ({ canGoBack }) => {
        // Si hay un modal abierto, cerrarlo
        const dedicationModal = document.getElementById('dedication-modal');
        if (dedicationModal && !dedicationModal.classList.contains('hidden')) {
          if (typeof window.closeDedicationModal === 'function') {
            window.closeDedicationModal();
            return;
          }
        }

        const mobileDrawer = document.getElementById('mobile-drawer');
        if (mobileDrawer && !mobileDrawer.classList.contains('hidden')) {
          mobileDrawer.classList.add('hidden');
          return;
        }

        // Si no hay modales, salir de la app o ir atrás
        if (canGoBack && window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
          window.history.back();
        } else {
          App.exitApp();
        }
      });
    }

    // 4. Monitoreo del estado de red
    if (Network) {
      Network.addListener('networkStatusChange', (status) => {
        if (!status.connected) {
          if (typeof window.showToast === 'function') {
            window.showToast('Sin conexión a Internet. Reintentando...', 'wifi');
          }
        } else {
          if (typeof window.showToast === 'function') {
            window.showToast('Conexión restablecida', 'check');
          }
          // Si el reproductor estaba activo pero falló la red, intentar reconectar
          if (window.radioPlayer && window.radioPlayer.isPlaying) {
            window.radioPlayer.play();
          }
        }
      });
    }
  }
})();
