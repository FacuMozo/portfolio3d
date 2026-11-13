import { useSyncExternalStore } from 'react'

/*
 * Background music for the ocean page.
 *
 * Tracks come from Pixabay (Pixabay Content License: free to use inside a
 * larger work, no attribution required, never as standalone downloads). The
 * mp3 files live in /public/audio and are downloaded by hand from each `source`.
 *
 * Explore mode plays the track picked in the player; combat and race force
 * their own loop and hand back to the picked track afterwards. Switching
 * crossfades. Browsers block audio until the first user gesture, so playback
 * starts on the first click or key press.
 */

export const TRACKS = [
  {
    id: 'menu',
    title: 'Pirates Acoustic Guitar Loop 2',
    artist: 'IdoBerg',
    file: '/audio/idoberg-pirates-acoustic-guitar-loop-2-549785.mp3',
    // Short loop: gapless playback through Web Audio, cut in and out without fades.
    gapless: true,
    fade: false,
    source: 'https://pixabay.com/es/music/guitarra-solista-pirates-acoustic-guitar-loop-2-549785/',
  },
  {
    id: 'jolly-roger',
    title: 'Pirate Jolly Roger (Acoustic)',
    artist: 'Ebunny',
    file: '/audio/ebunny-pirate-jolly-roger-acoustic-378603.mp3',
    source: 'https://pixabay.com/music/folk-pirate-jolly-roger-acoustic-378603/',
  },
  {
    id: 'race',
    title: 'Pirates Action Loop',
    artist: 'Ebunny',
    file: '/audio/ebunny-pirates-action-loop-368853.mp3',
    source: 'https://pixabay.com/es/music/titulo-principal-pirates-action-loop-368853/',
  },
  {
    id: 'battle',
    title: 'Pirates Battle',
    artist: 'Ebunny',
    file: '/audio/ebunny-pirates-battle-361336.mp3',
    source: 'https://pixabay.com/es/music/titulo-principal-pirates-battle-361336/',
  },
  {
    id: 'darkness',
    title: 'Way Through Darkness',
    artist: 'Brutaldesign',
    file: '/audio/brutaldesign-way-through-darkness-583317.mp3',
    source: 'https://pixabay.com/es/music/electr%C3%B3nico-way-through-darkness-583317/',
  },
];

const MODE_TRACK = { combat: 'battle', victory: 'battle', defeat: 'battle', race: 'race' };
const FADE_SECONDS = 0.8;
const PREFS_KEY = 'ocean_music';

// --- Player state (React-facing) -------------------------------------------

const loadPrefs = () => {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
  } catch {
    return {};
  }
};

const prefs = loadPrefs();

let state = {
  on: prefs.on ?? true, // the visitor wants music
  volume: typeof prefs.volume === 'number' ? prefs.volume : 0.35,
  selected: 'menu', // every visit starts on the menu loop
  mode: 'explore',
  current: null, // track id that should be audible right now
  waiting: false, // blocked by autoplay policy until a user gesture
  missing: [], // track ids whose file failed to load
};
const listeners = new Set();

const setState = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
  if ('on' in patch || 'volume' in patch) {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ on: state.on, volume: state.volume }));
    } catch {
      // Storage unavailable: preferences just won't persist.
    }
  }
};

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useMusic = () => useSyncExternalStore(subscribe, () => state);

// --- Audio engine -----------------------------------------------------------

const audios = new Map(); // id -> HTMLAudioElement or BufferLoop
const gains = new Map(); // id -> 0..1 fade level
let active = false; // the ocean page is mounted
let raf = 0;
let last = 0;
let ctx = null;

const notAllowed = () => new DOMException('Audio needs a user gesture', 'NotAllowedError');

const LOOP_XFADE = 1.2; // seconds two passes of a loop overlap
const SILENCE = 0.002; // amplitude treated as silence when trimming the file's edges
// Equal-power crossfade curves, so the overlap doesn't dip in loudness.
const curve = (fn) => Float32Array.from({ length: 64 }, (_, i) => fn((i / 63) * (Math.PI / 2)));
const FADE_IN = curve(Math.sin);
const FADE_OUT = curve(Math.cos);

