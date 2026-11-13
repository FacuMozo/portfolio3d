import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { WAVE_GLSL } from '../waves'
import { COLLIDERS, colliderProfile, PROFILE_BINS, WORLD_RADIUS } from '../config'
import { world } from '../store'

// Collider edge profiles, flattened and packed into vec4s for the shader.
const PROFILE_FLAT = COLLIDERS.flatMap(colliderProfile);
const PROFILE_VECS = Math.ceil(PROFILE_FLAT.length / 4);
const PROFILE_PACKED = Array.from({ length: PROFILE_VECS }, (_, i) =>
  new THREE.Vector4(...[0, 1, 2, 3].map((k) => PROFILE_FLAT[i * 4 + k] ?? 0)));
// Squared distance beyond which no collider can show shallows or foam.
const MAX_REACH = Math.max(...COLLIDERS.map((c) => Math.max(...colliderProfile(c)) + (c.profile ? 5 : 1.2)));
const MAX_REACH_SQ = (MAX_REACH * MAX_REACH).toFixed(1);

// Low-poly stylized sea: vertices displaced by the shared wave function,
// faceted shading from screen-space derivatives, and a foam ring around islands.
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  varying vec3 vWorld;
  varying float vHeight;
  ${WAVE_GLSL}
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    float h = waveHeight(world.xz, uTime, uAmp);
    world.y += h;
    vHeight = h;
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uFoam;
  uniform vec3 uSunDir;
  uniform vec4 uShapes[${COLLIDERS.length}]; // center xz, cos / sin of the rotation
  uniform float uReach[${COLLIDERS.length}]; // foam reach
  // Edge radius per direction, packed 4 per vec4: a float[] would take a whole
  // vec4 slot per element and blow past mobile uniform limits.
  uniform vec4 uProfile[${PROFILE_VECS}];
  float profile(int i) { return uProfile[i / 4][i - (i / 4) * 4]; }
  uniform float uEdge;
  uniform float uTime;
  varying vec3 vWorld;
  varying float vHeight;
  void main() {
    vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
    float light = clamp(dot(n, normalize(uSunDir)), 0.0, 1.0);
    vec3 color = mix(uDeep, uShallow, smoothstep(-0.4, 0.45, vHeight));

    // Shallow water and animated foam around every island / obstacle,
    // following the same oriented ellipse used for collisions.
    float shore = 0.0;
    for (int i = 0; i < ${COLLIDERS.length}; i++) {
      vec2 dp = vWorld.xz - uShapes[i].xy;
      float reach = uReach[i];
      // Far outside this shape's largest possible foam: skip the trig.
      if (dot(dp, dp) > ${MAX_REACH_SQ}) continue;
      float c = uShapes[i].z;
      float s = uShapes[i].w;
      vec2 local = vec2(dp.x * c - dp.y * s, dp.x * s + dp.y * c);
      float t = mod(atan(local.y, local.x) / 6.2831853 * ${PROFILE_BINS}.0, ${PROFILE_BINS}.0);
      int b0 = int(floor(t));
      int b1 = b0 + 1 == ${PROFILE_BINS} ? 0 : b0 + 1;
      float edge = mix(profile(i * ${PROFILE_BINS} + b0), profile(i * ${PROFILE_BINS} + b1), fract(t));
      float d = length(local) - edge;
      shore = max(shore, 1.0 - smoothstep(0.0, reach, d));
      float ring = sin(d * 2.2 - uTime * 2.0) * 0.5 + 0.5;
      shore = max(shore, step(0.92, ring) * (1.0 - smoothstep(0.0, reach * 0.7, d)));
    }
    color = mix(color, uShallow * 1.25, shore * 0.6);
    color = mix(color, uFoam, step(0.85, shore));

    // Outside the sailable area: darker, stormier water with a foam line at the edge.
    float beyond = length(vWorld.xz) - uEdge;
    color = mix(color, uDeep * 0.45, smoothstep(0.0, 10.0, beyond));
    color = mix(color, uFoam, (1.0 - smoothstep(0.0, 0.6, abs(beyond - 0.5))) * (0.55 + 0.25 * sin(uTime * 3.0 + atan(vWorld.z, vWorld.x) * 40.0)));

    color *= 0.75 + light * 0.35;
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

const Water = ({ amp = 1 }) => {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(260, 260, 130, 130);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  // Created once: three.js keeps using the uniforms object the program was
  // built with, so swapping it later (e.g. when `amp` changes) would freeze the sea.
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAmp: { value: 1 },
    uDeep: { value: new THREE.Color('#1e6fa8') },
    uShallow: { value: new THREE.Color('#38bdf8') },
    uFoam: { value: new THREE.Color('#f0f9ff') },
    uSunDir: { value: new THREE.Vector3(0.6, 1, 0.3) },
    uShapes: { value: COLLIDERS.map((c) => new THREE.Vector4(c.position[0], c.position[1], Math.cos(c.rotation), Math.sin(c.rotation))) },
    // Wide shallows around islands, a thin foam collar around buoys and the wreck.
    uReach: { value: COLLIDERS.map((c) => (c.profile ? 5 : 1.2)) },
    uProfile: { value: PROFILE_PACKED },
    uEdge: { value: WORLD_RADIUS + 2 },
  }), []);

  // Same clock as the simulation so floating objects match the waves.
  useFrame(() => {
    uniforms.uTime.value = world.time;
    uniforms.uAmp.value = amp;
  });

  return (
    <mesh geometry={geometry} receiveShadow>
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    </mesh>
  );
};

export default Water
