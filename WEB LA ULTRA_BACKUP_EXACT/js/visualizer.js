/**
 * LA ULTRA RADIO ONLINE - Reactive Visualizer & Cover Art Animator
 * Drives real-time scale, glow, and sonic soundwaves to the rhythm of the music
 */

class ReactiveVisualizer {
  constructor() {
    this.coverWrapper = document.getElementById('cover-stage-wrapper');
    this.coverGlow = document.getElementById('cover-glow-halo');
    this.coverImage = document.getElementById('main-cover-image');
    this.vinylDisc = document.getElementById('vinyl-disc-layer');
    this.canvas = document.getElementById('soundwave-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.animationFrameId = null;
    this.currentScale = 1.0;
    this.targetScale = 1.0;

    this.visualizerMode = 'waves'; // 'waves', 'orbit', 'bars'
    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.startLoop();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio || 600;
    this.canvas.height = (rect.height || 60) * window.devicePixelRatio || 120;
  }

  startLoop() {
    const loop = () => {
      this.updateCoverMotion();
      this.drawSoundwaves();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  updateCoverMotion() {
    if (!this.coverWrapper || !window.ultraAudio) return;

    const isPlaying = window.ultraAudio.isPlaying;
    let bass = 0;

    if (isPlaying) {
      bass = window.ultraAudio.getBassEnergy(); // 0.0 to 1.0
      // Smooth interpolation for elastic bounce
      this.targetScale = 1.0 + (bass * 0.08); // scale up to 1.08 on strong bass hits
    } else {
      this.targetScale = 1.0;
    }

    this.currentScale += (this.targetScale - this.currentScale) * 0.25;

    // Apply scale to the protagonist cover
    this.coverWrapper.style.transform = `scale(${this.currentScale.toFixed(4)})`;

    // Dynamic glow reactivity
    if (this.coverGlow) {
      if (isPlaying) {
        const glowOpacity = 0.4 + (bass * 0.5);
        const glowBlur = 24 + (bass * 25);
        this.coverGlow.style.opacity = glowOpacity.toFixed(2);
        this.coverGlow.style.filter = `blur(${glowBlur.toFixed(1)}px)`;
      } else {
        this.coverGlow.style.opacity = '0.2';
        this.coverGlow.style.filter = 'blur(20px)';
      }
    }

    // Vinyl spinning state
    if (this.vinylDisc) {
      if (isPlaying) {
        this.vinylDisc.classList.add('vinyl-active');
      } else {
        this.vinylDisc.classList.remove('vinyl-active');
      }
    }
  }

  drawSoundwaves() {
    if (!this.canvas || !this.ctx || !window.ultraAudio) return;

    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const isPlaying = window.ultraAudio.isPlaying;

    ctx.clearRect(0, 0, width, height);

    const freqData = window.ultraAudio.getFrequencyData();
    const numBars = 48;
    const barWidth = (width / numBars) - 4;
    const time = Date.now() * 0.004;

    for (let i = 0; i < numBars; i++) {
      let barHeight = 4;

      if (isPlaying) {
        if (freqData && freqData.length > 0) {
          const dataIndex = Math.floor((i / numBars) * (freqData.length * 0.6));
          const freqVal = freqData[dataIndex] / 255;
          barHeight = Math.max(4, freqVal * (height * 0.85));
        } else {
          // Organic simulated soundwave fallback
          const wave1 = Math.sin(time + i * 0.35) * 0.5 + 0.5;
          const wave2 = Math.cos(time * 0.7 + i * 0.2) * 0.3 + 0.3;
          barHeight = Math.max(4, (wave1 * 0.6 + wave2 * 0.4) * (height * 0.8));
        }
      } else {
        barHeight = 4;
      }

      const x = i * (barWidth + 4);
      const y = (height - barHeight) / 2;

      // Triple brand color gradient per bar (Sun Glare -> Exuberant Orange -> Blue Violet)
      const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
      const colorRatio = i / numBars;

      if (colorRatio < 0.33) {
        grad.addColorStop(0, '#D4FF00');
        grad.addColorStop(1, '#FF5E1E');
      } else if (colorRatio < 0.66) {
        grad.addColorStop(0, '#FF5E1E');
        grad.addColorStop(1, '#7B57FF');
      } else {
        grad.addColorStop(0, '#7B57FF');
        grad.addColorStop(1, '#D4FF00');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, barWidth, barHeight, [4]);
      } else {
        ctx.rect(x, y, barWidth, barHeight);
      }
      ctx.fill();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.ultraVisualizer = new ReactiveVisualizer();
});
