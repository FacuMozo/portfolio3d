import React, { Suspense, useState, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import Loader from '../components/Loader'
import Island from '../models/Island'
import Sky from '../models/Sky'
import Bird from '../models/Bird'
import Plane from '../models/Plane'
import HomeInfo from '../components/HomeInfo'
import arrowLeft from '../assets/icons/arrowleft.svg'
import arrowRight from '../assets/icons/arrowright.svg'



const Home = () => {
  const [isRotating, setIsRotating] = useState(false);
  const [currentStage,setCurrentStage] = useState(1)
  const islandApiRef = useRef(null);
  const maxStage = 4;

  const gotoStage = useCallback((target) => {
    if (target < 1 || target > maxStage) return;
    setCurrentStage(target);
    // Delay slight to ensure state update does not get overridden by frame logic
    requestAnimationFrame(() => {
      islandApiRef.current?.gotoStage(target);
    });
  }, []);

  const handlePrev = () => {
    if (currentStage === 1) gotoStage(maxStage); else gotoStage(currentStage - 1);
  }
  const handleNext = () => {
    if (currentStage === maxStage) gotoStage(1); else gotoStage(currentStage + 1);
  }

  const adjustIslandForScreenSize = () =>{
    
    let screenScale = null;
    let screenPosition = [0, -6.5, -43];
    let rotation = [0.1,4.7,0]
    if(window.innerWidth < 768){
      screenScale = [0.9,0.9,0.9];
    }else{
      screenScale = [1,1,1];
    }
    return [screenScale, screenPosition, rotation]
  }
  const adjustPlaneForScreenSize = () =>{
    
    let screenScale = undefined;
    let screenPosition = undefined;
    
    if(window.innerWidth < 768){
      screenScale = [1.5,1.5,1.5];
      screenPosition = [0,-1.5,0]
    }else{
      screenScale = [3,3,3];
      screenPosition = [0,-4,-4]
    }
    return [screenScale, screenPosition]
  }

  const [islandScale, islandPosition,islandRotation] = adjustIslandForScreenSize();
  const [planeScale, planePosition,planeRotation] = adjustPlaneForScreenSize();

  return (
    <section className='w-full h-screen relative'>
      {/* Stage overlay content */}
      <div className='absolute top-28 left-0 right-0 z-10 flex items-center justify-center pointer-events-none'>
        {currentStage && <HomeInfo currentStage={currentStage} />}
      </div> 
      {/* Navigation buttons */}
      <div className='absolute inset-y-0 left-4 flex items-center z-20'>
        <button
          onClick={handlePrev}
          className='group p-3 rounded-full bg-white/70 backdrop-blur border border-white/40 shadow-md transition transform hover:scale-110 active:scale-95 hover:bg-white cursor-pointer'
        >
          <img src={arrowLeft} alt='Anterior (circular)' className='w-6 h-6 group-hover:-translate-x-1 transition' />
        </button>
      </div>
      <div className='absolute inset-y-0 right-4 flex items-center z-20'>
        <button
          onClick={handleNext}
          className='group p-3 rounded-full bg-white/70 backdrop-blur border border-white/40 shadow-md transition transform hover:scale-110 active:scale-95 hover:bg-white cursor-pointer'
        >
          <img src={arrowRight} alt='Siguiente (circular)' className='w-6 h-6 group-hover:translate-x-1 transition' />
        </button>
      </div>
      <Canvas 
        className={`w-full h-screen bg-transparent ${isRotating ? 'cursor-grabbing' : 'cursor-grab'}`}
        camera={{near:0.1, far:1000}}
      >
        {/* fallback={<Loader />} */}
        <Suspense >
          <directionalLight position={[1,1,1]} intensity={2} />
          <ambientLight intensity={0.5}/>
          {/* <hemisphereLight skyColor="#b1e1ff" groundColor="#000000" intensity={1} /> */}
          
          <Bird />
          <Sky isRotating={isRotating}/>
          
          <Island 
            ref={islandApiRef}
            position={islandPosition} scale={islandScale} rotation={islandRotation} 
            isRotating={isRotating}
            setIsRotating={setIsRotating} 
            setCurrentStage={setCurrentStage}
            
          />
          <Plane 
            isRotating={isRotating}
            position={planePosition}
            scale={planeScale}
            rotation={[0,20,0]}
          />
        </Suspense>
      </Canvas>
    </section>
  )
}

export default Home