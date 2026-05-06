// ─── Isometric Grid ─────────────────────────────────────────────────────────
const TILE_W = 96;
const TILE_H = 48;

// ─── Utility ─────────────────────────────────────────────────────────────────
function formatMoney(n) {
  const abs  = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e15) return sign + '$' + (abs / 1e15).toFixed(2) + 'Qa';
  if (abs >= 1e12) return sign + '$' + (abs / 1e12).toFixed(2) + 'T';
  if (abs >= 1e9)  return sign + '$' + (abs / 1e9).toFixed(2)  + 'B';
  if (abs >= 1e6)  return sign + '$' + (abs / 1e6).toFixed(2)  + 'M';
  if (abs >= 1e3)  return sign + '$' + (abs / 1e3).toFixed(1)  + 'K';
  return sign + '$' + abs.toFixed(0);
}

// ─── Economy ─────────────────────────────────────────────────────────────────
const STARTING_MONEY = 0;

// Slot machine base spin table (positive = house earns, negative = house pays)
const SPIN_SMALL_WIN_CHANCE   = 0.59;
const SPIN_LOSS_CHANCE        = 0.20;
const SPIN_MEDIUM_WIN_CHANCE  = 0.20;
const SPIN_JACKPOT_CHANCE     = 0.01;

const SPIN_SMALL_WIN_MIN   =  3;
const SPIN_SMALL_WIN_MAX   =  6;
const SPIN_LOSS_MIN        = -5;
const SPIN_LOSS_MAX        = -2;
const SPIN_MEDIUM_WIN_MIN  =  5;
const SPIN_MEDIUM_WIN_MAX  = 10;
const SPIN_JACKPOT_MIN     = -28;
const SPIN_JACKPOT_MAX     = -14;

// ─── Spin Timing ─────────────────────────────────────────────────────────────
const SPIN_INTERVAL_BASE  = 2.2;
const SPIN_JITTER_MIN     = 0.85;
const SPIN_JITTER_RANGE   = 0.30;

// ─── Floor Population ────────────────────────────────────────────────────────
const FLOOR_CAPACITY_START   = 20;
const FLOOR_POPULATION_DECAY = 0.125;  // people lost per second (1 per 8s)
const CROWD_MULT_BONUS_BASE  = 1.0;    // bonus at full capacity: 1 + 1.0 = 2x wager

// ─── Supercomputer Upgrades - Tier 1 ─────────────────────────────────────────
const SC_T1_WAGER_LEVELS    = 50;
const SC_T1_WAGER_BASE_COST = 5;
const SC_T1_WAGER_SCALE     = 1.35;
const SC_T1_WAGER_PER_LEVEL = 0.094;   // +9.4% per level; 50 levels = ~100x total

const SC_T1_ROLLRATE_LEVELS    = 50;
const SC_T1_ROLLRATE_BASE_COST = 3;
const SC_T1_ROLLRATE_SCALE     = 1.35;
const SC_T1_ROLLRATE_PER_LEVEL = 0.035; // -3.5% interval per level; 50 levels = ~5x faster

const SC_T1_CAPACITY_LEVELS    = 20;
const SC_T1_CAPACITY_BASE_COST = 30;
const SC_T1_CAPACITY_SCALE     = 1.40;
const SC_T1_CAPACITY_PER_LEVEL = 5;    // +5 floor capacity per level

// ─── Machine Slots ────────────────────────────────────────────────────────────
const MACHINE_SLOT_CAP_START = 4;
const MACHINE_BASE_COST      = 20;
const MACHINE_COST_SCALE     = 3.0;   // machine 2: $20, 3: $60, 4: $180

// ─── Machine Level Upgrade (combined: payout + speed) ────────────────────────
const MACH_LEVEL_MAX           = 10;
const MACH_LEVEL_BASE_COST     = 200;
const MACH_LEVEL_COST_SCALE    = 3.0;    // $200, $600, $1800, $5400...
const MACH_LEVEL_PAYOUT_FACTOR = 1.5;   // payout x1.5 per level (multiplicative)
const MACH_LEVEL_SPEED_FACTOR  = 0.85;  // spin interval x0.85 per level (multiplicative)

// ─── Crowd Persons (visual) ──────────────────────────────────────────────────
const CROWD_PERSON_LIFETIME_MIN = 45;
const CROWD_PERSON_LIFETIME_MAX = 120;
const CROWD_PERSON_SPEED_MIN    = 50;
const CROWD_PERSON_SPEED_MAX    = 80;
const CROWD_PERSON_SIZE         = 7;
const CROWD_PERSON_BOB_FREQ     = 3.5;
const CROWD_PERSON_BOB_AMP      = 2;

// ─── Particles ───────────────────────────────────────────────────────────────
const FLOAT_DRIFT_SPEED   = -1.2;
const FLOAT_DECAY         = 0.97;
const FLOAT_LIFETIME      = 1.6;
const FLOAT_FONT_SMALL    = 8;
const FLOAT_FONT_MEDIUM   = 10;
const FLOAT_FONT_LARGE    = 13;
const FLOAT_LARGE_THRESH  = 20;

const SPARK_COUNT         = 14;
const SPARK_SPEED_MIN     = 1.5;
const SPARK_SPEED_MAX     = 5.5;
const SPARK_GRAVITY       = 0.07;
const SPARK_AIR_RES       = 0.96;
const SPARK_LIFE_MIN      = 0.4;
const SPARK_LIFE_MAX      = 0.9;
const SPARK_BIG_THRESH    = 14;

// ─── Floor ───────────────────────────────────────────────────────────────────
const FLOOR_COLS_START    = 6;
const FLOOR_ROWS_START    = 6;
const FLOOR_COLS_EXPANDED = 10;
const FLOOR_ROWS_EXPANDED = 10;
const FLOOR_EDGE_BUFFER   = 1;
const FLOOR_ORIGIN_Y_PAD  = 10;

// ─── Machine Visual ──────────────────────────────────────────────────────────
const MACHINE_SHAKE_THRESH = 14;
const MACHINE_BOX_H_SLOT   = 58;

// ─── Supercomputer Visual ────────────────────────────────────────────────────
const SC_BOX_H = 88;

// ─── Game Loop ────────────────────────────────────────────────────────────────
const DT_CAP          = 0.1;
const UI_UPDATE_EVERY = 6;
const IPS_WINDOW      = 5;

// ─── CRT Overlay ─────────────────────────────────────────────────────────────
const CRT_GRAIN_SIZE       = 200;
const CRT_GRAIN_OPACITY    = 0.55;
const CRT_SCANLINE_EVERY   = 3;
const CRT_SCANLINE_OPACITY = 0.18;
const CRT_VIGNETTE_OPACITY = 0.62;
const CRT_FLICKER_CHANCE   = 0.006;
const CRT_CANVAS_OPACITY   = 0.35;
