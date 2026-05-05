# Cashino - Changelog

All notable changes are documented here. Format: `## [version] YYYY-MM-DD - short description`.
The top entry is always the most recent push. Entries are added before every commit that changes gameplay, UI, or structure.

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