// First / last sample above the silence threshold, in seconds.
const audibleRange = (buffer) => {
  const chans = Array.from({ length: buffer.numberOfChannels }, (_, c) => buffer.getChannelData(c));
  const loud = (i) => chans.some((d) => Math.abs(d[i]) > SILENCE);
  let a = 0;
  let b = buffer.length - 1;
  while (a < b && !loud(a)) a++;
  while (b > a && !loud(b)) b--;
  return [a / buffer.sampleRate, (b + 1) / buffer.sampleRate];
};

/**
 * Seamless loop through Web Audio: <audio loop> leaves a small gap on every
 * repeat with mp3, very audible on a 16 s loop. The file's silent edges are
 * trimmed and each pass is crossfaded into the next (two overlapping voices
 * over the same decoded buffer). Mirrors the bits of the HTMLAudioElement API
 * the engine uses (play, pause, paused, volume, currentTime).
 */
class BufferLoop {
  constructor(url, onError) {
    this.url = url;
    this.onError = onError;
    this.paused = true;
    this.offset = 0; // position within the audible range, seconds
    this.voices = new Set();
    this.timer = 0;
    this.nextAt = 0; // context time the next pass starts
    this.buffer = null;
    this.loading = null;
    this.gain = null;
    this.vol = 0;
  }

  get period() {
    return this.end - this.start - LOOP_XFADE;
  }

  // One pass from `from` (seconds into the file) to the audible end, fading out
  // over the last LOOP_XFADE seconds; schedules where the next pass begins.
  voice(when, from, fadeIn) {
    const len = this.end - from;
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    src.buffer = this.buffer;
    src.connect(g).connect(this.gain);
    if (fadeIn) g.gain.setValueCurveAtTime(FADE_IN, when, LOOP_XFADE);
    else g.gain.setValueAtTime(1, when);
    g.gain.setValueCurveAtTime(FADE_OUT, when + len - LOOP_XFADE, LOOP_XFADE);
    src.start(when, from, len);
    const v = { src, g };
    src.onended = () => { this.voices.delete(v); g.disconnect(); };
    this.voices.add(v);
    this.nextAt = when + len - LOOP_XFADE;
  }

  schedule() {
    while (this.nextAt < ctx.currentTime + 0.5) this.voice(this.nextAt, this.start, true);
  }

  set volume(v) {
    this.vol = v;
    if (this.gain) this.gain.gain.value = v;
  }

  get volume() {
    return this.vol;
  }

  set currentTime(t) {
    if (this.paused) this.offset = t;
  }

  load() {
    this.loading ??= fetch(this.url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.arrayBuffer();
      })
      .then((data) => ctx.decodeAudioData(data))
      .then((buffer) => {
        this.buffer = buffer;
        [this.start, this.end] = audibleRange(buffer);
      })
      .catch((err) => { this.onError(); throw err; });
    return this.loading;
  }

  async play() {
    this.paused = false;
    try {
      // Without a prior gesture the context stays suspended; don't wait on it.
      if (navigator.userActivation && !navigator.userActivation.hasBeenActive) throw notAllowed();
      ctx ??= new AudioContext();
      if (ctx.state !== 'running') await Promise.race([ctx.resume(), new Promise((r) => setTimeout(r, 300))]);
      if (ctx.state !== 'running') throw notAllowed();
      if (!this.gain) {
        this.gain = ctx.createGain();
        this.gain.gain.value = this.vol;
        this.gain.connect(ctx.destination);
      }
      await this.load();
    } catch (err) {
      this.paused = true;
      throw err;
    }
    if (this.paused || this.timer) return; // paused while loading, or already running
    // Resuming too close to the end leaves no room for the fade: restart instead.
    let pos = this.offset % this.period;
    if (this.end - this.start - pos < LOOP_XFADE * 2) pos = 0;
    this.voice(ctx.currentTime, this.start + pos, false); // starts at full volume, no fade-in
    this.schedule();
    this.timer = setInterval(() => this.schedule(), 200);
  }

  pause() {
    this.paused = true;
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = 0;
    // Position within the current pass (the next one may already be queued).
    let pos = ctx.currentTime - (this.nextAt - this.period);
    while (pos < 0) pos += this.period;
    this.offset = pos;
    for (const { src, g } of this.voices) {
      src.onended = null;
      src.stop();
      g.disconnect();
    }
    this.voices.clear();
  }
}

