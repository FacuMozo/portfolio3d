// World layout and gameplay tuning for the ocean home screen.
// Units are world units on the XZ plane; the sea surface sits at y = 0.

export const WORLD_RADIUS = 60; // boundary the ship can't leave

// Each island is one section of the portfolio. `kind` picks its decoration,
// `page` is the full-page route its modal links to (if any).
// Laid out around the origin so that, seen from the isometric camera, the ship
// starts facing "About" (ahead-left) and "Projects" (ahead-right), with Help and
// CV to the sides and the Fort behind.
export const ISLANDS = [
  { id: 'help', kind: 'lighthouse', position: [20.5, -13.4], radius: 4.5, color: '#f59e0b', page: null },
  { id: 'about', kind: 'village', position: [-31, -5.7], radius: 7, color: '#22c55e', page: '/about' },
  { id: 'projects', kind: 'tower', position: [-7.1, -31], radius: 7.5, color: '#3b82f6', page: '/projects' },
  { id: 'cv', kind: 'treasure', position: [-13.4, 23.3], radius: 6, color: '#eab308', page: '/contact' },
  { id: 'fort', kind: 'fort', position: [19.1, 19.1], radius: 7, color: '#ef4444', page: null },
];

// Islands are drawn with Kenney's sand patch, stretched to the island radius
// and rotated per island. Its outline is irregular, so collisions, foam and the
// docking ring use its real silhouette: the max vertex distance from the center
// in 32 directions (model units, angle measured from local +X toward +Z),
// extracted from patch-sand.glb.
const PATCH_PROFILE = [
  3.97, 3.97, 3.97, 3.97, 3.72, 3.36, 3.36, 3.36, 3.08, 3.01, 3.08, 3.08, 3.08, 3.21, 3.58, 3.87,
  3.87, 3.87, 3.8, 3.32, 2.66, 2.82, 2.82, 3.1, 3.1, 3.28, 3.28, 4.26, 4.26, 4.26, 4.11, 3.87,
];
for (const [i, island] of ISLANDS.entries()) {
  island.patchScale = (island.radius * 2.15) / 6.04;
  island.rotation = i + 1;
  island.profile = PATCH_PROFILE.map((r) => r * island.patchScale);
}

// Solid scenery in the sea, shaped as oriented ellipses.
export const OBSTACLES = [
  { model: 'ship-wreck', position: [-44, 18], rotation: 0.7, scale: 0.45, halfX: 1.4, halfZ: 2.8, y: -0.6, tilt: [0.08, 0.12] },
  { model: 'buoy-flag', position: [-38, -22], rotation: 0, scale: 0.9, halfX: 0.55, halfZ: 0.55, y: -0.15, dynamic: true },
  { model: 'buoy', position: [5, 42], rotation: 1, scale: 0.9, halfX: 0.55, halfZ: 0.55, y: -0.15, dynamic: true },
  { model: 'buoy-flag', position: [40, -5], rotation: 2, scale: 0.9, halfX: 0.55, halfZ: 0.55, y: -0.15, dynamic: true },
  { model: 'buoy', position: [-25, -40], rotation: 3, scale: 0.9, halfX: 0.55, halfZ: 0.55, y: -0.15, dynamic: true },
];

// Harbor island on the right of the screen (world angle -45°). It's big and
// lies mostly beyond the boundary, lost in the clouds: only its tip pokes into
// the sea as a triangle, with a square fort on it. Scenery only (no modal), but
// solid, with shallows around it. Its patch is turned so the outline's sharpest
// point (profile bin ~28, 5.3 rad) faces the map center.
const EDGE_ANGLE = -Math.PI / 4;
export const EDGE_ISLAND = (() => {
  const radius = 11;
  const patchScale = (radius * 2.15) / 6.04;
  const profile = PATCH_PROFILE.map((r) => r * patchScale);
  const rotation = 5.3 - (EDGE_ANGLE + Math.PI);
  const tip = WORLD_RADIUS - 4; // how far the tip reaches into the sea
  const dist = tip + Math.max(...profile);
  return {
    id: 'harbor',
    angle: EDGE_ANGLE,
    dist,
    position: [Math.cos(EDGE_ANGLE) * dist, Math.sin(EDGE_ANGLE) * dist],
    radius,
    patchScale,
    rotation,
    profile,
  };
})();

