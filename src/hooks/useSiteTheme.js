import { useLayoutEffect } from 'react'

/**
 * The professional site is dark-only, the Ocean / Classic variants are light.
 * `theme-site` on <html> (set statically in index.html for the default route) switches the
 * document background and `color-scheme`, so overscroll and native UI match each variant.
 * Layout effect: applied before paint, no flash of the wrong background between routes.
 */
const useSiteTheme = (enabled) => {
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('theme-site', enabled);
  }, [enabled]);
};

export default useSiteTheme
