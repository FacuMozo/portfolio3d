import { useEffect, useRef } from 'react'
import { ISLANDS, RACE_CHECKPOINTS, WORLD_RADIUS } from '../config'
import { world } from '../store'

const SIZE = 132;
const scale = (SIZE / 2 - 6) / WORLD_RADIUS;
// Rotate the map 45° so "up" matches the isometric camera's screen-up.
const toMap = (x, z) => {
  const sx = (x - z) * Math.SQRT1_2;
  const sy = (x + z) * Math.SQRT1_2;
  return [SIZE / 2 + sx * scale, SIZE / 2 + sy * scale];
};

/** Small top-down map. Positions are refreshed straight from `world`, outside React renders. */
const Minimap = () => {
  const shipRef = useRef(null);
  const enemiesRef = useRef(null);
  const checkpointRef = useRef(null);

  useEffect(() => {
    let raf;
    let lastShip = '';
    let lastCheckpoint = '';
    let shownEnemies = 0;
    const tick = () => {
      const s = world.ship;
      const [x, y] = toMap(s.x, s.z);
      // Heading in map space: forward (sin h, cos h) rotated like the positions.
      const deg = (Math.atan2((Math.sin(s.heading) + Math.cos(s.heading)), (Math.sin(s.heading) - Math.cos(s.heading))) * 180) / Math.PI;
      // Only touch the DOM when something moved (rounded to what's visible).
      const ship = `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(0)})`;
      if (ship !== lastShip) {
        shipRef.current?.setAttribute('transform', ship);
        lastShip = ship;
      }
      const cp = checkpointRef.current;
      const target = world.race && RACE_CHECKPOINTS[world.race.next];
      const checkpoint = target ? toMap(target[0], target[1]).join() : '';
      if (cp && checkpoint !== lastCheckpoint) {
        lastCheckpoint = checkpoint;
        if (target) {
          const [cx, cy] = toMap(target[0], target[1]);
          cp.setAttribute('cx', cx);
          cp.setAttribute('cy', cy);
          cp.removeAttribute('display');
        } else {
          cp.setAttribute('display', 'none');
        }
      }
      const g = enemiesRef.current;
      if (g && (world.enemies.length || shownEnemies)) {
        let n = 0;
        for (const e of world.enemies) {
          if (e.sinking) continue;
          let c = g.childNodes[n];
          if (!c) {
            c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            c.setAttribute('r', '2.5');
            c.setAttribute('fill', '#dc2626');
            g.appendChild(c);
          }
          const [ex, ey] = toMap(e.x, e.z);
          c.removeAttribute('display');
          c.setAttribute('cx', ex);
          c.setAttribute('cy', ey);
          n++;
        }
        for (let i = n; i < shownEnemies; i++) g.childNodes[i]?.setAttribute('display', 'none');
        shownEnemies = n;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden='true' className='drop-shadow-lg'>
      <circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 2} fill='#0c4a6e' fillOpacity='0.75' stroke='#fff' strokeOpacity='0.7' strokeWidth='2' />
      {ISLANDS.map((i) => {
        const [x, y] = toMap(i.position[0], i.position[1]);
        return <circle key={i.id} cx={x} cy={y} r={Math.max(3.5, i.radius * scale)} fill={i.color} stroke='#fde68a' strokeWidth='1.5' />;
      })}
      <circle ref={checkpointRef} r='4' fill='none' stroke='#facc15' strokeWidth='2.5' display='none' />
      <g ref={enemiesRef} />
      <polygon ref={shipRef} points='6,0 -4,-4 -2,0 -4,4' fill='#fff' />
    </svg>
  );
};

export default Minimap