// Everything with foam around it (used by the water shader).
export const COLLIDERS = [...ISLANDS, EDGE_ISLAND, ...OBSTACLES];
// Solid, immovable: boats are pushed out of these.
export const STATIC_COLLIDERS = COLLIDERS.filter((c) => !c.dynamic);
// Buoys are anchored on a spring: they get knocked away, wobble and drift back.
export const BUOYS = OBSTACLES.filter((o) => o.dynamic);
// `edgeBoost`: the boundary buoys (and the boundary itself) send boats back 25% harder.
export const BUOY = { spring: 5, damping: 2.2, push: 0.9, bounce: 0.75, edgeBoost: 1.25 };

export const PROFILE_BINS = PATCH_PROFILE.length;

/**
 * Distance from a collider's center to its edge in a direction given in the
 * collider's local frame (radians from local +X toward +Z).
 */
export const colliderRadius = (c, angle) => {
  if (c.profile) {
    const n = c.profile.length;
    const t = (((angle / (Math.PI * 2)) * n) % n + n) % n;
    const i = Math.floor(t);
    const f = t - i;
    return c.profile[i] * (1 - f) + c.profile[(i + 1) % n] * f;
  }
  const cos = Math.cos(angle) / c.halfX;
  const sin = Math.sin(angle) / c.halfZ;
  return 1 / Math.sqrt(cos * cos + sin * sin);
};

/** Edge radius sampled in PROFILE_BINS directions (for the water shader / dock ring). */
export const colliderProfile = (c) =>
  Array.from({ length: PROFILE_BINS }, (_, i) => colliderRadius(c, (i / PROFILE_BINS) * Math.PI * 2));

const insideEdgeIsland = (x, z) => {
  const dx = x - EDGE_ISLAND.position[0];
  const dz = z - EDGE_ISLAND.position[1];
  // Collider-local angle = world angle + rotation (see colliderRadius).
  return Math.hypot(dx, dz) < colliderRadius(EDGE_ISLAND, Math.atan2(dz, dx) + EDGE_ISLAND.rotation);
};

/**
 * Pier running from the island's camera-facing shore along the boundary, just
 * outside it, so it shows below the island. `along(t)` is the point t units
 * from the island's axis, heading toward the camera (the ring's tangent there).
 */
export const PIER = (() => {
  const radius = WORLD_RADIUS + 4;
  const c = Math.cos(EDGE_ANGLE);
  const s = Math.sin(EDGE_ANGLE);
  const along = (t, r = radius) => [c * r - s * t, s * r + c * t];
  let shore = 0;
  while (shore < 40 && insideEdgeIsland(...along(shore))) shore += 0.1;
  const tile = 2.25;
  const tiles = 4;
  const start = shore - 1.5;
  const end = start + tile * (tiles - 1);
  return { radius, along, start, end, tile, tiles, heading: -EDGE_ANGLE, angle: EDGE_ANGLE };
})();

// The boundary is a ring of evenly spaced slots. Most hold a spring buoy,
// centered on WORLD_RADIUS so boats bump into it right before the boundary
// (which catches the gaps); a few hold a moored ship instead, and the ones
// under the harbor island are left empty.
export const BOUNDARY_SLOTS = Math.round((2 * Math.PI * WORLD_RADIUS) / 9);
const slotAngle = (i) => (i / BOUNDARY_SLOTS) * Math.PI * 2;
/**
 * Ships replacing boundary buoys, lying along the ring just outside it.
 * `length` / `beam` are their footprint in world units (for clearing slots and
 * traffic); the big liner spans three buoys.
 */
