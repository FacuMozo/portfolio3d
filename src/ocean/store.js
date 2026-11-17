import { useSyncExternalStore } from 'react'
import { BOUNDARY_BUOYS, BUOYS, RACE_CHECKPOINTS, RACE_DIFFICULTY, RACE_START, SHIP } from './config'
import { buildRace } from './race'

/*
 * Two kinds of state:
 *  - `world` / `input`: mutable objects read and written every frame by the
 *    simulation and the 3D renderers. Never triggers React renders.
 *  - `ui`: small immutable snapshot for the HTML overlay (HUD, modals), updated
 *    only when something discrete changes. Subscribed via useSyncExternalStore.
 */

export const input = {
  forward: false,
  back: false,
  left: false,
  right: false,
  fire: false,
  // Touch joystick, in screen space (x right, y up), magnitude 0..1.
  joyX: 0,
  joyY: 0,
};

// Starts just below the map center, bow pointing screen-up (world -X -Z).
const freshShip = () => ({ x: -2, z: -2, heading: -Math.PI * 0.75, speed: 0, hp: SHIP.maxHp, cooldown: 0, hitFlash: 0, scale: SHIP.exploreScale, kx: 0, kz: 0, effect: null });

export const world = {
  time: 0,
  ship: freshShip(),
  enemies: [], // { id, x, z, heading, speed, hp, maxHp, fireIn, sinking, sinkT, hitFlash }
  balls: [], // { x, y, z, vx, vy, vz, fromPlayer }
  particles: [], // { x, y, z, vx, vy, vz, life, maxLife, size, color }
  waveTimer: 0,
  // Spring-anchored buoys: anchor + offset, velocity and wobble amount.
  // The first ones are the map's buoys; a race appends its own.
  buoys: [],
  race: null, // see startRace
};

const makeBuoy = ({ x, z, model, rotation = 0, scale = 0.9, y = -0.15, halfX = 0.55, edge = false }) => ({
  x0: x, z0: z, model, rotation, scale, y, halfX, edge, ox: 0, oz: 0, vx: 0, vz: 0, wobble: 0,
});
// Map buoys first, then the boundary ring (index BUOYS.length + i), then a race's own.
const mapBuoys = () => [...BUOYS, ...BOUNDARY_BUOYS].map((b) => makeBuoy({ ...b, x: b.position[0], z: b.position[1] }));
world.buoys = mapBuoys();
export const MAP_BUOY_COUNT = BUOYS.length + BOUNDARY_BUOYS.length;

export const resetWorld = () => {
  world.ship = freshShip();
  world.enemies = [];
  world.balls = [];
  world.waveTimer = 0;
  world.race = null;
  world.buoys = mapBuoys();
};

// --- UI store -------------------------------------------------------------

let ui = {
  started: false, // false until the player picks "Sail" or "Play" on the start screen
  entering: null, // island id the camera is diving into (the modal opens when it arrives)
  mode: 'explore', // 'explore' | 'combat' | 'victory' | 'defeat' | 'race'
  nearIsland: null, // island id within docking range
  openIsland: null, // island id whose modal is open
  wave: 0,
  waveState: 'idle', // 'incoming' | 'fighting' | 'cleared'
  hp: SHIP.maxHp,
  enemyIds: [],
  // Race mode: { difficulty, state: 'countdown'|'running'|'finished'|'failed',
  //   count (countdown number), next (checkpoint index), effect, result }
  race: null,
};
const listeners = new Set();

export const getUi = () => ui;

