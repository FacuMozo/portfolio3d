import '../legacyFonts'
import Navbar from '../components/Navbar'
import Home from './Home'
import useSiteTheme from '../hooks/useSiteTheme'

/** /classic: the original 3D home (plane + island), kept as an alternative variant. Lazy-loaded. */
const Classic = () => {
  useSiteTheme(false);
  return (
    <div className='bg-slate-300/20 h-full font-worksans'>
      <Navbar />
      <main>
        <Home />
      </main>
    </div>
  );
};

export default Classic
