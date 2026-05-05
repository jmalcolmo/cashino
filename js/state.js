const State = {
  money:            STARTING_MONEY,
  totalEarned:      0,
  incomePerSecond:  0,

  machines:  [],
  customers: [],
  particles: [],
  floor:     null,

  splitscreen: false,

  // spin speed multiplier, upgraded via shop
  spinSpeedMult: 1.0,

  // click multiplier: spins triggered per click (1 + 0.5 per Power Click purchased)
  clickMultiplier: 1.0,

  // auto-clicker NPC (null until purchased)
  autoClickInterval: null,
  autoClickTimer:    0,

  canvas:        null,
  ctx:           null,
  crtCanvas:     null,

  floorOriginX:  0,
  floorOriginY:  0,

  tick:          0,
  lastTime:      0,
};
