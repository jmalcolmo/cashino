// CRT overlay: grain, scanlines, vignette
// Drawn on a separate canvas layered above the game canvas at reduced opacity

const CRT = {
  _noiseCanvas: null,
  _noiseCtx:    null,

  init(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');

    // Off-screen noise tile — regenerated every few frames for animated grain
    this._noiseCanvas        = document.createElement('canvas');
    this._noiseCanvas.width  = 200;
    this._noiseCanvas.height = 200;
    this._noiseCtx           = this._noiseCanvas.getContext('2d');
  },

  _rebuildNoise() {
    const w    = this._noiseCanvas.width;
    const h    = this._noiseCanvas.height;
    const img  = this._noiseCtx.createImageData(w, h);
    const d    = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v   = Math.random() * 255 | 0;
      d[i]     = v;
      d[i + 1] = v;
      d[i + 2] = v;
      d[i + 3] = 18 + (Math.random() * 18) | 0; // subtle opacity
    }
    this._noiseCtx.putImageData(img, 0, 0);
  },

  render() {
    const canvas = this.canvas;
    const ctx    = this.ctx;
    const W      = canvas.width;
    const H      = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // ── Grain ───────────────────────────────────────────────
    this._rebuildNoise();
    const pat = ctx.createPattern(this._noiseCanvas, 'repeat');
    ctx.globalAlpha = 0.55;
    ctx.fillStyle   = pat;
    ctx.fillRect(0, 0, W, H);

    // ── Scanlines ───────────────────────────────────────────
    ctx.globalAlpha = 0.18;
    ctx.fillStyle   = '#000';
    for (let yy = 0; yy < H; yy += 3) {
      ctx.fillRect(0, yy, W, 1);
    }

    // ── Vignette ────────────────────────────────────────────
    ctx.globalAlpha = 1;
    const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.9);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.62)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    // ── Horizontal flicker line (rare) ─────────────────────
    if (Math.random() < 0.006) {
      const ly = Math.random() * H;
      ctx.globalAlpha = 0.04 + Math.random() * 0.06;
      ctx.fillStyle   = '#fff';
      ctx.fillRect(0, ly, W, 1 + Math.random() * 2);
    }

    ctx.globalAlpha = 1;
  },
};
