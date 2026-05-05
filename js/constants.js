// ─── Isometric Grid ────────────────────────────────────────────────────────
const TILE_W = 96;
const TILE_H = 48;

// ─── Economy ────────────────────────────────────────────────────────────────
const STARTING_MONEY = 250;

// Slot machine base spin table
const SPIN_SMALL_WIN_CHANCE   = 0.55;
const SPIN_LOSS_CHANCE        = 0.20;
const SPIN_MEDIUM_WIN_CHANCE  = 0.20;
const SPIN_JACKPOT_CHANCE     = 0.05;

const SPIN_SMALL_WIN_MIN   =  3;
const SPIN_SMALL_WIN_MAX   =  6;
const SPIN_LOSS_MIN        = -9;   // negative = customer wins
const SPIN_LOSS_MAX        = -4;
const SPIN_MEDIUM_WIN_MIN  =  5;
const SPIN_MEDIUM_WIN_MAX  = 10;
const SPIN_JACKPOT_MIN     = -28;  // negative = customer jackpot
const SPIN_JACKPOT_MAX     = -14;

// ─── Spin Timing ────────────────────────────────────────────────────────────
const SPIN_INTERVAL_BASE  = 2.2;   // seconds between spins (base)
const SPIN_JITTER_MIN     = 0.85;
const SPIN_JITTER_RANGE   = 0.30;  // jitter = JITTER_MIN + rand * JITTER_RANGE
const SPIN_SPEED_MULT     = 0.80;  // multiplied per "Spin Faster" upgrade

// ─── Hype Mechanic ──────────────────────────────────────────────────────────
const HYPE_COOLDOWN_BASE    = 5;    // seconds
const HYPE_COOLDOWN_UPGRADE = 3;    // after "Faster Hype" upgrade
const HYPE_BOOST_DURATION   = 3;    // seconds customers stay boosted
const HYPE_RADIUS_BASE      = 160;  // px
const HYPE_RADIUS_UPGRADE   = 320;  // after "Mega Hype" upgrade
const HYPE_SPEED_MULT       = 2.2;  // movement speed multiplier when boosted
const HYPE_MAN_INTERVAL     = 10;   // seconds between auto-hypes (Hype Man NPC)

// ─── Customer ───────────────────────────────────────────────────────────────
const CUSTOMER_SPEED_MIN  = 65;  // px/sec
const CUSTOMER_SPEED_MAX  = 90;
const CUSTOMER_SIZE       = 7;   // radius in px
const CUSTOMER_BOB_FREQ   = 3.5; // sin frequency for idle bob
const CUSTOMER_BOB_AMP    = 2;   // px amplitude
const CUSTOMER_SPAWN_JITTER = 15; // ±px horizontal jitter at floor entrance

// ─── Particles ──────────────────────────────────────────────────────────────
// FloatingText
const FLOAT_DRIFT_SPEED   = -1.2;  // px/frame (upward)
const FLOAT_DECAY         = 0.97;  // velocity multiplier per frame
const FLOAT_LIFETIME      = 1.6;   // seconds
const FLOAT_FONT_SMALL    = 8;
const FLOAT_FONT_MEDIUM   = 10;
const FLOAT_FONT_LARGE    = 13;
const FLOAT_LARGE_THRESH  = 20;    // |amount| >= this → large font

// Spark burst
const SPARK_COUNT         = 14;    // sparks per burst
const SPARK_SPEED_MIN     = 1.5;
const SPARK_SPEED_MAX     = 5.5;
const SPARK_GRAVITY       = 0.07;  // px/frame² downward pull
const SPARK_AIR_RES       = 0.96;  // vx multiplier per frame
const SPARK_LIFE_MIN      = 0.4;   // seconds
const SPARK_LIFE_MAX      = 0.9;
const SPARK_BIG_THRESH    = 14;    // |amount| >= this → spawn spark burst

// HypePulse
const PULSE_DURATION      = 0.55;  // seconds to fully expand
const PULSE_STROKE_WIDTH  = 3;     // px

// ─── Shop / Upgrades ─────────────────────────────────────────────────────────
const SHOP_SLOT_MACHINE_COST  =   500;
const SHOP_SLOT_MACHINE_SCALE = 1.45;
const SHOP_SLOT_MACHINE_MAX   =     8;

const SHOP_FASTER_HYPE_COST   =   900;
const SHOP_MEGA_HYPE_COST     =  2200;
const SHOP_SPIN_FASTER_COST   =  1100;
const SHOP_SPIN_FASTER_SCALE  =   2.2;
const SHOP_SPIN_FASTER_MAX    =     3;
const SHOP_HYPE_MAN_COST      =  4500;
const SHOP_EXPAND_FLOOR_COST  =  6000;
const SHOP_ONE_TIME_SCALE     =    99; // effectively prevents repurchase

// ─── Floor ──────────────────────────────────────────────────────────────────
const FLOOR_COLS_START    = 6;
const FLOOR_ROWS_START    = 6;
const FLOOR_COLS_EXPANDED = 10;
const FLOOR_ROWS_EXPANDED = 10;
const FLOOR_EDGE_BUFFER   = 1;   // tiles from edge that cannot be occupied
const FLOOR_ORIGIN_Y_PAD  = 10;  // extra px to push floor down from center

// ─── Machine ─────────────────────────────────────────────────────────────────
const MACHINE_SHAKE_THRESH = 14; // |amount| >= this → trigger shake
const MACHINE_BOX_H_SLOT   = 48; // isometric box height for slot machine (px)

// ─── Game Loop ───────────────────────────────────────────────────────────────
const DT_CAP          = 0.1;   // seconds — max delta-time per frame
const UI_UPDATE_EVERY = 6;     // frames between DOM updates
const IPS_WINDOW      = 5;     // seconds for rolling income-per-second average

// ─── CRT Overlay ─────────────────────────────────────────────────────────────
const CRT_GRAIN_SIZE      = 200;  // noise tile dimensions (px)
const CRT_GRAIN_OPACITY   = 0.55;
const CRT_SCANLINE_EVERY  = 3;    // every Nth row gets a scanline
const CRT_SCANLINE_OPACITY= 0.18;
const CRT_VIGNETTE_OPACITY= 0.62;
const CRT_FLICKER_CHANCE  = 0.006; // per-frame probability of a flicker line
const CRT_CANVAS_OPACITY  = 0.35;  // CSS opacity of the overlay canvas
