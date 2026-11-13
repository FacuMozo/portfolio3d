import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { CHECKPOINT_RADIUS, MORTAR, RACE_CHECKPOINTS, RACE_START } from '../config'
import { MAP_BUOY_COUNT, useUi, world } from '../store'
import { waveHeight } from '../waves'
import { Buoy, Model } from './models'

const TOP = 0.8; // island sand height, where mortars sit
const GOLD = '#facc15';

// --- Checkpoint gates ---------------------------------------------------------

const Gate = ({ index, state }) => {
  const ringRef = useRef();
  const [x, z] = RACE_CHECKPOINTS[index];
  const [px, pz] = index === 0 ? RACE_START : RACE_CHECKPOINTS[index - 1];
  // Flags stand on both sides, across the direction the course arrives from.
  const dir = Math.atan2(x - px, z - pz);
  const isFinish = index === RACE_CHECKPOINTS.length - 1;

  useFrame(({ clock }) => {
    const m = ringRef.current;
    if (!m) return;
    const pulse = state === 'next' ? 1 + Math.sin(clock.elapsedTime * 5) * 0.06 : 1;
    m.scale.setScalar(pulse);
  });

  if (state === 'done') return null;
  const active = state === 'next';
  return (
    <group position={[x, 0, z]}>
      <mesh ref={ringRef} rotation-x={-Math.PI / 2} position-y={0.45}>
        <ringGeometry args={[CHECKPOINT_RADIUS - 0.45, CHECKPOINT_RADIUS, 48]} />
        <meshBasicMaterial color={active ? GOLD : '#ffffff'} transparent opacity={active ? 0.9 : 0.35} depthWrite={false} />
      </mesh>
      <group rotation-y={dir}>
        {[-1, 1].map((side) => (
          <Model
            key={side}
            name='flag-high-pennant'
            position={[side * (CHECKPOINT_RADIUS + 0.4), -0.2, 0]}
            scale={active ? 1.1 : 0.8}
          />
        ))}
      </group>
      {(active || state === 'upcoming') && (
        <Html position={[0, 4.5, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <span
            aria-hidden='true'
            className={`flex items-center justify-center rounded-full font-poppins font-bold shadow-lg border-2 select-none
              ${active ? 'w-10 h-10 text-lg bg-yellow-300 border-white text-slate-900' : 'w-7 h-7 text-xs bg-white/80 border-white text-slate-600'}`}
          >
            {isFinish ? '🏁' : index + 1}
          </span>
        </Html>
      )}
    </group>
  );
};

// --- Pickups ------------------------------------------------------------------

const Whirlpool = () => {
  const ref = useRef();
  useFrame((_, dt) => { ref.current.rotation.y -= dt * 2.5; });
  return (
    <group ref={ref} position-y={0.4}>
      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[2, 24]} />
        <meshBasicMaterial color='#3b0764' transparent opacity={0.55} depthWrite={false} />
      </mesh>
      {[0.6, 1.2, 1.8].map((r, i) => (
        <mesh key={r} rotation-x={-Math.PI / 2} position-y={0.02}>
          <ringGeometry args={[r - 0.12, r, 24, 1, i, Math.PI * 1.3]} />
          <meshBasicMaterial color='#c084fc' transparent opacity={0.85} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

const Glow = ({ color }) => (
  <mesh rotation-x={-Math.PI / 2} position-y={0.4}>
    <ringGeometry args={[1.3, 1.8, 32]} />
    <meshBasicMaterial color={color} transparent opacity={0.75} depthWrite={false} />
  </mesh>
);

const Pickup = ({ index, amp }) => {
  const ref = useRef();
  const itemRef = useRef();
  const p = world.race.pickups[index];
  useFrame(() => {
    const pk = world.race?.pickups[index];
    if (!pk) return;
    ref.current.visible = !pk.taken;
    ref.current.position.y = waveHeight(pk.x, pk.z, world.time, amp) * 0.6;
    if (itemRef.current) {
      itemRef.current.rotation.y = world.time * 1.8;
      itemRef.current.position.y = 1.1 + Math.sin(world.time * 3 + index) * 0.25;
    }
  });
  return (
    <group ref={ref} position={[p.x, 0, p.z]}>
      {p.type === 'slow' && <Whirlpool />}
      {p.type === 'boost' && (
        <>
          <Glow color='#22c55e' />
          <group ref={itemRef}><Model name='bottle-large' scale={1.8} /></group>
        </>
      )}
      {p.type === 'repair' && (
        <>
          <Glow color='#ef4444' />
          <group ref={itemRef}><Model name='crate' scale={1.1} /></group>
        </>
      )}
    </group>
  );
};

// --- Mortars & shells ---------------------------------------------------------

const Mortar = ({ index }) => {
  const ref = useRef();
  const m = world.race.mortars[index];
  useFrame(() => {
    const mo = world.race?.mortars[index];
    if (!mo) return;
    const back = mo.recoil * 0.4;
    ref.current.rotation.y = mo.aim;
    ref.current.position.set(mo.x - Math.sin(mo.aim) * back, TOP, mo.z - Math.cos(mo.aim) * back);
  });
  return (
    <group ref={ref} position={[m.x, TOP, m.z]}>
      <Model name='cannon' scale={1.1} rotation-x={-0.35} />
    </group>
  );
};

const MAX_SHELLS = 14;

// Danger zones on the water: an outline that fills up as the shell approaches,
// plus the shell itself dropping in during the last moments.
const Shells = () => {
  const groups = useRef([]);
  const fills = useRef([]);
  const balls = useRef([]);
  useFrame(({ clock }) => {
    const shells = world.race?.shells ?? [];
    for (let i = 0; i < MAX_SHELLS; i++) {
      const g = groups.current[i];
      const sh = shells[i];
      if (!g) continue;
      g.visible = !!sh;
      if (!sh) continue;
      const k = Math.min(1, sh.t / sh.delay);
      g.position.set(sh.x, 0.5, sh.z);
      g.scale.setScalar(sh.radius);
      fills.current[i].scale.setScalar(Math.max(0.01, k));
      fills.current[i].material.opacity = 0.25 + 0.3 * k + (k > 0.75 ? Math.sin(clock.elapsedTime * 30) * 0.1 : 0);
      const ball = balls.current[i];
      const remaining = sh.delay - sh.t;
      ball.visible = remaining < MORTAR.fallTime;
      ball.position.y = (Math.max(0, remaining) / MORTAR.fallTime) * MORTAR.lift / sh.radius;
    }
  });
  return Array.from({ length: MAX_SHELLS }, (_, i) => (
    <group key={i} ref={(el) => { groups.current[i] = el; }} visible={false}>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.9, 1, 40]} />
        <meshBasicMaterial color='#ef4444' transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <mesh ref={(el) => { fills.current[i] = el; }} rotation-x={-Math.PI / 2} position-y={-0.02}>
        <circleGeometry args={[1, 40]} />
        <meshBasicMaterial color='#ef4444' transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <mesh ref={(el) => { balls.current[i] = el; }} visible={false}>
        <sphereGeometry args={[0.12, 10, 8]} />
        <meshStandardMaterial color='#111827' />
      </mesh>
    </group>
  ));
};

// --- Guide arrow --------------------------------------------------------------

// Gold arrow circling the ship, always pointing at the next checkpoint.
const GuideArrow = () => {
  const ref = useRef();
  const geometry = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.9);
    s.lineTo(0.6, 0);
    s.lineTo(0.22, 0);
    s.lineTo(0.22, -0.7);
    s.lineTo(-0.22, -0.7);
    s.lineTo(-0.22, 0);
    s.lineTo(-0.6, 0);
    s.closePath();
    const g = new THREE.ShapeGeometry(s);
    g.rotateX(-Math.PI / 2);
    g.rotateY(Math.PI);
    return g;
  }, []);
  useFrame(() => {
    const r = world.race;
    const target = r && RACE_CHECKPOINTS[r.next];
    ref.current.visible = !!target && r.state !== 'finished';
    if (!target) return;
    const s = world.ship;
    const a = Math.atan2(target[0] - s.x, target[1] - s.z);
    ref.current.position.set(s.x + Math.sin(a) * 4.2, 0.7, s.z + Math.cos(a) * 4.2);
    ref.current.rotation.y = a;
  });
  return (
    <mesh ref={ref} geometry={geometry} renderOrder={3}>
      <meshBasicMaterial color={GOLD} transparent opacity={0.95} depthTest={false} depthWrite={false} />
    </mesh>
  );
};

// --- Course -------------------------------------------------------------------

/** Everything race-specific in the scene. Mounted only while a race is on. */
const RaceCourse = ({ amp }) => {
  const next = useUi((s) => s.race?.next ?? 0);
  const race = world.race;
  if (!race) return null;
  const raceBuoys = world.buoys.length - MAP_BUOY_COUNT;
  return (
    <group>
      {RACE_CHECKPOINTS.map((_, i) => (
        <Gate key={i} index={i} state={i < next ? 'done' : i === next ? 'next' : i === next + 1 ? 'upcoming' : 'later'} />
      ))}
      {race.rocks.map((r, i) => (
        <Model key={i} name={r.model} position={[r.x, -0.4, r.z]} rotation-y={r.rotation} scale={r.scale} />
      ))}
      {Array.from({ length: raceBuoys }, (_, i) => <Buoy key={i} index={MAP_BUOY_COUNT + i} amp={amp} />)}
      {race.pickups.map((_, i) => <Pickup key={i} index={i} amp={amp} />)}
      {race.mortars.map((_, i) => <Mortar key={i} index={i} />)}
      <Shells />
      <GuideArrow />
    </group>
  );
};

/** Mounts a fresh course for each race (retrying remounts it). */
const RaceLayer = ({ amp }) => {
  const id = useUi((s) => (s.mode === 'race' ? s.race?.id : null));
  return id ? <RaceCourse key={id} amp={amp} /> : null;
};

export default RaceLayer
