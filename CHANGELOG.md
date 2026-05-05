# Cashino - Changelog

All notable changes are documented here. Format: `## [version] YYYY-MM-DD - short description`.
The top entry is always the most recent push. Entries are added before every commit that changes gameplay, UI, or structure.

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
