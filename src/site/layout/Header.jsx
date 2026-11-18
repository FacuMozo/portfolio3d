import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage, useT } from '../../i18n/LanguageProvider'
import { socialLinks } from '../../constants'
import { prefetchOcean } from '../../routes'
import CvDialog from '../../components/CvDialog'
import useMediaQuery from '../../hooks/useMediaQuery'
import useScrollSpy from '../hooks/useScrollSpy'
import Icon from '../components/Icon'

import { SECTION_IDS } from '../sections'
const NAV_ID = 'site-nav';

const socialIcon = { GitHub: 'github', LinkedIn: 'linkedin' };
const ghostBtn = 'inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3 border border-border-prominent text-text-primary font-sans text-body-sm font-semibold hover:border-accent-cyan hover:text-accent-cyan transition-colors';

const Header = () => {
  const t = useT();
  const { lang, setLang } = useLanguage();
  const nextLang = lang === 'es' ? 'en' : 'es';
  const listRef = useRef(null);
  const { active, native } = useScrollSpy(SECTION_IDS);
  // One <nav> at every size: inline from xl up (it needs ~1270px in ES), a native popover below (Esc / click-outside for free).
  const wide = useMediaQuery('(min-width: 1280px)');

  const closeMenu = () => {
    const list = listRef.current;
    if (list?.matches?.(':popover-open')) list.hidePopover();
  };

  return (
    <header className='fixed inset-x-0 top-0 z-50 bg-surface-lowest/90 backdrop-blur-xl border-b border-border-subtle'>
      <div className='h-16 max-w-7xl mx-auto px-4 sm:px-margin flex items-center justify-between gap-3'>
        <div className='flex items-center gap-4 shrink-0'>
          <a href='#home' className='group flex items-center gap-2 shrink-0' aria-label={`Facundo Mozo — ${t('site.nav.home')}`}>
            <span aria-hidden='true' className='px-1 py-0.5 bg-surface-high border border-border-prominent text-accent-cyan font-mono text-code-badge font-bold'>FM</span>
            <span aria-hidden='true' className='hidden sm:inline font-mono text-code-badge tracking-wider text-text-primary font-bold group-hover:text-accent-cyan transition-colors'>
              FACUNDO MOZO
            </span>
          </a>
        </div>

        <nav aria-label={t('site.nav.label')}>
          <ul
            ref={listRef}
            id={NAV_ID}
            // Lowercase: React 18 passes unknown attributes through via setAttribute (as the guide requires).
            popover={wide ? undefined : 'auto'}
            className='site-nav-list hidden xl:flex items-center gap-5 text-left'
          >
            {SECTION_IDS.map((id) => {
              const current = active === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={closeMenu}
                    aria-current={current ? 'true' : undefined}
                    className={`site-nav-link inline-block whitespace-nowrap py-1 border-b-2 border-transparent font-mono text-nav-comment text-on-surface-variant hover:text-text-primary transition-colors ${current && !native ? 'target-current' : ''}`}
                  >
                    <span aria-hidden='true'>{'// '}</span>{t(`site.nav.${id}`)}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className='flex items-center gap-2 sm:gap-3 shrink-0'>
          <ul className='hidden 2xl:flex items-center gap-1'>
            {socialLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.link}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex p-1.5 text-on-surface-variant hover:text-accent-cyan transition-colors'
                >
                  <Icon name={socialIcon[link.name]} className='w-[18px] h-[18px]' />
                  <span className='sr-only'>{t(`site.social.${socialIcon[link.name]}`)} ({t('common.new_tab')})</span>
                </a>
              </li>
            ))}
          </ul>

          <button
            type='button'
            onClick={() => setLang(nextLang)}
            lang={nextLang}
            aria-label={t('navbar.langToggle_label')}
            className={ghostBtn}
          >
            <Icon name='globe' className='w-4 h-4' />
            {t('navbar.langToggle')}
          </button>

          <CvDialog
            theme='dark'
            buttonClassName={`${ghostBtn} hidden sm:inline-flex`}
            buttonContent={<><Icon name='document' className='w-4 h-4' /><span aria-hidden='true'>{t('site.resume')}</span></>}
          />

          <Link
            to='/ocean'
            onPointerEnter={prefetchOcean}
            onFocus={prefetchOcean}
            data-magnetic
            className='inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3 bg-accent-cyan text-surface-lowest font-sans text-body-sm font-semibold hover:bg-white transition-colors'
          >
            <Icon name='wave' className='w-4 h-4' />
            <span className='sr-only sm:not-sr-only'>{t('site.ocean.short')}</span>
          </Link>

          <button
            type='button'
            popovertarget={NAV_ID}
            aria-controls={NAV_ID}
            className='xl:hidden inline-flex items-center justify-center w-9 h-9 border border-border-prominent text-text-primary hover:border-accent-cyan hover:text-accent-cyan transition-colors'
          >
            <Icon name='menu' className='w-5 h-5' />
            <span className='sr-only'>{t('site.nav.menu')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header
