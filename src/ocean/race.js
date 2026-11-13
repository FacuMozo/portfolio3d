// Builds the per-race layout (obstacles, pickups, mortars) for a difficulty.
// Pure data: deterministic, so the same difficulty always gives the same course.
import { CHECKPOINT_RADIUS, ISLANDS, RACE_CHECKPOINTS, RACE_DIFFICULTY, RACE_START } from './config'

const seeded = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

const ROCKS = ['rocks-a', 'rocks-b', 'rocks-c'];
const ROCK_SCALE = 0.55;
// Each rock's footprint at the waterline (it sits at y = -0.4), measured from
// the models at ROCK_SCALE: [center offset x, z in the model frame, radius].
const ROCK_FOOTPRINT = {
  'rocks-a': [-0.1, 0.07, 1.3],
  'rocks-b': [-0.03, 0.04, 1.18],
  'rocks-c': [0.05, -0.01, 0.98],
};

// Rock at (x, z) with its collider: the footprint offset turned by the rock's
// rotation (three.js Y rotation: local (x, z) -> (x cos + z sin, -x sin + z cos)).
const makeRock = (x, z, model, rotation) => {
  const [ox, oz, radius] = ROCK_FOOTPRINT[model];
  const c = Math.cos(rotation);
  const s = Math.sin(rotation);
  return { x, z, model, rotation, scale: ROCK_SCALE, radius, cx: x + ox * c + oz * s, cz: z - ox * s + oz * c };
};

/** Legs of the course: from the start through every checkpoint. */
export const raceLegs = () => {
  const points = [RACE_START, ...RACE_CHECKPOINTS];
  return points.slice(1).map((to, i) => ({ from: points[i], to }));
};

// Point on a leg at fraction `f`, shifted sideways by `side` units.
const along = ({ from, to }, f, side) => {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const len = Math.hypot(dx, dz);
  return [from[0] + dx * f + (-dz / len) * side, from[1] + dz * f + (dx / len) * side];
};

export const buildRace = (difficulty) => {
  const cfg = RACE_DIFFICULTY[difficulty];
  const rnd = seeded({ easy: 11, medium: 23, hard: 37 }[difficulty]);
  const legs = raceLegs();
  const rocks = [];
  const buoys = [];
  const pickups = [];

  legs.forEach((leg, i) => {
    const len = Math.hypot(leg.to[0] - leg.from[0], leg.to[1] - leg.from[1]);
    // Obstacles spread along the leg, alternating sides of the racing line,
    // keeping clear of the checkpoints at both ends.
    const n = cfg.obstaclesPerLeg;
    for (let k = 0; k < n; k++) {
      const f = (k + 1) / (n + 1) + (rnd() - 0.5) * 0.1;
      if (f * len < CHECKPOINT_RADIUS + 4 || (1 - f) * len < CHECKPOINT_RADIUS + 4) continue;
      const side = (k % 2 ? 1 : -1) * (1 + rnd() * 2.5);
      const [x, z] = along(leg, f, side);
      if ((i + k) % 2 === 0) {
        rocks.push(makeRock(x, z, ROCKS[(i + k) % ROCKS.length], rnd() * 6));
      } else {
        buoys.push({ x, z, model: k % 2 ? 'buoy' : 'buoy-flag', rotation: rnd() * 6 });
      }
    }
    // One pickup per leg, past the obstacles' midpoint, on the racing line.
    const type = cfg.pickups[i % cfg.pickups.length];
    if (type === 'repair' && !cfg.hp) return;
    const [x, z] = along(leg, 0.62, (rnd() - 0.5) * 3);
    pickups.push({ type, x, z, taken: false });
  });

  // Mortars sit on the shore of their island, on the side facing the course.
  const mortars = cfg.mortarIslands.map((id) => {
    const island = ISLANDS.find((is) => is.id === id);
    const [ix, iz] = island.position;
    let best = null;
    for (const leg of legs) {
      for (let f = 0; f <= 1; f += 0.1) {
        const [x, z] = along(leg, f, 0);
        const d = Math.hypot(x - ix, z - iz);
        if (!best || d < best.d) best = { d, x, z };
      }
    }
    const dir = Math.atan2(best.x - ix, best.z - iz);
    const r = island.radius * 0.75;
    return { x: ix + Math.sin(dir) * r, z: iz + Math.cos(dir) * r, aim: dir, fireIn: 2 + rnd() * 2, recoil: 0 };
  });

  return { rocks, buoys, pickups, mortars };
};
