import { useEffect } from 'react'
import { enterIsland, getUi, input } from './store'

const KEYS = {
  KeyW: 'forward', ArrowUp: 'forward',
  KeyS: 'back', ArrowDown: 'back',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
  Space: 'fire',
};
const DOCK_KEYS = new Set(['KeyE', 'Enter', 'Space']);

// Typing in a form field must not steer the ship, and Space/Enter on a focused
// button or link must keep activating it.
const isTextField = (el) => el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
const isActivatable = (el) => el instanceof HTMLElement && /^(BUTTON|A|SUMMARY)$/.test(el.tagName);

/** WASD / arrows to sail, Space to fire, E / Enter / Space to dock at the nearby island. */
const useKeyboard = () => {
  useEffect(() => {
    let spaceDock = false;
    const release = () => Object.values(KEYS).forEach((k) => { input[k] = false; });

    const onKeyDown = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const ui = getUi();
      if (!ui.started || ui.openIsland || ui.entering || isTextField(e.target)) return;
      if ((e.code === 'Space' || e.code === 'Enter') && isActivatable(e.target)) return;
      // Next to an island, Space docks instead of firing.
      if (DOCK_KEYS.has(e.code) && ui.nearIsland && ui.mode === 'explore') {
        e.preventDefault();
        release();
        // Buttons activate on Space *keyup*: opening now would let that keyup
        // hit the modal's focused close button, so Space opens on release.
        if (e.code === 'Space') spaceDock = true;
        else if (!e.repeat) enterIsland(ui.nearIsland);
        return;
      }
      const action = KEYS[e.code];
      if (action) {
        input[action] = true;
        e.preventDefault(); // stop arrows/space from scrolling the page
      }
    };
    const onKeyUp = (e) => {
      const action = KEYS[e.code];
      if (action) input[action] = false;
      if (e.code === 'Space' && spaceDock) {
        spaceDock = false;
        const ui = getUi();
        if (ui.nearIsland && ui.mode === 'explore' && !ui.openIsland && !ui.entering) {
          e.preventDefault();
          enterIsland(ui.nearIsland);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', release);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', release);
      release();
    };
  }, []);
};

export default useKeyboard
