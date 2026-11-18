import { Link } from 'react-router-dom'
import { useT } from '../../i18n/LanguageProvider'
import { socialLinks } from '../../constants'
import { prefetchOcean } from '../../routes'
import Icon from '../components/Icon'

/** Invitation to the 3D variant, right before the footer. */
export const OceanPromo = () => {
  const t = useT();
  return (
    <aside aria-labelledby='ocean-promo-title' className='w-full max-w-7xl mx-auto px-4 sm:px-margin pb-space-3xl'>
      <div className='relative overflow-hidden border border-accent-cyan/30 bg-gradient-to-br from-[rgb(var(--c-tint))] via-surface-card to-surface-card p-6 sm:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
        <div className='max-w-2xl'>
          <h2 id='ocean-promo-title' className='font-display text-headline-md text-text-primary mb-2'>{t('site.ocean.title')}</h2>
          <p className='text-body-md text-text-secondary'>{t('site.ocean.desc')}</p>
        </div>
        <Link
          to='/ocean'
          onPointerEnter={prefetchOcean}
          onFocus={prefetchOcean}
          data-magnetic
          className='shrink-0 self-start md:self-auto inline-flex items-center gap-2 px-6 py-3 bg-accent-cyan text-surface-lowest font-sans text-body-sm font-semibold hover:bg-white transition-colors'
        >
          <Icon name='wave' className='w-4 h-4' />
          {t('site.ocean.cta')}
        </Link>
      </div>
    </aside>
  );
};

const Footer = () => {
  const t = useT();
  return (
    <footer className='w-full bg-surface-bg border-t border-border-subtle'>
      <div className='max-w-7xl mx-auto px-4 sm:px-margin py-10 flex flex-col md:flex-row items-center justify-between gap-6'>
        <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-4 font-mono text-code-snippet text-center'>
          <p className='text-text-muted'>© {new Date().getFullYear()} Facundo Mozo. {t('footer.rights')}</p>
          <span aria-hidden='true' className='hidden sm:inline text-border-prominent'>|</span>
          <p className='text-on-surface-variant'>{t('site.footer.built')}</p>
        </div>
        <div className='flex items-center gap-6 md:pr-16'>
          <ul className='flex items-center gap-4 font-mono text-code-snippet'>
            {socialLinks.map((link) => (
              <li key={link.name}>
                <a href={link.link} target='_blank' rel='noopener noreferrer' className='text-on-surface-variant hover:text-accent-cyan transition-colors'>
                  {`// ${link.name.toLowerCase()}`}
                  <span className='sr-only'> ({t('common.new_tab')})</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer
