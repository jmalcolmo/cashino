// ── Upgrade definitions ───────────────────────────────────────────────────────
// Each upgrade tracks its own level and provides apply() + effectText() methods.

const SC_UPGRADES = [
  {
    id:       'wager',
    name:     'WAGER BOOST',
    desc:     'Increase all machine payouts.',
    tier:     1,
    maxLevel: SC_T1_WAGER_LEVELS,
    level:    0,
    cost(lvl) {
      return Math.round(SC_T1_WAGER_BASE_COST * Math.pow(SC_T1_WAGER_SCALE, lvl));
    },
    apply() {
      State.globalWagerMult = Math.pow(1 + SC_T1_WAGER_PER_LEVEL, this.level);
    },
    effectText() {
      return Math.pow(1 + SC_T1_WAGER_PER_LEVEL, this.level).toFixed(2) + 'x payout';
    },
  },
  {
    id:       'rollrate',
    name:     'ROLL RATE',
    desc:     'All machines spin faster.',
    tier:     1,
    maxLevel: SC_T1_ROLLRATE_LEVELS,
    level:    0,
    cost(lvl) {
      return Math.round(SC_T1_ROLLRATE_BASE_COST * Math.pow(SC_T1_ROLLRATE_SCALE, lvl));
    },
    apply() {
      State.globalSpeedMult = Math.pow(1 - SC_T1_ROLLRATE_PER_LEVEL, this.level);
      State.machines.forEach(m => { m.spinInterval = m.effectiveInterval; });
    },
    effectText() {
      const faster = (1 / Math.max(0.01, Math.pow(1 - SC_T1_ROLLRATE_PER_LEVEL, this.level))).toFixed(2);
      return faster + 'x speed';
    },
  },
  {
    id:       'capacity',
    name:     'FLOOR CAPACITY',
    desc:     'Allow more people on the floor.',
    tier:     1,
    maxLevel: SC_T1_CAPACITY_LEVELS,
    level:    0,
    cost(lvl) {
      return Math.round(SC_T1_CAPACITY_BASE_COST * Math.pow(SC_T1_CAPACITY_SCALE, lvl));
    },
    apply() {
      State.floorCapacity = FLOOR_CAPACITY_START + this.level * SC_T1_CAPACITY_PER_LEVEL;
    },
    effectText() {
      return (FLOOR_CAPACITY_START + this.level * SC_T1_CAPACITY_PER_LEVEL) + ' cap';
    },
  },

  // ── Tier 2 Upgrades ──────────────────────────────────────────────────────
  {
    id:       'wager_t2',
    name:     'WAGER BOOST II',
    desc:     'Further increase all machine payouts.',
    tier:     2,
    maxLevel: SC_T2_WAGER_LEVELS,
    level:    0,
    cost(lvl) {
      return Math.round(SC_T2_WAGER_BASE_COST * Math.pow(SC_T2_WAGER_SCALE, lvl));
    },
    apply() {
      // T1 multiplier stacks with T2
      const t1 = Math.pow(1 + SC_T1_WAGER_PER_LEVEL, SC_UPGRADES[0].level);
      const t2 = Math.pow(1 + SC_T2_WAGER_PER_LEVEL, this.level);
      State.globalWagerMult = t1 * t2;
    },
    effectText() {
      const t1 = Math.pow(1 + SC_T1_WAGER_PER_LEVEL, SC_UPGRADES[0].level);
      const t2 = Math.pow(1 + SC_T2_WAGER_PER_LEVEL, this.level);
      return (t1 * t2).toFixed(2) + 'x total';
    },
    isUnlocked() {
      return SC_UPGRADES[0].level >= SC_UPGRADES[0].maxLevel;
    },
  },

  {
    id:       'rollrate_t2',
    name:     'ROLL RATE II',
    desc:     'Make machines spin even faster.',
    tier:     2,
    maxLevel: SC_T2_ROLLRATE_LEVELS,
    level:    0,
    cost(lvl) {
      return Math.round(SC_T2_ROLLRATE_BASE_COST * Math.pow(SC_T2_ROLLRATE_SCALE, lvl));
    },
    apply() {
      const t1 = Math.pow(1 - SC_T1_ROLLRATE_PER_LEVEL, SC_UPGRADES[1].level);
      const t2 = Math.pow(1 - SC_T2_ROLLRATE_PER_LEVEL, this.level);
      State.globalSpeedMult = t1 * t2;
      State.machines.forEach(m => { m.spinInterval = m.effectiveInterval; });
    },
    effectText() {
      const t1 = Math.pow(1 - SC_T1_ROLLRATE_PER_LEVEL, SC_UPGRADES[1].level);
      const t2 = Math.pow(1 - SC_T2_ROLLRATE_PER_LEVEL, this.level);
      const faster = (1 / Math.max(0.01, t1 * t2)).toFixed(2);
      return faster + 'x total';
    },
    isUnlocked() {
      return SC_UPGRADES[1].level >= SC_UPGRADES[1].maxLevel;
    },
  },

  {
    id:       'capacity_t2',
    name:     'FLOOR CAPACITY II',
    desc:     'Even more people on the floor.',
    tier:     2,
    maxLevel: SC_T2_CAPACITY_LEVELS,
    level:    0,
    cost(lvl) {
      return Math.round(SC_T2_CAPACITY_BASE_COST * Math.pow(SC_T2_CAPACITY_SCALE, lvl));
    },
    apply() {
      const t1 = FLOOR_CAPACITY_START + SC_UPGRADES[2].level * SC_T1_CAPACITY_PER_LEVEL;
      const t2 = this.level * SC_T2_CAPACITY_PER_LEVEL;
      State.floorCapacity = t1 + t2;
    },
    effectText() {
      const t1 = FLOOR_CAPACITY_START + SC_UPGRADES[2].level * SC_T1_CAPACITY_PER_LEVEL;
      const t2 = this.level * SC_T2_CAPACITY_PER_LEVEL;
      return (t1 + t2) + ' cap';
    },
    isUnlocked() {
      return SC_UPGRADES[2].level >= SC_UPGRADES[2].maxLevel;
    },
  },
];

