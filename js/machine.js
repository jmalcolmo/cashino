// Machine type definitions
// spin table: positive = house earns, negative = house pays out
// EV per spin for SLOT: ~1.6 (house profit per spin)
const MACHINE_DEFS = {
  SLOT: {
    name:     'Slot Machine',
    tileSize: 1,
    maxCustomers: 1,
    baseSpinInterval: 2.2,
    boxH: 58,
    colors: {
      top:       '#1e0835',
      left:      '#100420',
      right:     '#0a0118',
      topStroke: '#ff0090',
      sideStroke:'#2a0845',
    },
    accentColor: '#ff0090',
    spinTable: [
      { chance: 0.55, label: 'win',     amount: () =>   3 + Math.random() * 3   },  // house wins $3-6
      { chance: 0.20, label: 'loss',    amount: () => -(4 + Math.random() * 5)  },  // pays $4-9
      { chance: 0.20, label: 'win',     amount: () =>   5 + Math.random() * 5   },  // house wins $5-10
      { chance: 0.05, label: 'jackpot', amount: () => -(14 + Math.random() * 14) }, // pays $14-28
    ],
  },
};

class Machine {
  constructor(type, col, row) {
    this.type = type;
    this.def  = MACHINE_DEFS[type];
    this.col  = col;
    this.row  = row;

    this.customers      = [];
    this.spinInterval   = this.def.baseSpinInterval * State.spinSpeedMult;
    this.spinTimer      = Math.random() * this.spinInterval;
    this.shakeTimer     = 0;
    this.shakeAmount    = 0;
    this.reelPhase      = Math.random() * Math.PI * 2;
    this.active         = true;

    // Click boost: each click adds speed. Timer resets on each click; expires = no boost.
    this.clickBoost      = 0;
    this.clickBoostTimer = 0;
  }

  // Returns house profit amount (positive = earn, negative = pay out), or null if no spin.
  update(dt) {
    if (this.customers.length === 0) return null;

    // Decay boost timer; reset boost when it expires
    if (this.clickBoostTimer > 0) {
      this.clickBoostTimer -= dt;
      if (this.clickBoostTimer <= 0) {
        this.clickBoostTimer = 0;
        this.clickBoost      = 0;
      }
    }

    this.reelPhase += dt * 6;
    if (this.shakeTimer > 0) this.shakeTimer -= dt;

    // Click boost accelerates the spin countdown directly
    this.spinTimer -= dt * (1 + this.clickBoost);

    if (this.spinTimer <= 0) {
      this.spinTimer = this.spinInterval * (0.85 + Math.random() * 0.3);
      return this._spin() * this.customers.length;
    }
    return null;
  }

  _spin() {
    const roll = Math.random();
    let cum = 0;
    for (const entry of this.def.spinTable) {
      cum += entry.chance;
      if (roll < cum) {
        const amount = entry.amount();
        if (Math.abs(amount) >= 14) {
          this.shakeTimer  = 0.45;
          this.shakeAmount = 7;
        }
        return amount;
      }
    }
    return this.def.spinTable[0].amount();
  }

  get screenPos() {
    return ISO.toScreen(this.col, this.row, State.floorOriginX, State.floorOriginY);
  }

  get depth() {
    return this.col + this.row;
  }
}
