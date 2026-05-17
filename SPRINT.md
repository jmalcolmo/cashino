# Idle Casino - Sprint Plan

**Current Version:** 0.5.1  
**Last Updated:** 2026-05-15

---

## Project Status Overview

**What works:**
- Isometric floor with tile-based machine placement
- Passive machine spins with crowd multiplier (1x to 2x based on floor population)
- Supercomputer Tier 1: Wager, Roll Rate, Floor Capacity upgrades
- Machine local upgrades: Spin Rate, Payout
- CrowdPerson visual entities (wandering NPCs, decay after 45-120s)
- Click-to-spawn crowd mechanic
- CRT overlay aesthetic

**Known gaps:**
- No customer departure/respawn cycle (crowd just decays)
- No machine enable/disable
- No audio system
- No save/load system
- No prestige/endgame reset
- Only 1 machine type (slot machine)
- Supercomputer Tier 2/3 not implemented
- No timed powerups (Lucky Hour)
- No progression milestones or news ticker

---

## Sprint 1: Customer Lifecycle & Crowd Engagement (3-4 days)

### S1.1: Implement Customer Departure & Respawn Cycle
- [ ] Add `departureTime` field to `CrowdPerson` class
- [ ] Customers arrive at machine, play for N spins (configurable, default 5-10), then walk off floor
- [ ] Departing customer animates walking toward bottom exit point over 1-2 seconds
- [ ] Replace departed customer with auto-spawn after brief delay (0.5-1s)
- [ ] Update `game_design.md` section 6 with new lifecycle
- [ ] **Acceptance:** Customers visibly cycle through machines, floor never empties unless all money spent

### S1.2: Machine Seating Visualization
- [ ] Add `maxCustomers` field to Machine (currently always 1)
- [ ] Render customer count badge above machine (`×N` when N > 1)
- [ ] Position N customers around machine tile (offset left/right/front as needed)
- [ ] Spin income multiplies by seating count (already in code via `customers.length`)
- [ ] **Acceptance:** Multiple customers visible around single machine; income scales with headcount

### S1.3: Economy Rebalance for Customer Lifecycle
- [ ] Tune `FLOOR_POPULATION_DECAY` to match expected respawn rate
- [ ] Adjust machine costs and tier 1 upgrade scaling so mid-game (machines 4-8) feels achievable
- [ ] Add economy tuning constants: `SPIN_PER_CUSTOMER_BEFORE_DEPARTURE`, `DEPARTURE_ANIMATION_DURATION`, `RESPAWN_DELAY`
- [ ] Verify EV math still favors house after customer cycle changes
- [ ] **Acceptance:** Early game (first 2 machines) takes 2-5 mins; mid-game progression feels smooth without hard walls

---

## Sprint 2: Machine Types & Progression (5-6 days)

### S2.1: Add Tier 2 Machine (Poker Machine)
- [ ] Create Poker machine definition in `MACHINE_DEFS`: 1×1 tile, 1 customer, 1.8s base spin interval, higher variance
- [ ] Design new spin table with same EV but different outcome distribution (fewer small wins, more medium/big)
- [ ] Add visual: same size as slot machine but different color scheme (purple/blue instead of pink/green)
- [ ] Cost formula: scales from $500 at tier 1, ~$1200 for first poker machine
- [ ] **Acceptance:** Poker machine placeable, spins with correct variance, visually distinct

### S2.2: Add Tier 3 Machine (Blackjack Table)
- [ ] Create Blackjack table definition: 2×2 tile footprint, 4 max customers, 4.0s spin interval
- [ ] Spin table with higher payouts but lower frequency (house still positive EV)
- [ ] Visual: larger isometric box, distinct colors (gold/red), more ornate
- [ ] Placement restrictions: must have 2×2 contiguous free tiles
- [ ] Cost formula: ~$3500 for first blackjack table (higher due to larger footprint)
- [ ] **Acceptance:** Blackjack table placeable on 6×6 floor (not on tiny floors), seats 4 customers, spins correctly

### S2.3: Machine Selection UI
- [ ] Add machine selection panel when clicking empty floor tiles (or right-click/shift-click)
- [ ] Show available machines by tier: Slot, Poker, Blackjack (grayed if unaffordable or floor too small)
- [ ] Display each machine's cost, spin interval, max customers, expected income
- [ ] Click to buy and place on that tile
- [ ] **Acceptance:** Player can choose which machine type to place; costs and restrictions enforced

