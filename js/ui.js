// Manages the HTML shop panel and all HUD text updates

const UI = {
  _focusIndex: 0,

  init() {
    document.getElementById('hype-btn').addEventListener('click', () => {
      triggerHype(State.canvas.width / 2, State.canvas.height / 2);
    });
    this.render();
  },

  render() {
    this._updateHUD();
    this._updateShop();
  },

  _updateHUD() {
    const money = Math.floor(State.money);
    document.getElementById('balance-display').textContent =
      '$' + money.toLocaleString();

    const btn = document.getElementById('hype-btn');
    if (State.hype.cooldown > 0) {
      btn.className   = 'hype-cooldown';
      btn.textContent = `[H] ${State.hype.cooldown.toFixed(1)}s`;
    } else {
      btn.className   = 'hype-ready';
      btn.innerHTML   = '<span class="key-hint">[H]</span> HYPE THE FLOOR';
    }
  },

  _updateShop() {
    const money = Math.floor(State.money);
    document.getElementById('shop-money').textContent = '$' + money.toLocaleString();

    const ips      = State.incomePerSecond;
    const rateEl   = document.getElementById('shop-rate');
    const sign     = ips > 0 ? '▲' : ips < 0 ? '▼' : '-';
    rateEl.textContent = `${sign} $${Math.abs(ips).toFixed(2)}/s`;
    rateEl.className   = ips > 0 ? 'rate-up' : ips < 0 ? 'rate-down' : 'rate-zero';

    const items = Shop.visibleItems();
    const list  = document.getElementById('shop-items-list');

    // Clamp focus index
    this._focusIndex = Math.max(0, Math.min(this._focusIndex, items.length - 1));

    // Only rebuild DOM if item count changed (avoid flicker on every frame)
    if (list.children.length !== items.length) {
      this._buildShopDOM(items);
    } else {
      // Update affordability classes only
      items.forEach((item, i) => {
        const el = list.children[i];
        if (!el) return;
        const affordable = Shop.canAfford(item);
        el.className = 'shop-item' +
          (affordable                     ? ' affordable'  : ' unaffordable') +
          (i === this._focusIndex         ? ' focused'     : '');
        el.querySelector('.item-cost').textContent =
          '$' + Shop.cost(item).toLocaleString();
      });
    }
  },

  _buildShopDOM(items) {
    const list = document.getElementById('shop-items-list');
    list.innerHTML = '';

    items.forEach((item, i) => {
      const affordable = Shop.canAfford(item);
      const div = document.createElement('div');
      div.className = 'shop-item' +
        (affordable             ? ' affordable'  : ' unaffordable') +
        (i === this._focusIndex ? ' focused'     : '');
      div.setAttribute('tabindex', '0');

      div.innerHTML = `
        <span class="item-hotkey">${i + 1}</span>
        <div class="item-name">${item.name}</div>
        <div class="item-desc">${item.desc.replace(/\n/g, '<br>')}</div>
        <div class="item-footer">
          <span class="item-cost">$${Shop.cost(item).toLocaleString()}</span>
          <span class="item-count">${item.purchased}/${item.maxCount}</span>
        </div>
      `;

      div.addEventListener('click', () => this.buy(i));
      list.appendChild(div);
    });
  },

  buy(index) {
    const items = Shop.visibleItems();
    if (index < 0 || index >= items.length) return;
    const item = items[index];
    if (!Shop.purchase(item)) return;

    // Rebuild shop DOM after purchase (counts/costs change)
    this._buildShopDOM(Shop.visibleItems());

    // Flash the item
    const el = document.getElementById('shop-items-list').children[index];
    if (el) {
      el.classList.add('just-bought');
      setTimeout(() => el.classList.remove('just-bought'), 400);
    }
    this.render();
  },

  moveFocus(delta) {
    const items = Shop.visibleItems();
    this._focusIndex = (this._focusIndex + delta + items.length) % items.length;
    // Scroll focused item into view
    const el = document.getElementById('shop-items-list').children[this._focusIndex];
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    this._updateShop();
  },

  getFocusIndex() { return this._focusIndex; },
};
