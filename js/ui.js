const UI = {
  _openPanel:          null,   // null | 'supercomputer' | 'machine'
  _selectedMachine:    null,
  _machinePanelAnchor: { x: 0, y: 0 },

  init() {
    this._buildOverlays();
    this.render();
  },

  // ── Overlay construction ───────────────────────────────────────────────────

  _buildOverlays() {
    const wrap = document.getElementById('canvas-wrap');

    const scPanel = document.createElement('div');
    scPanel.id        = 'sc-panel';
    scPanel.className = 'overlay-panel hidden';
    wrap.appendChild(scPanel);

    const mPanel = document.createElement('div');
    mPanel.id        = 'machine-panel';
    mPanel.className = 'overlay-panel machine-panel hidden';
    wrap.appendChild(mPanel);
  },

  // ── Panel open / close ────────────────────────────────────────────────────

  openSupercomputer() {
    this._openPanel = 'supercomputer';
    this._renderSCPanel();
    document.getElementById('sc-panel').classList.remove('hidden');
    document.getElementById('machine-panel').classList.add('hidden');
  },

  openMachinePanel(machine, cssX, cssY) {
    this._openPanel          = 'machine';
    this._selectedMachine    = machine;
    this._machinePanelAnchor = { x: cssX, y: cssY };
    this._renderMachinePanel();
    document.getElementById('machine-panel').classList.remove('hidden');
    document.getElementById('sc-panel').classList.add('hidden');
  },

  closeAllPanels() {
    this._openPanel       = null;
    this._selectedMachine = null;
    document.getElementById('sc-panel').classList.add('hidden');
    document.getElementById('machine-panel').classList.add('hidden');
  },

  isAnyPanelOpen() { return this._openPanel !== null; },

  // ── Supercomputer panel ────────────────────────────────────────────────────

  _renderSCPanel() {
    const panel = document.getElementById('sc-panel');

    let html = `
      <div class="op-header">
        <span class="op-title">SUPERCOMPUTER</span>
        <button class="op-close" onclick="UI.closeAllPanels()">X</button>
      </div>
      <div class="op-scroll">`;

    // Group upgrades by tier
    const tiers = {};
    for (const upg of SC_UPGRADES) {
      if (!tiers[upg.tier]) tiers[upg.tier] = [];
      tiers[upg.tier].push(upg);
    }

    // Render each tier
    for (const tierNum of Object.keys(tiers).sort((a, b) => parseInt(a) - parseInt(b))) {
      const tier = tiers[tierNum];
      html += `<div class="op-tier-label">TIER ${tierNum}</div>`;
      html += `<div class="op-list">`;

      for (const upg of tier) {
        const isUnlocked = !upg.isUnlocked || upg.isUnlocked();
        const maxed      = upg.level >= upg.maxLevel;
        const cost       = upg.cost(upg.level);
        const canAfford  = !maxed && State.money >= cost && isUnlocked;

        let rowClass = 'op-row';
        if (!isUnlocked) {
          rowClass += ' locked';
        } else if (maxed) {
          rowClass += ' maxed';
        } else if (canAfford) {
          rowClass += ' affordable';
        }

        html += `
          <div class="${rowClass}" data-upg-id="${upg.id}">
            <div class="op-row-top">
              <span class="op-row-name">${upg.name}</span>
              <span class="op-row-lvl">${isUnlocked ? `Lv ${upg.level}/${upg.maxLevel}` : 'LOCKED'}</span>
            </div>
            <div class="op-row-desc">${upg.desc}</div>
            <div class="op-row-bottom">
              <span class="op-row-effect">${isUnlocked ? upg.effectText() : 'Max T' + (parseInt(tierNum) - 1) + ' first'}</span>
              <button class="op-buy-btn" ${!isUnlocked || maxed ? 'disabled' : ''}
                onclick="UI._buySC('${upg.id}')">
                ${!isUnlocked ? 'LOCKED' : maxed ? 'MAXED' : formatMoney(cost)}
              </button>
            </div>
          </div>`;
      }

      html += `</div>`;
    }

    html += `</div>`;
    panel.innerHTML = html;
  },

  _buySC(id) {
    if (Supercomputer.purchase(id)) {
      this._renderSCPanel();
      this._updateStatus();
    }
  },

  _refreshSCAffordability() {
    const panel = document.getElementById('sc-panel');
    if (!panel || panel.classList.contains('hidden')) return;
    for (const upg of SC_UPGRADES) {
      const row = panel.querySelector(`[data-upg-id="${upg.id}"]`);
      if (!row) continue;
      const isUnlocked = !upg.isUnlocked || upg.isUnlocked();
      const maxed      = upg.level >= upg.maxLevel;
      const cost       = upg.cost(upg.level);
      const canAfford  = !maxed && State.money >= cost && isUnlocked;

      let className = 'op-row';
      if (!isUnlocked) {
        className += ' locked';
      } else if (maxed) {
        className += ' maxed';
      } else if (canAfford) {
        className += ' affordable';
      }
      row.className = className;

      const btn = row.querySelector('.op-buy-btn');
      if (btn) {
        btn.disabled    = !isUnlocked || maxed;
        btn.textContent = !isUnlocked ? 'LOCKED' : maxed ? 'MAXED' : formatMoney(cost);
      }
    }
  },

  // ── Machine panel ─────────────────────────────────────────────────────────

  _renderMachinePanel() {
    const panel = document.getElementById('machine-panel');
    const m     = this._selectedMachine;
    if (!m) return;

    // Position panel near the machine, clamped to canvas bounds
    const wrap = document.getElementById('canvas-wrap');
    const pW   = 230;
    const pH   = 280;
    const { x: anchorX, y: anchorY } = this._machinePanelAnchor;
    const left = Math.min(Math.max(8, anchorX - pW / 2), wrap.clientWidth  - pW - 8);
    const top  = Math.min(Math.max(8, anchorY - pH - 20), wrap.clientHeight - pH - 8);
    panel.style.left = left + 'px';
    panel.style.top  = top  + 'px';

    const mlCost  = MachineShop.machineLevelCost(m);
    const mlMaxed = m.machineLvl >= MACH_LEVEL_MAX;
    const canML   = !mlMaxed && State.money >= mlCost;

    const payoutPct = ((Math.pow(MACH_LEVEL_PAYOUT_FACTOR, m.machineLvl) - 1) * 100).toFixed(0);
    const speedPct  = ((1 - Math.pow(MACH_LEVEL_SPEED_FACTOR, m.machineLvl)) * 100).toFixed(0);

    const atCap   = State.machines.length >= State.machineSlotCap;
    const noTile  = !State.floor || !State.floor.findFreeTile();
    const buyCost = MachineShop.nextMachineCost();
    const canBuy  = !atCap && !noTile && State.money >= buyCost;
    const buyLabel = atCap ? 'CAP REACHED' : noTile ? 'NO SPACE' : formatMoney(buyCost);

    panel.innerHTML = `
      <div class="op-header">
        <span class="op-title">${m.def.name.toUpperCase()}</span>
        <button class="op-close" onclick="UI.closeAllPanels()">X</button>
      </div>

      <div class="mp-section">
        <div class="mp-row ${canML ? 'affordable' : mlMaxed ? 'maxed' : ''}">
          <div class="mp-row-top">
            <span class="mp-name">MACHINE LEVEL</span>
            <span class="mp-lvl">Lv ${m.machineLvl}/${MACH_LEVEL_MAX}</span>
          </div>
          <div class="mp-eff">+${payoutPct}% payout  |  ${speedPct}% faster</div>
          <button class="op-buy-btn" ${mlMaxed ? 'disabled' : ''}
            onclick="UI._upgradeML()">${mlMaxed ? 'MAXED' : formatMoney(mlCost)}</button>
        </div>
      </div>

      <div class="mp-divider"></div>

      <div class="mp-buy-row ${canBuy ? 'affordable' : ''}">
        <div class="mp-row-top">
          <span class="mp-name">BUY MACHINE</span>
          <span class="mp-lvl">${State.machines.length}/${State.machineSlotCap}</span>
        </div>
        <button class="op-buy-btn wide" ${canBuy ? '' : 'disabled'}
          onclick="UI._buyMachine()">${buyLabel}</button>
      </div>`;
  },

  _upgradeML() {
    if (MachineShop.upgradeMachineLevel(this._selectedMachine)) {
      this._renderMachinePanel();
      this._updateStatus();
    }
  },

  _buyMachine() {
    if (MachineShop.buyMachine()) {
      this._renderMachinePanel();
      this._updateStatus();
    }
  },

  // ── Status panel (right side) ─────────────────────────────────────────────

  render() {
    this._updateStatus();
  },

  _updateStatus() {
    const money = State.money;
    document.getElementById('balance-display').textContent = formatMoney(money);
    document.getElementById('status-money').textContent    = formatMoney(money);

    const ips    = State.incomePerSecond;
    const rateEl = document.getElementById('status-rate');
    const sign   = ips > 0 ? '+' : '';
    rateEl.textContent = sign + formatMoney(ips) + '/s';
    rateEl.className   = ips > 0 ? 'rate-up' : ips < 0 ? 'rate-down' : 'rate-zero';

    const cap  = State.floorCapacity;
    const pop  = Math.min(Math.round(State.floorPopulation), cap);
    const mult = 1 + (State.floorPopulation / FLOOR_CAPACITY_START) * CROWD_MULT_BONUS_BASE;
    document.getElementById('crowd-count').textContent = `CROWD  ${pop} / ${cap}`;
    document.getElementById('crowd-mult').textContent  = mult.toFixed(2) + 'x WAGER';

    const crowdFill = document.getElementById('crowd-bar-fill');
    if (crowdFill) crowdFill.style.width = Math.min(100, (pop / cap) * 100).toFixed(1) + '%';

    if (this._openPanel === 'supercomputer') this._refreshSCAffordability();

    const t = State.tick;
    const setVal = (id, val, avail) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (!avail) { el.textContent = '--'; el.className = 'earn-val earn-unknown'; return; }
      el.textContent = formatMoney(val);
      el.className   = 'earn-val ' + (val >= 0 ? 'earn-pos' : 'earn-neg');
    };
    setVal('earn-prev-1m', earningsInWindow(t - 120, t - 60),    t >= 120);
    setVal('earn-curr-1m', earningsInWindow(t - 60,  t),         t >= 1);
    setVal('earn-prev-5m', earningsInWindow(t - 600, t - 300),   t >= 600);
    setVal('earn-curr-5m', earningsInWindow(t - 300, t),         t >= 1);
    setVal('earn-prev-1h', earningsInWindow(t - 7200, t - 3600), t >= 7200);
    setVal('earn-curr-1h', earningsInWindow(t - 3600, t),        t >= 1);
  },
};
