import { Link } from 'react-router-dom'
import { useT } from '../../i18n/LanguageProvider'
import { prefetchOcean } from '../../routes'
import Icon from '../components/Icon'
import HeroArt from './HeroArt'
import { heroStack } from '../../constants'

const Hero = () => {
  const t = useT();
  return (
    <section
      id='home'
      tabIndex={-1}
      aria-labelledby='hero-title'
      className='relative w-full pt-12 pb-24 lg:pt-20 lg:pb-28 px-4 sm:px-margin overflow-hidden'
    >
      <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-x-12 items-center'>
        {/* Text first in the DOM (h1 before the cubes); on mobile the cubes are shown on top. */}
        <div className='flex flex-col items-center text-center lg:items-start lg:text-left'>
          {/* Text LCP: no image competes with it. */}
          <h1 id='hero-title' className='font-display text-display-hero text-text-primary uppercase mb-6 max-w-4xl text-balance'>
            Facundo Mozo
          </h1>

          <p className='inline-flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center lg:items-start xl:items-center gap-x-3 gap-y-1 mb-8 px-4 py-2 bg-surface-card border border-border-subtle font-mono text-code-snippet text-text-primary'>
            <span className='inline-flex items-center gap-2'>
              <span aria-hidden='true' className='w-2 h-2 rounded-full bg-accent-cyan' />
              {t('site.hero.role')}
            </span>
            {/* Slash only when both parts fit on one line; otherwise they stack. */}
            <span aria-hidden='true' className='hidden sm:inline lg:hidden xl:inline text-accent-violet'>/</span>
            <span className='text-text-secondary'>{t('site.hero.degree')}</span>
          </p>
          <p className='text-body-lg text-on-surface max-w-2xl mx-auto lg:mx-0 mb-10'>{t('site.hero.summary')}</p>

          <div className='flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-12'>
            <a
              href='#work'
              data-magnetic
              className='inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-white font-sans text-body-sm font-semibold hover:bg-inverse-primary transition-colors shadow-lg shadow-primary-container/20'
            >
              {t('site.hero.cta_work')}
              <Icon name='arrowRight' className='w-4 h-4' />
            </a>
            <a
              href='#contact'
              data-magnetic
              className='inline-flex items-center gap-2 px-6 py-3 border border-border-prominent text-text-primary font-sans text-body-sm font-semibold hover:border-accent-cyan hover:text-accent-cyan transition-colors'
            >
              {t('site.hero.cta_contact')}
            </a>
            <Link
              to='/ocean'
              onPointerEnter={prefetchOcean}
              onFocus={prefetchOcean}
              data-magnetic
              className='inline-flex items-center gap-2 px-6 py-3 border border-accent-cyan/40 text-accent-cyan font-sans text-body-sm font-semibold hover:bg-accent-cyan/10 transition-colors'
            >
              <Icon name='wave' className='w-4 h-4' />
              {t('site.ocean.cta')}
            </Link>
          </div>

          <div className='flex flex-col items-center lg:items-start gap-3'>
            <p className='font-mono text-code-badge text-text-muted tracking-widest uppercase'>{t('site.hero.stack_label')}</p>
            <ul className='flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-3 pt-1 font-mono text-code-snippet text-text-secondary'>
              {heroStack.map((tech) => (
                <li key={tech} className='flex items-center gap-1.5 px-3 py-1 bg-surface-card border border-border-subtle'>
                  <span aria-hidden='true' className='w-1.5 h-1.5 rounded-full bg-text-muted' />
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className='order-first lg:order-none'>
          <HeroArt />
        </div>
      </div>
    </section>
  );
};

export default Hero
