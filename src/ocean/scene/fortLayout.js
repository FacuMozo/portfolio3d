// --- Square fort -------------------------------------------------------------
// Kenney castle pieces: the crenellated face runs along local X (wall/window 2.0 wide,
// gate 4.0, all 4.4 tall); local Z is the wall's depth (2.8, walkway) and +Z its outer
// face. A piece on a side with outward normal (nx, nz) gets rotation-y = atan2(nx, nz):
// its X then runs along the side and its front faces out. The same rule aims the cannons
// (their barrel points along local +Z).
//
// A tower stands on every corner. Its footprint (tower-complete-large: 3.62 wide, 10.22
// tall) is sized to the wall's depth so it caps the corner, and the walls only fill the
// span *between* towers, so pieces don't run through them.
const PIECE_LENGTH = { 'castle-gate': 4, 'castle-wall': 2, 'castle-window': 2 };
const WALL = { height: 4.4, depth: 2.8 };
const TOWER = { name: 'tower-complete-large', width: 3.62, height: 10.22 };
const GATE_SIDE = ['castle-wall', 'castle-window', 'castle-gate', 'castle-window', 'castle-wall'];
const PLAIN_SIDE = ['castle-wall', 'castle-window', 'castle-wall', 'castle-window', 'castle-wall'];
const TOWER_OVER_WALL = 1.9; // tower height / wall height
const CANNON_SCALE = 0.8;

/**
 * Pieces [name, x, z, rotationY, scale] of a square fort centred on (cx, cz), gate facing +X.
 * `cannons`: sides that get a pair of cannons ('front' flanks the gate, 'back' the opposite side).
 * The array also carries `half` (half the side length, world units).
 */
export const squareFort = ({ scale: s, cx = 0, cz = 0, cannons = ['front'] }) => {
  const sideLength = (names) => names.reduce((sum, n) => sum + PIECE_LENGTH[n], 0);
  const h = (sideLength(GATE_SIDE) * s) / 2;
  const towerScale = (WALL.height * s * TOWER_OVER_WALL) / TOWER.height;
  // Walls start a little inside each tower (a 15% overlap hides the seam).
  const towerR = (TOWER.width * towerScale) / 2;
  const inset = towerR * 0.85;
  const span = 2 * (h - inset);

  const pieces = [];
  // `place(offset)` -> [x, z] along the side; (nx, nz) is the side's outward normal.
  const lay = (names, [nx, nz], place) => {
    const stretch = span / (sideLength(names) * s);
    const rot = Math.atan2(nx, nz);
    let o = -span / 2;
    for (const name of names) {
      const l = PIECE_LENGTH[name] * s * stretch;
      const [x, z] = place(o + l / 2);
      pieces.push([name, x, z, rot, [s * stretch, s, s]]);
      o += l;
    }
  };
  lay(GATE_SIDE, [1, 0], (o) => [cx + h, cz + o]);
  lay(PLAIN_SIDE, [-1, 0], (o) => [cx - h, cz + o]);
  lay(PLAIN_SIDE, [0, 1], (o) => [cx + o, cz + h]);
  lay(PLAIN_SIDE, [0, -1], (o) => [cx + o, cz - h]);
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    pieces.push([TOWER.name, cx + sx * h, cz + sz * h, 0, towerScale]);
  }

  // Cannons on the beach, outside the wall, halfway between the gate and each corner.
  const out = h + (WALL.depth * s) / 2 + 1.3;
  for (const side of cannons) {
    const dir = side === 'front' ? 1 : -1;
    for (const along of [-1, 1]) {
      pieces.push(['cannon', cx + dir * out, cz + along * h * 0.55, Math.atan2(dir, 0), CANNON_SCALE]);
    }
  }

  pieces.half = h;
  return pieces;
};
