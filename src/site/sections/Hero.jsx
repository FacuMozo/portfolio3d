import { Link } from 'react-router-dom'
import { useT } from '../../i18n/LanguageProvider'
import { prefetchOcean } from '../../routes'
import Icon from '../components/Icon'
import HeroArt from './HeroArt'

const DOMAIN_DOTS = ['bg-accent-coral', 'bg-accent-violet', 'bg-syntax-comment', 'bg-accent-cyan'];

const Hero = () => {
  const t = useT();
  const domains = t('site.hero.domains');
  return (
    <section
      id='home'
      tabIndex={-1}
      aria-labelledby='hero-title'
      className='relative w-full pt-12 pb-24 px-4 sm:px-margin flex flex-col items-center text-center overflow-hidden'
    >
      <HeroArt />

      <p className='inline-flex items-center gap-2 mb-6 px-3 py-1 bg-surface-card border border-border-subtle font-mono text-code-snippet text-text-secondary uppercase'>
        <span aria-hidden='true' className='pulse-dot w-2 h-2 rounded-full bg-syntax-comment' />
        {t('site.available')}
      </p>

      {/* Text LCP: no image competes with it. */}
      <h1 id='hero-title' className='font-display text-display-hero text-text-primary uppercase mb-4 max-w-4xl'>
        Facundo Mozo
      </h1>
      <p className='font-mono text-code-badge text-text-secondary uppercase tracking-[0.2em] max-w-2xl mx-auto mb-6'>
        {t('site.hero.role')} <span aria-hidden='true' className='text-accent-violet'>/</span> {t('site.hero.degree')}
      </p>
      <p className='text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10'>{t('site.hero.summary')}</p>

      <div className='flex flex-wrap items-center justify-center gap-3 mb-12'>
        <a
          href='#work'
          data-magnetic
          className='inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-white font-mono text-code-badge font-bold uppercase tracking-wider hover:bg-inverse-primary transition-colors shadow-lg shadow-primary-container/20'
        >
          {t('site.hero.cta_work')}
          <Icon name='arrowRight' className='w-4 h-4' />
        </a>
        <a
          href='#contact'
          data-magnetic
          className='inline-flex items-center gap-2 px-6 py-3 border border-border-prominent text-text-primary font-mono text-code-badge font-bold uppercase tracking-wider hover:border-accent-cyan hover:text-accent-cyan transition-colors'
        >
          {t('site.hero.cta_contact')}
        </a>
        <Link
          to='/ocean'
          onPointerEnter={prefetchOcean}
          onFocus={prefetchOcean}
          data-magnetic
          className='inline-flex items-center gap-2 px-6 py-3 border border-accent-cyan/40 text-accent-cyan font-mono text-code-badge font-bold uppercase tracking-wider hover:bg-accent-cyan/10 transition-colors'
        >
          <Icon name='wave' className='w-4 h-4' />
          {t('site.ocean.cta')}
        </Link>
      </div>

      <div className='flex flex-col items-center gap-3'>
        <p className='font-mono text-code-badge text-text-muted tracking-widest uppercase'>{t('site.hero.domains_label')}</p>
        <ul className='flex flex-wrap items-center justify-center gap-x-4 gap-y-3 pt-1 font-mono text-code-snippet text-text-secondary'>
          {Array.isArray(domains) && domains.map((domain, i) => (
            <li key={domain} className='flex items-center gap-1.5 px-3 py-1 bg-surface-card border border-border-subtle'>
              <span aria-hidden='true' className={`w-1.5 h-1.5 rounded-full ${DOMAIN_DOTS[i % DOMAIN_DOTS.length]}`} />
              {domain}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Hero
