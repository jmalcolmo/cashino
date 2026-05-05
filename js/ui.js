// Manages the HTML shop panel and all HUD text updates

const UI = {
  _focusIndex: 0,

  init() {
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

    this._focusIndex = Math.max(0, Math.min(this._focusIndex, items.length - 1));

    if (list.children.length !== items.length) {
      this._buildShopDOM(items);
    } else {
      items.forEach((item, i) => {
        const el = list.children[i];
        if (!el) return;
        const affordable = Shop.canAfford(item);
        el.className = 'shop-item' +
          (affordable             ? ' affordable'  : ' unaffordable') +
          (i === this._focusIndex ? ' focused'     : '');
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

    this._buildShopDOM(Shop.visibleItems());

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
    const el = document.getElementById('shop-items-list').children[this._focusIndex];
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    this._updateShop();
  },

  getFocusIndex() { return this._focusIndex; },
};
