import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useUi, world } from '../store'
import { waveHeight } from '../waves'
import { EnemyBoatModel, PlayerShipModel } from './models'

// Place a boat on the sea. The water is sampled at the bow, stern and both sides at the
// hull's real size (halfLen / halfBeam, world units), and the boat takes the plane through
// those points: on short, steep waves sampling only next to the centre left the bow and
// stern under water ("flooded" look). It also never sits below the average of its ends, so
// the deck stays clear in a trough.
const MAX_TILT = 0.35;
const clampTilt = (a) => Math.max(-MAX_TILT, Math.min(MAX_TILT, a));
const float = (obj, x, z, heading, amp, { halfLen, halfBeam, roll: extraRoll = 0 }) => {
  const t = world.time;
  const fx = Math.sin(heading);
  const fz = Math.cos(heading);
  const center = waveHeight(x, z, t, amp);
  const bow = waveHeight(x + fx * halfLen, z + fz * halfLen, t, amp);
  const stern = waveHeight(x - fx * halfLen, z - fz * halfLen, t, amp);
  const right = waveHeight(x + fz * halfBeam, z - fx * halfBeam, t, amp);
  const left = waveHeight(x - fz * halfBeam, z + fx * halfBeam, t, amp);
  const y = Math.max(center, (bow + stern) / 2, (right + left) / 2);
  obj.position.set(x, y, z);
  obj.rotation.set(0, 0, 0);
  obj.rotateY(heading);
  obj.rotateX(-clampTilt(Math.atan2(bow - stern, 2 * halfLen)));
  obj.rotateZ(clampTilt(Math.atan2(right - left, 2 * halfBeam)) + extraRoll);
};

// Hull half-length / half-beam of the Kenney ships at their base scale (model ±4.4 x ±2.4,
// drawn at 0.4 for the player and 0.26 for enemies), slightly inset from the extremes.
const PLAYER_HULL = { halfLen: 1.6, halfBeam: 0.8 };
const ENEMY_HULL = { halfLen: 1.05, halfBeam: 0.55 };

// Kenney's arrow riding the waves ahead of the ship, showing where it's heading.
// Points backward when reversing and fades out as the ship stops.
const HeadingArrow = ({ amp }) => {
  const ref = useRef();
  const { scene } = useGLTF('/models/watercraft/arrow.glb');
  // Own copy of the materials so fading it doesn't touch any other model.
  const { arrow, materials } = useMemo(() => {
    const copy = scene.clone(true);
    const mats = [];
    copy.traverse((o) => {
      if (!o.isMesh) return;
      o.material = o.material.clone();
      o.material.transparent = true;
      mats.push(o.material);
    });
    return { arrow: copy, materials: mats };
  }, [scene]);

  useFrame(() => {
    const s = world.ship;
    const heading = s.heading + (s.speed < 0 ? Math.PI : 0);
    const dist = 3.4 * s.scale;
    const x = s.x + Math.sin(heading) * dist;
    const z = s.z + Math.cos(heading) * dist;
    const g = ref.current;
    g.position.set(x, waveHeight(x, z, world.time, amp) + 0.15, z);
    g.rotation.y = heading;
    g.scale.setScalar(0.6 * s.scale);
    const k = s.hp === 0 ? 0 : Math.min(1, Math.abs(s.speed) / 3);
    for (const m of materials) m.opacity = 0.9 * k;
    g.visible = k > 0.02;
  });

  return <primitive ref={ref} object={arrow} />;
};

export const PlayerShip = ({ amp }) => {
  const ref = useRef();
  const prevHeading = useRef(world.ship.heading);
  const sink = useRef(0);

  useFrame((_, dt) => {
    const s = world.ship;
    const obj = ref.current;
    // Lean into turns, proportional to turn rate.
    const dh = s.heading - prevHeading.current;
    const turnRate = Math.atan2(Math.sin(dh), Math.cos(dh)) / Math.max(dt, 1e-3);
    prevHeading.current = s.heading;
    // Gentle lean into turns: a stronger one dipped the rail under the waves.
    const roll = Math.max(-0.12, Math.min(0.12, -turnRate * 0.08));
    float(obj, s.x, s.z, s.heading, amp, {
      halfLen: PLAYER_HULL.halfLen * s.scale,
      halfBeam: PLAYER_HULL.halfBeam * s.scale,
      roll,
    });

    sink.current = s.hp === 0 ? Math.min(sink.current + dt * 0.6, 2.5) : 0;
    obj.position.y -= sink.current;
    obj.rotation.x += sink.current * 0.15;
    const pulse = s.hitFlash > 0 ? 1 + Math.sin(s.hitFlash * 60) * 0.05 : 1;
    obj.scale.setScalar(pulse * s.scale);
  });

  return (
    <>
      <group ref={ref}>
        <PlayerShipModel />
      </group>
      <HeadingArrow amp={amp} />
    </>
  );
};

const EnemyBoat = ({ id, amp }) => {
  const ref = useRef();
  useFrame(() => {
    const e = world.enemies.find((en) => en.id === id);
    const obj = ref.current;
    if (!e) { obj.visible = false; return; }
    float(obj, e.x, e.z, e.heading, amp, ENEMY_HULL);
    if (e.sinking) {
      obj.position.y -= e.sinkT * 0.9;
      obj.rotateZ(e.sinkT * 0.5);
    }
    obj.scale.setScalar(e.hitFlash > 0 ? 1.12 : 1);
  });
  return (
    <group ref={ref}>
      <EnemyBoatModel />
    </group>
  );
};

export const Enemies = ({ amp }) => {
  const ids = useUi((s) => s.enemyIds);
  return ids.map((id) => <EnemyBoat key={id} id={id} amp={amp} />);
};
