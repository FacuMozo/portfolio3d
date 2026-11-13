import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useUi, world } from '../store'
import { waveHeight } from '../waves'
import { EnemyBoatModel, PlayerShipModel } from './models'

// Place a boat on the sea: follow wave height and tilt with the local slope.
const float = (obj, x, z, heading, amp, extraRoll = 0) => {
  const t = world.time;
  const h = waveHeight(x, z, t, amp);
  const fx = Math.sin(heading);
  const fz = Math.cos(heading);
  const ahead = waveHeight(x + fx, z + fz, t, amp);
  const side = waveHeight(x + fz, z - fx, t, amp);
  obj.position.set(x, h, z);
  obj.rotation.set(0, 0, 0);
  obj.rotateY(heading);
  obj.rotateX(-(ahead - h) * 0.9);
  obj.rotateZ((side - h) * 0.9 + extraRoll);
};

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
    const roll = Math.max(-0.25, Math.min(0.25, -turnRate * 0.12));
    float(obj, s.x, s.z, s.heading, amp, roll);

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
    float(obj, e.x, e.z, e.heading, amp);
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
