// ── Helpers ────────────────────────────────────────────────────────────────

function recalcOrigin() {
  if (!State.canvas || !State.floor) return;
  const W = State.canvas.width;
  const H = State.canvas.height;
  const floorH = (State.floor.cols + State.floor.rows) * ISO.TILE_H / 2;
  State.floorOriginX = W / 2;
  State.floorOriginY = Math.round((H - floorH) / 2) + 10;
}

function spawnCustomer(machine) {
  // Customers enter from the bottom point of the floor
  const ox = State.floorOriginX;
  const oy = State.floorOriginY;
  const bY = oy + (State.floor.cols + State.floor.rows) * ISO.TILE_H / 2 + 28;
  const c  = new Customer(ox + (Math.random() - 0.5) * 30, bY);
  c.assignMachine(machine);
  State.customers.push(c);
}

function triggerHype(x, y) {
  if (State.hype.cooldown > 0) return;
  State.hype.cooldown = State.hype.COOLDOWN_MAX;

  State.particles.push(new HypePulse(x, y, State.hype.RADIUS));

  // Boost all customers within radius
  State.customers.forEach(c => {
    const dist = Math.hypot(c.x - x, c.y - y);
    if (dist <= State.hype.RADIUS) {
      c.boostTimer = State.hype.BOOST_DURATION;
    }
  });
}

// ── Init ───────────────────────────────────────────────────────────────────

function init() {
  const canvas    = document.getElementById('game-canvas');
  const crtCanvas = document.getElementById('crt-canvas');
  const wrap      = document.getElementById('canvas-wrap');

  State.canvas    = canvas;
  State.ctx       = canvas.getContext('2d');
  State.crtCanvas = crtCanvas;

  function resize() {
    canvas.width    = wrap.clientWidth  || window.innerWidth - 300;
    canvas.height   = wrap.clientHeight || window.innerHeight;
    crtCanvas.width  = canvas.width;
    crtCanvas.height = canvas.height;
    CRT.init(crtCanvas);
    recalcOrigin();
  }

  window.addEventListener('resize', resize);
  resize();

  // Floor
  State.floor = new Floor(6, 6);
  recalcOrigin();

  // Starter machine (free), centered-ish on 6x6 grid
  const starter = new Machine('SLOT', 2, 2);
  State.machines.push(starter);
  State.floor.setOccupied(2, 2, true);
  spawnCustomer(starter);

  // Hype Man state placeholder
  State.hypeManTimer    = null;
  State.hypeManInterval = null;

  // Init subsystems
  UI.init();
  Input.init();

  State.lastTime = performance.now();
  requestAnimationFrame(loop);
}

// ── Income rolling window ──────────────────────────────────────────────────

const _incomeWindow = [];

function recordIncome(amount) {
  _incomeWindow.push({ t: State.tick, v: amount });
  // Keep last 5 seconds
  const cutoff = State.tick - 5;
  while (_incomeWindow.length && _incomeWindow[0].t < cutoff) _incomeWindow.shift();
  const sum      = _incomeWindow.reduce((s, e) => s + e.v, 0);
  const window   = Math.min(State.tick, 5);
  State.incomePerSecond = window > 0 ? sum / window : 0;
}

// ── Game loop ──────────────────────────────────────────────────────────────

let _uiFrameCounter = 0;

function loop(now) {
  const dt = Math.min((now - State.lastTime) / 1000, 0.1);
  State.lastTime = now;
  State.tick    += dt;

  // Hype cooldown
  if (State.hype.cooldown > 0) {
    State.hype.cooldown = Math.max(0, State.hype.cooldown - dt);
  }

  // Hype Man auto-hype
  if (State.hypeManInterval !== null) {
    State.hypeManTimer += dt;
    if (State.hypeManTimer >= State.hypeManInterval) {
      State.hypeManTimer = 0;
      triggerHype(State.floorOriginX, State.floorOriginY + 60);
    }
  }

  // Machines
  State.machines.forEach(m => {
    const spin = m.update(dt);
    if (spin === null) return;

    State.money += spin;
    if (State.money < 0) State.money = 0;
    recordIncome(spin);

    // Floating text at machine position
    const sp    = m.screenPos;
    const posX  = sp.x + (Math.random() - 0.5) * 28;
    const posY  = sp.y - m.def.boxH - 4;
    const color = spin >= 0 ? '#39ff14' : '#ff3333';
    const label = (spin >= 0 ? '+' : '') + '$' + Math.abs(spin).toFixed(0);
    State.particles.push(new FloatingText(posX, posY, label, color));

    // Sparks on big events
    if (Math.abs(spin) >= 14) {
      const sparkColor = spin < 0 ? '#ff3333' : '#ffd700';
      for (let i = 0; i < 14; i++) {
        State.particles.push(new Spark(sp.x, sp.y - m.def.boxH * 0.5, sparkColor));
      }
    }
  });

  // Customers
  State.customers.forEach(c => c.update(dt));

  // Particles
  State.particles = State.particles.filter(p => p.update(dt));

  // Render
  Renderer.render();
  CRT.render();

  // Update HTML UI every ~6 frames (~10×/sec) to avoid DOM thrash
  _uiFrameCounter++;
  if (_uiFrameCounter % 6 === 0) UI.render();

  requestAnimationFrame(loop);
}

// ── Boot ───────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', init);
