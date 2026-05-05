const PALETTE = [
  '#ff6b6b','#ff9f43','#ffd32a','#0be881',
  '#67e8f9','#c084fc','#f472b6','#86efac',
];

let _custId = 0;

class Customer {
  constructor(spawnX, spawnY) {
    this.id     = _custId++;
    this.x      = spawnX;
    this.y      = spawnY;
    this.tx     = spawnX;
    this.ty     = spawnY;
    this.machine = null;
    this.state   = 'moving'; // moving | playing
    this.color   = PALETTE[this.id % PALETTE.length];
    this.speed   = 65 + Math.random() * 25;
    this.size    = 7;
    this.bob     = Math.random() * Math.PI * 2;
  }

  assignMachine(machine) {
    this.machine = machine;
    machine.customers.push(this);
    const sp = machine.screenPos;
    this.tx = sp.x + (Math.random() - 0.5) * 12;
    this.ty = sp.y + ISO.TILE_H * 0.75;
    this.state = 'moving';
  }

  update(dt) {
    if (this.state === 'moving') {
      const dx   = this.tx - this.x;
      const dy   = this.ty - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 2) {
        this.x = this.tx;
        this.y = this.ty;
        this.state = 'playing';
      } else {
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
      }
    }
  }

  draw(ctx, tick) {
    const bobY = Math.sin(tick * 3.5 + this.bob) * 2;
    const cy   = this.y + bobY;

    ctx.save();

    // Drop shadow
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.size * 0.6, this.size * 0.75, this.size * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Body circle
    ctx.fillStyle   = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur  = 5;
    ctx.beginPath();
    ctx.arc(this.x, cy, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle  = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(this.x - 2, cy - 2.5, this.size * 0.38, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  get depth() {
    const tile = ISO.toTile(this.x, this.y, State.floorOriginX, State.floorOriginY);
    return tile.col + tile.row + 0.5;
  }
}