export const MOORED_SHIPS = [
  { slot: 7, model: 'ship-cargo-a', length: 4, beam: 1.5 },
  { slot: 17, model: 'ship-ocean-liner-small', scale: 2, length: 30.4, beam: 9.5 },
  { slot: 27, model: 'ship-cargo-b', length: 4, beam: 1.5 },
].map((ship) => {
  const a = slotAngle(ship.slot);
  const r = WORLD_RADIUS + ship.beam / 2 + 0.6;
  return { ...ship, angle: a, radius: r, position: [Math.cos(a) * r, Math.sin(a) * r], heading: -a };
});

// The big liner's Titanic moment: an iceberg dead ahead of its bow (bows point
// along increasing angle), and the liner itself listing, bow down.
const LINER = MOORED_SHIPS[1];
export const ICEBERG = (() => {
  const a = LINER.angle + (LINER.length / 2 + 5) / LINER.radius;
  const r = LINER.radius + 0.8;
  return { position: [Math.cos(a) * r, Math.sin(a) * r], angle: a, size: 3.2 };
})();
LINER.tilt = { pitch: 0.07, roll: -0.05 };

const angleGap = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
const blockedSlot = (slot, [x, z]) =>
  insideEdgeIsland(x, z) ||
  Math.hypot(x - PIER.along(PIER.start)[0], z - PIER.along(PIER.start)[1]) < 3 ||
  Math.hypot(x - ICEBERG.position[0], z - ICEBERG.position[1]) < ICEBERG.size + 1.5 ||
  MOORED_SHIPS.some((m) => angleGap(slotAngle(slot), m.angle) * WORLD_RADIUS < m.length / 2 + 1);

export const BOUNDARY_BUOYS = Array.from({ length: BOUNDARY_SLOTS }, (_, slot) => {
  const a = slotAngle(slot);
  return {
    slot,
    position: [Math.cos(a) * WORLD_RADIUS, Math.sin(a) * WORLD_RADIUS],
    model: slot % 2 === 0 ? 'buoy-flag' : 'buoy',
    rotation: a,
    scale: 1.1,
    halfX: 0.67,
    y: -0.15,
    edge: true,
  };
}).filter((b) => !blockedSlot(b.slot, b.position));

/**
 * Ships cruising beyond the boundary while exploring. Each circles the map at
 * `radius` ± `sway` (units/s `speed`, negative = clockwise); the far ones weave
 * in and out of the cloud ring. All swing wide around the harbor island.
 */
export const TRAFFIC = [
  { model: 'ship-ocean-liner-small', radius: 64.6, sway: 0.5, swayFreq: 0.05, speed: 1.2, phase: 0.4 },
  { model: 'ship-cargo-c', radius: 64.6, sway: 0.5, swayFreq: 0.04, speed: 1.2, phase: 0.4 + Math.PI },
  { model: 'ship-ocean-liner', radius: 74, sway: 5, swayFreq: 0.013, speed: -1.6, phase: 2.2 },
  { model: 'ship-cargo-a', radius: 87, sway: 5, swayFreq: 0.017, speed: 1.9, phase: 5.1 },
];
// Where traffic swings out (to at least `radius`, over ~`spread` rad around
// `angle`): around the harbor island and its pier, and the big moored liner.
export const TRAFFIC_CLEARANCES = [
  { angle: EDGE_ANGLE + 0.1, radius: EDGE_ISLAND.dist + Math.max(...EDGE_ISLAND.profile) + 3, spread: 0.4 },
  // The liner and the iceberg ahead of it.
  {
    angle: (LINER.angle + ICEBERG.angle) / 2,
    radius: LINER.radius + LINER.beam / 2 + 2,
    spread: (LINER.length / 2 + 12) / LINER.radius,
  },
];

// Clouds part over this arc (radians) so the pier stays in sight.
export const CLOUD_GAP = {
  from: EDGE_ANGLE + (PIER.start - 2) / PIER.radius,
  to: EDGE_ANGLE + (PIER.end + 10) / PIER.radius,
  radius: PIER.radius + 16,
};