// ── Supercomputer visual entity ───────────────────────────────────────────────

const Supercomputer = {
  x:         0,
  y:         0,
  boxH:      SC_BOX_H,
  glowPhase: 0,
  dataPhase: 0,

  colors: {
    top:        '#001833',
    left:       '#000d1f',
    right:      '#000812',
    topStroke:  '#00d4ff',
    sideStroke: '#001a33',
  },
  accentColor: '#00d4ff',

  reposition() {
    if (!State.floor) return;
    const ox       = State.floorOriginX;
    const oy       = State.floorOriginY;
    const leftEdge = ISO.toScreen(0, State.floor.rows - 1, ox, oy);
    this.x = Math.max(72, leftEdge.x - 72);
    this.y = leftEdge.y;
  },

  update(dt) {
    this.glowPhase += dt * 2.2;
    this.dataPhase += dt * 5.0;
  },

  containsPoint(px, py) {
    const hw = ISO.TILE_W / 2;
    return (
      px >= this.x - hw        && px <= this.x + hw &&
      py >= this.y - this.boxH && py <= this.y + ISO.TILE_H
    );
  },

  draw(ctx) {
    const { x, y, boxH } = this;
    ISO.drawBox(ctx, x, y, boxH, this.colors);

    ctx.save();
    const hw = ISO.TILE_W / 2;
    const hh = ISO.TILE_H / 2;

    // Blinking data LEDs across top face
    for (let i = 0; i < 4; i++) {
      const phase = this.dataPhase + i * (Math.PI * 0.5);
      ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(phase));
      ctx.fillStyle   = this.accentColor;
      ctx.shadowColor = this.accentColor;
      ctx.shadowBlur  = 8;
      ctx.beginPath();
      ctx.arc(x - hw * 0.45 + i * hw * 0.30, y - boxH + hh * 0.45, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Screen glow on left face
    ctx.globalAlpha = 0.10 + 0.07 * Math.sin(this.glowPhase);
    ctx.fillStyle   = this.accentColor;
    ctx.beginPath();
    ctx.moveTo(x - hw * 0.72, y + hh * 0.18 - boxH * 0.50);
    ctx.lineTo(x - hw * 0.12, y + hh * 0.58 - boxH * 0.50);
    ctx.lineTo(x - hw * 0.12, y + hh * 0.58 - boxH * 0.15);
    ctx.lineTo(x - hw * 0.72, y + hh * 0.18 - boxH * 0.15);
    ctx.closePath();
    ctx.fill();

    // Second screen glow (lower)
    ctx.globalAlpha = 0.08 + 0.06 * Math.sin(this.glowPhase + 1.2);
    ctx.beginPath();
    ctx.moveTo(x - hw * 0.72, y + hh * 0.18 - boxH * 0.12);
    ctx.lineTo(x - hw * 0.12, y + hh * 0.58 - boxH * 0.12);
    ctx.lineTo(x - hw * 0.12, y + hh * 0.58 + boxH * 0.10);
    ctx.lineTo(x - hw * 0.72, y + hh * 0.18 + boxH * 0.10);
    ctx.closePath();
    ctx.fill();

    // Antenna
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(this.glowPhase * 1.8);
    ctx.strokeStyle = this.accentColor;
    ctx.shadowColor = this.accentColor;
    ctx.shadowBlur  = 14;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - boxH);
    ctx.lineTo(x, y - boxH - 22);
    ctx.stroke();

    // Antenna tip blink
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(this.dataPhase * 0.7);
    ctx.fillStyle   = this.accentColor;
    ctx.shadowBlur  = 16;
    ctx.beginPath();
    ctx.arc(x, y - boxH - 25, 3, 0, Math.PI * 2);
    ctx.fill();

    // Pulsing base ring
    ctx.globalAlpha = 0.08 + 0.06 * Math.sin(this.glowPhase * 0.6);
    ctx.strokeStyle = this.accentColor;
    ctx.shadowBlur  = 20;
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.ellipse(x, y, hw * 1.15, hh * 0.65, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  },

  purchase(id) {
    const upg = SC_UPGRADES.find(u => u.id === id);
    if (!upg) return false;
    if (upg.level >= upg.maxLevel) return false;
    if (upg.isUnlocked && !upg.isUnlocked()) return false;  // Check if tier is unlocked
    const cost = upg.cost(upg.level);
    if (State.money < cost) return false;
    State.money -= cost;
    upg.level++;
    upg.apply();
    return true;
  },
};
