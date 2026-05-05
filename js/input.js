// Unified input - every action reachable by mouse OR keyboard

const Input = {
  init() {
    const canvas = State.canvas;

    // ── Mouse: click floor to hype ──────────────────────────
    canvas.addEventListener('click', e => {
      const r  = canvas.getBoundingClientRect();
      const sx = canvas.width  / r.width;
      const sy = canvas.height / r.height;
      triggerHype(
        (e.clientX - r.left) * sx,
        (e.clientY - r.top)  * sy
      );
    });

    // ── Keyboard ────────────────────────────────────────────
    document.addEventListener('keydown', e => {
      switch (e.code) {

        // H - hype from canvas center
        case 'KeyH':
          triggerHype(State.canvas.width / 2, State.canvas.height / 2);
          break;

        // 1–9 - buy shop item at that slot
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