// Ring of clouds hiding the open sea beyond the boundary.
export const CLOUDS = { inner: WORLD_RADIUS + 6, outer: WORLD_RADIUS + 36, count: 72 };

// Distance from an island's shore at which "press E to dock" appears.
export const DOCK_RANGE = 12;

export const SHIP = {
  radius: 1.9, // roughly half the hull length, so the bow doesn't clip into things
  maxSpeed: 11,
  reverseSpeed: 4,
  accel: 7,
  drag: 1.4,
  turnRate: 1.9, // rad/s at full speed
  maxHp: 10,
  cannonCooldown: 1.1, // seconds between broadsides
  exploreScale: 1.8, // drawn (and collides) bigger while exploring the zoomed-out map
  ballSpeed: 22,
  ballLift: 6,
};

export const ENEMY = {
  radius: 1.1,
  orbitDistance: 11, // tries to circle the player at this range
  fireRange: 13.6, // only fires when the player is this close
  ballSpeed: 16,
  ballLift: 6,
};

export const GRAVITY = 18;

// Isometric camera. Exploring: zoomed out to fit every island, framed between
// the map center and the ship. Combat: zoomed in, centered on the ship.
export const CAMERA = {
  mapCenter: [0, 0],
  exploreView: [100, 62], // world units that must fit horizontally / vertically
  exploreFollow: 0.5, // 0 = fixed on map center, 1 = centered on the ship
  combatView: 46,
};

// Three waves of increasing difficulty.
export const WAVES = [
  { count: 3, hp: 1, speed: 6, fireEvery: [3.2, 4.5] },
  { count: 5, hp: 2, speed: 7, fireEvery: [2.6, 3.8] },
  { count: 7, hp: 2, speed: 8, fireEvery: [2.0, 3.2] },
];

export const WAVE_BREAK = 3; // seconds between waves

// --- Race mode ----------------------------------------------------------------

// One lap around the archipelago. Checkpoints are gates the ship must pass in
// order; the last one is the start/finish line.
export const RACE_START = [0, 0];
export const RACE_CHECKPOINTS = [
  [-16, -18], [-10, -48], [14, -34], [38, -22], [36, 4],
  [36, 38], [4, 36], [-30, 40], [-46, 0], [-18, 8],
  RACE_START,
];
export const CHECKPOINT_RADIUS = 4.5;

export const PICKUP = {
  radius: 2.2,
  boost: { duration: 3, speed: 1.6 }, // speed multiplier
  slow: { duration: 2.5, speed: 0.5 },
  repair: { hp: 3 },
};

// Island mortars: they mark a circle on the water and the shell lands after a delay.
export const MORTAR = { lift: 26, fallTime: 0.55 };

export const RACE_DIFFICULTY = {
  easy: {
    obstaclesPerLeg: 1,
    // Pickup pattern by leg index: one entry per leg, cycled.
    pickups: ['boost', 'boost', 'slow', 'boost'],
    hp: false,
    mortarIslands: [],
    enemies: null,
  },
  medium: {
    obstaclesPerLeg: 2,
    pickups: ['boost', 'slow', 'repair', 'boost', 'slow'],
    hp: true,
    mortarIslands: ['about', 'projects', 'fort'],
    mortar: { range: 22, every: [3, 4.2], delay: 2, radius: 3.2 },
    enemies: { count: 2, hp: 2, speed: 7, fireEvery: [3, 4.2] },
  },
  hard: {
    obstaclesPerLeg: 3,
    pickups: ['slow', 'boost', 'slow', 'repair', 'slow', 'boost'],
    hp: true,
    mortarIslands: ['help', 'about', 'projects', 'cv', 'fort'],
    mortar: { range: 26, every: [2, 3], delay: 1.5, radius: 3.8 },
    enemies: { count: 4, hp: 2, speed: 8, fireEvery: [2.2, 3.2] },
  },
};
