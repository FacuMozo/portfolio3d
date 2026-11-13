import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { EDGE_ISLAND, ICEBERG, MOORED_SHIPS, PIER, TRAFFIC, TRAFFIC_CLEARANCES } from '../config'
import { useUi, world } from '../store'
import { waveHeight } from '../waves'
import { IslandModel, Model, VesselModel } from './models'

const TAU = Math.PI * 2;
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

/** A moored ship rocking gently on the swell, optionally listing (`tilt`). */
const Bobbing = ({ name, scale, phase = 0, tilt, ...props }) => {
  const ref = useRef();
  useFrame(() => {
    const t = world.time + phase;
    const g = ref.current;
    g.position.y = Math.sin(t * 1.1) * 0.08;
    g.rotation.z = (tilt?.roll ?? 0) + Math.sin(t * 0.9) * 0.04;
    g.rotation.x = (tilt?.pitch ?? 0) + Math.sin(t * 0.7 + 1) * 0.02;
  });
  return (
    <group {...props}>
      <group ref={ref}>
        <VesselModel name={name} scale={scale} />
      </group>
    </group>
  );
};

// --- Harbor island ------------------------------------------------------------
// Island pieces are laid out in a frame whose local +X points at the map
// center; the fort sits on the tip that pokes out of the clouds.
const FRAME = -(EDGE_ISLAND.angle + Math.PI);
const TIP = Math.max(...EDGE_ISLAND.profile); // local x of the tip

// Square fort: each side alternates castle-wall and castle-window, the side
// facing the sea has a castle-gate in the middle, and a tower-complete-large
// stands on every corner. Pieces run along their local Z: walls/windows are
// 2.8 long, the gate 3.6, so the gateless sides stretch theirs to match.
const FORT = (() => {
  const s = 0.45;
  const gateSide = ['castle-wall', 'castle-window', 'castle-gate', 'castle-window', 'castle-wall'];
  const plainSide = ['castle-wall', 'castle-window', 'castle-wall', 'castle-window', 'castle-wall'];
  const length = (name) => (name === 'castle-gate' ? 3.6 : 2.8);
  const side = gateSide.reduce((sum, n) => sum + length(n), 0); // model units
  const h = (side * s) / 2;
  const cx = TIP - h - 3.4;
  const pieces = [];
  // Lays a side along its own axis: `place(offset)` -> [x, z]; `rot` turns the
  // pieces so their length follows that side.
  const lay = (names, rot, place) => {
    const stretch = side / names.reduce((sum, n) => sum + length(n), 0);
    let o = -h;
    for (const name of names) {
      const l = length(name) * s * stretch;
      const [x, z] = place(o + l / 2);
      pieces.push([name, x, z, rot, [s, s, s * stretch]]);
      o += l;
    }
  };
  lay(gateSide, 0, (o) => [cx + h, o]); // sea side, facing the map
  lay(plainSide, Math.PI, (o) => [cx - h, o]);
  lay(plainSide, Math.PI / 2, (o) => [cx + o, h]);
  lay(plainSide, -Math.PI / 2, (o) => [cx + o, -h]);
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    pieces.push(['tower-complete-large', cx + sx * h, sz * h, 0, 0.3]);
  }
  pieces.push(['flag-pirate-high', cx, 0, 0.3, 0.9]);
  pieces.push(['cannon', cx + h + 1.6, -2.2, Math.PI / 2, 0.8]);
  pieces.push(['cannon', cx + h + 1.6, 2.2, Math.PI / 2, 0.8]);
  return pieces;
})();

const HarborIsland = () => (
  <group position={[EDGE_ISLAND.position[0], 0, EDGE_ISLAND.position[1]]} rotation-y={FRAME}>
    <IslandModel kind='harbor' radius={EDGE_ISLAND.radius} seed={11} patchScale={EDGE_ISLAND.patchScale} rotation={EDGE_ISLAND.rotation - FRAME} />
    {FORT.map(([name, x, z, rot, scale], i) => (
      <Model key={i} name={name} position={[x, 0.8, z]} rotation-y={rot} scale={scale} />
    ))}
  </group>
);

