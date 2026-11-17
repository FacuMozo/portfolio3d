import { useSyncExternalStore } from 'react'

/** Subscribes to a CSS media query; re-renders when it starts or stops matching. */
const useMediaQuery = (query) =>
  useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );

export default useMediaQuery
