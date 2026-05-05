// Unified input - every action reachable by mouse OR keyboard

const Input = {
  init() {
    const canvas = State.canvas;

    // Mouse: click a machine tile to trigger immediate spins
    canvas.addEventListener('click', e => {
      const r    = canvas.getBoundingClientRect();
      const sx   = canvas.width  / r.width;
      const sy   = canvas.height / r.height;
      const cx   = (e.clientX - r.left) * sx;
      const cy   = (e.clientY - r.top)  * sy;
      const tile = ISO.toTile(cx, cy, State.floorOriginX, State.floorOriginY);
      const machine = State.machines.find(m => m.col === tile.col && m.row === tile.row);
      if (machine) applyClick(machine);
    });

    // Keyboard
    document.addEventListener('keydown', e => {
      switch (e.code) {

        // 1-9 - buy shop item at that slot
        case 'Digit1': case 'Digit2': case 'Digit3':
        case 'Digit4': case 'Digit5': case 'Digit6':
        case 'Digit7': case 'Digit8': case 'Digit9':
          UI.buy(parseInt(e.key) - 1);
          break;

        // Arrow keys - scroll shop focus
        case 'ArrowDown':
          e.preventDefault();
          UI.moveFocus(1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          UI.moveFocus(-1);
          break;

        // Enter / Space - purchase focused item
        case 'Enter':
        case 'Space':
          UI.buy(UI.getFocusIndex());
          break;
      }
    });
  },
};
