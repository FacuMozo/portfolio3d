// Loaders for the heavy, route-level chunks (three.js / react-three-fiber live here).
// They are shared by React.lazy() and by intent-based prefetching (hover/focus on a link),
// so the module that gets prefetched is the very same one the route renders.
// Speculation rules don't apply to an SPA, hence the import() warm-up instead.

let oceanPromise;
export const loadOcean = () => (oceanPromise ??= import('./pages/Ocean'));

let classicPromise;
export const loadClassic = () => (classicPromise ??= import('./pages/Classic'));

/** Fire-and-forget prefetch: a failed warm-up must not break anything (the route retries on navigation). */
export const prefetchOcean = () => {
  loadOcean().catch(() => {
    oceanPromise = undefined;
  });
};

// Opt in to React Router v7 behaviour now (silences the deprecation warnings, eases the upgrade).
export const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };
