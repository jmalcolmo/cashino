# Cashino - Changelog

All notable changes are documented here. Format: `## [version] YYYY-MM-DD - short description`.
The top entry is always the most recent push. Entries are added before every commit that changes gameplay, UI, or structure.

---

## [0.5.1] 2026-05-05 - Spin table rebalance: reduced jackpot rate and loss payout

### Changed
- SPIN_JACKPOT_CHANCE reduced 80% (0.05 -> 0.01) to make jackpots much rarer
- SPIN_SMALL_WIN_CHANCE increased from 0.55 to 0.59 to absorb freed probability
- Loss payout range reduced from -$9/-$4 to -$5/-$2 (smaller player wins on loss events)

---

## [0.5.0] 2026-05-05 - Supercomputer upgrades, floor crowd system, machine panels, economy reset

### Added
- Supercomputer entity: isometric server-rack visual positioned left of the floor; clicking opens global upgrade panel
- Tier 1 supercomputer upgrades: Wager Boost (50 levels, +9.4%/level, ~100x at max), Roll Rate (50 levels, -3.5%/level, ~5x faster at max), Floor Capacity (20 levels, +5 cap/level)
- Floor population system: clicking any floor tile spawns 1 visual crowd person at that location and increments `State.floorPopulation`; population decays at 1 person/8s passively; crowd multiplier = 1 + (population/capacity) applied to all spin results (max 2x at full cap)
- CrowdPerson visual entity (replaces Customer): spawns at click location, wanders to machines or random tiles, idles, occasionally cheers (arm animation + glow), then fades out and leaves after random lifetime (45-120s)
- Machine local upgrade panel: clicking a machine opens a contextual panel with Spin Rate (10 levels, -10%/level) and Payout (10 levels, +20%/level) upgrades, plus Buy Machine button
- Machine slot cap starts at 4; costs scale $20 - $60 - $180 per additional machine
- `formatMoney()` utility in constants.js: formats K/M/B/T/Qa suffixes for large numbers
- `MachineShop` in shop.js handles all machine purchase and local upgrade logic
- `SC_UPGRADES` array in supercomputer.js - extensible tier structure for future tiers

### Changed
- Machines now spin passively at all times (no customer seating required); crowd multiplier replaces the old customer-count multiplier
- Starting money reset to $0; first upgrades cost $3-5 and are reachable within seconds of spawning a crowd
- Old shop panel (right side) repurposed as status panel: shows balance, IPS, crowd count/bar/multiplier, and hint text
- `customer.js` file now contains `CrowdPerson` class (visual only); old `Customer` mechanic removed entirely
- `shop.js` now contains `MachineShop` (was `SHOP_ITEMS` + `Shop`)
- All spin particle labels now use `formatMoney()` for proper K/M/B/T formatting at high upgrade levels
- Removed: splitscreen, click multiplier, auto clicker, old shop upgrades, spin speed mult, all legacy customer spawn/assign logic

### Fixed
- Supercomputer panel clipping: anchored top-right in canvas area instead of center to avoid overflow on narrow canvases

---

## [0.4.0] 2026-05-04 - Click-to-spin system, repeatable Power Click upgrade

### Changed
- Clicking a machine now directly triggers an immediate spin instead of applying a speed boost to the spin timer
- Power Click is now a repeatable upgrade (max 18 purchases, x1.8 cost scale) that adds +0.5 spins per click per purchase, stacking to a 10x click multiplier
  - The fractional part uses a per-machine accumulator: at 1.5x, clicks alternate between 1 and 2 spins
- Auto Clicker now triggers `applyClick` instead of a boost, meaning it fires real spins and benefits from Power Click upgrades
- Removed Extended Boost upgrade: the boost duration concept no longer applies with the new system

### Removed
- Click boost system entirely: `machine.clickBoost`, `machine.clickBoostTimer`, boost decay logic, boost ring visual, speed multiplier label above machines
- `CLICK_BOOST_PER_CLICK`, `CLICK_BOOST_PER_CLICK_UPGRADED`, `CLICK_BOOST_MAX`, `CLICK_BOOST_DURATION`, `CLICK_BOOST_DURATION_UPGRADED` constants
- `SHOP_EXTENDED_BOOST_COST` constant
- `applyClickBoost()` function in main.js

