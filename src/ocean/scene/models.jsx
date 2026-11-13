// Ships and islands built from Kenney's Pirate Kit / Watercraft Pack (CC0, www.kenney.nl).
// Files live in /public/models/<kit>/ next to the kit's shared Textures/colormap.png.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Clone, useGLTF } from '@react-three/drei'
import { OBSTACLES } from '../config'
import { MAP_BUOY_COUNT, world } from '../store'
import { waveHeight } from '../waves'

const KIT = {
  pirate: '/models/pirate/',
  watercraft: '/models/watercraft/',
};

const url = (name) => (/^(buoy|arrow|ship-ocean|ship-cargo)/.test(name) ? KIT.watercraft : KIT.pirate) + name + '.glb';

/** One Kenney model by file name, cloned so it can be placed many times. */
export const Model = ({ name, ...props }) => {
  const { scene } = useGLTF(url(name));
  return <Clone object={scene} castShadow receiveShadow {...props} />;
};

// --- Ships ------------------------------------------------------------------
// Kenney ships sit with the keel at y = 0; lower them a bit so they float.
// Like our ships, their bow points to +Z.

export const PlayerShipModel = () => (
  <Model name='ship-small' scale={0.4} position-y={-0.35} />
);

export const EnemyBoatModel = () => (
  <Model name='ship-pirate-small' scale={0.26} position-y={-0.25} />
);

// Scenery ships: scale, draft and, for models whose origin isn't amidships,
// a forward offset (model units) that recenters the hull.
const VESSELS = {
  'ship-small': { scale: 0.4, y: -0.35 },
  'ship-pirate-small': { scale: 0.4, y: -0.35 },
  'ship-ocean-liner': { scale: 0.32, y: -0.45 },
  'ship-ocean-liner-small': { scale: 0.32, y: -0.45, z: -3.04 },
  'ship-cargo-a': { scale: 0.38, y: -0.35 },
  'ship-cargo-b': { scale: 0.38, y: -0.35 },
  'ship-cargo-c': { scale: 0.36, y: -0.35 },
};

/** A ship centered on its hull, bow toward +Z. `scale` overrides the default size. */
export const VesselModel = ({ name, scale }) => {
  const v = VESSELS[name];
  const s = scale ?? v.scale;
  const k = s / v.scale; // draft grows with size
  return <Model name={name} scale={s} position={[0, v.y * k, (v.z ?? 0) * s]} />;
};

// --- Islands ----------------------------------------------------------------

const TOP = 0.8; // height of the sand surface

// Hand-placed landmark pieces per island kind: [model, x, z, rotationY, scale].
const LANDMARKS = {
  lighthouse: () => [
    ['tower-complete-small', 0.3, -0.4, 0.3, 0.45],
    ['barrel', 1.9, 1.2, 0, 0.6],
    ['crate', 1.3, 2, 0.6, 0.8],
    ['flag-high-pennant', -1.8, 1.2, 0.5, 0.8],
  ],
  village: () => [
    ['structure', -1.6, -1.2, 0.3, 0.95],
    ['structure', 1.9, 0, -0.4, 0.95],
    ['structure-roof', -0.2, 2.1, 0.9, 0.95],
    ['barrel', 0.5, -2.6, 0, 0.6],
    ['crate', 3.4, -1.8, 0.4, 0.8],
    ['flag-high-pennant', 2.8, 2.4, 0.2, 0.9],
  ],
  tower: () => [
    ['tower-complete-large', 0, -0.4, 0.4, 0.5],
    ['flag-high-pennant', -2.8, 1.8, 0.4, 0.9],
    ['crate', 2.6, 1.6, 0.3, 0.9],
    ['crate-bottles', 2.1, 2.7, -0.3, 0.9],
    ['barrel', 3.3, 0.4, 0, 0.6],
  ],
  treasure: () => [
    ['chest', 0.8, 0.5, 0.5, 1.5],
    ['chest', -1.9, 1.9, -0.4, 1.0],
    ['hole', -1.5, -0.9, 0, 1.1],
    ['tool-shovel', -0.4, -1.8, 0.8, 1.1],
    ['crate-bottles', 2, -1.3, 0.3, 1],
    ['flag-high-pennant', -2.4, 2, 0, 0.9],
  ],
  fort: (radius) => {
    // A ring of castle walls with a gate, cannons on the beach and a keep.
    const r = radius * 0.6;
    const scale = 0.55;
    const count = Math.round((2 * Math.PI * r) / (2.8 * scale));
    const pieces = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      pieces.push([i === 0 ? 'castle-gate' : 'castle-wall', Math.cos(a) * r, Math.sin(a) * r, -a, scale]);
    }
    for (const a of [0.8, 2.3, 3.9, 5.4]) {
      const d = radius * 0.84;
      pieces.push(['cannon', Math.cos(a) * d, Math.sin(a) * d, Math.atan2(Math.cos(a), Math.sin(a)), 0.8]);
    }
    pieces.push(['tower-complete-small', 0, 0, 0, 0.4]);
    pieces.push(['flag-pirate-high', 1.6, 1.4, 0.4, 0.8]);
    return pieces;
  },
};

