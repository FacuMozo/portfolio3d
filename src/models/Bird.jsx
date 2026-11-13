import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'

import birdScene from '../assets/3d/bird.glb'

const SPEED = 1.2; // world units per second

const Bird = () => {
  const { scene, animations } = useGLTF(birdScene);
  const birdRef = useRef();
  const { actions } = useAnimations(animations, birdRef);

  useEffect(() => {
    const action = actions['Take 001'];
    action?.play();
    return () => action?.stop();
  }, [actions]);

  useFrame(({ clock, camera }, delta) => {
    const bird = birdRef.current;
    if (!bird) return;
    bird.position.y = Math.sin(clock.elapsedTime) * 1.6;

    if (bird.position.x > camera.position.x + 10) {
      bird.rotation.y = Math.PI;
    } else if (bird.position.x < camera.position.x - 10) {
      bird.rotation.y = 0;
    }

    // Frame-rate independent movement (same speed on 60Hz and 120Hz screens).
    const step = SPEED * delta * (bird.rotation.y === 0 ? 1 : -1);
    bird.position.x += step;
    bird.position.z -= step;
  });

  return (
    <mesh position={[-5, 2, 1]} scale={[0.003, 0.003, 0.003]} ref={birdRef}>
      <primitive object={scene} />
    </mesh>
  )
}

useGLTF.preload(birdScene);

export default Bird
