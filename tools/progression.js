#!/usr/bin/env node
// Run from project root: node tools/progression.js
// Simulates the "always buy cheapest upgrade" path using live values from constants.js.
// Re-run any time constants or shop costs change to see updated timings.

const fs   = require('fs');
const path = require('path');

// Load all numeric constants from constants.js into a plain object
const rawSrc = fs.readFileSync(path.join(__dirname, '../js/constants.js'), 'utf8');
const constNames = [...rawSrc.matchAll(/^const\s+(\w+)/gm)].map(m => m[1]);
// eslint-disable-next-line no-new-func
const C = new Function(
  rawSrc.replace(/\bconst\b/g, 'var') + `\nreturn {${constNames.join(',')}};`
)();

const {
  STARTING_MONEY,
  SPIN_SMALL_WIN_CHANCE, SPIN_LOSS_CHANCE, SPIN_MEDIUM_WIN_CHANCE, SPIN_JACKPOT_CHANCE,
  SPIN_SMALL_WIN_MIN, SPIN_SMALL_WIN_MAX,
  SPIN_LOSS_MIN, SPIN_LOSS_MAX,
  SPIN_MEDIUM_WIN_MIN, SPIN_MEDIUM_WIN_MAX,
  SPIN_JACKPOT_MIN, SPIN_JACKPOT_MAX,
  SPIN_INTERVAL_BASE, SPIN_SPEED_MULT,
  CLICK_BOOST_PER_CLICK, CLICK_BOOST_PER_CLICK_UPGRADED,
  SHOP_SLOT_MACHINE_COST, SHOP_SLOT_MACHINE_SCALE, SHOP_SLOT_MACHINE_MAX,
  SHOP_POWER_CLICK_COST, SHOP_SPIN_FASTER_COST, SHOP_SPIN_FASTER_SCALE, SHOP_SPIN_FASTER_MAX,
  SHOP_AUTO_CLICK_COST, SHOP_EXPAND_FLOOR_COST,
  SHOP_SPLITSCREEN_COST, SHOP_ONE_TIME_SCALE,
  POWER_CLICK_MULT_PER_PURCHASE, SHOP_POWER_CLICK_SCALE, POWER_CLICK_MAX,
} = C;

// ─── Economy ────────────────────────────────────────────────────────────────

const spinEV =
  SPIN_SMALL_WIN_CHANCE  * (SPIN_SMALL_WIN_MIN  + SPIN_SMALL_WIN_MAX)  / 2 +
  SPIN_LOSS_CHANCE       * (SPIN_LOSS_MIN        + SPIN_LOSS_MAX)        / 2 +
  SPIN_MEDIUM_WIN_CHANCE * (SPIN_MEDIUM_WIN_MIN  + SPIN_MEDIUM_WIN_MAX)  / 2 +
  SPIN_JACKPOT_CHANCE    * (SPIN_JACKPOT_MIN     + SPIN_JACKPOT_MAX)     / 2;

// ─── Shop items (mirrors shop.js without game object dependencies) ───────────

const ITEMS = [
  { id: 'slot_machine', name: 'SLOT MACHINE', baseCost: SHOP_SLOT_MACHINE_COST, scale: SHOP_SLOT_MACHINE_SCALE, max: SHOP_SLOT_MACHINE_MAX },
  { id: 'power_click',  name: 'POWER CLICK',  baseCost: SHOP_POWER_CLICK_COST,  scale: SHOP_POWER_CLICK_SCALE,  max: POWER_CLICK_MAX },
  { id: 'spin_faster',  name: 'SPIN FASTER',  baseCost: SHOP_SPIN_FASTER_COST,  scale: SHOP_SPIN_FASTER_SCALE,  max: SHOP_SPIN_FASTER_MAX },
  { id: 'auto_click',   name: 'AUTO CLICKER', baseCost: SHOP_AUTO_CLICK_COST,   scale: SHOP_ONE_TIME_SCALE,     max: 1 },
  { id: 'expand_floor', name: 'EXPAND FLOOR', baseCost: SHOP_EXPAND_FLOOR_COST, scale: SHOP_ONE_TIME_SCALE,     max: 1 },
  { id: 'splitscreen',  name: 'SPLITSCREEN',  baseCost: SHOP_SPLITSCREEN_COST,  scale: SHOP_ONE_TIME_SCALE,     max: 1 },
];

