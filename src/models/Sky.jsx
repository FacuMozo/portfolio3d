import {  extend   } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
extend({useGLTF});

import skyScene from '../assets/3d/sky.glb'


const Sky = ({isRotating}) => {
  const sky = useGLTF(skyScene);
  const skyRef = useRef();
  useFrame((_,delta)=>{
    skyRef.current.rotation.y -= 0.05* delta;
    if(isRotating){
    }
  })

  return (
    <mesh ref = {skyRef}>
      <primitive object={sky.scene} />
    </mesh>
  )
}

export default Sky