### S2.4: Update Design Doc
- [ ] Update `game_design.md` section 5.4 (Machine Progression) with Poker and Blackjack stats
- [ ] Add cost scaling formulas
- [ ] Document EV for each machine type
- [ ] **Acceptance:** `game_design.md` reflects all current machines

---

## Sprint 3: Supercomputer Tier 2 & Economy Depth (4-5 days)

### S3.1: Implement Tier 2 Supercomputer Upgrades
- [ ] Create 3 new upgrades for Tier 2: Wager II, Roll Rate II, Capacity II
- [ ] Wager II: 50 levels, each +12% cumulative (pushes beyond Tier 1's 100x), costs scale $50 * 1.4^level
- [ ] Roll Rate II: 50 levels, each -5% (stacks with Tier 1 for total 8.5x faster), costs $40 * 1.4^level
- [ ] Capacity II: 20 levels, +10 capacity per level, costs $100 * 1.45^level
- [ ] Tier 2 unlocks after Tier 1 is fully purchased (or at level 50/50/20)
- [ ] **Acceptance:** Tier 2 upgrades visible and purchasable; costs and effects verified; stacking with Tier 1 works

### S3.2: Add Machine Local Upgrade Tier 2
- [ ] Each machine's local upgrades now have 2 tiers: Tier 1 (10 levels), Tier 2 (10 levels)
- [ ] Tier 2 effects stronger: Tier 1 Spin Rate -10%/level, Tier 2 -15%/level
- [ ] Tier 1 Payout +20%/level, Tier 2 +30%/level
- [ ] Tier 2 unlocks after Tier 1 maxed on that machine
- [ ] Costs scale higher for Tier 2 (base 2x more expensive)
- [ ] **Acceptance:** Local upgrades fully upgradeable; both tiers visible in machine panel; stacking verified

### S3.3: Economy Tuning for Tiers 1-2 Progression
- [ ] Test progression: $0 start -> $20 (first tier 1 upgrade) -> $500 (machines 2-3) -> $5000 (tier 2 unlocked)
- [ ] Adjust upgrade costs/scales so progression feels rewarding, not grindy
- [ ] Verify machine purchase costs don't create unpassable walls
- [ ] **Acceptance:** Playtesting shows smooth scaling through tier 2 unlocks (no arbitrary walls)

---

## Sprint 4: Quality of Life & Polish (3-4 days)

### S4.1: Save/Load System
- [ ] Implement `localStorage` serialization: `State.money`, `State.totalEarned`, all machine positions/types, all upgrade purchase counts
- [ ] Save every 30 seconds + on `beforeunload` event
- [ ] Load on game init; show "Loaded: $X earnings" toast
- [ ] Offline earnings calculation: if saved > 8 hours ago, calculate earnings at 50% of last known rate, cap at max 8 hours
- [ ] **Acceptance:** Game state persists across refreshes; offline earnings calculated and capped

### S4.2: Pause Menu & Settings Panel
- [ ] Add ESC key to toggle pause overlay (dims game, shows menu)
- [ ] Menu options: Resume, Clear Save & Start Over, Settings
- [ ] Settings: Master Volume (audio is muted), CRT grain on/off, UI opacity slider, theme (currently neon-only)
- [ ] Stored in localStorage under `settings.*`
- [ ] **Acceptance:** Game pauses/resumes cleanly; settings persist; clear save wipes all data

### S4.3: Tooltips & Help Text
- [ ] Hover tooltips on shop items: describe upgrade effect, show cost scaling formula
- [ ] Click machine -> "Click to spawn crowd" helper text (first few times)
- [ ] Click supercomputer -> "Global upgrades" helper
- [ ] Ctrl+H shortcut to toggle help overlay (explains all systems)
- [ ] **Acceptance:** New players can understand mechanics without reading design doc

### S4.4: Earnings History Improvements
- [ ] Keep current 3-row HUD (1m, 5m, 1h) but add rolling graph in a collapsible widget
- [ ] 60-second rolling line graph of earnings rate (smooth curve, not bar chart)
- [ ] Color: green for positive, red for negative
- [ ] Can be minimized to hide when not playing actively
- [ ] **Acceptance:** Player can see income trends at a glance; graph updates smoothly

---

## Sprint 5: Audio Foundation (4-5 days)

### S5.1: Audio System Architecture
- [ ] Create `audio.js` module with `playSound(soundKey, volume)` function
- [ ] Define sound slots in `constants.js`: spin reel, small win, big win, jackpot, crowd cheer, level up, machine place
- [ ] Master volume control in State
- [ ] All sound calls use `playSound()`, respect master volume and muted state
- [ ] **Acceptance:** Audio system initialized, no console errors

### S5.2: Generate/Implement Core Sounds
- [ ] Spin reel: looping mechanical sound (0.3-0.5s clip, plays at spin start, stops at spin end)
- [ ] Small win (0.1s): ascending beep
- [ ] Big win (0.5s): arcade win jingle (bright ascending notes)
- [ ] Jackpot (1.0s): alarm bell loop (10 rings)
- [ ] Crowd cheer (0.4s): crowd "oooh" or "aaah"
- [ ] Machine place: satisfying "ding" sound
- [ ] **Acceptance:** Sounds play on correct events; no distortion; balanced mix

### S5.3: Sound Triggers
- [ ] `Machine.doSpin()`: play spin reel at start, stop at spin end
- [ ] `processSpinResult()`: play small/big/jackpot sound based on amount
- [ ] `CrowdPerson.cheer()`: play crowd cheer
- [ ] `MachineShop.buyMachine()`: play place sound
- [ ] All supercomputer purchases: level-up sound
- [ ] **Acceptance:** Sounds trigger correctly without lag; no overlapping/clipping

---

## Sprint 6: Content & Progression Depth (5-6 days)

### S6.1: Achievements System
- [ ] Define 15-20 achievements: first machine, earn $1M, own 4 machines, unlock Tier 2 wager, 1-hour playtime, etc.
- [ ] Store achievement unlock timestamps in localStorage
- [ ] Badge UI: small grid in pause menu showing earned/total (greyed out unearned)
- [ ] Toast notification on unlock: "Achievement: [Name]"
- [ ] Each achievement is flavor + describes a meaningful milestone
- [ ] **Acceptance:** Achievements unlock correctly; stored and loaded; toast shows on first unlock

### S6.2: Combo System
- [ ] Track consecutive spin results: N wins in a row triggers combo bonus
- [ ] 3+ wins = +10% income bonus for next 10 seconds
- [ ] 7+ wins = +25% bonus
- [ ] 15+ wins = +50% bonus + FloatingText "COMBO x15!" above machine
- [ ] Resets on any loss/jackpot
- [ ] Visual: machine glows brighter during combo, combo counter floats above it
- [ ] **Acceptance:** Combo triggers, income bonus applied, counter visible, resets on loss

### S6.3: Lucky Hour Timed Buff
- [ ] New supercomputer upgrade "Lucky Hour": $8000, max 2 purchases
- [ ] When activated: 60-second buff granting +100% income
- [ ] Visual: animated border glow on all machines, timer in HUD
- [ ] Can be stacked (purchase twice, activate twice back-to-back for 120s)
- [ ] Buff applies to all machines, all spin results (before crowd multiplier)
- [ ] **Acceptance:** Buff purchasable, activatable, applies correctly, timer visible, expires cleanly

### S6.4: News Ticker (Simple)
- [ ] Small scrolling text area at bottom of HUD
- [ ] Displays recent big events: "Jackpot on Machine 3: -$42!", "Earned $1.2M in last hour", "Combo x7!"
- [ ] 5-8 most recent events stored (FIFO queue), scroll right-to-left
- [ ] Updates every time an event occurs
- [ ] Collapsible (ESC -> Settings -> Hide News)
- [ ] **Acceptance:** Ticker shows events, scrolls smoothly, can be toggled

---

## Sprint 7: Endgame & Prestige (6-7 days)

### S7.1: Prestige System
- [ ] New supercomputer upgrade "Ascend": $500M to unlock
- [ ] Clicking Ascend: prompt "Reset all progress. Gain 1 Prestige Point per $100M earned. New multiplier: income × (1 + prestige × 0.25)"
- [ ] On prestige: reset money, machines, all local upgrades, all achievement progress; keep Tier 1 & 2 supercomputer levels
- [ ] "Prestige level" displayed in HUD next to balance
- [ ] Prestige multiplier applied to all spin results (after crowd, before combo)
- [ ] **Acceptance:** Prestige system functional; multiplier verified; prestige points calculated correctly; reset is clean

### S7.2: Infinite Supercomputer Tiers
- [ ] Tier 2 unlocks at $10M (or Tier 1 complete)
- [ ] Tier 3 unlocks at $100M, Tier 4 at $1B, Tier 5 at $10B, etc.
- [ ] Each tier: Wager, Roll Rate, Capacity (50 levels each) with stronger scaling
- [ ] Tier N cost = Tier N-1 cost × 2 (base)
- [ ] Tier N effect = Tier N-1 effect × 1.5 (e.g., Wager Tier 3 = +15%/level vs +12% for Tier 2)
- [ ] UI: show Tier in parentheses (Wager Boost (Tier 2)) when browsing
- [ ] **Acceptance:** Infinite tiers generated correctly; costs and effects scale as expected

### S7.3: Advanced Machine Types (Tier 4 & 5)
- [ ] **Craps Table (Tier 4):** 3×3 tile footprint, 6 max customers, 5.0s spin, extreme variance (small payouts rare, big wins common, devastating losses possible)
- [ ] **Roulette Wheel (Tier 5):** 2×3 tile footprint, 5 max customers, 3.5s spin, balanced variance, highest base income
- [ ] Each has unique visuals, spin tables, and upgrade potential
- [ ] Cost scaling proportional to footprint and capability
- [ ] **Acceptance:** New machine types placeable, visually distinct, spin correctly

### S7.4: Second Floor Section (VIP Room)
- [ ] Unlock via supercomputer upgrade "VIP Lounge": $250M
- [ ] Creates new 10×10 floor section (separate canvas area or scrollable within main)
- [ ] VIP floor has red/gold color scheme instead of pink/green
- [ ] VIP machines: premium variants of standard machines, 2-3x income but higher cost
- [ ] Customers can be directed to either floor; visual separation maintained
- [ ] Earnings from VIP floor counted separately in HUD row "VIP: $X"
- [ ] **Acceptance:** VIP floor renders, machines placeable, customers spawn there, earnings tracked

---

## Sprint 8: Late-Game Exponential Content (4-5 days)

### S8.1: Tier 3 Machine Local Upgrades
- [ ] Machines can now upgrade to Tier 3: Spin Rate & Payout (10 levels each)
- [ ] Tier 3 effects: Spin Rate -20%/level, Payout +50%/level
- [ ] Costs: base 3x more expensive than Tier 1
- [ ] Can only upgrade Tier 3 after maxing Tier 2 on that machine
- [ ] **Acceptance:** Tier 3 visible when Tier 2 is maxed; upgrades apply correctly

### S8.2: Machine Prestige (Optional: Machines Reset -> Multiplier)
- [ ] Each machine can be "reset" for a small bonus multiplier (1.1x income on next reset)
- [ ] Applies to 5 machines max per prestige cycle to prevent spam
- [ ] Cost: scales based on total upgrades spent on that machine
- [ ] **Acceptance:** Machine prestige unlocks new upgrade paths; bonus applies correctly

### S8.3: Automated Progression Simulator
- [ ] Add "Simulator" button in Settings: projects earnings 1h forward at current rate
- [ ] Shows estimated balance, next machine tier unlock, prestige readiness
- [ ] No actual state change, just display
- [ ] Useful for players deciding whether to afk-grind or pivot strategy
- [ ] **Acceptance:** Simulator calculates and displays projected state

### S8.4: End-State Balance Verification
- [ ] Test reaching $1T+ earnings with all systems active
- [ ] Verify no numerical overflow in formatMoney() or earnings calculation
- [ ] Confirm prestige multipliers stack correctly at high levels
- [ ] Check Tier 5+ supercomputer costs don't overflow
- [ ] **Acceptance:** Game remains stable and playable at extreme scales

---

## Sprint 9: Visual Polish & Juice (4-5 days)

### S9.1: Machine Tier Visual Progression
- [ ] Tier 1 (Slot): neon pink/cyan, small 1×1
- [ ] Tier 2 (Poker): purple/blue accent, same 1×1 but darker shades
- [ ] Tier 3 (Blackjack): gold/red, 2×2, larger with more detail
- [ ] Tier 4 (Craps): blood red/deep purple, 3×3, ornate curved top
- [ ] Tier 5 (Roulette): platinum/gold, 2×3, circular roulette wheel visible on top face
- [ ] Each tier has animated accent lights (faster/flashier for higher tiers)
- [ ] **Acceptance:** Each machine type visually distinct and recognizable at a glance

### S9.2: Enhanced Particle Effects
- [ ] Combo milestone sparks (15 sparks instead of 14 for combo milestones)
- [ ] Prestige unlock particle burst (confetti-style across entire screen)
- [ ] Lucky Hour activation: green flash across all machines + glow pulse
- [ ] Machine placement: satisfying "poof" particle cloud + shine
- [ ] **Acceptance:** Particle effects feel responsive and celebratory

### S9.3: CRT Overlay Refinement
- [ ] Add occasional glitch effect at low probability (screen tint shift, brief scanline flicker, mirrored section)
- [ ] VIP floor has slightly warmer CRT overlay (red tint instead of green)
- [ ] Adjustable grain & scanline intensity in Settings (currently fixed at 55% & 18%)
- [ ] **Acceptance:** CRT effects enhanced; adjustable in settings; no performance loss

### S9.4: UI Layout Final Pass
- [ ] Responsive HUD: balance, prestige level, earnings history (1m/5m/1h rows)
- [ ] Collapsible sections: news ticker, combo counter, lucky hour timer
- [ ] Status bar: floor population meter, total machines count, next upgrade hint
- [ ] Dark mode CSS variant (Settings toggle, persists)
- [ ] **Acceptance:** UI readable at all resolutions; no overlapping; dark mode matches neon aesthetic

---

## Sprint 10: Stretch Goals & Final Polish (3-4 days)

### S10.1: Idle Mode Auto-Progression
- [ ] If idle (no clicks) > 30s: auto-spawn extra crowd at faster rate
- [ ] Shows visual indicator: "AFK MODE" text fading in/out
- [ ] Earnings rate increases by 20% during AFK mode (reward passive play)
- [ ] Disables on any click
- [ ] **Acceptance:** AFK mode triggers correctly, earnings boost verified

### S10.2: Keyboard Shortcuts Legend
- [ ] Overlaid on-screen legend: `?` key shows all shortcuts
- [ ] Lists: number keys (not used now), arrows (shop scroll), ESC (pause), C (hard click on focused machine), etc.
- [ ] Can be dismissed or toggled persistent
- [ ] **Acceptance:** Legend displays correctly, shortcuts accurate

### S10.3: Statistics & Analytics Panel
- [ ] Track: total spins, total wins/losses, avg payout, longest win streak, biggest single spin
- [ ] Reset on prestige (but historical totals shown separately)
- [ ] Accessible via ESC -> Stats
- [ ] Shows all-time + current-prestige stats side-by-side
- [ ] **Acceptance:** Stats calculated correctly, persist across sessions

### S10.4: Final Balance Tuning & Playtesting
- [ ] 2-3 hour playtesting session: document progression feel, identify any grind walls
- [ ] Adjust machine costs, upgrade scaling, supercomputer tier unlock points if needed
- [ ] Verify all economy invariants hold at scale
- [ ] Test prestige cycle timing (should feel rewarding every 20-60 minutes of play)
- [ ] **Acceptance:** Playtesting log; all recommendations implemented or noted for future

---

## Post-Launch Roadmap (Future)

- **Seasonal Events:** Limited-time challenges (earn $X in 10min, specific machine combo)
- **Trading/Economy:** Players can mark machines for sale, queue multiple actions
- **Leaderboards:** Fastest to $1M, highest single spin, longest combo
- **Custom Themes:** Neon skins (cyberpunk, retro, synthwave variants)
- **Mobile Export:** Responsive CSS for phone play
- **Cloud Save:** Sync progress across devices via Anthropic account (future)

---

## Notes for Developer

- Playtest frequently; each sprint should have a 15-30min interactive session
- Update `CHANGELOG.md` before each commit (copy sprint heading + items completed)
- Keep `game_design.md` in sync with code changes (economy, mechanics, new features)
- All numeric constants must live in `constants.js`; no magic numbers inline
- No em-dashes in docs or code comments
- Audio implementation can use Web Audio API or simple HTML5 `<audio>` tags with preloaded .mp3/.wav files (recommend simple approach first)

---

**Estimated total timeline:** 12-16 weeks at 1-2 days per sprint = ~4-5 months to feature-complete (Sprints 1-8).  
Sprints 9-10 are polish and can be parallel with playtesting/tuning.
