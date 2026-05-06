const Input = {
  init() {
    const canvas = State.canvas;

    canvas.addEventListener('click', e => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width  / rect.width;
      const scaleY = canvas.height / rect.height;
      // Canvas pixel coordinates
      const cx = (e.clientX - rect.left) * scaleX;
      const cy = (e.clientY - rect.top)  * scaleY;
      // CSS pixel coordinates (for HTML overlay positioning)
      const cssX = e.clientX - rect.left;
      const cssY = e.clientY - rect.top;

      // 1. Supercomputer hit test
      if (Supercomputer.containsPoint(cx, cy)) {
        if (UI._openPanel === 'supercomputer') {
          UI.closeAllPanels();
        } else {
          UI.openSupercomputer();
        }
        return;
      }

      // 2. Machine hit test (tile-based)
      const tile    = ISO.toTile(cx, cy, State.floorOriginX, State.floorOriginY);
      const machine = State.machines.find(m => m.col === tile.col && m.row === tile.row);
      if (machine) {
        if (UI._openPanel === 'machine' && UI._selectedMachine === machine) {
          UI.closeAllPanels();
        } else {
          UI.openMachinePanel(machine, cssX, cssY);
        }
        return;
      }

      // 3. Close any open panel on click-outside
      if (UI.isAnyPanelOpen()) {
        UI.closeAllPanels();
        return;
      }

      // 4. Floor click - spawn crowd person + increment population
      const f = State.floor;
      if (f && tile.col >= 0 && tile.col < f.cols && tile.row >= 0 && tile.row < f.rows) {
        if (Math.round(State.floorPopulation) < State.floorCapacity) {
          State.floorPopulation = Math.min(State.floorPopulation + 1, State.floorCapacity);
          State.crowdPersons.push(new CrowdPerson(cx, cy));
        }
      }
    });
  },
};
