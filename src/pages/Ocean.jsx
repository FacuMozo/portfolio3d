import { useEffect } from 'react'
import '../legacyFonts'
import OceanScene from '../ocean/scene/OceanScene'
import Hud from '../ocean/ui/Hud'
import IslandModal from '../ocean/ui/IslandModal'
import useKeyboard from '../ocean/useKeyboard'
import { backToExplore, closeIsland, getUi, openIsland, useUi } from '../ocean/store'
import { mountMusic, setMusicMode } from '../ocean/music'
import { useT } from '../i18n/LanguageProvider'
import useMediaQuery from '../hooks/useMediaQuery'
import useSiteTheme from '../hooks/useSiteTheme'

const HELP_SEEN_KEY = 'ocean_help_seen';

/** 3D variant (/ocean): sail between islands, each one a section of the portfolio. Lazy-loaded. */
const Ocean = () => {
  const t = useT();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const coarse = useMediaQuery('(pointer: coarse)');
  const mode = useUi((s) => s.mode);
  useKeyboard();
  useSiteTheme(false);

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
    <main className='relative w-full h-dvh overflow-hidden bg-[#0e5f94]'>
      <h1 className='sr-only'>{t('ocean.title')}</h1>
      <OceanScene reducedMotion={reducedMotion} />
      <Hud coarse={coarse} />
      <IslandModal />
    </main>
  );
};

export default Ocean
