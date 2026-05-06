// ── Helpers ───────────────────────────────────────────────────────────────────

function recalcOrigin() {
  if (!State.canvas || !State.floor) return;
  const W      = State.canvas.width;
  const H      = State.canvas.height;
  const floorH = (State.floor.cols + State.floor.rows) * ISO.TILE_H / 2;
  State.floorOriginX = W / 2;
  State.floorOriginY = Math.round((H - floorH) / 2) + FLOOR_ORIGIN_Y_PAD;
}

function processSpinResult(machine, amount) {
  State.money += amount;
  if (State.money < 0) State.money = 0;
  recordIncome(amount);

  const sp    = machine.screenPos;
  const posX  = sp.x + (Math.random() - 0.5) * 28;
  const posY  = sp.y - machine.def.boxH - 4;
  const color = amount >= 0 ? '#39ff14' : '#ff3333';
  const sign  = amount >= 0 ? '+' : '';
  State.particles.push(new FloatingText(posX, posY, sign + formatMoney(amount), color));

  if (Math.abs(amount) >= SPARK_BIG_THRESH) {
    const sparkColor = amount < 0 ? '#ff3333' : '#ffd700';
    for (let i = 0; i < SPARK_COUNT; i++) {
      State.particles.push(new Spark(sp.x, sp.y - machine.def.boxH * 0.5, sparkColor));
    }
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

function init() {
  const canvas    = document.getElementById('game-canvas');
  const crtCanvas = document.getElementById('crt-canvas');
  const wrap      = document.getElementById('canvas-wrap');

  State.canvas    = canvas;
  State.ctx       = canvas.getContext('2d');
  State.crtCanvas = crtCanvas;

  function resize() {
    canvas.width     = wrap.clientWidth  || window.innerWidth - 300;
    canvas.height    = wrap.clientHeight || window.innerHeight;
    crtCanvas.width  = canvas.width;
    crtCanvas.height = canvas.height;
    CRT.init(crtCanvas);
    recalcOrigin();
    Supercomputer.reposition();
  }

  window.addEventListener('resize', resize);
  resize();

  State.floor = new Floor(FLOOR_COLS_START, FLOOR_ROWS_START);
  recalcOrigin();
  Supercomputer.reposition();

  // Starter machine - free, pre-placed
  const starter = new Machine('SLOT', 2, 2);
  State.machines.push(starter);
  State.floor.setOccupied(2, 2, true);

  UI.init();
  Input.init();

  State.lastTime = performance.now();
  requestAnimationFrame(loop);
}

// ── Income rolling window ─────────────────────────────────────────────────────

const _incomeWindow    = [];
const _earningsHistory = [];

function recordIncome(amount) {
  const entry = { t: State.tick, v: amount };

  _incomeWindow.push(entry);
  const cutoff = State.tick - IPS_WINDOW;
  while (_incomeWindow.length && _incomeWindow[0].t < cutoff) _incomeWindow.shift();
  const sum    = _incomeWindow.reduce((s, e) => s + e.v, 0);
  const window = Math.min(State.tick, IPS_WINDOW);
  State.incomePerSecond = window > 0 ? sum / window : 0;

  _earningsHistory.push(entry);
  const histCutoff = State.tick - 7200;
  while (_earningsHistory.length && _earningsHistory[0].t < histCutoff) _earningsHistory.shift();
}

function earningsInWindow(t0, t1) {
  return _earningsHistory.reduce((s, e) => (e.t >= t0 && e.t < t1 ? s + e.v : s), 0);
}

// ── Game loop ─────────────────────────────────────────────────────────────────

let _uiFrameCounter = 0;

function loop(now) {
  const dt = Math.min((now - State.lastTime) / 1000, DT_CAP);
  State.lastTime = now;
  State.tick    += dt;

  // Floor population decay
  State.floorPopulation = Math.max(0, State.floorPopulation - FLOOR_POPULATION_DECAY * dt);

  // Supercomputer animation
  Supercomputer.update(dt);

  // Machines (always spin, no customer gating)
  State.machines.forEach(m => {
    const spin = m.update(dt);
    if (spin !== null) processSpinResult(m, spin);
  });

  // Crowd persons (visual only)
  State.crowdPersons = State.crowdPersons.filter(p => p.update(dt));

  // Particles
  State.particles = State.particles.filter(p => p.update(dt));

  Renderer.render();
  CRT.render();

  _uiFrameCounter++;
  if (_uiFrameCounter % UI_UPDATE_EVERY === 0) UI.render();

  requestAnimationFrame(loop);
}

// ── Boot ──────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', init);