// ─── Simulation state ────────────────────────────────────────────────────────

const bought = {};
ITEMS.forEach(i => { bought[i.id] = 0; });

let money       = STARTING_MONEY;
let machines    = 1;  // 1 free starter machine
let spinIntv    = SPIN_INTERVAL_BASE;
let splitscreen = false;
let autoClicker = false;
let clickMult   = 1.0;  // spins per click; increases with Power Click

function itemCost(item) {
  return Math.round(item.baseCost * Math.pow(item.scale, bought[item.id]));
}

// Passive income per second at current state (no player clicking assumed).
// Auto clicker fires 1 click every AUTO_CLICK_INTERVAL seconds on a random machine,
// triggering clickMult spins on that machine.
function ips() {
  const baseRate  = spinEV / spinIntv;
  const customers = splitscreen ? 2 : 1;
  let income      = machines * baseRate * customers;
  if (autoClicker) {
    income += (1 / AUTO_CLICK_INTERVAL) * clickMult * spinEV * customers;
  }
  return income;
}

function cheapest() {
  let best = null;
  for (const item of ITEMS) {
    if (bought[item.id] >= item.max) continue;
    if (!best || itemCost(item) < itemCost(best)) best = item;
  }
  return best;
}

function applyPurchase(item) {
  switch (item.id) {
    case 'slot_machine':   machines++;          break;
    case 'power_click':    clickMult  += POWER_CLICK_MULT_PER_PURCHASE; break;
    case 'spin_faster':    spinIntv   *= SPIN_SPEED_MULT; break;
    case 'auto_click':     autoClicker = true;  break;
    case 'splitscreen':    splitscreen = true;  break;
    default: break; // extended_boost, expand_floor: no passive income change
  }
  bought[item.id]++;
}

// ─── Run simulation ──────────────────────────────────────────────────────────

const rows = [];
let elapsed = 0;

rows.push({ label: 'Free Slot Machine', cost: 0, machines, income: ips(), wait: 0, elapsed: 0 });

for (;;) {
  const next = cheapest();
  if (!next) break;

  const c    = itemCost(next);
  const rate = ips();
  const wait = money >= c ? 0 : (c - money) / rate;

  elapsed += wait;
  money   += wait * rate;
  money   -= c;

  applyPurchase(next);

  const n = bought[next.id];
  let label;
  if      (next.id === 'slot_machine') label = `Slot Machine #${n}`;
  else if (next.id === 'spin_faster')  label = `Spin Faster x${n}`;
  else if (next.id === 'power_click')  label = `Power Click (${clickMult.toFixed(1)}x)`;
  else                                 label = next.name;

  rows.push({ label, cost: c, machines, income: ips(), wait, elapsed });
}

// ─── Format helpers ──────────────────────────────────────────────────────────

function fmtTime(s) {
  const h   = Math.floor(s / 3600);
  const m   = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  return `${m}:${String(sec).padStart(2,'0')}`;
}

function fmtMoney(n) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ─── Print table ─────────────────────────────────────────────────────────────

const COL = [22, 9, 10, 11, 8, 10];
const headers = ['Purchase', 'Cost', 'Machines', 'Income/s', 'Wait', 'Elapsed'];
const sep = COL.map(w => '-'.repeat(w)).join('');

console.log('\n=== CASHINO PROGRESSION (cheapest-first, passive income only) ===\n');
console.log(`EV/spin: ${fmtMoney(spinEV)}   Interval: ${SPIN_INTERVAL_BASE}s base   Start money: ${fmtMoney(STARTING_MONEY)}`);
console.log();
console.log(headers.map((h, i) => h.padEnd(COL[i])).join(''));
console.log(sep);

for (const r of rows) {
  const cols = [
    r.label.padEnd(COL[0]),
    (r.cost === 0 ? '--' : fmtMoney(r.cost)).padEnd(COL[1]),
    String(r.machines).padEnd(COL[2]),
    fmtMoney(r.income).padEnd(COL[3]),
    (r.wait === 0 ? '--' : fmtTime(r.wait)).padEnd(COL[4]),
    fmtTime(r.elapsed).padEnd(COL[5]),
  ];
  console.log(cols.join(''));
}

console.log(sep);
console.log(`\nTotal purchases: ${rows.length - 1}`);
console.log(`Final income:    ${fmtMoney(ips())}`);
console.log(`Total game time: ${fmtTime(elapsed)}\n`);
