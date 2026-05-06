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

  buyMachine() {
    if (State.machines.length >= State.machineSlotCap) return false;
    const tile = State.floor && State.floor.findFreeTile();
    if (!tile) return false;
    const cost = this.nextMachineCost();
    if (State.money < cost) return false;
    State.money -= cost;
    const m = new Machine('SLOT', tile.col, tile.row);
    State.machines.push(m);
    State.floor.setOccupied(tile.col, tile.row, true);
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
