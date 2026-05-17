// MachineShop - handles buying new machines and machine-local upgrades.
// Global (supercomputer) upgrades are handled in supercomputer.js.

const MachineShop = {

  // Cost of the next machine purchase (starter is free, not counted here)
  nextMachineCost() {
    const bought = State.machines.length - 1;  // starter doesn't count
    return Math.round(MACHINE_BASE_COST * Math.pow(MACHINE_COST_SCALE, Math.max(0, bought)));
  },

  canBuyMachine() {
    return (
      State.machines.length < State.machineSlotCap &&
      State.floor !== null &&
      State.floor.findFreeTile() !== null &&
      State.money >= this.nextMachineCost()
    );
  },

  buyMachine(type = 'SLOT') {
    if (State.machines.length >= State.machineSlotCap) return false;
    const cost = this.nextMachineCost();
    if (State.money < cost) return false;
    const def = MACHINE_DEFS[type];
    if (!def) return false;

    let tile;
    if (def.tileSize === 1) {
      tile = State.floor && State.floor.findFreeTile();
      if (!tile) return false;
    } else if (def.tileSize === 2) {
      const candidates = [];
      for (let r = 1; r < State.floor.rows - 2; r++) {
        for (let c = 1; c < State.floor.cols - 2; c++) {
          if (!State.floor.isOccupied(c, r) && !State.floor.isOccupied(c + 1, r) &&
              !State.floor.isOccupied(c, r + 1) && !State.floor.isOccupied(c + 1, r + 1)) {
            candidates.push({ col: c, row: r });
          }
        }
      }
      if (!candidates.length) return false;
      tile = candidates[Math.floor(Math.random() * candidates.length)];
    }

    State.money -= cost;
    const m = new Machine(type, tile.col, tile.row);
    State.machines.push(m);
    State.floor.setOccupied(tile.col, tile.row, true);
    if (def.tileSize === 2) {
      State.floor.setOccupied(tile.col + 1, tile.row, true);
      State.floor.setOccupied(tile.col, tile.row + 1, true);
      State.floor.setOccupied(tile.col + 1, tile.row + 1, true);
    }
    return true;
  },

  machineLevelCost(machine) {
    return Math.round(MACH_LEVEL_BASE_COST * Math.pow(MACH_LEVEL_COST_SCALE, machine.machineLvl));
  },

  upgradeMachineLevel(machine) {
    if (machine.machineLvl >= MACH_LEVEL_MAX) return false;
    const cost = this.machineLevelCost(machine);
    if (State.money < cost) return false;
    State.money -= cost;
    machine.machineLvl++;
    machine.spinInterval = machine.effectiveInterval;
    return true;
  },
};
