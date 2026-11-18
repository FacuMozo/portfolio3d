import { useEffect, useRef, useState } from 'react'
import { useT } from '../../i18n/LanguageProvider'
import useMediaQuery from '../../hooks/useMediaQuery'
import { FIRST_UNLOCK_PALETTE, PALETTES, nextPalette, setPalette, unlockPalettes, usePalette } from '../palette'

/*
 * Hero easter egg: three isometric cubes.
 * - Hover (fine pointer, motion allowed): the cube tilts in 3D toward the pointer.
 * - Click / Enter: the cube lights up with a color sweep (click again turns it off).
 * - All three lit: the first time, a circle grows from the cubes and repaints the site with the
 *   "Matrix" palette (flash + sparks) and the palette picker appears; afterwards, lighting all
 *   three again moves to the next palette.
 */
// Cube, sun and star positions live in site.css (.hero-cube--N, .hero-dot--N): they change with the
// layout (wide strip above the text on mobile, taller box beside it on desktop).
const CUBES = [0, 1, 2];
const SPARKS = Array.from({ length: 22 }, (_, i) => {
  const a = (i / 22) * Math.PI * 2 + (i % 2) * 0.2;
  const d = 90 + (i % 5) * 28;
  return { dx: Math.cos(a) * d, dy: Math.sin(a) * d * 0.7, hue: i % 3, delay: (i % 4) * 30 };
});
const CUBE_BOX = '-10 -10 120 150';

const CubeSvg = () => (
  <svg viewBox={CUBE_BOX} aria-hidden='true' focusable='false'>
    <ellipse className='hero-cube__shadow' cx='50' cy='128' rx='44' ry='7' />
    <g className='hero-cube__body'>
      <polygon className='hero-cube__face hero-cube__face--top' points='50,0 100,24 50,48 0,24' />
      <polygon className='hero-cube__face hero-cube__face--left' points='0,24 50,48 50,110 0,86' />
      <polygon className='hero-cube__face hero-cube__face--right' points='50,48 100,24 100,86 50,110' />
    </g>
  </svg>
);

const centerOf = (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

export const PalettePicker = () => {
  const t = useT();
  const { palette } = usePalette();
  return (
    <fieldset className='palette-picker'>
      <legend className='font-mono text-code-badge text-text-muted uppercase tracking-widest mb-2 mx-auto'>{t('site.palette.legend')}</legend>
      <div className='flex flex-wrap justify-center gap-2'>
        {PALETTES.map((id) => (
          <label key={id} className='palette-chip' data-swatch={id}>
            <input
              type='radio'
              name='site-palette'
              value={id}
              checked={palette === id}
              onChange={(e) => setPalette(id, centerOf(e.currentTarget.closest('label')))}
              className='sr-only'
            />
            <span aria-hidden='true' className='palette-chip__dot' />
            {t(`site.palette.names.${id}`)}
          </label>
        ))}
      </div>
    </fieldset>
  );
};

const HeroArt = () => {
  const t = useT();
  const { unlocked } = usePalette();
  const tilt = useMediaQuery('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const [lit, setLit] = useState([false, false, false]);
  const [igniting, setIgniting] = useState(null);
  const [burst, setBurst] = useState(0);
  const [status, setStatus] = useState('');
  const boxRef = useRef(null);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const onAllLit = () => {
    const origin = centerOf(boxRef.current);
    if (!unlocked) {
      unlockPalettes();
      setBurst((b) => b + 1);
      setPalette(FIRST_UNLOCK_PALETTE, { ...origin, big: true });
      setStatus(t('site.palette.unlocked'));
    } else {
      const next = nextPalette();
      setPalette(next, origin);
      setStatus(t('site.palette.applied').replace('{name}', t(`site.palette.names.${next}`)));
    }
    later(() => setLit([false, false, false]), 1100);
  };

  const toggle = (i) => {
    const next = lit.map((v, j) => (j === i ? !v : v));
    setLit(next);
    if (next[i]) setIgniting(i);
    if (next.every(Boolean)) later(onAllLit, 550);
  };

  const onMove = (e) => {
    if (!tilt) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--ry', `${px * 34}deg`);
    el.style.setProperty('--rx', `${-py * 34}deg`);
    el.style.setProperty('--sx', `${-px * 14}px`);
  };
  const onLeave = (e) => {
    for (const p of ['--rx', '--ry', '--sx']) e.currentTarget.style.removeProperty(p);
  };

  return (
    <div className='relative w-full max-w-3xl mx-auto mb-6 lg:mb-0 flex flex-col items-center'>
      <div aria-hidden='true' className='absolute w-72 h-72 rounded-full bg-primary-container/15 blur-3xl -top-10 pointer-events-none' />
      <div ref={boxRef} className='hero-cubes relative w-full max-w-[600px] aspect-[3/1] lg:aspect-[5/4]'>
        <span aria-hidden='true' className='hero-sun' />
        <span aria-hidden='true' className='hero-dot hero-dot--0' />
        <span aria-hidden='true' className='hero-dot hero-dot--1' />
        <span aria-hidden='true' className='hero-dot hero-dot--alt hero-dot--2' />
        <span aria-hidden='true' className='hero-dot hero-dot--alt hero-dot--3' />
        {CUBES.map((i) => (
          <button
            key={i}
            type='button'
            className={`hero-cube hero-cube--${i} ${igniting === i ? 'is-igniting' : ''}`}
            aria-pressed={lit[i]}
            aria-label={t('site.palette.cube').replace('{n}', i + 1)}
            onClick={() => toggle(i)}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            onAnimationEnd={() => setIgniting(null)}
          >
            <CubeSvg />
          </button>
        ))}
        {burst > 0 && (
          <div key={burst} aria-hidden='true' className='hero-burst'>
            <span className='hero-burst__ring' />
            {SPARKS.map((s, i) => (
              <span
                key={i}
                className={`hero-burst__spark hero-burst__spark--${s.hue}`}
                style={{ '--dx': `${s.dx}px`, '--dy': `${s.dy}px`, animationDelay: `${s.delay}ms` }}
              />
            ))}
          </div>
        )}
      </div>
      <p role='status' className='sr-only'>{status}</p>
      {unlocked && <PalettePicker />}
    </div>
  );
};

export default HeroArt
