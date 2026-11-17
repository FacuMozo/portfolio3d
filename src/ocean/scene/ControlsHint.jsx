import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useUi, world } from '../store'
import { useT } from '../../i18n/LanguageProvider'

const MOVE_THRESHOLD = 4; // world units sailed before the hint is dismissed
const TIMEOUT_MS = 12000;

const isCoarse = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

const Key = ({ children }) => (
  <kbd className='inline-flex w-7 h-7 items-center justify-center rounded-md border border-slate-300 bg-slate-50 font-mono text-xs font-semibold text-slate-700 shadow-[0_2px_0_#cbd5e1]'>
    {children}
  </kbd>
);

// Inverted-T key cluster: up on top, left/down/right below.
const Cluster = ({ up, left, down, right }) => (
  <span className='inline-flex flex-col items-center gap-1'>
    <Key>{up}</Key>
    <span className='flex gap-1'>
      <Key>{left}</Key>
      <Key>{down}</Key>
      <Key>{right}</Key>
    </span>
  </span>
);

/** Speech bubble over the ship on first load showing the sailing keys (desktop only). */
const ControlsHint = () => {
  const t = useT();
  const groupRef = useRef();
  const start = useRef(null);
  const [coarse] = useState(isCoarse);
  const [dismissed, setDismissed] = useState(false);
  // Shown once the player has started and closed the instructions.
  const visible = useUi((s) => s.started && s.mode === 'explore' && !s.openIsland && !s.entering);

  const [gone, setGone] = useState(false);

  const [armed, setArmed] = useState(false);
  if (visible && !armed) setArmed(true);

  useEffect(() => {
    if (!armed) return undefined;
    const id = setTimeout(() => setDismissed(true), TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [armed]);

  // Unmount once the fade-out ends, so drei stops repositioning it every frame.
  useEffect(() => {
    if (!dismissed) return undefined;
    const id = setTimeout(() => setGone(true), 600);
    return () => clearTimeout(id);
  }, [dismissed]);

  useFrame(() => {
    const s = world.ship;
    const g = groupRef.current;
    if (!g) return;
    g.position.set(s.x, 6 * s.scale, s.z);
    if (dismissed || !armed) return;
    if (!start.current) start.current = [s.x, s.z];
    if (Math.hypot(s.x - start.current[0], s.z - start.current[1]) > MOVE_THRESHOLD) setDismissed(true);
  });

  if (coarse || gone) return null;
  const shown = visible && !dismissed;

  return (
    <group ref={groupRef}>
      <Html center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div
          aria-hidden='true'
          className={`relative select-none whitespace-nowrap rounded-2xl bg-white px-4 py-3 shadow-xl text-center motion-safe:transition-opacity motion-safe:duration-500 ${shown ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className='flex items-end justify-center gap-3'>
            <Cluster up='W' left='A' down='S' right='D' />
            <span className='pb-2 text-sm font-semibold text-slate-400'>/</span>
            <Cluster up='↑' left='←' down='↓' right='→' />
          </div>
          <p className='mt-2 text-sm font-semibold text-black-500'>{t('ocean.hint.move')}</p>
          <p className='text-xs text-slate-500'>{t('ocean.hint.fire')}</p>
          {/* Tail pointing down at the ship */}
          <span className='absolute left-1/2 -bottom-2 -ml-2 w-4 h-4 rotate-45 bg-white' />
        </div>
      </Html>
    </group>
  );
};

export default ControlsHint
