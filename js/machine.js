const MACHINE_DEFS = {
  SLOT: {
    name:             'Slot Machine',
    tileSize:         1,
    baseSpinInterval: SPIN_INTERVAL_BASE,
    boxH:             MACHINE_BOX_H_SLOT,
    colors: {
      top:        '#1e0835',
      left:       '#100420',
      right:      '#0a0118',
      topStroke:  '#ff0090',
      sideStroke: '#2a0845',
    },
    accentColor: '#ff0090',
    spinTable: [
      { chance: SPIN_SMALL_WIN_CHANCE,  label: 'win',     amount: () => SPIN_SMALL_WIN_MIN  + Math.random() * (SPIN_SMALL_WIN_MAX  - SPIN_SMALL_WIN_MIN)  },
      { chance: SPIN_LOSS_CHANCE,       label: 'loss',    amount: () => SPIN_LOSS_MIN       + Math.random() * (SPIN_LOSS_MAX       - SPIN_LOSS_MIN)        },
      { chance: SPIN_MEDIUM_WIN_CHANCE, label: 'win',     amount: () => SPIN_MEDIUM_WIN_MIN + Math.random() * (SPIN_MEDIUM_WIN_MAX - SPIN_MEDIUM_WIN_MIN) },
      { chance: SPIN_JACKPOT_CHANCE,    label: 'jackpot', amount: () => SPIN_JACKPOT_MIN    + Math.random() * (SPIN_JACKPOT_MAX    - SPIN_JACKPOT_MIN)    },
    ],
  },
};

class Machine {
  constructor(type, col, row) {
    this.type = type;
    this.def  = MACHINE_DEFS[type];
    this.col  = col;
    this.row  = row;

    this.spinInterval = this.def.baseSpinInterval;
    this.spinTimer    = Math.random() * this.spinInterval;
    this.shakeTimer   = 0;
    this.shakeAmount  = 0;
    this.reelPhase    = Math.random() * Math.PI * 2;

    this.machineLvl = 0;
  }

  get localSpeedMult() {
    return Math.pow(MACH_LEVEL_SPEED_FACTOR, this.machineLvl);
  }

  get localPayoutMult() {
    return Math.pow(MACH_LEVEL_PAYOUT_FACTOR, this.machineLvl);
  }

  get effectiveInterval() {
    return this.def.baseSpinInterval * State.globalSpeedMult * this.localSpeedMult;
  }

  // Always spins - no customer gating. Crowd multiplier applied inside doSpin.
  update(dt) {
    this.reelPhase += dt * 6;
    if (this.shakeTimer > 0) this.shakeTimer -= dt;

    this.spinInterval = this.effectiveInterval;
    this.spinTimer   -= dt;

    if (this.spinTimer <= 0) {
      this.spinTimer = this.spinInterval * (SPIN_JITTER_MIN + Math.random() * SPIN_JITTER_RANGE);
      return this.doSpin();
    }
    return null;
  }

  doSpin() {
    const crowdMult = 1 + (State.floorPopulation / FLOOR_CAPACITY_START) * CROWD_MULT_BONUS_BASE;

    const roll = Math.random();
    let cum = 0;
    for (const entry of this.def.spinTable) {
      cum += entry.chance;
      if (roll < cum) {
        const base   = entry.amount();
        const amount = base * State.globalWagerMult * this.localPayoutMult * crowdMult;
        if (Math.abs(amount) >= MACHINE_SHAKE_THRESH) {
          this.shakeTimer  = 0.45;
          this.shakeAmount = 7;
        }
        return amount;
      }
    }
    const base = this.def.spinTable[0].amount();
    return base * State.globalWagerMult * this.localPayoutMult * crowdMult;
  }

  get screenPos() {
    return ISO.toScreen(this.col, this.row, State.floorOriginX, State.floorOriginY);
  }

  get depth() {
    return this.col + this.row;
  }
}
