// Each item: { id, name, desc, baseCost, scaleFactor, maxCount, purchased, canBuy(), onBuy() }
// scaleFactor of 99 = effectively one-time (cost jumps to unaffordable after 1 purchase)

const SHOP_ITEMS = [
  {
    id:          'slot_machine',
    name:        'SLOT MACHINE',
    desc:        'Place another slot machine.\nEach one brings in a customer.',
    baseCost:    500,
    scaleFactor: 1.45,
    maxCount:    8,
    purchased:   0,
    canBuy() { return State.floor && State.floor.findFreeTile() !== null; },
    onBuy() {
      const tile = State.floor.findFreeTile();
      if (!tile) return false;
      const m = new Machine('SLOT', tile.col, tile.row);
      State.machines.push(m);
      State.floor.setOccupied(tile.col, tile.row, true);
      spawnCustomer(m);
      return true;
    },
  },
  {
    id:          'hype_cooldown',
    name:        'FASTER HYPE',
    desc:        'Cut hype cooldown\nfrom 5s → 3s.',
    baseCost:    900,
    scaleFactor: 99,
    maxCount:    1,
    purchased:   0,
    canBuy() { return true; },
    onBuy() { State.hype.COOLDOWN_MAX = 3; return true; },
  },
  {
    id:          'spin_speed',
    name:        'SPIN FASTER',
    desc:        'All machines spin\n20% faster. Stacks 3×.',
    baseCost:    1100,
    scaleFactor: 2.2,
    maxCount:    3,
    purchased:   0,
    canBuy() { return true; },
    onBuy() {
      State.spinSpeedMult *= 0.80;
      State.machines.forEach(m => { m.spinInterval *= 0.80; });
      return true;
    },
  },
  {
    id:          'hype_radius',
    name:        'MEGA HYPE',
    desc:        'Double the hype\npulse radius.',
    baseCost:    2200,
    scaleFactor: 99,
    maxCount:    1,
    purchased:   0,
    canBuy() { return true; },
    onBuy() { State.hype.RADIUS *= 2; return true; },
  },
  {
    id:          'hype_man',
    name:        'HYPE MAN NPC',
    desc:        'Auto-hypes the floor\nevery 10 seconds.',
    baseCost:    4500,
    scaleFactor: 99,
    maxCount:    1,
    purchased:   0,
    canBuy() { return true; },
    onBuy() { State.hypeManTimer = 0; State.hypeManInterval = 10; return true; },
  },
  {
    id:          'expand_floor',
    name:        'EXPAND FLOOR',
    desc:        'Grow casino from\n6×6 → 10×10 tiles.',
    baseCost:    6000,
    scaleFactor: 99,
    maxCount:    1,
    purchased:   0,
    canBuy() { return true; },
    onBuy() {
      const oldFloor = State.floor;
      State.floor = new Floor(10, 10);
      // Re-register machines in new floor
      State.machines.forEach(m => {
        const tile = State.floor.findFreeTile();
        if (tile) {
          m.col = tile.col;
          m.row = tile.row;
          State.floor.setOccupied(tile.col, tile.row, true);
          // Update customer target positions
          State.customers.forEach(c => {
            if (c.machine === m) c.assignMachine(m);
          });
        }
      });
      recalcOrigin();
      return true;
    },
  },
];

const Shop = {
  visibleItems() {
    return SHOP_ITEMS.filter(i => i.purchased < i.maxCount);
  },

  cost(item) {
    return Math.round(item.baseCost * Math.pow(item.scaleFactor, item.purchased));
  },

  canAfford(item) {
    return State.money >= this.cost(item) && item.canBuy();
  },

  purchase(item) {
    if (item.purchased >= item.maxCount) return false;
    const cost = this.cost(item);
    if (State.money < cost) return false;
    if (!item.onBuy()) return false;
    State.money -= cost;
    item.purchased++;
    return true;
  },
};
