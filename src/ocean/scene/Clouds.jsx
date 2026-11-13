import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CLOUD_GAP, CLOUDS, EDGE_ISLAND } from '../config'

// Deterministic pseudo-random so the cloud ring looks the same on every visit.
const seeded = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

/**
 * Low-poly clouds ringing the sailable area: clusters of white puffs drawn as
 * one instanced mesh, drifting slowly around the map.
 */
const DRIFT = 0.006; // rad/s the ring turns
const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
// 1 inside the pier's arc, fading out over ~0.08 rad on each side.
const gapWeight = (a) => {
  const from = Math.atan2(Math.sin(a - CLOUD_GAP.from), Math.cos(a - CLOUD_GAP.from));
  const to = Math.atan2(Math.sin(CLOUD_GAP.to - a), Math.cos(CLOUD_GAP.to - a));
  return smoothstep(-0.08, 0.04, from) * smoothstep(-0.08, 0.04, to);
};

const Clouds = ({ reducedMotion }) => {
  const meshRef = useRef();

  const puffs = useMemo(() => {
    const rnd = seeded(7);
    // Drifting ring: even spacing with some jitter, two layers deep.
    const clusters = Array.from({ length: CLOUDS.count }, (_, c) => ({
      a: (c / CLOUDS.count) * Math.PI * 2 + rnd() * 0.12,
      r: CLOUDS.inner + rnd() * (CLOUDS.outer - CLOUDS.inner),
      cy: 3 + rnd() * 4,
      size: 3.5 + rnd() * 3.5,
      fixed: false,
    }));
    // Fixed bank over the harbor island: everything but its tip (and the pier
    // arc) stays hidden whatever the ring is doing.
    const [ix, iz] = EDGE_ISLAND.position;
    const reach = Math.max(...EDGE_ISLAND.profile) + 4;
    for (let x = -reach; x <= reach; x += 4.5) {
      for (let z = -reach; z <= reach; z += 4.5) {
        if (Math.hypot(x, z) > reach) continue;
        const wx = ix + x;
        const wz = iz + z;
        const r = Math.hypot(wx, wz);
        const a = Math.atan2(wz, wx);
        if (r < CLOUDS.inner - 1 || gapWeight(a) > 0.2) continue;
        clusters.push({ a, r, cy: 2.5 + rnd() * 2, size: 3.5 + rnd() * 2, fixed: true });
      }
    }
    const list = [];
    for (const { a, r, cy, size, fixed } of clusters) {
      const n = 6 + Math.floor(rnd() * 5);
      for (let i = 0; i < n; i++) {
        // Puffs spread mostly sideways (tangent to the ring), flatter on top.
        list.push({
          a,
          r,
          fixed,
          along: (rnd() - 0.5) * size * 2.2,
          across: (rnd() - 0.5) * size * 0.9,
          y: cy + rnd() * size * 0.35,
          s: size * (0.55 + rnd() * 0.5),
          rot: rnd() * Math.PI,
          phase: rnd() * Math.PI * 2,
        });
      }
    }
    return list;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const place = (t, drift) => {
    const mesh = meshRef.current;
    puffs.forEach((p, i) => {
      const a = p.fixed ? p.a : p.a - drift;
      // Clusters drifting over the pier part around it so it stays in sight.
      const r = p.fixed ? p.r : p.r + Math.max(0, CLOUD_GAP.radius - p.r) * gapWeight(a);
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      dummy.position.set(
        cos * r - sin * p.along + cos * p.across,
        p.y + Math.sin(t * 0.4 + p.phase) * 0.3,
        sin * r + cos * p.along + sin * p.across,
      );
      dummy.rotation.set(p.rot, p.rot * 0.7 - (p.fixed ? 0 : drift), 0);
      dummy.scale.set(p.s, p.s * 0.62, p.s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- place only touches refs and memoized data
  useLayoutEffect(() => place(0, 0), []);

  // The ring drifts and bobs very slowly, so ~15 updates a second look the same
  // as 60 and save re-uploading every puff's matrix each frame.
  const last = useRef(-1);
  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    if (t - last.current < 1 / 15) return;
    last.current = t;
    place(t, t * DRIFT);
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, puffs.length]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color='#ffffff' emissive='#dbeafe' emissiveIntensity={0.35} flatShading />
      </instancedMesh>
    </group>
  );
};

export default Clouds
