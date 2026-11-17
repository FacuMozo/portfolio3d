import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { colliderProfile, colliderRadius, DOCK_RANGE, ISLANDS, SHIP } from '../config'
import { enterIsland, useUi, world } from '../store'
import { useT } from '../../i18n/LanguageProvider'
import { IslandModel } from './models'

const setCursor = (value) => { document.body.style.cursor = value; };

// Text color with the better contrast on a given background: white or slate-900.
const DARK = '#0f172a';
const luminance = (hex) => {
  const c = new THREE.Color(hex); // converts sRGB to linear
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
};
const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const labelText = (bg) => {
  const l = luminance(bg);
  return contrast(l, 1) >= contrast(l, luminance(DARK)) ? '#fff' : DARK;
};

const RING_GROW = DOCK_RANGE * 0.7; // ring distance from the shore
const RING_WIDTH = 0.5;
const FAINT = 0.12; // ring opacity far from the island
const NEAR = 0.5; // ring opacity right before docking range (not hovered)
const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// The island's outline (smoothed with a circular moving average so it reads as
// a soft curve) pushed out by `offset`, as points in the shape's XY plane.
const ringPath = (profile, offset) => profile.map((r, i) => {
  const a = (i / profile.length) * Math.PI * 2;
  // Shape lies in XY; after rotateX(-90°) local Z = -Y.
  return new THREE.Vector2(Math.cos(a) * (r + offset), -Math.sin(a) * (r + offset));
});
const smoothProfile = (island) => {
  const raw = colliderProfile(island);
  return raw.map((_, i) => [-2, -1, 0, 1, 2].reduce((sum, k) => sum + raw[(i + k + raw.length) % raw.length], 0) / 5);
};

// Ring on the water marking the docking range: faint from afar, filling in as
// the ship approaches, pulsing once it can dock (or while hovered).
const DockRing = ({ island, active, hovered }) => {
  const ref = useRef();
  const geometry = useMemo(() => {
    const profile = smoothProfile(island);
    const shape = new THREE.Shape(ringPath(profile, RING_GROW));
    shape.holes.push(new THREE.Path(ringPath(profile, RING_GROW - RING_WIDTH).reverse()));
    const g = new THREE.ShapeGeometry(shape);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [island]);

  useFrame(({ clock }) => {
    const s = world.ship;
    const dx = s.x - island.position[0];
    const dz = s.z - island.position[1];
    // Same distance the sim uses: from the shore to the ship's hull.
    const shore = colliderRadius(island, Math.atan2(dz, dx) + island.rotation);
    const d = Math.hypot(dx, dz) - shore - SHIP.radius * s.scale;
    const approach = smoothstep(DOCK_RANGE * 3, DOCK_RANGE, d);
    const pulse = 0.75 + Math.sin(clock.elapsedTime * 4) * 0.2;
    ref.current.material.opacity = active || hovered ? pulse : FAINT + (NEAR - FAINT) * approach;
  });

  return (
    <mesh ref={ref} geometry={geometry} rotation-y={island.rotation} position-y={0.35}>
      <meshBasicMaterial color={island.color} transparent depthWrite={false} />
    </mesh>
  );
};

// Invisible disc covering the island and the water up to its ring: the hover /
// click target. (Invisible via opacity: R3F skips raycasts on visible={false}.)
const HoverZone = ({ island, ...handlers }) => {
  const geometry = useMemo(() => {
    const g = new THREE.ShapeGeometry(new THREE.Shape(ringPath(smoothProfile(island), RING_GROW)));
    g.rotateX(-Math.PI / 2);
    return g;
  }, [island]);
  return (
    <mesh geometry={geometry} rotation-y={island.rotation} position-y={0.4} {...handlers}>
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
};

const Island = ({ island, index, near, canDock }) => {
  const t = useT();
  const name = t(`ocean.islands.${island.id}.name`);
  const open = () => canDock && enterIsland(island.id);
  const [hovered, setHovered] = useState(false);
  const highlight = near || hovered;

  return (
    <group position={[island.position[0], 0, island.position[1]]}>
      <IslandModel kind={island.kind} radius={island.radius} seed={index + 1} patchScale={island.patchScale} rotation={island.rotation} />
      {/* Pointer target: one flat mesh instead of every triangle of the island */}
      <HoverZone
        island={island}
        onClick={(e) => { e.stopPropagation(); open(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); if (canDock) setCursor('pointer'); }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); setCursor(''); }}
      />
      {canDock && <DockRing island={island} active={near} hovered={hovered} />}
      <Html position={[0, 7, 0]} center zIndexRange={[10, 0]}>
        <button
          type='button'
          onClick={open}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          disabled={!canDock}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-semibold shadow-lg border-2 transition duration-200 select-none
            ${highlight ? 'scale-125' : 'bg-white/85 text-slate-900'} disabled:opacity-60 disabled:cursor-default
            focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400`}
          // Highlighted: filled with the island's color, white border, readable text.
          style={highlight
            ? { backgroundColor: island.color, borderColor: '#fff', color: labelText(island.color) }
            : { borderColor: island.color }}
        >
          <span aria-hidden='true' className='mr-1'>{t(`ocean.islands.${island.id}.icon`)}</span>
          {name}
        </button>
      </Html>
    </group>
  );
};

const Islands = () => {
  const near = useUi((s) => s.nearIsland);
  const canDock = useUi((s) => s.started && s.mode === 'explore' && !s.entering);
  return ISLANDS.map((island, i) => (
    <Island key={island.id} island={island} index={i} near={near === island.id} canDock={canDock} />
  ));
};

export default Islands