export const setUi = (patch) => {
  const next = typeof patch === 'function' ? patch(ui) : patch;
  let changed = false;
  for (const key in next) {
    if (ui[key] !== next[key]) { changed = true; break; }
  }
  if (!changed) return;
  ui = { ...ui, ...next };
  listeners.forEach((l) => l());
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useUi = (selector = (s) => s) => useSyncExternalStore(subscribe, () => selector(ui));

// --- Actions --------------------------------------------------------------

const releaseInput = () => {
  Object.keys(input).forEach((k) => { input[k] = typeof input[k] === 'number' ? 0 : false; });
};

/** Opens the modal immediately (no camera dive). */
export const openIsland = (id) => setUi({ openIsland: id, entering: null });
export const closeIsland = () => setUi({ openIsland: null, entering: null });

let reducedMotion = false;
export const setReducedMotion = (value) => { reducedMotion = value; };

/**
 * Player-initiated docking: the camera first dives into the island (CameraRig), then the
 * modal unrolls. With reduced motion the modal opens straight away.
 */
export const enterIsland = (id) => {
  releaseInput();
  if (reducedMotion) openIsland(id);
  else setUi({ entering: id, openIsland: null });
};

export const startCombat = () => {
  const { x, z, heading, scale } = world.ship;
  resetWorld();
  Object.assign(world.ship, { x, z, heading, scale });
  world.waveTimer = 2.5;
  setUi({ mode: 'combat', openIsland: null, nearIsland: null, wave: 0, waveState: 'incoming', hp: SHIP.maxHp, enemyIds: [] });
};

export const backToExplore = () => {
  const { scale } = world.ship;
  resetWorld();
  // Back to the starting spot and heading (facing About and Projects); the
  // camera glides there and the ship's size eases back up from its current scale.
  world.ship.scale = scale;
  setUi({ mode: 'explore', wave: 0, waveState: 'idle', hp: SHIP.maxHp, enemyIds: [], race: null });
};

// --- Start screen -----------------------------------------------------------

/** "Sail": free exploration straight away (the Help island and the MENU keep the instructions). */
export const startExploring = () => {
  setUi({ started: true });
};

/** "Play": start a game mode, then show the instructions; the mode begins when they're closed. */
export const startPlaying = (mode, difficulty) => {
  if (mode === 'race') startRace(difficulty);
  else startCombat();
  setUi({ started: true });
  openIsland('help');
};

/** Leaving /ocean: back to the start screen next time. */
export const resetSession = () => {
  releaseInput();
  if (ui.mode !== 'explore') backToExplore();
  setUi({ started: false, openIsland: null, entering: null });
};

// --- Race -------------------------------------------------------------------

const BEST_KEY = 'ocean_race_best';

export const readBestTimes = () => {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY)) || {};
  } catch {
    return {};
  }
};

/** Saves the time if it beats the stored best; returns { best, record }. */
export const saveRaceTime = (difficulty, time) => {
  const all = readBestTimes();
  const prev = all[difficulty];
  const record = prev == null || time < prev;
  if (record) {
    all[difficulty] = time;
    try {
      localStorage.setItem(BEST_KEY, JSON.stringify(all));
    } catch {
      // Storage unavailable: the record just won't persist.
    }
  }
  return { best: record ? time : prev, record };
};

let raceCounter = 0;

export const startRace = (difficulty) => {
  const { scale } = world.ship;
  resetWorld();
  // Line up behind the start gate, facing the first checkpoint.
  const [fx, fz] = RACE_CHECKPOINTS[0];
  const dir = Math.atan2(fx - RACE_START[0], fz - RACE_START[1]);
  Object.assign(world.ship, {
    x: RACE_START[0] - Math.sin(dir) * 5,
    z: RACE_START[1] - Math.cos(dir) * 5,
    heading: dir,
    scale,
  });
  const layout = buildRace(difficulty);
  world.buoys.push(...layout.buoys.map(makeBuoy));
  world.race = {
    difficulty,
    cfg: RACE_DIFFICULTY[difficulty],
    state: 'countdown',
    countdown: 3,
    time: 0,
    next: 0,
    rocks: layout.rocks,
    pickups: layout.pickups,
    mortars: layout.mortars,
    shells: [], // { x, z, t, delay, radius }: marked impact zones
    enemiesSpawned: false,
  };
  setUi({
    mode: 'race', openIsland: null, nearIsland: null, hp: SHIP.maxHp, enemyIds: [],
    race: { id: ++raceCounter, difficulty, state: 'countdown', count: 3, next: 0, effect: null, result: null },
  });
};

// Called from the sim loop (every frame during the countdown): skip unchanged patches.
export const setRaceUi = (patch) => {
  const race = ui.race;
  if (race && Object.keys(patch).every((k) => race[k] === patch[k])) return;
  setUi({ race: { ...race, ...patch } });
};