// Pier along the boundary below the island, two boats alongside, one across its head.
const Pier = () => {
  const mid = (PIER.start + PIER.end) / 2;
  const at = (t, dr = 0) => {
    const [x, z] = PIER.along(t, PIER.radius + dr);
    return [x, 0, z];
  };
  return (
    <>
      {Array.from({ length: PIER.tiles }, (_, i) => {
        const [x, , z] = at(PIER.start + i * PIER.tile);
        return <Model key={i} name='structure-platform-dock' position={[x, -0.35, z]} rotation-y={PIER.heading} scale={0.9} />;
      })}
      <Bobbing name='ship-small' position={at(mid - 0.4, -2.4)} rotation-y={PIER.heading} phase={0} />
      <Bobbing name='ship-pirate-small' position={at(mid + 0.4, 2.4)} rotation-y={PIER.heading} phase={1.7} />
      <Bobbing name='ship-cargo-c' position={at(PIER.end + 2.4)} rotation-y={PIER.heading + Math.PI / 2} phase={3.1} />
    </>
  );
};

// --- Ships moored on the boundary, and the iceberg -----------------------------

const MooredShips = () => MOORED_SHIPS.map((s, i) => (
  <Bobbing
    key={s.slot}
    name={s.model}
    scale={s.scale}
    tilt={s.tilt}
    position={[s.position[0], 0, s.position[1]]}
    rotation-y={s.heading}
    phase={i * 2.3}
  />
));

// Low-poly ice chunks, mostly under water, bobbing slowly.
const Iceberg = () => {
  const ref = useRef();
  const chunks = useMemo(() => {
    const s = ICEBERG.size;
    return [
      [0, 0.2, 0, s, 1.1],
      [s * 0.7, -0.2, s * 0.4, s * 0.65, 0.9],
      [-s * 0.6, -0.3, s * 0.3, s * 0.55, 0.8],
      [s * 0.1, 0.9, -s * 0.2, s * 0.55, 1.6],
      [-s * 0.3, -0.4, -s * 0.7, s * 0.5, 0.7],
    ];
  }, []);
  useFrame(() => {
    const t = world.time;
    ref.current.position.y = -0.6 + Math.sin(t * 0.6) * 0.1;
    ref.current.rotation.z = Math.sin(t * 0.4) * 0.03;
  });
  return (
    <group position={[ICEBERG.position[0], 0, ICEBERG.position[1]]} rotation-y={ICEBERG.angle}>
      <group ref={ref}>
        {chunks.map(([x, y, z, size, stretch], i) => (
          <mesh key={i} position={[x, y, z]} scale={[size, size * stretch, size * 0.9]} rotation={[i * 0.7, i * 1.3, i * 0.4]} castShadow>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color='#f1f9ff' emissive='#bae6fd' emissiveIntensity={0.25} flatShading />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// --- Traffic --------------------------------------------------------------------

const lanePosition = (ship, t) => {
  const a = ship.phase + (ship.speed / ship.radius) * t;
  let r = ship.radius + Math.sin(t * ship.swayFreq * TAU + ship.phase * 3) * ship.sway;
  // Swing out (into the clouds) around the harbor and the big liner, then back.
  for (const c of TRAFFIC_CLEARANCES) {
    const w = Math.exp(-((wrapAngle(a - c.angle) / c.spread) ** 2));
    r += Math.max(0, c.radius - r) * w;
  }
  return [Math.cos(a) * r, Math.sin(a) * r];
};

const TrafficShip = ({ ship, amp, frozen }) => {
  const ref = useRef();
  useFrame(() => {
    const t = frozen ? 0 : world.time;
    const [x, z] = lanePosition(ship, t);
    const [nx, nz] = lanePosition(ship, t + 0.5);
    const g = ref.current;
    g.position.set(x, waveHeight(x, z, world.time, amp) * 0.6, z);
    g.rotation.y = Math.atan2(nx - x, nz - z);
  });
  return (
    <group ref={ref}>
      <VesselModel name={ship.model} />
    </group>
  );
};

const Traffic = ({ amp, reducedMotion }) => {
  const exploring = useUi((s) => s.mode === 'explore');
  if (!exploring) return null;
  return TRAFFIC.map((ship) => <TrafficShip key={ship.model} ship={ship} amp={amp} frozen={reducedMotion} />);
};

/** Life around the edge of the map: harbor island and pier, moored ships, an iceberg and passing traffic. */
const Scenery = ({ amp, reducedMotion }) => (
  <>
    <HarborIsland />
    <Pier />
    <MooredShips />
    <Iceberg />
    <Traffic amp={amp} reducedMotion={reducedMotion} />
  </>
);

export default Scenery
