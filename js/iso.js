// Isometric rendering utilities
// Convention: (col, row) → screen top-vertex of tile diamond
// TILE_W = diamond full width, TILE_H = diamond full height

const ISO = (() => {
  const TILE_W = 96;
  const TILE_H = 48;

  function toScreen(col, row, ox, oy) {
    return {
      x: (col - row) * TILE_W / 2 + ox,
      y: (col + row) * TILE_H / 2 + oy
    };
  }

  function toTile(sx, sy, ox, oy) {
    const dx = sx - ox;
    const dy = sy - oy;
    const col = (dx / (TILE_W / 2) + dy / (TILE_H / 2)) / 2;
    const row = (dy / (TILE_H / 2) - dx / (TILE_W / 2)) / 2;
    return { col: Math.floor(col), row: Math.floor(row) };
  }

  // Draw a flat isometric tile diamond. sx,sy = top vertex.
  function drawTile(ctx, sx, sy, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(sx,           sy);
    ctx.lineTo(sx + TILE_W / 2, sy + TILE_H / 2);
    ctx.lineTo(sx,           sy + TILE_H);
    ctx.lineTo(sx - TILE_W / 2, sy + TILE_H / 2);
    ctx.closePath();
    if (fill)   { ctx.fillStyle = fill;     ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  }

  // Draw an isometric box on a tile. sx,sy = top vertex of tile footprint.
  // boxH = height in pixels the box rises above the tile.
  // colors: { top, left, right, topStroke, sideStroke }
  function drawBox(ctx, sx, sy, boxH, colors) {
    const hw = TILE_W / 2;
    const hh = TILE_H / 2;

    // Right face (south-east wall) — draw first so left face overlaps edge
    ctx.beginPath();
    ctx.moveTo(sx + hw, sy + hh - boxH);
    ctx.lineTo(sx,      sy + TILE_H - boxH);
    ctx.lineTo(sx,      sy + TILE_H);
    ctx.lineTo(sx + hw, sy + hh);
    ctx.closePath();
    ctx.fillStyle = colors.right;
    ctx.fill();
    if (colors.sideStroke) {
      ctx.strokeStyle = colors.sideStroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Left face (south-west wall)
    ctx.beginPath();
    ctx.moveTo(sx - hw, sy + hh - boxH);
    ctx.lineTo(sx,      sy + TILE_H - boxH);
    ctx.lineTo(sx,      sy + TILE_H);
    ctx.lineTo(sx - hw, sy + hh);
    ctx.closePath();
    ctx.fillStyle = colors.left;
    ctx.fill();
    if (colors.sideStroke) {
      ctx.strokeStyle = colors.sideStroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Top face — drawn last so it sits on top
    ctx.beginPath();
    ctx.moveTo(sx,      sy - boxH);
    ctx.lineTo(sx + hw, sy + hh - boxH);
    ctx.lineTo(sx,      sy + TILE_H - boxH);
    ctx.lineTo(sx - hw, sy + hh - boxH);
    ctx.closePath();
    ctx.fillStyle = colors.top;
    ctx.fill();
    if (colors.topStroke) {
      ctx.strokeStyle = colors.topStroke;
      ctx.lineWidth = 2;
      ctx.shadowColor = colors.topStroke;
      ctx.shadowBlur  = 6;
      ctx.stroke();
      ctx.shadowBlur  = 0;
    }
  }

  return { TILE_W, TILE_H, toScreen, toTile, drawTile, drawBox };
})();
