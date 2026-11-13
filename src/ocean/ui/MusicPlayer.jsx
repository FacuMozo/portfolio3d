import { useEffect, useId, useRef } from 'react'
import { TRACKS, selectTrack, setVolume, stepTrack, toggleMusic, useMusic } from '../music'
import { useT } from '../../i18n/LanguageProvider'

const ARTISTS = [...new Set(TRACKS.map((tr) => tr.artist))];
const iconBtn = 'w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 disabled:opacity-40';

/**
 * Music player, bottom-left (above the joystick on touch screens).
 * Collapsed: play/pause, next track and a button that opens the track list,
 * volume and credits. `open` is owned by the HUD so it never overlaps the MENU.
 */
const MusicPlayer = ({ coarse, open, setOpen }) => {
  const t = useT();
  const music = useMusic();
  const rootRef = useRef(null);
  const panelId = useId();
  const current = TRACKS.find((tr) => tr.id === music.current);
  const forced = music.mode !== 'explore'; // combat / race pick their own track
  const playing = music.on && !music.waiting;

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.code === 'Escape') setOpen(false); };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen]);

  return (
    <div
      ref={rootRef}
      className={`absolute z-20 flex flex-col-reverse items-start gap-2 ${coarse ? 'left-4' : 'left-6 bottom-6'}`}
      style={coarse ? { bottom: 'calc(11rem + env(safe-area-inset-bottom, 0px))' } : undefined}
    >
      <div className='flex items-center gap-0.5 rounded-full bg-white/90 p-0.5 shadow-lg border-2 border-slate-200'>
        <button
          type='button'
          onClick={toggleMusic}
          aria-pressed={music.on}
          aria-label={t(music.on ? 'ocean.music.pause' : 'ocean.music.play')}
          title={t(music.on ? 'ocean.music.pause' : 'ocean.music.play')}
          className={iconBtn}
        >
          <span aria-hidden='true'>{music.on ? '⏸' : '▶'}</span>
        </button>
        <button
          type='button'
          onClick={() => stepTrack(1)}
          disabled={forced}
          aria-label={t('ocean.music.next')}
          title={t('ocean.music.next')}
          className={iconBtn}
        >
          <span aria-hidden='true'>⏭</span>
        </button>
        <button
          type='button'
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={t('ocean.music.title')}
          title={t('ocean.music.title')}
          className={iconBtn}
        >
          <span aria-hidden='true' className={playing ? 'motion-safe:animate-pulse' : ''}>🎵</span>
        </button>
      </div>

      <div
        id={panelId}
        hidden={!open}
        className={`modal-scroll w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl bg-white/95 backdrop-blur p-3 shadow-2xl text-slate-800 ${coarse ? 'max-h-[calc(100dvh-16rem)]' : 'max-h-[calc(100dvh-7rem)]'}`}
      >
        <p className='px-1 text-xs font-bold uppercase tracking-wider text-slate-400'>{t('ocean.music.now_playing')}</p>
        <p className='px-1 mt-1 font-semibold leading-tight'>{music.on && current ? current.title : '—'}</p>
        <p className='px-1 text-xs text-slate-500'>
          {music.on && current ? current.artist : t('ocean.music.off')}
          {forced && music.on && <> · {t(`ocean.music.mode_${music.mode === 'race' ? 'race' : 'combat'}`)}</>}
        </p>
        {music.waiting && music.on && <p className='px-1 mt-1 text-xs text-amber-600'>{t('ocean.music.tap_to_start')}</p>}

        <div className='mt-2 flex items-center gap-1'>
          <button type='button' onClick={() => stepTrack(-1)} disabled={forced} aria-label={t('ocean.music.prev')} className={iconBtn}>⏮</button>
          <button type='button' onClick={toggleMusic} aria-label={t(music.on ? 'ocean.music.pause' : 'ocean.music.play')} className={iconBtn}>
            {music.on ? '⏸' : '▶'}
          </button>
          <button type='button' onClick={() => stepTrack(1)} disabled={forced} aria-label={t('ocean.music.next')} className={iconBtn}>⏭</button>
          <label className='ml-2 flex flex-1 items-center gap-2'>
            <span className='sr-only'>{t('ocean.music.volume')}</span>
            <input
              type='range'
              min='0'
              max='1'
              step='0.05'
              value={music.volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className='w-full accent-blue-500'
            />
          </label>
        </div>

        <ul className='mt-2 border-t border-slate-200 pt-2' aria-label={t('ocean.music.tracks')}>
          {TRACKS.map((tr) => {
            const selected = tr.id === music.selected;
            const missing = music.missing.includes(tr.id);
            return (
              <li key={tr.id}>
                <button
                  type='button'
                  onClick={() => selectTrack(tr.id)}
                  disabled={missing}
                  aria-current={selected ? 'true' : undefined}
                  className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 disabled:opacity-40 ${selected ? 'bg-blue-50 font-semibold text-blue-700' : ''}`}
                >
                  {tr.title}
                  <span className='block text-xs font-normal text-slate-500'>
                    {tr.artist}
                    {missing && <> · {t('ocean.music.missing')}</>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {forced && <p className='px-1 mt-1 text-xs text-slate-500'>{t('ocean.music.forced_hint')}</p>}

        <p className='mt-2 border-t border-slate-200 pt-2 px-1 text-[11px] leading-snug text-slate-500'>
          {t('ocean.music.credits')} {ARTISTS.join(', ')} {t('ocean.music.via')}{' '}
          <a href='https://pixabay.com/service/license-summary/' target='_blank' rel='noreferrer' className='underline hover:text-blue-600'>Pixabay</a>
        </p>
      </div>
    </div>
  );
};

export default MusicPlayer
