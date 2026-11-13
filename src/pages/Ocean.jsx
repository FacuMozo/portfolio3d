import { useEffect, useSyncExternalStore } from 'react'
import OceanScene from '../ocean/scene/OceanScene'
import Hud from '../ocean/ui/Hud'
import IslandModal from '../ocean/ui/IslandModal'
import useKeyboard from '../ocean/useKeyboard'
import { backToExplore, closeIsland, getUi, openIsland, useUi } from '../ocean/store'
import { mountMusic, setMusicMode } from '../ocean/music'
import { useT } from '../i18n/LanguageProvider'

const HELP_SEEN_KEY = 'ocean_help_seen';

const useMediaQuery = (query) =>
  useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
  );

/** Home screen: sail between islands, each one a section of the portfolio. */
const Ocean = () => {
  const t = useT();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const coarse = useMediaQuery('(pointer: coarse)');
  const mode = useUi((s) => s.mode);
  useKeyboard();

  useEffect(() => mountMusic(getUi().mode), []);
  useEffect(() => setMusicMode(mode), [mode]);

  useEffect(() => {
    // Show the instructions on the first visit only.
    let seen = true;
    try {
      seen = localStorage.getItem(HELP_SEEN_KEY) === '1';
      localStorage.setItem(HELP_SEEN_KEY, '1');
    } catch {
      // Storage unavailable: skip the auto-open rather than nag every visit.
    }
    if (!seen) openIsland('help');

    return () => {
      // Leaving the page: close modals and stop any battle in progress.
      closeIsland();
      if (getUi().mode !== 'explore') backToExplore();
      document.body.style.cursor = '';
    };
  }, []);

  return (
    <section className='relative w-full h-dvh overflow-hidden bg-[#0e5f94]'>
      <h1 className='sr-only'>{t('ocean.title')}</h1>
      <OceanScene reducedMotion={reducedMotion} />
      <Hud coarse={coarse} />
      <IslandModal />
    </section>
  );
};

export default Ocean
