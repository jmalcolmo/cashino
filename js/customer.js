// CrowdPerson - purely visual wandering entity. No mechanical role.
// Spawned when the player clicks the floor. Decays naturally over its lifetime.

const CROWD_PALETTE = [
  '#ff6b6b', '#ff9f43', '#ffd32a', '#0be881',
  '#67e8f9', '#c084fc', '#f472b6', '#86efac',
];

let _cpId = 0;

class CrowdPerson {
  constructor(spawnX, spawnY) {
    this.id    = _cpId++;
    this.x     = spawnX;
    this.y     = spawnY;
    this.tx    = spawnX;
    this.ty    = spawnY;
    this.color = CROWD_PALETTE[this.id % CROWD_PALETTE.length];
    this.speed = CROWD_PERSON_SPEED_MIN + Math.random() * (CROWD_PERSON_SPEED_MAX - CROWD_PERSON_SPEED_MIN);
    this.size  = CROWD_PERSON_SIZE;
    this.bob   = Math.random() * Math.PI * 2;

    this.lifetime   = CROWD_PERSON_LIFETIME_MIN + Math.random() * (CROWD_PERSON_LIFETIME_MAX - CROWD_PERSON_LIFETIME_MIN);
    this.age        = 0;
    this.state      = 'moving';  // moving | idle | cheering | leaving
    this.idleTimer  = 0;
    this.cheerTimer = 0;
    this.alpha      = 1;

    this._pickTarget();
  }

  _pickTarget() {
    if (State.machines.length > 0 && Math.random() < 0.7) {
      const m  = State.machines[Math.floor(Math.random() * State.machines.length)];
      const sp = m.screenPos;
      this.tx  = sp.x + (Math.random() - 0.5) * 50;
      this.ty  = sp.y + ISO.TILE_H * 0.75 + (Math.random() - 0.5) * 14;
    } else if (State.floor) {
      const c  = 1 + Math.floor(Math.random() * (State.floor.cols - 2));
      const r  = 1 + Math.floor(Math.random() * (State.floor.rows - 2));
      const sp = ISO.toScreen(c, r, State.floorOriginX, State.floorOriginY);
      this.tx  = sp.x + (Math.random() - 0.5) * 20;
      this.ty  = sp.y + ISO.TILE_H * 0.5;
    }
    this.state = 'moving';
  }

  _moveToward(dt) {
    const dx   = this.tx - this.x;
    const dy   = this.ty - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 2) { this.x = this.tx; this.y = this.ty; return true; }
    this.x += (dx / dist) * this.speed * dt;
    this.y += (dy / dist) * this.speed * dt;
    return false;
  }

  update(dt) {
    this.age += dt;

    if (this.age >= this.lifetime && this.state !== 'leaving') {
      this.state = 'leaving';
      const ox   = State.floorOriginX;
      const oy   = State.floorOriginY;
      this.tx    = ox + (Math.random() - 0.5) * 30;
      this.ty    = oy + (State.floor.cols + State.floor.rows) * ISO.TILE_H / 2 + 80;
    }

    if (this.state === 'leaving') {
      this._moveToward(dt);
      const remaining = (this.lifetime + 3) - this.age;
      this.alpha = Math.max(0, remaining / 3);
      return this.alpha > 0;
    }

    if (this.state === 'moving') {
      if (this._moveToward(dt)) {
        this.state     = 'idle';
        this.idleTimer = 2 + Math.random() * 5;
      }
    } else if (this.state === 'idle') {
      this.idleTimer -= dt;
      if (Math.random() < 0.003) {
        this.state      = 'cheering';
        this.cheerTimer = 0.6 + Math.random() * 1.4;
      }
      if (this.idleTimer <= 0) this._pickTarget();
    } else if (this.state === 'cheering') {
      this.cheerTimer -= dt;
      if (this.cheerTimer <= 0) {
        this.state     = 'idle';
        this.idleTimer = 1 + Math.random() * 3;
      }
    }

    return true;
  }

  draw(ctx, tick) {
    ctx.save();
    ctx.globalAlpha = this.alpha;

    const cheering = this.state === 'cheering';
    const bobY = cheering
      ? Math.sin(tick * 8 + this.bob) * 4
      : Math.sin(tick * CROWD_PERSON_BOB_FREQ + this.bob) * CROWD_PERSON_BOB_AMP;
    const cy = this.y + bobY;

    // Drop shadow
    ctx.globalAlpha = 0.25 * this.alpha;
    ctx.fillStyle   = '#000';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.size * 0.6, this.size * 0.75, this.size * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = this.alpha;

    // Body
    ctx.fillStyle   = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur  = cheering ? 14 : 5;
    ctx.beginPath();
    ctx.arc(this.x, cy, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle  = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(this.x - 2, cy - 2.5, this.size * 0.38, 0, Math.PI * 2);
    ctx.fill();

    // Arms when cheering
    if (cheering) {
      const wave = Math.sin(tick * 9 + this.bob);
      ctx.strokeStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur  = 8;
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(this.x - this.size * 0.8, cy + 2);
      ctx.lineTo(this.x - this.size * 1.7, cy - 7 + wave * 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(this.x + this.size * 0.8, cy + 2);
      ctx.lineTo(this.x + this.size * 1.7, cy - 7 - wave * 3);
      ctx.stroke();
    }

    ctx.restore();
  }

  get depth() {
    const tile = ISO.toTile(this.x, this.y, State.floorOriginX, State.floorOriginY);
    return tile.col + tile.row + 0.5;
  }
}
