# IDLE CASINO - Game Design Document
**Version:** 0.1 (Milestone 1 scaffold)
**Stack:** Vanilla JS · Canvas2D · HTML/CSS · No build step

---

## 1. Vision & Aesthetic

### 1.1 Core Feeling
This is an idle game that looks like it could run on an old-school arcade cabinet. Not polished or corporate - grainy, vibrant, slightly chaotic. The player should feel like they own a seedy, neon-soaked casino where money visibly flows in and out in real time.

### 1.2 Visual Direction
- **CRT aesthetic:** Grain overlay (animated per-frame noise texture), scanline pass (every 3px), screen vignette, and occasional horizontal flicker lines. Implemented as a second canvas layered on top of the game canvas at reduced opacity.
- **Color palette:** Near-black backgrounds (`#04010a`), neon pink (`#ff0090`), electric blue (`#00d4ff`), gold (`#ffd700`), hot green (`#39ff14`), blood red (`#ff3333`), deep purple (`#9b30ff`). Everything glows. No flat colors.
- **Font:** Press Start 2P (Google Fonts) - used for all text including the HUD, shop panel, floating dollar amounts, and badges.
- **Isometric perspective:** All game objects rendered on an isometric tile grid. Machines physically occupy tile space. Customers walk in world-space.
- **No screen shake.** Individual machines shake on big payouts - not the whole screen.

### 1.3 Anti-"Claude Game" Principles
- No clean sans-serif UI
- No flat pastel colors
- No minimalist whitespace
- Everything should feel slightly overstimulating - neon bleed, glow, grain, animated lights
- Money text should feel urgent and real, not decorative

---

## 2. Tech Architecture

### 2.1 Render Split
| Layer | Technology | Purpose |
|---|---|---|
| Game canvas (`#game-canvas`) | Canvas2D | Isometric floor, machines, customers, particles |
| CRT overlay (`#crt-canvas`) | Canvas2D (pointer-events: none) | Grain, scanlines, vignette - drawn every frame |
| Shop panel (`#shop-panel`) | HTML/CSS | Upgrade list, balance, income rate - updated ~10×/sec |
| HUD (`#hud`) | HTML/CSS (absolute overlay) | Balance display, Hype button |

### 2.2 File Structure
```
idle-casino/
├── index.html
├── style.css
├── game_design.md
├── .claude/
│   └── launch.json        - preview server config (npx serve, port 3457)
└── js/
    ├── iso.js             - isometric math (toScreen, toTile, drawTile, drawBox)
    ├── state.js           - central mutable game state object
    ├── particle.js        - FloatingText, Spark, HypePulse classes
    ├── machine.js         - MACHINE_DEFS, Machine class
    ├── customer.js        - Customer class
    ├── floor.js           - Floor class (tile grid)
    ├── shop.js            - SHOP_ITEMS array, Shop purchase logic
    ├── renderer.js        - Renderer (draws floor, entities, particles)
    ├── crt.js             - CRT overlay rendering
    ├── ui.js              - HTML shop panel + HUD DOM updates
    ├── input.js           - Unified mouse + keyboard input
    └── main.js            - init(), gameLoop(), helpers (triggerHype, spawnCustomer, recalcOrigin)
```

### 2.3 Load Order (script tags)
`iso → state → particle → machine → customer → floor → shop → renderer → crt → ui → input → main`

All cross-module references that are only needed at runtime (e.g. `spawnCustomer` called from shop item effects) safely resolve because they execute after `main.js` runs.

### 2.4 Game Loop
- `requestAnimationFrame` - uncapped frame rate
- Delta time capped at 100ms per frame to prevent spiral-of-death on tab blur
- `State.tick` accumulates total elapsed seconds
- UI DOM updated every 6 frames (~10×/sec) to avoid layout thrash

### 2.5 Isometric Math (`iso.js`)
```
TILE_W = 96px, TILE_H = 48px

toScreen(col, row, originX, originY):
  x = (col - row) * TILE_W/2 + originX
  y = (col + row) * TILE_H/2 + originY
  → returns top-vertex of the tile diamond

toTile(screenX, screenY, originX, originY):
  → inverse of above, returns { col, row }

drawTile(ctx, sx, sy, fill, stroke):
  → draws the flat diamond (4 vertices from top-vertex)

drawBox(ctx, sx, sy, boxH, colors):
  → draws a 3-faced isometric box (right face, left face, top face)
  → sx,sy = top-vertex of the tile footprint the box sits on
  → boxH = how many pixels the box rises above the tile
  → colors: { top, left, right, topStroke, sideStroke }
```

