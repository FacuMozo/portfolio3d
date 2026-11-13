import { Suspense, useCallback, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Loader from '../components/Loader'
import Island from '../models/Island'
import Sky from '../models/Sky'
import Bird from '../models/Bird'
import Plane from '../models/Plane'
import HomeInfo from '../components/HomeInfo'
import arrowLeft from '../assets/icons/arrowleft.svg'
import arrowRight from '../assets/icons/arrowright.svg'
import { useT } from '../i18n/LanguageProvider'

const MAX_STAGE = 4;

const getSceneLayout = () => {
  const isMobile = window.innerWidth < 768;
  return {
    island: {
      scale: isMobile ? [0.9, 0.9, 0.9] : [1, 1, 1],
      position: [0, -6.5, -43],
      rotation: [0.1, 4.7, 0],
    },
    plane: {
      scale: isMobile ? [1.5, 1.5, 1.5] : [3, 3, 3],
      position: isMobile ? [0, -1.5, 0] : [0, -4, -4],
      rotation: [0, 20, 0],
    },
  };
};

const navButtonClass = 'group p-3 rounded-full bg-white/70 backdrop-blur border border-white/40 shadow-md transition hover:bg-white motion-safe:hover:scale-110 motion-safe:active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500';

const Home = () => {
  const t = useT();
  const [isRotating, setIsRotating] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const islandApiRef = useRef(null);
  // Computed once per mount; avoids recalculating on every re-render.
  const [layout] = useState(getSceneLayout);

  const gotoStage = useCallback((target) => {
    setCurrentStage(target);
    islandApiRef.current?.gotoStage(target);
  }, []);

  const handlePrev = () => gotoStage(currentStage === 1 || !currentStage ? MAX_STAGE : currentStage - 1);
  const handleNext = () => gotoStage(currentStage === MAX_STAGE || !currentStage ? 1 : currentStage + 1);

  return (
    <section className='w-full h-dvh relative'>
      <div aria-live='polite' className='absolute top-28 left-0 right-0 z-10 flex items-center justify-center pointer-events-none'>
        {currentStage && <HomeInfo currentStage={currentStage} />}
      </div>

      <div className='absolute inset-y-0 left-4 flex items-center z-20'>
        <button type='button' onClick={handlePrev} aria-label={t('navigation.prev_alt')} className={navButtonClass}>
          <img src={arrowLeft} alt='' className='w-6 h-6 transition motion-safe:group-hover:-translate-x-1' />
        </button>
      </div>
      <div className='absolute inset-y-0 right-4 flex items-center z-20'>
        <button type='button' onClick={handleNext} aria-label={t('navigation.next_alt')} className={navButtonClass}>
          <img src={arrowRight} alt='' className='w-6 h-6 transition motion-safe:group-hover:translate-x-1' />
        </button>
      </div>

      <Canvas
        className={`w-full h-dvh bg-transparent ${isRotating ? 'cursor-grabbing' : 'cursor-grab'}`}
        camera={{ near: 0.1, far: 1000 }}
        dpr={[1, 2]}
        aria-hidden='true'
      >
        <Suspense fallback={<Loader />}>
          <directionalLight position={[1, 1, 1]} intensity={2} />
          <ambientLight intensity={0.5} />
          <Bird />
          <Sky />
          <Island
            ref={islandApiRef}
            {...layout.island}
            isRotating={isRotating}
            setIsRotating={setIsRotating}
            setCurrentStage={setCurrentStage}
          />
          <Plane {...layout.plane} />
        </Suspense>
      </Canvas>
    </section>
  )
}

export default Home
