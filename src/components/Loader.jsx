import { Html } from '@react-three/drei'
import { useT } from '../i18n/LanguageProvider'

// Suspense fallback rendered inside the <Canvas> while the .glb models load.
const Loader = () => {
  const t = useT();
  return (
    <Html center>
      <div role='status' aria-live='polite' className='flex flex-col items-center gap-3'>
        <div
          aria-hidden='true'
          className='w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 motion-safe:animate-spin'
        />
        <span className='sr-only'>{t('loader.loading')}</span>
      </div>
    </Html>
  )
}

export default Loader
