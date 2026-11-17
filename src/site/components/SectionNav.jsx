import { useT } from '../../i18n/LanguageProvider'
import { SECTION_IDS } from '../sections'
import useCurrentSection from '../hooks/useCurrentSection'
import Icon from './Icon'

/**
 * Floating section navigation:
 * - centered "next section" arrow (hidden on the last section, so it never covers the form);
 * - bottom-right "back to top" once the visitor has left the hero.
 * Plain fragment links: they work without JS state, keep history and move focus to the
 * section (sections are tabindex=-1).
 */
const SectionNav = () => {
  const t = useT();
  const current = useCurrentSection(SECTION_IDS);
  const index = SECTION_IDS.indexOf(current);
  const next = index >= 0 && index < SECTION_IDS.length - 1 ? SECTION_IDS[index + 1] : null;

  return (
    <>
      {next && (
        <a
          key={next}
          href={`#${next}`}
          data-testid='next-section'
          className='section-fab section-fab--next left-1/2 -translate-x-1/2'
        >
          <Icon name='arrowDown' className='section-fab__icon w-5 h-5' />
          <span className='sr-only'>{t('site.nav.next').replace('{section}', t(`site.nav.${next}`))}</span>
        </a>
      )}
      {current !== 'home' && (
        <a href='#home' data-testid='back-to-top' className='section-fab right-4 sm:right-6'>
          <Icon name='arrowUp' className='w-5 h-5' />
          <span className='sr-only'>{t('site.nav.top')}</span>
        </a>
      )}
    </>
  );
};

export default SectionNav
