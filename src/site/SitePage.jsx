import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import '@fontsource-variable/inter/wght.css'
import '@fontsource-variable/space-grotesk/wght.css'
import '@fontsource-variable/jetbrains-mono/wght.css'
import './site.css'
import { useT } from '../i18n/LanguageProvider'
import useMediaQuery from '../hooks/useMediaQuery'
import useSiteTheme from '../hooks/useSiteTheme'
import Header from './layout/Header'
import Footer, { OceanPromo } from './layout/Footer'
import Hero from './sections/Hero'
import Expertise from './sections/Expertise'
import Work from './sections/Work'
import Experience from './sections/Experience'
import Contact from './sections/Contact'

// Purely decorative: its own chunk, fetched after the page is idle and only where it can be seen.
const CustomCursor = lazy(() => import('./components/CustomCursor'));

const useIdle = () => {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const ric = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 1200));
    const cancel = window.cancelIdleCallback ?? clearTimeout;
    const id = ric(() => setIdle(true));
    return () => cancel(id);
  }, []);
  return idle;
};

/**
 * Hash links from other routes (/about → /#experience, Ocean islands, /classic) land here.
 * The section exists once this page renders, so scroll to it and move focus for keyboard users.
 */
const useScrollToHash = () => {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!el) return;
    el.scrollIntoView({ block: 'start' });
    el.focus({ preventScroll: true });
  }, [hash]);
};

/** Professional variant (route "/"): single page, sections reachable from the header nav. */
const SitePage = () => {
  const t = useT();
  useSiteTheme(true);
  useScrollToHash();
  const fancyPointer = useMediaQuery('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const idle = useIdle();

  return (
    <div className='site min-h-dvh bg-surface-lowest text-on-surface text-body-md'>
      <a href='#main' className='skip-link px-4 py-2 bg-accent-cyan text-surface-lowest font-mono text-code-badge font-bold uppercase'>
        {t('site.skip')}
      </a>
      <Header />
      <main id='main' tabIndex={-1} className='relative z-10 pt-16 outline-none'>
        <Hero />
        <Expertise />
        <Work />
        <Experience />
        <Contact />
        <OceanPromo />
      </main>
      <div className='relative z-10'>
        <Footer />
      </div>
      {fancyPointer && idle && (
        <Suspense fallback={null}>
          <CustomCursor />
        </Suspense>
      )}
    </div>
  );
};

export default SitePage
