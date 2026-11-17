import { useSyncExternalStore } from 'react'

/*
 * Accent palettes of the professional site (hero easter egg).
 * Colors live in site.css under html[data-palette]; this module only switches the attribute,
 * remembers the choice (localStorage) and plays the circular reveal (View Transitions).
 */
export const PALETTES = ['violet', 'matrix', 'sunset', 'ocean'];
export const DEFAULT_PALETTE = 'violet';
export const FIRST_UNLOCK_PALETTE = 'matrix';

const KEY = 'site_palette';
const UNLOCK_KEY = 'site_palette_unlocked';

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: the choice just won't persist.
  }
};

let state = {
  palette: PALETTES.includes(read(KEY)) ? read(KEY) : DEFAULT_PALETTE,
  unlocked: read(UNLOCK_KEY) === '1',
};
const listeners = new Set();
const emit = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

export const getPaletteState = () => state;
export const usePalette = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );

/** Writes the attribute the CSS reads. Synchronous, so it can run inside a view transition. */
export const paintPalette = (palette = state.palette) => {
  document.documentElement.dataset.palette = palette;
};

const reducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Applies `palette` with a circle that grows from (x, y) (viewport px) and covers the page.
 * Falls back to an instant swap without View Transitions support or with reduced motion.
 * `big` makes the reveal slower and adds a flash (used for the first unlock).
 */
export const setPalette = (palette, { x = innerWidth / 2, y = innerHeight / 2, big = false } = {}) => {
  if (!PALETTES.includes(palette)) return Promise.resolve();
  write(KEY, palette);
  const update = () => {
    paintPalette(palette);
    emit({ palette });
  };
  if (typeof document.startViewTransition !== 'function' || reducedMotion()) {
    update();
    return Promise.resolve();
  }
  const root = document.documentElement;
  root.style.setProperty('--reveal-x', `${x}px`);
  root.style.setProperty('--reveal-y', `${y}px`);
  root.classList.add('palette-reveal');
  root.classList.toggle('palette-reveal--big', big);
  const transition = document.startViewTransition(update);
  return transition.finished.finally(() => {
    root.classList.remove('palette-reveal', 'palette-reveal--big');
  });
};

export const unlockPalettes = () => {
  write(UNLOCK_KEY, '1');
  emit({ unlocked: true });
};

/** Next palette in the cycle (used when the three cubes are lit again). */
export const nextPalette = (current = state.palette) =>
  PALETTES[(PALETTES.indexOf(current) + 1) % PALETTES.length];

/** Test helper: back to the defaults. */
export const resetPaletteState = () => {
  state = { palette: DEFAULT_PALETTE, unlocked: false };
  delete document.documentElement.dataset.palette;
  listeners.forEach((l) => l());
};
