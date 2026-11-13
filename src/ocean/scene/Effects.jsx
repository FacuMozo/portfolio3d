import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { world } from '../store'

const MAX_BALLS = 96;
const MAX_PARTICLES = 320;
const dummy = new THREE.Object3D();
const color = new THREE.Color();
// Particles carry a handful of hex colors: parse each once, not per particle per frame.
const parsed = new Map();
const colorOf = (hex) => {
  let c = parsed.get(hex);
  if (!c) parsed.set(hex, (c = new THREE.Color(hex)));
  return c;
};

// All cannonballs in one draw call.
export const Cannonballs = () => {
  const ref = useRef();
  useFrame(() => {
    const mesh = ref.current;
    const balls = world.balls;
    const n = Math.min(balls.length, MAX_BALLS);
    for (let i = 0; i < n; i++) {
      dummy.position.set(balls[i].x, balls[i].y, balls[i].z);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, MAX_BALLS]} castShadow frustumCulled={false}>
      <sphereGeometry args={[0.22, 8, 6]} />
      <meshStandardMaterial color='#111827' roughness={0.4} />
    </instancedMesh>
  );
};

// Splashes, smoke, fire and debris: small cubes that shrink as they fade.
export const Particles = () => {
  const ref = useRef();
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  useLayoutEffect(() => {
    // Allocate the per-instance color buffer up front.
    ref.current.setColorAt(0, color.set('#ffffff'));
  }, []);

  useFrame(() => {
    const mesh = ref.current;
    const ps = world.particles;
    const n = Math.min(ps.length, MAX_PARTICLES);
    for (let i = 0; i < n; i++) {
      const p = ps[i];
      const k = p.life / p.maxLife;
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(k * 4, k * 3, 0);
      dummy.scale.setScalar(p.size * (0.3 + 0.7 * k));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, colorOf(p.color));
    }
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[geometry, undefined, MAX_PARTICLES]} frustumCulled={false}>
      <meshStandardMaterial flatShading />
    </instancedMesh>
  );
};
