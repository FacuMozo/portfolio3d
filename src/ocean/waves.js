// Sea surface height. The same formula runs in the water vertex shader
// (WAVE_GLSL) so floating objects bob in sync with the visible waves.

export const waveHeight = (x, z, t, amp = 1) =>
  amp *
  (Math.sin(x * 0.18 + t * 1.1) * 0.22 +
    Math.sin(z * 0.23 - t * 0.9) * 0.18 +
    Math.sin((x + z) * 0.11 + t * 0.6) * 0.15);

export const WAVE_GLSL = /* glsl */ `
  float waveHeight(vec2 p, float t, float amp) {
    return amp * (
      sin(p.x * 0.18 + t * 1.1) * 0.22 +
      sin(p.y * 0.23 - t * 0.9) * 0.18 +
      sin((p.x + p.y) * 0.11 + t * 0.6) * 0.15
    );
  }
`;
