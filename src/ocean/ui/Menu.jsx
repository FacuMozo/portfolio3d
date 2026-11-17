import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ISLANDS, RACE_DIFFICULTY } from '../config'
import { getUi, openIsland, readBestTimes, startCombat, startRace } from '../store'
import { useLanguage, useT } from '../../i18n/LanguageProvider'
import { formatTime } from './format'

const item = 'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left font-semibold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400';
const sectionTitle = 'px-3 pt-2 pb-1 text-xs font-bold uppercase tracking-wider text-slate-400';

const isTextField = (el) => el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

/**
 * Collapsible "MENU" with island shortcuts, game modes and language.
 * Top-left. `M` toggles it; Esc or a click outside closes it.
 * `open` is owned by the HUD so it never overlaps the music player.
 */
const Menu = ({ coarse, open, setOpen }) => {
  const t = useT();
  const { lang, setLang } = useLanguage();
  const [racePicker, setRacePicker] = useState(false);
  const [best, setBest] = useState({});
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const panelId = useId();
  const nextLang = lang === 'es' ? 'en' : 'es';

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    setRacePicker(false);
    if (returnFocus) buttonRef.current?.focus();
  }, [setOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Escape' && open) { close(true); return; }
      if (e.code !== 'KeyM' || e.altKey || e.ctrlKey || e.metaKey || isTextField(e.target)) return;
      if (getUi().openIsland) return;
      setOpen((o) => !o);
      setRacePicker(false);
    };
    const onDown = (e) => { if (open && !rootRef.current?.contains(e.target)) close(); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open, close, setOpen]);

  useEffect(() => {
    if (!open) return;
    setBest(readBestTimes());
    panelRef.current?.querySelector('button')?.focus();
  }, [open]);

  const run = (fn) => () => { close(); fn(); };

  return (
    <div
      ref={rootRef}
      className={`absolute z-20 flex flex-col gap-2 ${coarse ? 'left-4' : 'left-6'}`}
      style={{ top: `calc(${coarse ? '1rem' : '1.5rem'} + env(safe-area-inset-top, 0px))` }}
    >
      <button
        ref={buttonRef}
        type='button'
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls={panelId}
        className='self-start flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 font-poppins font-bold tracking-wide text-slate-900 shadow-lg border-b-4 border-blue-500 transition motion-safe:hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400'
      >
        <span aria-hidden='true' className='text-lg leading-none'>{open ? '✕' : '☰'}</span>
        {t('ocean.menu.title')}
        {!coarse && <kbd className='ml-1 rounded border border-slate-300 bg-slate-50 px-1.5 text-xs font-mono font-normal text-slate-500'>M</kbd>}
      </button>

      <div
        id={panelId}
        ref={panelRef}
        hidden={!open}
        className='modal-scroll w-72 max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-2xl bg-white/95 backdrop-blur p-2 shadow-2xl'
      >
        <nav aria-label={t('ocean.menu.islands')}>
          <p className={sectionTitle}>{t('ocean.menu.islands')}</p>
          <ul>
            {ISLANDS.map((island) => (
              <li key={island.id}>
                <button type='button' onClick={run(() => openIsland(island.id))} className={item}>
                  <span aria-hidden='true' className='w-7 h-7 shrink-0 rounded-full flex items-center justify-center border-2' style={{ borderColor: island.color }}>
                    {t(`ocean.islands.${island.id}.icon`)}
                  </span>
                  {t(`ocean.islands.${island.id}.name`)}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className='my-2 border-t border-slate-200' />
        <p className={sectionTitle}>{t('ocean.menu.modes')}</p>
        <button type='button' onClick={run(startCombat)} className={item}>
          <span aria-hidden='true' className='w-7 text-center'>⚔️</span>
          <span>
            {t('ocean.menu.combat')}
            <span className='block text-xs font-normal text-slate-500'>{t('ocean.menu.combat_desc')}</span>
          </span>
        </button>
        <button type='button' onClick={() => setRacePicker((v) => !v)} aria-expanded={racePicker} className={item}>
          <span aria-hidden='true' className='w-7 text-center'>🏁</span>
          <span className='flex-1'>
            {t('ocean.menu.race')}
            <span className='block text-xs font-normal text-slate-500'>{t('ocean.menu.race_desc')}</span>
          </span>
          <span aria-hidden='true' className={`text-slate-400 transition ${racePicker ? 'rotate-90' : ''}`}>›</span>
        </button>
        {racePicker && (
          <ul className='ml-10 mb-1 flex flex-col gap-1'>
            {Object.keys(RACE_DIFFICULTY).map((d) => (
              <li key={d}>
                <button type='button' onClick={run(() => startRace(d))} className={`${item} !py-1.5`}>
                  <span className='flex-1'>
                    {t(`ocean.menu.difficulty.${d}`)}
                    <span className='block text-xs font-normal text-slate-500'>{t(`ocean.menu.difficulty.${d}_desc`)}</span>
                  </span>
                  {best[d] != null && (
                    <span className='text-xs font-mono text-amber-600' title={t('ocean.race.best')}>🏆 {formatTime(best[d])}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className='my-2 border-t border-slate-200' />
        <button type='button' onClick={() => setLang(nextLang)} lang={nextLang} className={item}>
          <span aria-hidden='true' className='w-7 text-center'>🌐</span>
          {t('navbar.langToggle_label')}
        </button>
        <Link to='/' className={item}>
          <span aria-hidden='true' className='w-7 text-center'>↩</span>
          {t('site.ocean.back')}
        </Link>
      </div>
    </div>
  );
};

export default Menu
