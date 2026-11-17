import { useEffect, useRef } from 'react'

const INTERACTIVE = 'a, button, summary, input, textarea, [role="button"], .project-card';
const MAGNETIC = '[data-magnetic]';

/**
 * Decorative cursor follower + ambient glow + subtle magnetic pull, from the Stitch design.
 * Rebuilt for performance and accessibility:
 * - only mounted for fine pointers without reduced motion (decided by the parent), lazily;
 * - the native cursor stays visible (this is an accent, not a replacement);
 * - positions via `transform: translate3d` (compositor only, no layout) and one rAF loop that
 *   stops when the pointer is idle; event delegation instead of a listener per element.
 */
const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const glow = glowRef.current;
    let mouse = { x: innerWidth / 2, y: innerHeight / 2 };
    const pos = { dot: { ...mouse }, ring: { ...mouse }, glow: { ...mouse } };
    let magnet = null; // { el, x, y }
    let frame = 0;

    const place = (el, p) => { el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`; };

    const tick = () => {
      const target = magnet
        ? { x: mouse.x * 0.45 + magnet.x * 0.55, y: mouse.y * 0.45 + magnet.y * 0.55 }
        : mouse;
      let moving = false;
      const follow = (p, to, k) => {
        const dx = to.x - p.x;
        const dy = to.y - p.y;
        p.x += dx * k;
        p.y += dy * k;
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) moving = true;
      };
      follow(pos.dot, target, 0.35);
      follow(pos.ring, target, 0.16);
      follow(pos.glow, mouse, 0.055);
      place(dot, pos.dot);
      place(ring, pos.ring);
      place(glow, pos.glow);
      frame = moving ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => { if (!frame) frame = requestAnimationFrame(tick); };

    const onMove = (e) => {
      mouse = { x: e.clientX, y: e.clientY };
      root.classList.add('cursor-visible');
      const m = magnet?.el;
      if (m) {
        // Micro pull of the hovered control towards the pointer.
        const r = m.getBoundingClientRect();
        m.style.translate = `${(e.clientX - (r.left + r.width / 2)) * 0.18}px ${(e.clientY - (r.top + r.height / 2)) * 0.18}px`;
      }
      wake();
    };
    const onOver = (e) => {
      const target = e.target instanceof Element ? e.target : null;
      root.classList.toggle('cursor-hovering', Boolean(target?.closest(INTERACTIVE)));
      const m = target?.closest(MAGNETIC) ?? null;
      if (m !== magnet?.el) {
        if (magnet) magnet.el.style.translate = '';
        if (m) {
          const r = m.getBoundingClientRect();
          magnet = { el: m, x: r.left + r.width / 2, y: r.top + r.height / 2 };
        } else {
          magnet = null;
        }
      }
    };
    const onLeave = () => root.classList.remove('cursor-visible');
    const onDown = () => root.classList.add('cursor-clicking');
    const onUp = () => root.classList.remove('cursor-clicking');
    const onScroll = () => {
      if (magnet) magnet.el.style.translate = '';
      magnet = null;
    };

    addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    addEventListener('pointerdown', onDown, { passive: true });
    addEventListener('pointerup', onUp, { passive: true });
    addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      removeEventListener('pointerdown', onDown);
      removeEventListener('pointerup', onUp);
      removeEventListener('scroll', onScroll);
      if (magnet) magnet.el.style.translate = '';
      root.classList.remove('cursor-visible', 'cursor-hovering', 'cursor-clicking');
    };
  }, []);

  return (
    <div aria-hidden='true'>
      <div ref={glowRef} className='cursor-glow' />
      <div ref={ringRef} className='cursor-ring' />
      <div ref={dotRef} className='cursor-dot' />
    </div>
  );
};

export default CustomCursor