const audioFor = (id) => {
  let a = audios.get(id);
  if (a) return a;
  const track = TRACKS.find((t) => t.id === id);
  const onError = () => {
    if (!state.missing.includes(id)) setState({ missing: [...state.missing, id] });
  };
  if (track.gapless && typeof AudioContext !== 'undefined') {
    a = new BufferLoop(track.file, onError);
  } else {
    a = new Audio(track.file);
    a.loop = true;
    a.preload = 'auto';
    a.volume = 0;
    a.addEventListener('error', onError);
  }
  audios.set(id, a);
  gains.set(id, 0);
  return a;
};

const tryPlay = (a) => {
  a.play().then(
    () => { if (state.waiting) setState({ waiting: false }); },
    (err) => { if (err?.name === 'NotAllowedError' && !state.waiting) setState({ waiting: true }); },
  );
};

// Steps every fade toward its target; stops itself once everything settles.
const tick = (now) => {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  let busy = false;
  for (const [id, a] of audios) {
    const target = active && state.on && id === state.current ? 1 : 0;
    let g = gains.get(id);
    if (g !== target) {
      const step = TRACKS.find((t) => t.id === id).fade === false ? 1 : dt / FADE_SECONDS;
      g = target > g ? Math.min(target, g + step) : Math.max(target, g - step);
      gains.set(id, g);
      busy = true;
    }
    a.volume = Math.min(1, g * state.volume);
    if (g === 0 && !a.paused) a.pause();
  }
  raf = busy ? requestAnimationFrame(tick) : 0;
};

const kick = () => {
  if (raf) return;
  last = performance.now();
  raf = requestAnimationFrame(tick);
};

const sync = () => {
  const current = MODE_TRACK[state.mode] ?? state.selected;
  if (current !== state.current) setState({ current });
  if (active && state.on && current) {
    const a = audioFor(current);
    // A mode loop that had fully faded out starts again from the top.
    if (gains.get(current) === 0 && MODE_TRACK[state.mode]) a.currentTime = 0;
    if (a.paused) tryPlay(a);
  }
  kick();
};

// First gesture on the page unlocks audio.
const onGesture = () => {
  if (state.waiting) sync();
};

// --- Public API ---------------------------------------------------------------

/** Called by the ocean page on mount, with the game mode it starts in; returns the cleanup. */
export const mountMusic = (mode = 'explore') => {
  active = true;
  // Leaving mid-battle leaves a stale mode behind: start on the right track.
  if (mode !== state.mode) setState({ mode });
  window.addEventListener('pointerdown', onGesture);
  window.addEventListener('pointerup', onGesture);
  window.addEventListener('keydown', onGesture);
  sync();
  return () => {
    active = false;
    window.removeEventListener('pointerdown', onGesture);
    window.removeEventListener('pointerup', onGesture);
    window.removeEventListener('keydown', onGesture);
    kick(); // fade everything out
  };
};

export const setMusicMode = (mode) => {
  if (mode === state.mode) return;
  setState({ mode });
  sync();
};

export const toggleMusic = () => {
  setState({ on: !state.on });
  sync();
};

export const selectTrack = (id) => {
  setState({ selected: id, on: true });
  sync();
};

export const stepTrack = (dir) => {
  const i = TRACKS.findIndex((t) => t.id === state.selected);
  selectTrack(TRACKS[(i + dir + TRACKS.length) % TRACKS.length].id);
};

export const setVolume = (volume) => {
  setState({ volume });
  for (const [id, a] of audios) a.volume = Math.min(1, gains.get(id) * volume);
};
