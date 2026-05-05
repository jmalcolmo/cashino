const State = {
  money:            250,
  totalEarned:      0,
  incomePerSecond:  0,

  machines:  [],
  customers: [],
  particles: [],
  floor:     null,

  // spin speed multiplier, upgraded via shop
  spinSpeedMult: 1.0,

  // click boost settings (modified by shop upgrades)
  clickBoostPerClick: CLICK_BOOST_PER_CLICK,
  clickBoostMax:      CLICK_BOOST_MAX,
  clickBoostDuration: CLICK_BOOST_DURATION,

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
