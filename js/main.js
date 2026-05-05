// ── Helpers ──────────────────────────────────────────────────────────────────

function spawnCustomersForMachine(m) {
  spawnCustomer(m);
  if (State.splitscreen) spawnCustomer(m);
}

function recalcOrigin() {
  if (!State.canvas || !State.floor) return;
  const W = State.canvas.width;
  const H = State.canvas.height;
  const floorH = (State.floor.cols + State.floor.rows) * ISO.TILE_H / 2;
  State.floorOriginX = W / 2;
  State.floorOriginY = Math.round((H - floorH) / 2) + 10;
}

function spawnCustomer(machine) {
  const ox = State.floorOriginX;
  const oy = State.floorOriginY;
  const bY = oy + (State.floor.cols + State.floor.rows) * ISO.TILE_H / 2 + 28;
  const c  = new Customer(ox + (Math.random() - 0.5) * 30, bY);
  c.assignMachine(machine);
  State.customers.push(c);
}

// Record a spin result: update money, IPS window, and spawn particles.
function processSpinResult(machine, amount) {
  State.money += amount;
  if (State.money < 0) State.money = 0;
  recordIncome(amount);

  const sp    = machine.screenPos;
  const posX  = sp.x + (Math.random() - 0.5) * 28;
  const posY  = sp.y - machine.def.boxH - 4;
  const color = amount >= 0 ? '#39ff14' : '#ff3333';
  const label = (amount >= 0 ? '+' : '') + '$' + Math.abs(amount).toFixed(0);
  State.particles.push(new FloatingText(posX, posY, label, color));

  if (Math.abs(amount) >= SPARK_BIG_THRESH) {
    const sparkColor = amount < 0 ? '#ff3333' : '#ffd700';
    for (let i = 0; i < SPARK_COUNT; i++) {
      State.particles.push(new Spark(sp.x, sp.y - machine.def.boxH * 0.5, sparkColor));
    }
  }
}

// Trigger click-spins on a machine. Uses the fractional accumulator so 1.5x alternates 1/2 spins.
// Called from player input and the auto-clicker NPC.
function applyClick(machine) {
  if (machine.customers.length === 0) return;
  machine.clickAccum += State.clickMultiplier;
  while (machine.clickAccum >= 1) {
    processSpinResult(machine, machine.doSpin());
    machine.clickAccum -= 1;
  }
}

// ── Init ─────────────────────────────────────────────────────────────────────

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

  State.floor = new Floor(6, 6);
  recalcOrigin();

  // Starter machine (free), centered-ish on 6x6 grid
  const starter = new Machine('SLOT', 2, 2);
  State.machines.push(starter);
  State.floor.setOccupied(2, 2, true);
  spawnCustomersForMachine(starter);

  UI.init();
  Input.init();

  State.lastTime = performance.now();
  requestAnimationFrame(loop);
}

// ── Income rolling window ─────────────────────────────────────────────────────

const _incomeWindow   = [];
const _earningsHistory = [];

function recordIncome(amount) {
  const entry = { t: State.tick, v: amount };

  _incomeWindow.push(entry);
  const cutoff = State.tick - 5;
  while (_incomeWindow.length && _incomeWindow[0].t < cutoff) _incomeWindow.shift();
  const sum    = _incomeWindow.reduce((s, e) => s + e.v, 0);
  const window = Math.min(State.tick, 5);
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
  const dt = Math.min((now - State.lastTime) / 1000, 0.1);
  State.lastTime = now;
  State.tick    += dt;

  // Auto-clicker NPC
  if (State.autoClickInterval !== null) {
    State.autoClickTimer += dt;
    if (State.autoClickTimer >= State.autoClickInterval) {
      State.autoClickTimer = 0;
      if (State.machines.length > 0) {
        const m = State.machines[Math.floor(Math.random() * State.machines.length)];
        applyClick(m);
      }
    }
  }

  // Machines (passive timer-driven spins)
  State.machines.forEach(m => {
    const spin = m.update(dt);
    if (spin !== null) processSpinResult(m, spin);
  });

  // Customers
  State.customers.forEach(c => c.update(dt));

  // Particles
  State.particles = State.particles.filter(p => p.update(dt));

  // Render
  Renderer.render();
  CRT.render();

  _uiFrameCounter++;
  if (_uiFrameCounter % 6 === 0) UI.render();

  requestAnimationFrame(loop);
}

// ── Boot ──────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', init);
