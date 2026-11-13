import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

import skyScene from '../assets/3d/sky.glb'

const Sky = () => {
  const { scene } = useGLTF(skyScene);
  const skyRef = useRef();

  useFrame((_, delta) => {
    if (skyRef.current) skyRef.current.rotation.y -= 0.05 * delta;
  });

  return (
    <mesh ref={skyRef}>
      <primitive object={scene} />
    </mesh>
  )
}

useGLTF.preload(skyScene);

export default Sky