**Depth sorting (painter's algorithm):** All drawable entities (machines + customers) are collected into one array, sorted by `col + row` ascending, then drawn in order. Customers get `depth = tile.col + tile.row + 0.5` so they always render in front of machines on the same diagonal.

### 2.6 Floor Centering
```javascript
floorOriginX = canvasWidth / 2
floorOriginY = Math.round((canvasHeight - floorHeight) / 2) + 10

floorHeight = (floor.cols + floor.rows) * TILE_H / 2
```
Origin re-calculated on window resize and after floor expansion.

---

## 3. Game State (`state.js`)

```javascript
State = {
  money,           // current player balance (float)
  totalEarned,     // lifetime earnings (for stats/achievements later)
  incomePerSecond, // rolling 5-second average

  machines[],      // array of Machine instances
  customers[],     // array of Customer instances
  particles[],     // array of FloatingText | Spark | HypePulse

  floor,           // Floor instance

  hype: {
    cooldown,        // seconds remaining (counts down to 0)
    COOLDOWN_MAX,    // 5s base, upgradeable to 3s
    BOOST_DURATION,  // 3s customer boost duration
    RADIUS,          // 160px base, upgradeable to 320px
  },

  spinSpeedMult,   // starts at 1.0, multiplied by 0.80 per speed upgrade

  canvas, ctx,
  crtCanvas,
  floorOriginX, floorOriginY,
  tick, lastTime,

  // Hype Man NPC (null until upgrade purchased)
  hypeManTimer,
  hypeManInterval,
}
```

---

## 4. Economy & Math

### 4.1 Design Principle
The house always wins in aggregate. Individual spins can and do go negative (customer hits jackpot, player visibly loses that money). The chaos is part of the appeal - income fluctuates wildly but trends upward.

### 4.2 Slot Machine Spin Table (current)
| Outcome | Probability | House Amount | Label |
|---|---|---|---|
| Small win | 55% | +$3–$6 | `win` |
| Customer win | 20% | −$4–$9 | `loss` |
| Medium win | 20% | +$5–$10 | `win` |
| Jackpot payout | 5% | −$14–$28 | `jackpot` |

**Expected value per spin (house):**
`0.55×4.5 + 0.20×(−6.5) + 0.20×7.5 + 0.05×(−21) = ~$1.63/spin`

**Base spin interval:** 2.2 seconds ± 15% jitter

**Net income per machine (base):** ~$0.74/sec

### 4.3 Starting Economy
- Starting money: **$250**
- First purchasable slot machine: **$500**
- Player must earn ~$250 before first upgrade - creates early engagement loop
- Second machine at $500 × 1.45¹ = **$725**, etc.

### 4.4 Income Rolling Average
```
State.incomePerSecond = (sum of all spin amounts in last 5s) / min(tick, 5)
```
Shown in shop panel as `▲ $X.XX/s` (green) or `▼ $X.XX/s` (red).

---

## 5. Machine System

### 5.1 Machine Class
Each `Machine` instance has:
- `type` - string key into `MACHINE_DEFS`
- `col, row` - tile position on the floor
- `customers[]` - Customer instances currently using this machine
- `spinInterval` - seconds between spins (modified by speed upgrades)
- `spinTimer` - countdown to next spin (staggered on spawn via random seed)
- `shakeTimer, shakeAmount` - drives per-machine shake on big payouts
- `reelPhase` - running phase accumulator for animated reel light cycling
- `active` - reserved for future enable/disable mechanic

### 5.2 Spin Logic
1. Timer counts down by delta-time each frame
2. When `spinTimer <= 0`: roll random, walk through spin table cumulative probabilities, return house profit amount
3. Amount returned to `main.js` which: adds to `State.money`, spawns `FloatingText`, spawns `Spark` burst if `|amount| >= 14`, triggers machine shake if `|amount| >= 14`
4. `spinTimer` resets to `spinInterval × (0.85 + random × 0.3)` - jitter prevents all machines from spinning simultaneously

### 5.3 Machine Definitions (`MACHINE_DEFS`)
Each definition contains:
- `name` - display name
- `tileSize` - 1 for slot machines, 2 for tables (future)
- `maxCustomers` - max simultaneously seated customers
- `baseSpinInterval` - before speed upgrades
- `boxH` - isometric box height in pixels
- `colors` - `{ top, left, right, topStroke, sideStroke }` for `drawBox`
- `accentColor` - neon color for lights and glow
- `spinTable[]` - array of `{ chance, label, amount }` entries summing to 1.0

### 5.4 Machine Progression (planned)
| Tier | Name | Tile Size | Max Customers | Spin Interval | Notes |
|---|---|---|---|---|---|
| 1 | Slot Machine | 1×1 | 1 | 2.2s | Current |
| 2 | Poker Machine | 1×1 | 1 | 1.8s | Faster, higher variance |
| 3 | Blackjack Table | 2×2 | 4 | 4.0s | Multi-customer, dealer NPC |
| 4 | Craps Table | 2×3 | 6 | 5.0s | Biggest win animations, crowd forms |
| 5+ | TBD | - | - | - | Escalates from there |

Higher tier machines should feel meaningfully busier: more customers crowding around, dealer NPCs, bigger/louder win animations.

### 5.5 Machine Visual Rendering
Drawn in `renderer._drawMachine`:
1. `ISO.drawBox` - main cabinet (3 faces, neon top edge)
2. Animated reel light - color cycles through neon palette using `reelPhase`, pulsing arc on top face
3. Spin progress lights - two small dots on the top face pulse in sync with spin countdown
4. Customer count badge - `×N` above machine when customers are seated
5. Shake offset - if `shakeTimer > 0`, random x/y displacement applied to draw position each frame

---

## 6. Customer System

### 6.1 Customer Class
Each `Customer` instance has:
- `id` - monotonically incrementing for palette cycling
- `x, y` - current screen position (world-space, not tile-space)
- `tx, ty` - target screen position
- `machine` - reference to assigned Machine
- `state` - `'moving'` or `'playing'`
- `color` - cycling from 8-color palette
- `speed` - 65–90 px/sec base movement
- `size` - 7px radius circle
- `bob` - per-customer phase offset for idle bobbing animation
- `boostTimer` - seconds of hype boost remaining

### 6.2 Lifecycle
1. Spawned from `spawnCustomer(machine)` in `main.js`
2. Spawn point: bottom-most diamond vertex of the floor (the entrance), ±15px horizontal jitter
3. `assignMachine(machine)` - sets target position just in front of the machine tile; adds self to `machine.customers[]`
4. Moves toward target at `speed × dt` each frame (linear interpolation)
5. On arrival: state transitions to `'playing'`
6. Machine will only spin if `machine.customers.length > 0`
7. No departure logic yet - customers stay permanently (planned: they leave after N spins, new one arrives)

### 6.3 Customer Rendering
- Drop shadow ellipse below feet
- Body circle with `shadowBlur` glow (color-matched)
- Specular highlight dot (top-left of circle)
- Idle bob: `sin(tick × 3.5 + customer.bob) × 2px` vertical oscillation
- Hype boost: increased glow intensity + double-speed movement

### 6.4 Customer Depth
`depth = ISO.toTile(x, y, ox, oy).col + row + 0.5`

The +0.5 ensures customers always render in front of machines on the same iso diagonal.

### 6.5 Planned: Customer Departure
- Customer plays for N spins then leaves (walks off bottom of floor)
- New customer auto-spawns after a brief cooldown
- Late-game upgrade: VIP lounge keeps customers permanently

---

## 7. Particle System

### 7.1 FloatingText
Spawned every spin at machine screen position.

- Drifts upward at -1.2 px/frame with velocity decay (×0.97)
- Fades out over 1.6 seconds
- Font size scales with payout magnitude: small (8px), medium (10px), large (13px, |amount| ≥ 20)
- Color: green (`#39ff14`) for house wins, red (`#ff3333`) for house losses
- Format: `+$N` or `-$N`
- `shadowBlur: 10` glow in the text color

### 7.2 Spark
Spawned in bursts of 14 on big payouts (`|amount| >= 14`).

- Random angle + speed (1.5–5.5 px/frame)
- Gravity pull (+0.07/frame on vy)
- Air resistance on vx (×0.96/frame)
- Fades over 0.4–0.9 seconds
- Color: gold (`#ffd700`) on wins, red on jackpot losses
- Small filled circles with glow

### 7.3 HypePulse
Spawned on every hype trigger at the click/key position.

- Expands from 0 to `State.hype.RADIUS` over 0.55 seconds
- Outer ring: 3px stroke, cyan glow
- Inner ring: 50% radius, 40% opacity
- Fades out as it expands

### 7.4 Particle Lifecycle
All particles implement `update(dt)` returning `true` if alive, `false` if expired.
`State.particles` is filtered every frame: `State.particles = State.particles.filter(p => p.update(dt))`

---

## 8. Hype the Floor

### 8.1 Mechanic
- Player clicks anywhere on the game canvas OR presses `H`
- A `HypePulse` visual radiates from the click point
- All customers within `State.hype.RADIUS` pixels receive `boostTimer = BOOST_DURATION`
- Boosted customers move 2.2× faster (they play more spins per unit time due to faster seating)
- **Cooldown:** 5 seconds base (upgradeable to 3s)
- Visual indicator: HUD button shows cooldown countdown while on cooldown

### 8.2 Planned: Hype Man NPC
- Purchased via shop upgrade
- An NPC character on the floor who automatically hypes on a timer (every 10 seconds)
- Auto-hypes from the center of the floor
- Walks around the floor between hypes (future enhancement)

---

## 9. Shop System

### 9.1 Shop Panel Layout
- Fixed 300px right-side panel
- `UPGRADES` header in neon pink
- Balance display (gold) + income rate (green/red/grey) beneath header
- Scrollable item list (thin pink scrollbar)
- Footer: hotkey legend `[1–9] BUY · [H] HYPE · [↑↓] SCROLL`

### 9.2 Item Rendering
Each item card shows:
- Hotkey badge `[N]` top-right corner
- Item name (9px white)
- Description text (7px grey, multi-line)
- Cost (gold, or green if affordable)
- `purchased/maxCount` counter (grey, bottom-right)

**Affordability states:**
- `affordable` - green border glow, green cost text, green hotkey badge
- `unaffordable` - 42% opacity, default styling
- `focused` - pink border glow (keyboard navigation)
- `just-bought` - brief green box-shadow flash animation (0.4s)

### 9.3 Cost Scaling
```
cost = baseCost × scaleFactor^purchased
```
`scaleFactor = 99` effectively makes an item one-time (next cost is unaffordable).

### 9.4 Current Shop Items
| # | Name | Base Cost | Scale | Max | Effect |
|---|---|---|---|---|---|
| 1 | SLOT MACHINE | $500 | ×1.45 | 8 | Place new slot machine, spawn 1 customer |
| 2 | FASTER HYPE | $900 | ×99 | 1 | Cooldown 5s → 3s |
| 3 | SPIN FASTER | $1,100 | ×2.2 | 3 | All machines −20% spin interval (stacks) |
| 4 | MEGA HYPE | $2,200 | ×99 | 1 | Hype radius ×2 (160px → 320px) |
| 5 | HYPE MAN NPC | $4,500 | ×99 | 1 | Auto-hype every 10s |
| 6 | EXPAND FLOOR | $6,000 | ×99 | 1 | 6×6 → 10×10 tiles, re-places machines |

### 9.5 Shop Visibility
Items are hidden once `purchased >= maxCount`. The list dynamically rebuilds when item count changes. Affordability classes update every 6 frames without full DOM rebuilds (only inner class changes unless count changed).

### 9.6 Planned Upgrades
- **Lucky Hour:** Temporary 2× income multiplier (purchasable buff, lasts 60s)
- **Extra Seat:** Increase `maxCustomers` for existing machines
- **Better Odds:** Adjust spin table toward higher house win frequency
- **VIP Room:** Unlock a second, premium floor section
- **Dealer NPCs:** Visual addition for table games
- **Prestige:** Reset with a permanent multiplier (very late game)

---

## 10. Input System

### 10.1 Principle
Every action reachable by mouse AND keyboard. Neither is optional.

### 10.2 Keyboard Bindings
| Key | Action |
|---|---|
| `H` | Trigger hype from canvas center |
| `1`–`9` | Purchase shop item at that slot index |
| `↑` / `↓` | Move shop focus up/down |
| `Enter` / `Space` | Purchase currently focused shop item |

### 10.3 Mouse Bindings
| Event | Action |
|---|---|
| Click on game canvas | Trigger hype at click coordinates |
| Click on HUD hype button | Trigger hype from canvas center |
| Click on shop item card | Purchase that item |

### 10.4 Shop Focus Navigation
- `UI.moveFocus(delta)` increments/decrements `_focusIndex` with wraparound
- Scrolls focused element into view (`scrollIntoView({ block: 'nearest' })`)
- Focus index is preserved across renders

---

## 11. Floor System

### 11.1 Floor Class
- 2D grid of `cols × rows` boolean cells (`false` = unoccupied)
- `findFreeTile()` returns random unoccupied interior tile (1 tile from edges)
- `setOccupied(col, row, val)` marks a tile
- `freeCount()` - used to gate shop item availability (prevents purchase if no free tiles)

### 11.2 Starting Floor
- **6×6 tiles**
- Origin re-calculated to center the floor in the canvas on resize
- Starter machine pre-placed at tile `(2, 2)` - free, not purchased
- Player needs to earn before buying the next machine

### 11.3 Floor Entrance
Visual chevron arrows drawn at the bottom-most point of the floor diamond, pulsing gently. Indicates where customers enter. Customers spawn from this point and walk to their assigned machine.

### 11.4 Floor Expansion
Upgrade: **6×6 → 10×10**
- New `Floor(10, 10)` created
- All existing machines relocated to free tiles in the new floor
- Customer target positions recalculated via `assignMachine`
- `recalcOrigin()` called to re-center the larger floor
- Planned: further expansions (10×10 → 14×14, then section unlocks)

---

## 12. CRT Overlay

Rendered every frame on `#crt-canvas`:
1. **Grain:** 200×200 noise tile regenerated each frame, tiled across canvas at 55% opacity - creates animated film grain
2. **Scanlines:** 1px black lines every 3px at 18% opacity
3. **Vignette:** Radial gradient dark edges (`rgba(0,0,0,0)` center → `rgba(0,0,0,0.62)` edge)
4. **Flicker:** 0.6% chance per frame of a semi-transparent horizontal line (1–3px tall) at random y position

The CRT canvas has `opacity: 0.35` in CSS (combined with its internal opacity values = subtle but visible).

---

## 13. Planned Features (Backlog)

### 13.1 Gameplay
- Customer departure + respawn cycle
- Machine enable/disable (toggle machines off during slow periods)
- Prestige system - reset with multiplier
- Lucky Hour / timed buff system
- Achievement unlocks
- News ticker showing recent big wins/losses
- Combo system: consecutive big wins trigger escalating bonuses

### 13.2 Visuals
- Dealer NPC sprites for table games
- Hype Man NPC sprite (currently just logic stub)
- Distinct win/jackpot animations per machine tier
- Crowd density increases visually around hot machines
- Floor tile wear/texture at high-traffic spots
- Neon sign decorations on floor border

### 13.3 Audio (stub)
- Per-machine slot sound (spinning reel)
- Win jingle (ascending notes)
- Jackpot alarm (bells)
- Hype crowd cheer
- Background ambient casino noise
- All triggered from spin logic in `main.js`

### 13.4 Save System
- `localStorage` serialization of: `State.money`, `State.totalEarned`, all machine positions/types, all shop item purchase counts
- Auto-save on tab close (`beforeunload`) and every 30 seconds
- Offline earnings calculation on load (capped at 8 hours)

### 13.5 Second Floor Section
- VIP room unlockable as major milestone
- Different visual theme (red/gold vs. green/pink)
- Higher-variance machines with bigger payouts

---

## 14. Economy Tuning Notes

- **Early game tension:** Start with $250, first machine costs $500. Player must earn $250 before first purchase. At ~$0.74/s that's ~5–6 minutes.
- **Scaling:** Each additional slot costs 45% more. 8 machines = $500 + $725 + $1051 + ... - gets very expensive. Later machines must be cheaper per income unit or player hits a wall.
- **Hype value:** At 5s cooldown with 160px radius, boosting 1 customer for 3s adds maybe 1–2 extra spins per hype cycle. Roughly +$2 per hype at base stats. Not huge - the upgrade that makes hype matter more is `SPIN FASTER`.
- **Math rule:** The spin table for every machine tier must produce positive expected value for the house. It is acceptable (and desirable) for the short-term rolling average to go negative sometimes. The 5-second IPS display will show red during downswings. This is intentional visual chaos.

---

## 15. Isometric Rendering Reference

### Tile coordinate system
```
(0,0) = top of floor diamond
(1,0) = one step right (screen: +48x, +24y)
(0,1) = one step left  (screen: -48x, +24y)
(N,N) = bottom of floor (screen: 0x, +N*48y from origin)
```

### Box faces (for new machine types)
```
Top face:   lightest shade (receives most light)
Left face:  mid shade
Right face: darkest shade

For iso convention: light source is top-left
```

### Tile to screen conversion
```
screenX = (col - row) × 48 + originX
screenY = (col + row) × 24 + originY
```

### Customer position in world space
Customers move in screen pixel space, not tile space. Depth calculated by converting screen position back to approximate tile via `ISO.toTile`.

---

*Last updated: Milestone 1 - isometric floor, single slot machine, one customer, floating income text, shop panel, hype mechanic, CRT overlay.*
