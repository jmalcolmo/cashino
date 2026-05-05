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
    id:          'power_click',
    name:        'POWER CLICK',
    desc:        'Double boost per click.\n+0.1x speed -> +0.2x speed.',
    baseCost:    900,
    scaleFactor: 99,
    maxCount:    1,
    purchased:   0,
    canBuy() { return true; },
    onBuy() { State.clickBoostPerClick = CLICK_BOOST_PER_CLICK_UPGRADED; return true; },
  },
  {
    id:          'spin_speed',
    name:        'SPIN FASTER',
    desc:        'All machines spin\n20% faster. Stacks 3x.',
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
    id:          'extended_boost',
    name:        'EXTENDED BOOST',
    desc:        'Click boost lasts\n5s -> 8s before fading.',
    baseCost:    2200,
    scaleFactor: 99,
    maxCount:    1,
    purchased:   0,
    canBuy() { return true; },
    onBuy() { State.clickBoostDuration = CLICK_BOOST_DURATION_UPGRADED; return true; },
  },
  {
    id:          'auto_click',
    name:        'AUTO CLICKER',
    desc:        'Phantom hands click a\nrandom machine every 8s.',
    baseCost:    4500,
    scaleFactor: 99,
    maxCount:    1,
    purchased:   0,
    canBuy() { return true; },
    onBuy() {
      State.autoClickInterval = AUTO_CLICK_INTERVAL;
      State.autoClickTimer    = 0;
      return true;
    },
  },
  {
    id:          'expand_floor',
    name:        'EXPAND FLOOR',
    desc:        'Grow casino from\n6x6 -> 10x10 tiles.',
    baseCost:    6000,
    scaleFactor: 99,
    maxCount:    1,
    purchased:   0,
    canBuy() { return true; },
    onBuy() {
      State.floor = new Floor(10, 10);
      State.machines.forEach(m => {
        const tile = State.floor.findFreeTile();
        if (tile) {
          m.col = tile.col;
          m.row = tile.row;
          State.floor.setOccupied(tile.col, tile.row, true);
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
