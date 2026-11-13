import { useEffect, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'

import planeScene from '../assets/3d/plane.glb'

// 3D Model from: https://sketchfab.com/3d-models/stylized-ww1-plane-c4edeb0e410f46e8a4db320879f0a1db
const Plane = (props) => {
  const ref = useRef();
  const { scene, animations } = useGLTF(planeScene);
  const { actions } = useAnimations(animations, ref);

  // Animation names can be found on the Sketchfab page of the model.
  useEffect(() => {
    const action = actions['Take 001'];
    action?.play();
    return () => action?.stop();
  }, [actions]);

  return (
    <mesh {...props} ref={ref}>
      <primitive object={scene} />
    </mesh>
  );
}

useGLTF.preload(planeScene);

export default Plane;
