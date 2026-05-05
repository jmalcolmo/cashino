// Floating dollar text that drifts upward and fades
class FloatingText {
  constructor(x, y, text, color) {
    this.x    = x;
    this.y    = y;
    this.text = text;
    this.color = color;
    this.alpha = 1;
    this.vy    = -1.2;
    this.life  = 1.6;
    this.age   = 0;
    // Big wins get bigger text
    const val = parseFloat(text.replace(/[^0-9.]/g, ''));
    this.size = val >= 20 ? 13 : val >= 8 ? 10 : 8;
  }

  update(dt) {
    this.age += dt;
    this.y   += this.vy;
    this.vy  *= 0.97;
    this.alpha = Math.max(0, 1 - this.age / this.life);
    return this.alpha > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.font        = `${this.size}px 'Press Start 2P'`;
    ctx.fillStyle   = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur  = 10;
    ctx.textAlign   = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

// Small burst particle for big wins/losses
class Spark {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    const angle = Math.random() * Math.PI * 2;
    const spd   = 1.5 + Math.random() * 4;
    this.vx   = Math.cos(angle) * spd;
    this.vy   = Math.sin(angle) * spd - 1;
    this.life = 0.4 + Math.random() * 0.5;
    this.age  = 0;
    this.r    = 2 + Math.random() * 2.5;
  }

  update(dt) {
    this.age += dt;
    this.x   += this.vx;
    this.y   += this.vy;
    this.vy  += 0.07;
    this.vx  *= 0.96;
    return this.age < this.life;
  }

  draw(ctx) {
    const a = 1 - this.age / this.life;
    ctx.save();
    ctx.globalAlpha  = a;
    ctx.fillStyle    = this.color;
    ctx.shadowColor  = this.color;
    ctx.shadowBlur   = 6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Expanding ring that appears on hype click
class HypePulse {
  constructor(x, y, maxRadius) {
    this.x         = x;
    this.y         = y;
    this.radius    = 0;
    this.maxRadius = maxRadius;
    this.life      = 0.55;
    this.age       = 0;
  }

  update(dt) {
    this.age    += dt;
    this.radius  = (this.age / this.life) * this.maxRadius;
    return this.age < this.life;
  }

  draw(ctx) {
    const a = (1 - this.age / this.life) * 0.7;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#00d4ff';
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur  = 16;
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    // Inner ring at half radius
    ctx.globalAlpha = a * 0.4;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
