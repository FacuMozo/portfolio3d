// Small inline SVG icon set (replaces the Material Symbols webfont from the Stitch export:
// a few hundred bytes instead of a multi-hundred-KB font + an extra render-blocking request).
// Decorative by default (aria-hidden); the surrounding control provides the accessible name.
const PATHS = {
  github:
    'M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z',
  linkedin:
    'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z',
};

const STROKES = {
  phone: <><rect x='6' y='2' width='12' height='20' rx='2.5' /><path d='M11 18h2' /></>,
  hub: <><circle cx='12' cy='12' r='2.5' /><circle cx='5' cy='5' r='2' /><circle cx='19' cy='5' r='2' /><circle cx='5' cy='19' r='2' /><circle cx='19' cy='19' r='2' /><path d='M6.5 6.5l3.7 3.7M17.5 6.5l-3.7 3.7M6.5 17.5l3.7-3.7M17.5 17.5l-3.7-3.7' /></>,
  dns: <><rect x='3' y='3' width='18' height='7' rx='1.5' /><rect x='3' y='14' width='18' height='7' rx='1.5' /><path d='M7 6.5h.01M7 17.5h.01' /></>,
  document: <><path d='M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z' /><path d='M14 3v5h5M9 13h6M9 17h4' /></>,
  arrowUp: <path d='M12 19V5m-6 6 6-6 6 6' />,
  arrowDown: <path d='M12 5v14m-6-6 6 6 6-6' />,
  arrowRight: <path d='M5 12h14m-6-6 6 6-6 6' />,
  northEast: <path d='M7 17 17 7M8 7h9v9' />,
  menu: <path d='M4 7h16M4 12h16M4 17h16' />,
  close: <path d='M6 6l12 12M18 6 6 18' />,
  wave: <path d='M2 12c2.5-3 4.5-3 7 0s4.5 3 7 0 4.5-3 6 0M2 18c2.5-3 4.5-3 7 0s4.5 3 7 0 4.5-3 6 0M12 3l3 5H9z' />,
  mail: <><rect x='3' y='5' width='18' height='14' rx='2' /><path d='m3 7 9 6 9-6' /></>,
  pin: <><path d='M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z' /><circle cx='12' cy='10' r='2.5' /></>,
  globe: <><circle cx='12' cy='12' r='9' /><path d='M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18' /></>,
};

const Icon = ({ name, className = 'w-5 h-5', title }) => {
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true };
  if (PATHS[name]) {
    return (
      <svg viewBox='0 0 24 24' className={className} fill='currentColor' focusable='false' {...a11y}>
        <path d={PATHS[name]} />
      </svg>
    );
  }
  return (
    <svg
      viewBox='0 0 24 24'
      className={className}
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      focusable='false'
      {...a11y}
    >
      {STROKES[name]}
    </svg>
  );
};

export default Icon
