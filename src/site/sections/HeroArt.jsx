// Decorative isometric composition from the Stitch design, as a static inline SVG
// (no network request, crisp at any density). Hidden from assistive technology.
const Cube = ({ transform, top, left, right, stroke = ['#4A4455', '#3F3F4D', '#7C3AED'], width = 0.75, rightOpacity }) => (
  <g transform={transform}>
    <polygon fill={top} points='50,0 100,24 50,48 0,24' stroke={stroke[0]} strokeWidth={width} />
    <polygon fill={left} points='0,24 50,48 50,110 0,86' stroke={stroke[1]} strokeWidth={width} />
    <polygon fill={right} opacity={rightOpacity} points='50,48 100,24 100,86 50,110' stroke={stroke[2]} strokeWidth={width} />
  </g>
);

const HeroArt = () => (
  <div aria-hidden='true' className='relative w-full max-w-3xl h-40 sm:h-52 mx-auto mb-6 flex items-center justify-center pointer-events-none select-none'>
    <div className='absolute w-72 h-72 rounded-full bg-primary-container/15 blur-3xl -top-10' />
    <svg className='relative w-full h-full max-h-48' viewBox='0 0 600 200' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <defs>
        <radialGradient id='hero-sun' cx='50%' cy='50%' r='50%'>
          <stop offset='0%' stopColor='#FFDD99' />
          <stop offset='50%' stopColor='#F97316' />
          <stop offset='100%' stopColor='#905B00' stopOpacity='0.1' />
        </radialGradient>
        <linearGradient id='hero-left' x1='0%' x2='100%' y1='0%' y2='100%'>
          <stop offset='0%' stopColor='#2A2A38' />
          <stop offset='100%' stopColor='#14141A' />
        </linearGradient>
        <linearGradient id='hero-right' x1='0%' x2='100%' y1='100%' y2='0%'>
          <stop offset='0%' stopColor='#4E2788' />
          <stop offset='100%' stopColor='#23173B' />
        </linearGradient>
        <linearGradient id='hero-top' x1='0%' x2='100%' y1='0%' y2='0%'>
          <stop offset='0%' stopColor='#3A384F' />
          <stop offset='100%' stopColor='#211F2D' />
        </linearGradient>
        <filter id='hero-glow' x='-100%' y='-100%' width='300%' height='300%'>
          <feGaussianBlur stdDeviation='6' />
        </filter>
      </defs>

      <circle cx='370' cy='40' r='18' fill='#F97316' opacity='0.55' filter='url(#hero-glow)' />
      <circle cx='370' cy='40' r='14' fill='url(#hero-sun)' />
      <circle cx='366' cy='36' r='3' fill='#FFF' opacity='0.6' />

      <Cube transform='translate(160, 20) scale(0.75)' top='#2E2C3D' left='#181822' right='#291838' stroke={['#3F3F4D', '#282830', '#3F3F4D']} width={0.5} />
      <Cube transform='translate(350, 60) scale(0.65)' top='#38364D' left='#1C1A28' right='#3D1D69' stroke={['#4A4455', '#282830', '#6D28D9']} width={0.5} />
      <Cube transform='translate(250, 42)' top='url(#hero-top)' left='url(#hero-left)' right='url(#hero-right)' rightOpacity='0.85' />

      <circle cx='120' cy='110' r='1.5' fill='#66D9ED' opacity='0.4' />
      <circle cx='140' cy='120' r='1.5' fill='#66D9ED' opacity='0.3' />
      <circle cx='480' cy='100' r='1.5' fill='#A855F7' opacity='0.4' />
      <circle cx='460' cy='115' r='1.5' fill='#A855F7' opacity='0.3' />
    </svg>
  </div>
);

export default HeroArt
