import { useCallback, useEffect, useRef, useState } from 'react'
import { ISLANDS, RACE_CHECKPOINTS, RACE_DIFFICULTY, SHIP, WAVES } from '../config'
import { backToExplore, enterIsland, startCombat, startRace, useUi, world } from '../store'
import { useT } from '../../i18n/LanguageProvider'
import Minimap from './Minimap'
import TouchControls from './TouchControls'
import Menu from './Menu'
import MusicPlayer from './MusicPlayer'
import StartScreen from './StartScreen'
import { formatTime } from './format'

const chip = 'rounded-full bg-white/90 px-3 py-1.5 text-sm font-semibold shadow-md border-2 transition hover:bg-white motion-safe:hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400';
const panel = 'rounded-xl bg-slate-900/70 text-white backdrop-blur px-4 py-2 shadow-lg';

// Cannon reload bar, animated straight from the simulation.
const ReloadBar = () => {
  const ref = useRef(null);
  useEffect(() => {
    let raf;
    const tick = () => {
      const k = 1 - world.ship.cooldown / SHIP.cannonCooldown;
      if (ref.current) {
        ref.current.style.transform = `scaleX(${k})`;
        ref.current.style.backgroundColor = k >= 1 ? '#22c55e' : '#f59e0b';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className='h-2 w-28 rounded-full bg-white/25 overflow-hidden' aria-hidden='true'>
      <div ref={ref} className='h-full w-full origin-left rounded-full' />
    </div>
  );
};

const HpBar = ({ hp }) => (
  <div className='flex gap-0.5' aria-hidden='true'>
    {Array.from({ length: SHIP.maxHp }, (_, i) => (
      <span key={i} className={`h-3 w-2.5 rounded-sm ${i < hp ? 'bg-red-500' : 'bg-white/25'}`} />
    ))}
  </div>
);

const CombatHud = ({ ui, t }) => {
  const alive = ui.enemyIds.length;
  return (
    <div className='absolute left-1/2 -translate-x-1/2 top-4 z-20 flex flex-col items-center gap-2 pointer-events-none'>
      <div className={`${panel} flex flex-wrap items-center justify-center gap-x-5 gap-y-2`}>
        <span className='font-poppins font-semibold'>
          {t('ocean.hud.wave')} {Math.max(ui.wave, 1)}/{WAVES.length}
        </span>
        <span className='flex items-center gap-2'>
          <span className='sr-only'>{t('ocean.hud.hp')}: {ui.hp}/{SHIP.maxHp}</span>
          <HpBar hp={ui.hp} />
        </span>
        <span className='flex items-center gap-2 text-sm'>
          <span aria-hidden='true'>💣</span>
          <ReloadBar />
        </span>
        {ui.waveState === 'fighting' && (
          <span className='text-sm'>{t('ocean.hud.enemies')}: {alive}</span>
        )}
      </div>
      <button type='button' onClick={backToExplore} className={`${chip} border-slate-300 pointer-events-auto`}>
        {t('ocean.hud.quit')}
      </button>
    </div>
  );
};

const Banner = ({ ui, t }) => {
  if (ui.mode !== 'combat' || ui.waveState !== 'incoming') return null;
  const text = ui.wave === 0
    ? t('ocean.combat.incoming').replace('{n}', 1)
    : `${t('ocean.combat.cleared')} ${t('ocean.combat.incoming').replace('{n}', ui.wave + 1)}`;
  return (
    <div className='absolute inset-x-0 top-1/3 z-20 flex justify-center pointer-events-none px-4'>
      <p className='font-poppins font-bold text-2xl sm:text-4xl text-white text-center drop-shadow-[0_3px_0_rgba(0,0,0,0.45)] motion-safe:animate-pulse'>
        {text}
      </p>
    </div>
  );
};

const EndScreen = ({ ui, t }) => {
  const firstRef = useRef(null);
  const show = ui.mode === 'victory' || ui.mode === 'defeat';
  useEffect(() => { if (show) firstRef.current?.focus(); }, [show]);
  if (!show) return null;
  const win = ui.mode === 'victory';
  return (
    <div className='absolute inset-0 z-30 flex items-center justify-center bg-slate-900/50 p-4'>
      <div role='alertdialog' aria-labelledby='ocean-end-title' aria-describedby='ocean-end-desc' className='w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 text-center shadow-2xl'>
        <p aria-hidden='true' className='text-5xl'>{win ? '🏆' : '🌊'}</p>
        <h2 id='ocean-end-title' className='mt-3 font-poppins font-semibold text-2xl text-black-500'>
          {t(win ? 'ocean.combat.victory_title' : 'ocean.combat.defeat_title')}
        </h2>
        <p id='ocean-end-desc' className='mt-2 text-slate-600'>
          {t(win ? 'ocean.combat.victory_text' : 'ocean.combat.defeat_text')}
        </p>
        <div className='mt-6 flex flex-col sm:flex-row gap-3 justify-center'>
          <button ref={firstRef} type='button' onClick={startCombat} className='btn'>{t('ocean.combat.retry')}</button>
          <button type='button' onClick={backToExplore} className={`${chip} border-blue-500 text-blue-500 py-2.5 px-5`}>
            {t('ocean.combat.explore')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Race clock, refreshed straight from the simulation.
const RaceClock = () => {
  const ref = useRef(null);
  useEffect(() => {
    let raf;
    const tick = () => {
      if (ref.current && world.race) ref.current.textContent = formatTime(world.race.time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <span ref={ref} className='font-mono text-lg tabular-nums'>0:00.00</span>;
};

const EFFECT_STYLE = {
  boost: 'bg-green-500 text-white',
  slow: 'bg-purple-600 text-white',
};

const RaceHud = ({ ui, t }) => {
  const race = ui.race;
  const cfg = RACE_DIFFICULTY[race.difficulty];
  const total = RACE_CHECKPOINTS.length;
  return (
    <div className='absolute left-1/2 -translate-x-1/2 top-4 z-20 flex flex-col items-center gap-2 pointer-events-none'>
      <div className={`${panel} flex flex-wrap items-center justify-center gap-x-5 gap-y-2`}>
        <span className='font-poppins font-semibold'>🏁 {t(`ocean.menu.difficulty.${race.difficulty}`)}</span>
        <span className='flex items-center gap-2'>
          <span aria-hidden='true'>⏱</span>
          <RaceClock />
        </span>
        <span className='text-sm'>
          {t('ocean.race.checkpoint')} {Math.min(race.next + 1, total)}/{total}
        </span>
        {cfg.hp && (
          <span className='flex items-center gap-2'>
            <span className='sr-only'>{t('ocean.hud.hp')}: {ui.hp}/{SHIP.maxHp}</span>
            <HpBar hp={ui.hp} />
          </span>
        )}
      </div>
      {race.effect && (
        <span className={`rounded-full px-3 py-1 text-sm font-bold shadow-lg ${EFFECT_STYLE[race.effect]}`}>
          {t(`ocean.race.effect_${race.effect}`)}
        </span>
      )}
      <button type='button' onClick={backToExplore} className={`${chip} border-slate-300 pointer-events-auto`}>
        {t('ocean.race.quit')}
      </button>
    </div>
  );
};

// 3, 2, 1, GO! in the middle of the screen.
const Countdown = ({ ui, t }) => {
  const race = ui.race;
  const [showGo, setShowGo] = useState(false);
  const running = race?.state === 'running';
  useEffect(() => {
    if (!running) return undefined;
    setShowGo(true);
    const id = setTimeout(() => setShowGo(false), 900);
    return () => clearTimeout(id);
  }, [running, race?.id]);
  const text = race?.state === 'countdown' ? race.count : showGo && running ? t('ocean.race.go') : null;
  if (text == null) return null;
  return (
    <div className='absolute inset-0 z-20 flex items-center justify-center pointer-events-none'>
      <p
        key={text}
        className='font-poppins font-black text-7xl sm:text-8xl text-yellow-300 drop-shadow-[0_5px_0_rgba(0,0,0,0.45)] motion-safe:animate-ping-once'
      >
        {text}
      </p>
    </div>
  );
};

const RaceEnd = ({ ui, t }) => {
  const firstRef = useRef(null);
  const race = ui.race;
  const show = race && (race.state === 'finished' || race.state === 'failed');
  useEffect(() => { if (show) firstRef.current?.focus(); }, [show]);
  if (!show) return null;
  const won = race.state === 'finished';
  const result = race.result;
  return (
    <div className='absolute inset-0 z-30 flex items-center justify-center bg-slate-900/50 p-4'>
      <div role='alertdialog' aria-labelledby='race-end-title' aria-describedby='race-end-desc' className='w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 text-center shadow-2xl'>
        <p aria-hidden='true' className='text-5xl'>{won ? '🏁' : '💥'}</p>
        <h2 id='race-end-title' className='mt-3 font-poppins font-semibold text-2xl text-black-500'>
          {t(won ? 'ocean.race.finished_title' : 'ocean.race.failed_title')}
        </h2>
        <div id='race-end-desc' className='mt-3 text-slate-600'>
          {won ? (
            <>
              <p className='text-sm'>{t('ocean.race.your_time')} · {t(`ocean.menu.difficulty.${race.difficulty}`)}</p>
              <p className='mt-1 font-mono text-4xl font-bold text-slate-900'>{formatTime(result.time)}</p>
              {result.record ? (
                <p className='mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700'>🏆 {t('ocean.race.record')}</p>
              ) : (
                <p className='mt-2 text-sm'>{t('ocean.race.best')}: <span className='font-mono font-semibold'>{formatTime(result.best)}</span></p>
              )}
            </>
          ) : (
            <p>{t('ocean.race.failed_text')}</p>
          )}
        </div>
        <div className='mt-6 flex flex-col sm:flex-row gap-3 justify-center'>
          <button ref={firstRef} type='button' onClick={() => startRace(race.difficulty)} className='btn'>{t('ocean.combat.retry')}</button>
          <button type='button' onClick={backToExplore} className={`${chip} border-blue-500 text-blue-500 py-2.5 px-5`}>
            {t('ocean.combat.explore')}
          </button>
        </div>
      </div>
    </div>
  );
};

const DockHint = ({ ui, t, coarse }) => {
  if (ui.mode !== 'explore' || !ui.nearIsland || ui.entering) return null;
  const island = ISLANDS.find((i) => i.id === ui.nearIsland);
  const name = t(`ocean.islands.${island.id}.name`);
  return (
    <div
      className='absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1'
      // Touch: above the music player (which sits at 11rem, over the joystick), so they never overlap.
      style={{ bottom: coarse ? 'calc(15.5rem + env(safe-area-inset-bottom, 0px))' : '2rem' }}
    >
      <button
        type='button'
        onClick={() => enterIsland(island.id)}
        className='whitespace-nowrap rounded-xl bg-white px-5 py-3 font-poppins font-semibold text-slate-900 shadow-xl border-b-4 transition motion-safe:hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400'
        style={{ borderColor: island.color }}
      >
        <span aria-hidden='true' className='mr-2'>{t(`ocean.islands.${island.id}.icon`)}</span>
        {t('ocean.hud.dock').replace('{name}', name)}
        {!coarse && <kbd className='ml-3 rounded border border-slate-300 bg-slate-50 px-1.5 text-xs font-mono'>E</kbd>}
      </button>
    </div>
  );
};

/** Everything drawn over the canvas: island shortcuts, minimap, combat status and touch controls. */
const Hud = ({ coarse }) => {
  const t = useT();
  const ui = useUi();
  const exploring = ui.mode === 'explore';

  // Only one of MENU / music player can be open at a time.
  const [panel, setPanel] = useState(null); // 'menu' | 'music' | null
  const setMenuOpen = useCallback((v) => setPanel((p) => {
    const next = typeof v === 'function' ? v(p === 'menu') : v;
    return next ? 'menu' : p === 'menu' ? null : p;
  }), []);
  const setMusicOpen = useCallback((v) => setPanel((p) => (v ? 'music' : p === 'music' ? null : p)), []);
  // MENU unmounts outside explore mode; don't let it pop back open on return.
  useEffect(() => { if (!exploring) setMenuOpen(false); }, [exploring, setMenuOpen]);

  if (!ui.started) {
    return (
      <>
        <MusicPlayer coarse={coarse} open={panel === 'music'} setOpen={setMusicOpen} />
        <StartScreen />
      </>
    );
  }

  return (
    <>
      {/* Live region so screen readers hear docking, wave and result changes */}
      <p className='sr-only' aria-live='polite'>
        {exploring && ui.nearIsland ? t('ocean.hud.dock').replace('{name}', t(`ocean.islands.${ui.nearIsland}.name`)) : ''}
        {ui.mode === 'combat' && ui.wave > 0 ? `${t('ocean.hud.wave')} ${ui.wave}/${WAVES.length}` : ''}
        {ui.mode === 'race' && ui.race ? `${t('ocean.race.checkpoint')} ${Math.min(ui.race.next + 1, RACE_CHECKPOINTS.length)}/${RACE_CHECKPOINTS.length}` : ''}
      </p>

      {exploring && <Menu coarse={coarse} open={panel === 'menu'} setOpen={setMenuOpen} />}
      <MusicPlayer coarse={coarse} open={panel === 'music'} setOpen={setMusicOpen} />

      {!coarse && (
        <div className='absolute right-6 bottom-6 z-20 flex flex-col items-end gap-2'>
          <Minimap />
          {exploring && (
            <p className={`${panel} text-xs`}>
              <kbd className='font-mono'>WASD</kbd> {t('ocean.hud.hint_move')} · <kbd className='font-mono'>{t('ocean.help.space')}</kbd> {t('ocean.hud.hint_fire')}
            </p>
          )}
        </div>
      )}

      {ui.mode === 'combat' && <CombatHud ui={ui} t={t} />}
      {ui.mode === 'race' && ui.race && <RaceHud ui={ui} t={t} />}
      {ui.mode === 'race' && <Countdown ui={ui} t={t} />}
      <Banner ui={ui} t={t} />
      <DockHint ui={ui} t={t} coarse={coarse} />
      {coarse && (ui.mode === 'explore' || ui.mode === 'combat' || ui.race?.state === 'running') && !ui.openIsland && !ui.entering && <TouchControls />}
      <EndScreen ui={ui} t={t} />
      <RaceEnd ui={ui} t={t} />
    </>
  );
};

export default Hud
