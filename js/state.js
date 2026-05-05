const State = {
  money:            250,
  totalEarned:      0,
  incomePerSecond:  0,

  machines:  [],
  customers: [],
  particles: [],
  floor:     null,

  hype: {
    cooldown:     0,
    COOLDOWN_MAX: 5,
    BOOST_DURATION: 3,
    RADIUS:       160,
  },

  // spin speed multiplier, upgraded via shop
  spinSpeedMult: 1.0,

  canvas:        null,
  ctx:           null,
  crtCanvas:     null,
  crtCtx:        null,

  floorOriginX:  0,
  floorOriginY:  0,

  tick:          0,
  lastTime:      0,
};
