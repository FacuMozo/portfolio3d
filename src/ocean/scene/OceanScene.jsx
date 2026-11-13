import { Suspense, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import Loader from '../../components/Loader'
import { step } from '../sim'
import { getUi, world } from '../store'
import { CAMERA } from '../config'
import Water from './Water'
import Islands from './Islands'
import { Enemies, PlayerShip } from './Ships'
import { Cannonballs, Particles } from './Effects'
import { SeaDecor } from './models'
import Clouds from './Clouds'
import Scenery from './Scenery'
import RaceLayer from './RaceCourse'
import ControlsHint from './ControlsHint'

const CAMERA_OFFSET = new THREE.Vector3(30, 30, 30);

const GameLoop = () => {
  // Clamp dt so a background tab or a hitch doesn't teleport everything.
  useFrame((_, dt) => step(Math.min(dt, 1 / 20)));
  return null;
};

// Isometric orthographic camera. Exploring: zoomed out to fit the whole
// archipelago, framed between the map center and the ship. Combat: zoomed in
// and following the ship with a little look-ahead. Blends smoothly between both.
// Also moves the sun so its shadow frustum stays around what's on screen.
const CameraRig = ({ reducedMotion }) => {
  const camRef = useRef();
  const sunRef = useRef();
  const focus = useRef(new THREE.Vector3(world.ship.x, 0, world.ship.z));
  const goal = useRef(new THREE.Vector3());
  const blend = useRef(getUi().mode === 'explore' ? 0 : 1); // 0 explore, 1 combat
  const size = useThree((s) => s.size);

  useFrame((_, dt) => {
    const ease = (rate) => (reducedMotion ? 1 : 1 - Math.exp(-dt * rate));
    const target = getUi().mode === 'explore' ? 0 : 1;
    blend.current += (target - blend.current) * ease(2.5);
    const k = blend.current;

    // Zoom = pixels per world unit, so the same area of sea fits any screen.
    const exploreZoom = Math.max(5, Math.min(20, Math.min(size.width / CAMERA.exploreView[0], size.height / CAMERA.exploreView[1])));
    const combatZoom = Math.max(12, Math.min(34, Math.min(size.width, size.height * 1.5) / CAMERA.combatView));
    const cam = camRef.current;
    const zoom = exploreZoom + (combatZoom - exploreZoom) * k;
    if (Math.abs(cam.zoom - zoom) > 1e-3) {
      cam.zoom = zoom;
      cam.updateProjectionMatrix();
    }

    const s = world.ship;
    const lead = reducedMotion ? 0 : 0.35 * s.speed * k;
    const follow = CAMERA.exploreFollow + (1 - CAMERA.exploreFollow) * k;
    const [cx, cz] = CAMERA.mapCenter;
    goal.current.set(
      cx + (s.x + Math.sin(s.heading) * lead - cx) * follow,
      0,
      cz + (s.z + Math.cos(s.heading) * lead - cz) * follow,
    );
    focus.current.lerp(goal.current, ease(3));

    cam.position.copy(focus.current).add(CAMERA_OFFSET);
    cam.lookAt(focus.current);

    const sun = sunRef.current;
    sun.position.set(focus.current.x + 18, 40, focus.current.z + 8);
    sun.target.position.copy(focus.current);
    sun.target.updateMatrixWorld();
  });

  return (
    <>
      <OrthographicCamera ref={camRef} makeDefault near={-100} far={300} position={[30, 30, 30]} />
      <directionalLight
        ref={sunRef}
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-75}
        shadow-camera-right={75}
        shadow-camera-top={75}
        shadow-camera-bottom={-75}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-bias={-0.0005}
      />
    </>
  );
};

const OceanScene = ({ reducedMotion }) => {
  const amp = reducedMotion ? 0.35 : 1;
  return (
    <Canvas shadows flat dpr={[1, 1.5]} className='!absolute inset-0'>
      <color attach='background' args={['#0e5f94']} />
      <hemisphereLight args={['#e0f2fe', '#0c4a6e', 1.1]} />
      <CameraRig reducedMotion={reducedMotion} />
      <GameLoop />
      <Water amp={amp} />
      <Suspense fallback={<Loader />}>
        <Islands />
        <SeaDecor amp={amp} />
        <Scenery amp={amp} reducedMotion={reducedMotion} />
        <PlayerShip amp={amp} />
        <ControlsHint />
        <Enemies amp={amp} />
        <RaceLayer amp={amp} />
      </Suspense>
      <Clouds reducedMotion={reducedMotion} />
      <Cannonballs />
      <Particles />
    </Canvas>
  );
};

export default OceanScene