### Added
- `Machine.doSpin()` public method: executes one spin (including shake and customers.length multiplier); called by both the passive timer and click handlers
- `processSpinResult(machine, amount)` helper in main.js: extracted from the game loop, handles money, IPS recording, and particle spawning
- `applyClick(machine)` in main.js: the single entry point for player clicks and auto-clicker; uses `machine.clickAccum` for fractional multiplier handling
- `machine.clickAccum` field: carries over the fractional part of the click multiplier between clicks

---

## [0.3.0] 2026-05-04 - HUD earnings history, splitscreen upgrade, economy rebalance

### Added
- HUD earnings history panel below the balance: three rows showing previous vs current window totals for 1 minute, 5 minutes, and 1 hour
  - Left value = previous complete window; shows "--" until enough time has elapsed
  - Right value = current rolling window; updates every 6 frames
  - Values turn red if net earnings are negative for that window
- SPLITSCREEN upgrade ($15,000): each slot machine seats 2 customers at once; spin income multiplied by customer count, effectively doubling per-machine output
- `spawnCustomersForMachine(m)` helper in main.js - respects splitscreen state when placing new machines
- `earningsInWindow(t0, t1)` helper in main.js - sums net earnings over any time range from the rolling history buffer (up to 2 hours retained)

### Changed
- Balance display font size doubled: 15px -> 30px
- Starting money: $250 -> $150
- First slot machine cost: $500 -> $200 (second machine ~$290, scaling unchanged at x1.45)
- Multi-customer positioning: first customer sits slightly left, second slightly right of machine center (index-based offset replacing pure random)
- Machine spin result is now multiplied by `customers.length`, so splitscreen truly doubles per-spin income (and loss variance)

---

## [0.2.1] 2026-05-04 - Show effective speed multiplier above each machine

### Changed
- Replaced the customer count badge (always showed "x1", looked like a multiplier) and the "+N%" boost label with a single persistent speed multiplier label
- At base: dim "1.0x" in dark teal; when boosted: bright cyan "1.3x" etc. with glow
- Pulsing ring remains when boost is active; multiplier label is always visible

---

## [0.2.0] 2026-05-04 - Replace Hype mechanic with machine click boost

### Changed
- Removed Hype the Floor entirely: no hype button, no H key, no HypePulse particle, no hype cooldown, no radius, no customer speed boost
- Canvas clicks now detect which machine tile was clicked and apply a speed boost to that machine
- Each click adds +0.1x to the machine's spin countdown speed (stacks up to +1.0x, max 2x total speed)
- Boost timer resets to 5s on each click; machine returns to base speed after 5s of no clicks
- Boosted machines show a pulsing cyan ring and a "+N%" label above them

### Replaced shop upgrades
- FASTER HYPE -> POWER CLICK ($900): doubles boost per click from +0.1x to +0.2x
- MEGA HYPE -> EXTENDED BOOST ($2,200): extends boost duration from 5s to 8s
- HYPE MAN NPC -> AUTO CLICKER ($4,500): phantom clicks a random machine every 8s

### Architecture
- `applyClickBoost(machine)` in main.js is the single entry point for both player clicks and the auto-clicker
- `State.clickBoostPerClick`, `State.clickBoostMax`, `State.clickBoostDuration` are runtime-upgradeable
- `constants.js` now loaded first in index.html (was missing from script tags)
- Removed `HypePulse` class from particle.js, `boostTimer` from Customer, hype state from State

---

## [0.1.0] 2026-05-04 - Initial commit

### Added
- Isometric casino floor (6×6 grid) with painter's-algorithm depth sort
- Slot machine system: spin table, floating income text, per-machine shake on big payouts
- Customer system: spawn, pathfind to machine, idle bob animation
- Particle system: FloatingText, Spark burst, HypePulse ring
- CRT overlay: animated grain, scanlines, vignette, random flicker
- Shop panel: 6 upgrade items with hotkey support and affordability states
- Hype mechanic: player-triggered speed boost for nearby customers
- Full keyboard + mouse input parity
- `js/constants.js` - all magic numbers centralized here

### Architecture
- Zero build step - plain HTML/CSS/JS loaded in dependency order via `<script>` tags
- `state.js` is the single source of truth for all mutable game state
