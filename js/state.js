const State = {
  money:           STARTING_MONEY,
  totalEarned:     0,
  incomePerSecond: 0,

  machines:     [],
  crowdPersons: [],
  particles:    [],
  floor:        null,

  // Floor population: float that decays over time, boosted by floor clicks
  floorPopulation: 0,
  floorCapacity:   FLOOR_CAPACITY_START,

  // Global multipliers driven by supercomputer upgrades
  globalWagerMult: 1.0,
  globalSpeedMult: 1.0,

  // Max machines on the floor (expandable via supercomputer)
  machineSlotCap: MACHINE_SLOT_CAP_START,

  canvas:       null,
  ctx:          null,
  crtCanvas:    null,

  floorOriginX: 0,
  floorOriginY: 0,

  tick:     0,
  lastTime: 0,
};