const PALMS = ['palm-straight', 'palm-bend', 'palm-detailed-straight', 'palm-detailed-bend'];
const ROCKS = ['rocks-sand-a', 'rocks-sand-b', 'rocks-sand-c'];

// Deterministic pseudo-random so each island keeps its layout across renders.
const seeded = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

export const IslandModel = ({ kind, radius, seed = 1, patchScale, rotation }) => {
  const pieces = useMemo(() => {
    const rnd = seeded(seed * 9301 + 49297);
    const list = LANDMARKS[kind]?.(radius) ?? [];
    const palms = kind === 'fort' ? 2 : Math.round(radius * 0.55);
    for (let i = 0; i < palms; i++) {
      const a = rnd() * Math.PI * 2;
      const d = radius * (kind === 'fort' ? 0.92 : 0.68 + rnd() * 0.16);
      list.push([PALMS[i % PALMS.length], Math.cos(a) * d, Math.sin(a) * d, rnd() * 6, 0.5 + rnd() * 0.2]);
    }
    for (let i = 0; i < 3; i++) {
      const a = rnd() * Math.PI * 2;
      const d = radius * (0.95 + rnd() * 0.12);
      list.push([ROCKS[i], Math.cos(a) * d, Math.sin(a) * d, rnd() * 6, 0.32 + rnd() * 0.15, -0.6]);
    }
    return list;
  }, [kind, radius, seed]);

  // Sand patch shape (scale, rotation) comes from config so collisions match it.
  // Thickened so waves don't wash over it.
  return (
    <group>
      <Model name='patch-sand' scale={[patchScale, 5, patchScale]} position-y={TOP - 1.25} rotation-y={rotation} />
      <Model name='patch-grass-foliage' scale={[radius * 0.3, 1.2, radius * 0.3]} position-y={TOP - 0.05} rotation-y={seed * 2} />
      {pieces.map(([name, x, z, rot, scale, dy = 0], i) => (
        <Model key={i} name={name} position={[x, TOP + dy, z]} rotation-y={rot} scale={scale} />
      ))}
    </group>
  );
};

// --- Sea decoration ---------------------------------------------------------

const clamp = (v, m) => Math.max(-m, Math.min(m, v));

// A buoy on its spring: follows the simulated offset, bobs on the waves and
// leans the way it was shoved, wobbling for a bit after a hit.
// `index` points into world.buoys (map buoys first, then the race's own).
export const Buoy = ({ index, amp }) => {
  const ref = useRef();
  const buoy = world.buoys[index];
  useFrame(() => {
    const st = world.buoys[index];
    if (!st) return;
    const t = world.time;
    const x = st.x0 + st.ox;
    const z = st.z0 + st.oz;
    const g = ref.current;
    g.position.set(x, st.y + waveHeight(x, z, t, amp) * 0.8, z);
    const shake = st.wobble * 0.35;
    g.rotation.x = clamp(st.vz * 0.07, 0.6) + Math.sin(t * 9) * shake;
    g.rotation.z = clamp(-st.vx * 0.07, 0.6) + Math.cos(t * 7.3) * shake;
  });
  return (
    <group ref={ref}>
      <Model name={buoy.model} rotation-y={buoy.rotation} scale={buoy.scale} />
    </group>
  );
};

export const SeaDecor = ({ amp = 1 }) => (
  <group>
    {OBSTACLES.filter((o) => !o.dynamic).map((o, i) => (
      <Model
        key={i}
        name={o.model}
        position={[o.position[0], o.y, o.position[1]]}
        rotation={[o.tilt?.[0] ?? 0, o.rotation, o.tilt?.[1] ?? 0]}
        scale={o.scale}
      />
    ))}
    {/* Map buoys and the boundary ring: all on springs */}
    {Array.from({ length: MAP_BUOY_COUNT }, (_, i) => <Buoy key={`buoy-${i}`} index={i} amp={amp} />)}
  </group>
);

const ALL = [
  'ship-small', 'ship-pirate-small', 'patch-sand', 'patch-grass-foliage', 'ship-wreck', 'buoy', 'buoy-flag',
  'rocks-a', 'rocks-b', 'rocks-c', 'bottle-large', 'arrow', 'structure-platform-dock', 'castle-window',
  ...Object.keys(VESSELS),
  ...PALMS, ...ROCKS,
  ...new Set(Object.entries(LANDMARKS).flatMap(([, f]) => f(7).map(([n]) => n))),
];
ALL.forEach((name) => useGLTF.preload(url(name)));
