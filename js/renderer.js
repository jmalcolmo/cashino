const Renderer = {

  render() {
    const ctx = State.ctx;
    const W   = State.canvas.width;
    const H   = State.canvas.height;

    ctx.fillStyle = '#03010a';
    ctx.fillRect(0, 0, W, H);

    this._drawFloor(ctx);
    Supercomputer.draw(ctx);
    this._drawEntities(ctx);
    this._drawParticles(ctx);
  },

  _drawFloor(ctx) {
    const floor = State.floor;
    const ox    = State.floorOriginX;
    const oy    = State.floorOriginY;

    for (let r = 0; r < floor.rows; r++) {
      for (let c = 0; c < floor.cols; c++) {
        const s    = ISO.toScreen(c, r, ox, oy);
        const even = (c + r) % 2 === 0;
        ISO.drawTile(ctx, s.x, s.y,
          even ? '#092c13' : '#0b3416',
          '#1a6030');
      }
    }

    const bx = ox;
    const by = oy + (floor.cols + floor.rows) * ISO.TILE_H / 2;
    this._drawEntrance(ctx, bx, by);
  },

  _drawEntrance(ctx, x, y) {
    ctx.save();
    ctx.globalAlpha = 0.45 + 0.15 * Math.sin(State.tick * 2.5);
    ctx.strokeStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur  = 10;
    ctx.lineWidth   = 2;
    for (let i = 0; i < 2; i++) {
      const offset = i * 14;
      ctx.beginPath();
      ctx.moveTo(x - 16, y + 22 + offset);
      ctx.lineTo(x,      y + 10 + offset);
      ctx.lineTo(x + 16, y + 22 + offset);
      ctx.stroke();
    }
    ctx.restore();
  },

  _drawEntities(ctx) {
    const entities = [];
    State.machines.forEach(m => entities.push({
      depth: m.depth,
      draw:  () => this._drawMachine(ctx, m),
    }));
    State.crowdPersons.forEach(p => entities.push({
      depth: p.depth,
      draw:  () => p.draw(ctx, State.tick),
    }));
    entities.sort((a, b) => a.depth - b.depth);
    entities.forEach(e => e.draw());
  },

  _drawMachine(ctx, m) {
    const def = m.def;
    let { x, y } = m.screenPos;

    if (m.shakeTimer > 0) {
      x += (Math.random() - 0.5) * m.shakeAmount * 2;
      y += (Math.random() - 0.5) * m.shakeAmount;
    }

    ISO.drawBox(ctx, x, y, def.boxH, def.colors);

    ctx.save();
    const hw = ISO.TILE_W / 2;
    const hh = ISO.TILE_H / 2;
    const bH = def.boxH;

    // Animated reel color indicator
    const reelAlpha  = 0.55 + 0.35 * Math.sin(m.reelPhase);
    const reelColors = ['#ff0090', '#00d4ff', '#ffd700', '#39ff14', '#9b30ff'];
    const reelColor  = reelColors[Math.floor(m.reelPhase / 1.2) % reelColors.length];

    ctx.globalAlpha = reelAlpha;
    ctx.fillStyle   = reelColor;
    ctx.shadowColor = reelColor;
    ctx.shadowBlur  = 12;
    ctx.beginPath();
    ctx.arc(x, y - bH + hh * 0.7, 5, 0, Math.PI * 2);
    ctx.fill();

    // Spin progress pulse dots
    const progress = 1 - m.spinTimer / m.spinInterval;
    const pulse    = 0.4 + 0.6 * Math.sin(progress * Math.PI);
    ctx.globalAlpha = pulse * 0.9;
    ctx.fillStyle   = def.accentColor;
    ctx.shadowColor = def.accentColor;
    ctx.shadowBlur  = 8;
    ctx.beginPath();
    ctx.arc(x - hw * 0.35, y - bH + hh * 0.5, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + hw * 0.35, y - bH + hh * 0.5, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  _drawParticles(ctx) {
    State.particles.forEach(p => p.draw(ctx));
  },
};
