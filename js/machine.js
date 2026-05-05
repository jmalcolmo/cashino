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
    this.active     = true;
    this.clickAccum = 0;  // fractional accumulator for click multiplier
  }

  // Returns house profit amount (positive = earn, negative = pay out), or null if no spin.
  update(dt) {
    if (this.customers.length === 0) return null;

    this.reelPhase += dt * 6;
    if (this.shakeTimer > 0) this.shakeTimer -= dt;

    this.spinTimer -= dt;

    if (this.spinTimer <= 0) {
      this.spinTimer = this.spinInterval * (SPIN_JITTER_MIN + Math.random() * SPIN_JITTER_RANGE);
      return this.doSpin();
    }
    return null;
  }

  // Public: execute one spin and return the house profit (already multiplied by customer count).
  // Called by both the passive timer (update) and click handlers.
  doSpin() {
    const roll = Math.random();
    let cum = 0;
    for (const entry of this.def.spinTable) {
      cum += entry.chance;
      if (roll < cum) {
        const amount = entry.amount() * this.customers.length;
        if (Math.abs(amount) >= MACHINE_SHAKE_THRESH) {
          this.shakeTimer  = 0.45;
          this.shakeAmount = 7;
        }
        return amount;
      }
    }
    return this.def.spinTable[0].amount() * this.customers.length;
  }

  get screenPos() {
    return ISO.toScreen(this.col, this.row, State.floorOriginX, State.floorOriginY);
  }

  get depth() {
    return this.col + this.row;
  }
}
