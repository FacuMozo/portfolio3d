import { useEffect, useState } from 'react'

const supportsNativeSpy = () =>
  typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('scroll-target-group: auto');

/**
 * Returns the id of the section currently in view.
 *
 * - Where `scroll-target-group` is supported, the browser tracks it natively (`:target-current`
 *   styles the link in CSS); we only mirror it into state so `aria-current` reaches assistive tech,
 *   syncing when scrolling ends.
 * - Elsewhere, an IntersectionObserver over the sections (a horizontal line at mid-viewport)
 *   decides which one is current.
 *
 * `ids` must be stable (module-level constant).
 */
const useScrollSpy = (navRef, ids) => {
  const [active, setActive] = useState(ids[0] ?? null);

  useEffect(() => {
    if (supportsNativeSpy()) {
      const sync = () => {
        const current = navRef.current?.querySelector('a:target-current');
        if (current) setActive(current.hash.slice(1));
      };
      sync();
      const evt = 'onscrollend' in window ? 'scrollend' : 'scroll';
      window.addEventListener(evt, sync, { passive: true });
      // The mobile list is a popover: re-sync when it opens.
      const list = navRef.current;
      list?.addEventListener('toggle', sync);
      return () => {
        window.removeEventListener(evt, sync);
        list?.removeEventListener('toggle', sync);
      };
    }

    if (typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [navRef, ids]);

  return active;
};

export default useScrollSpy
