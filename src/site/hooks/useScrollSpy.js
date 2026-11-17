import useCurrentSection from './useCurrentSection'

export const supportsNativeSpy = () =>
  typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('scroll-target-group: auto');

/**
 * Scrollspy for the header nav.
 * - Visual state: native `scroll-target-group` + `:target-current` (CSS) where supported;
 *   elsewhere a `.target-current` class driven by `active`.
 * - `active` (from an IntersectionObserver) always drives `aria-current`, so assistive tech gets
 *   the state in every browser. Only one source paints the highlight, never both.
 */
const useScrollSpy = (ids) => {
  const active = useCurrentSection(ids);
  return { active, native: supportsNativeSpy() };
};

export default useScrollSpy
