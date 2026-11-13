import { useEffect, useRef, useState } from 'react'
import { input } from '../store'
import { useT } from '../../i18n/LanguageProvider'

const RADIUS = 52; // px the knob can travel from the center

/** Virtual joystick (screen-relative steering) + fire button, for touch screens. */
const TouchControls = () => {
  const t = useT();
  const baseRef = useRef(null);
  const pointerId = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const update = (e) => {
    const r = baseRef.current.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    if (d > RADIUS) { dx *= RADIUS / d; dy *= RADIUS / d; }
    setKnob({ x: dx, y: dy });
    input.joyX = dx / RADIUS;
    input.joyY = -dy / RADIUS; // screen y grows downward
  };

  const onDown = (e) => {
    pointerId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    update(e);
  };
  const onMove = (e) => { if (e.pointerId === pointerId.current) update(e); };
  const onUp = (e) => {
    if (e.pointerId !== pointerId.current) return;
    pointerId.current = null;
    setKnob({ x: 0, y: 0 });
    input.joyX = 0;
    input.joyY = 0;
  };

  const fire = (on) => (e) => {
    e.preventDefault();
    input.fire = on;
  };

  // Unmounting mid-press (end screens) never fires pointerup: release everything.
  useEffect(() => () => {
    input.joyX = 0;
    input.joyY = 0;
    input.fire = false;
  }, []);

  return (
    <>
      <div
        ref={baseRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        aria-hidden='true'
        className='absolute left-5 z-20 w-36 h-36 rounded-full bg-white/25 border-2 border-white/60 backdrop-blur-sm touch-none select-none'
        style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div
          className='absolute left-1/2 top-1/2 w-16 h-16 -ml-8 -mt-8 rounded-full bg-white/90 shadow-lg'
          style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
        />
      </div>
      <button
        type='button'
        onPointerDown={fire(true)}
        onPointerUp={fire(false)}
        onPointerCancel={fire(false)}
        onPointerLeave={fire(false)}
        onContextMenu={(e) => e.preventDefault()}
        aria-label={t('ocean.hud.fire')}
        className='absolute right-5 z-20 w-24 h-24 rounded-full bg-red-500/90 text-white font-bold shadow-xl border-4 border-white/70 touch-none select-none active:scale-95 transition'
        style={{ bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <span aria-hidden='true' className='text-3xl'>💣</span>
      </button>
    </>
  );
};

export default TouchControls
