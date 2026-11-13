import AboutContent from '../components/sections/AboutContent';
import CTA from '../components/CTA';
import { useT } from '../i18n/LanguageProvider';

const About = () => {
  const t = useT();
  return (
    <section className='max-container'>
      <h1 className='head-text'>
        {t('about.title_intro')} <span className='blue-gradient_text font-semibold drop-shadow'>Facundo Mozo</span>
      </h1>
      <AboutContent />

      <hr className='border-slate-200' />
      <CTA />
    </section>
  )
}

export default About
