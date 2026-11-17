import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RACE_DIFFICULTY } from '../config'
import { readBestTimes, startExploring, startPlaying } from '../store'
import { useT } from '../../i18n/LanguageProvider'
import { formatTime } from './format'

const choice = 'w-full flex items-center gap-4 rounded-2xl bg-white px-5 py-4 text-left shadow-lg border-b-4 transition motion-safe:hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400';
const small = 'w-full flex items-center gap-3 rounded-xl bg-white/95 px-4 py-2.5 text-left font-semibold text-slate-800 shadow transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400';

/**
 * Gate shown over the living sea until the player picks what to do.
 * The ship can't be steered (and islands can't be docked) until then; the instructions
 * open right after the choice.
 */
const StartScreen = () => {
  const t = useT();
  const [picking, setPicking] = useState(false);
  const [best] = useState(readBestTimes);
  const firstRef = useRef(null);

  // Move focus to the first option of each step (initial screen, then the mode list).
  useEffect(() => { firstRef.current?.focus(); }, [picking]);

  return (
    <div className='absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-b from-sky-950/40 via-sky-950/20 to-sky-950/50 px-4'>
      <section aria-labelledby='ocean-start-title' className='w-full max-w-md text-center'>
        <h2 id='ocean-start-title' className='font-poppins font-extrabold text-3xl sm:text-4xl text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.35)]'>
          {t('ocean.start.title')}
        </h2>
        <p className='mt-3 text-white/90 font-medium drop-shadow'>{t('ocean.start.subtitle')}</p>

        {!picking ? (
          <div className='mt-8 flex flex-col gap-4'>
            <button ref={firstRef} type='button' onClick={startExploring} className={`${choice} border-sky-500`}>
              <span aria-hidden='true' className='text-3xl'>⛵</span>
              <span>
                <span className='block font-poppins font-bold text-lg text-slate-900'>{t('ocean.start.sail')}</span>
                <span className='block text-sm text-slate-600'>{t('ocean.start.sail_desc')}</span>
              </span>
            </button>
            <button type='button' onClick={() => setPicking(true)} className={`${choice} border-red-500`}>
              <span aria-hidden='true' className='text-3xl'>🎮</span>
              <span>
                <span className='block font-poppins font-bold text-lg text-slate-900'>{t('ocean.start.play')}</span>
                <span className='block text-sm text-slate-600'>{t('ocean.start.play_desc')}</span>
              </span>
            </button>
          </div>
        ) : (
          <div className='mt-8 rounded-2xl bg-white/90 backdrop-blur p-4 shadow-xl text-left'>
            <p className='px-1 pb-2 font-poppins font-semibold text-slate-900'>{t('ocean.start.choose')}</p>
            <ul className='flex flex-col gap-2'>
              <li>
                <button ref={firstRef} type='button' onClick={() => startPlaying('combat')} className={small}>
                  <span aria-hidden='true' className='w-7 text-center'>⚔️</span>
                  <span>
                    {t('ocean.menu.combat')}
                    <span className='block text-xs font-normal text-slate-500'>{t('ocean.menu.combat_desc')}</span>
                  </span>
                </button>
              </li>
              {Object.keys(RACE_DIFFICULTY).map((d) => (
                <li key={d}>
                  <button type='button' onClick={() => startPlaying('race', d)} className={small}>
                    <span aria-hidden='true' className='w-7 text-center'>🏁</span>
                    <span className='flex-1'>
                      {t('ocean.menu.race')} · {t(`ocean.menu.difficulty.${d}`)}
                      <span className='block text-xs font-normal text-slate-500'>{t(`ocean.menu.difficulty.${d}_desc`)}</span>
                    </span>
                    {best[d] != null && (
                      <span className='text-xs font-mono text-amber-700' title={t('ocean.race.best')}>🏆 {formatTime(best[d])}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <button type='button' onClick={() => setPicking(false)} className='mt-3 px-1 text-sm font-semibold text-blue-700 hover:underline focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 rounded'>
              ← {t('ocean.start.back')}
            </button>
          </div>
        )}

        <Link to='/' className='mt-8 inline-block text-sm font-semibold text-white/90 underline underline-offset-4 hover:text-white drop-shadow'>
          ↩ {t('site.ocean.back')}
        </Link>
      </section>
    </div>
  );
};

export default StartScreen
