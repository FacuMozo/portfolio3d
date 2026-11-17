import { describe, expect, it } from 'vitest'
import { squareFort } from './fortLayout'

const LENGTH = { 'castle-gate': 4, 'castle-wall': 2, 'castle-window': 2 };

describe('squareFort', () => {
  const s = 0.6;
  const pieces = squareFort({ scale: s, cx: 3, cz: -1 });
  const walls = pieces.filter(([name]) => name.startsWith('castle'));

  it('has one gate, four corner towers, 5 pieces per side and cannons by the gate', () => {
    expect(walls).toHaveLength(20);
    expect(walls.filter(([n]) => n === 'castle-gate')).toHaveLength(1);
    expect(pieces.filter(([n]) => n.startsWith('tower'))).toHaveLength(4);
    const cannons = pieces.filter(([n]) => n === 'cannon');
    expect(cannons).toHaveLength(2);
    for (const [, x, , rot] of cannons) {
      expect(x).toBeGreaterThan(3 + pieces.half); // outside the gate wall
      expect(Math.sin(rot)).toBeCloseTo(1); // barrel pointing out (+X)
    }
  });

  it('towers are clearly taller than the walls', () => {
    const [, , , , towerScale] = pieces.find(([n]) => n.startsWith('tower'));
    expect(10.22 * towerScale).toBeGreaterThan(4.4 * s * 1.8);
  });

  it('each side is continuous (no gaps, no overlaps) and runs between the corner towers', () => {
    const h = pieces.half;
    // Group by rotation = by side; measure along the side (z for ±X sides, x for ±Z sides).
    const sides = Object.groupBy(walls, ([, , , rot]) => rot.toFixed(3));
    expect(Object.keys(sides)).toHaveLength(4);
    for (const side of Object.values(sides)) {
      const rot = side[0][3];
      const alongZ = Math.abs(Math.sin(rot)) > 0.5; // normal along ±X → pieces run along Z
      const spans = side
        .map(([name, x, z, , scale]) => {
          const center = alongZ ? z + 1 : x - 3; // relative to the fort centre (3, -1)
          const half = (LENGTH[name] * scale[0]) / 2; // stretched length along local X
          return [center - half, center + half];
        })
        .sort((a, b) => a[0] - b[0]);
      // Symmetric, ending inside the towers (not through them).
      expect(spans[0][0]).toBeCloseTo(-spans.at(-1)[1]);
      expect(spans.at(-1)[1]).toBeLessThan(h);
      expect(spans.at(-1)[1]).toBeGreaterThan(h * 0.7);
      for (let i = 1; i < spans.length; i++) expect(spans[i][0]).toBeCloseTo(spans[i - 1][1]);
    }
  });

  it('the gate faces +X (outward) and sits on the +X side', () => {
    const [, x, , rot] = walls.find(([n]) => n === 'castle-gate');
    expect(x).toBeCloseTo(3 + pieces.half);
    // Local +Z maps to (sin rot, cos rot): must point to +X.
    expect(Math.sin(rot)).toBeCloseTo(1);
  });
});
