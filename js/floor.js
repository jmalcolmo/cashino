class Floor {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this._grid = [];
    for (let r = 0; r < rows; r++) {
      this._grid[r] = new Array(cols).fill(false); // false = unoccupied
    }
  }

  isValid(col, row) {
    return col >= 0 && col < this.cols && row >= 0 && row < this.rows;
  }

  isOccupied(col, row) {
    return !this.isValid(col, row) || this._grid[row][col];
  }

  setOccupied(col, row, val) {
    if (this.isValid(col, row)) this._grid[row][col] = val;
  }

  // Returns a random unoccupied interior tile (stays 1 tile from edge for breathing room)
  findFreeTile() {
    const candidates = [];
    for (let r = 1; r < this.rows - 1; r++) {
      for (let c = 1; c < this.cols - 1; c++) {
        if (!this._grid[r][c]) candidates.push({ col: c, row: r });
      }
    }
    if (!candidates.length) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  freeCount() {
    let n = 0;
    for (let r = 1; r < this.rows - 1; r++)
      for (let c = 1; c < this.cols - 1; c++)
        if (!this._grid[r][c]) n++;
    return n;
  }
}
