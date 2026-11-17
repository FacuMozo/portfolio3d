import { useT } from '../../i18n/LanguageProvider'
import { expertise } from '../../constants'
import Icon from '../components/Icon'

const ACCENT = {
  coral: { text: 'text-accent-coral', border: 'border-accent-coral' },
  cyan: { text: 'text-accent-cyan', border: 'border-accent-cyan' },
  violet: { text: 'text-accent-lilac', border: 'border-accent-violet' },
};

const S = ({ c = 'text-syntax-comment', children }) => <span className={c}>{children}</span>;
const str = (v) => <S>&quot;{v}&quot;</S>;
const list = (items) => <>[{items.map((v, i) => <span key={v}>{i > 0 && ', '}{str(v)}</span>)}]</>;

/** Terminal-style profile card. Language-neutral (it's code), built only from real CV data. */
const ProfileSnippet = () => {
  const t = useT();
  return (
    <figure className='mt-6 bg-surface-lowest border border-border-subtle'>
      <figcaption className='flex flex-wrap items-center justify-between gap-2 px-6 py-3 border-b border-border-subtle font-mono text-code-badge text-text-muted'>
        <span className='flex items-center gap-2'>
          <span aria-hidden='true' className='w-2.5 h-2.5 rounded-full bg-error' />
          <span aria-hidden='true' className='w-2.5 h-2.5 rounded-full bg-tertiary' />
          <span aria-hidden='true' className='w-2.5 h-2.5 rounded-full bg-syntax-comment' />
          <span className='ml-2 text-text-secondary'>engineer_profile.ts</span>
        </span>
        <span className='text-syntax-comment'>{t('site.expertise.profile_note')}</span>
      </figcaption>
      <div className='overflow-x-auto p-6' tabIndex={0} role='region' aria-label='engineer_profile.ts'>
        <pre className='font-mono text-code-snippet text-text-secondary leading-relaxed'>
          <code>
            <S c='text-accent-violet'>const</S> <S c='text-accent-cyan'>engineer</S> = {'{'}{'\n'}
            {'  '}name: {str('Facundo Mozo')},{'\n'}
            {'  '}degree: {str('Ingeniería de Sistemas · UNICEN')},{'\n'}
            {'  '}domains: {list(['Oil & Gas', 'Healthcare', 'Industrial manufacturing'])},{'\n'}
            {'  '}stack: {'{'} web: {list(['React', 'TypeScript'])}, mobile: {str('React Native')}, backend: {list(['Spring Boot', 'Node.js', 'Python'])} {'}'},{'\n'}
            {'  '}openTo: <S c='text-accent-coral'>&quot;Frontend · Mobile · Full-Stack (remote)&quot;</S>,{'\n'}
            {'}'} <S c='text-accent-violet'>satisfies</S> <S c='text-accent-cyan'>Engineer</S>;
          </code>
        </pre>
      </div>
    </figure>
  );
};

const Expertise = () => {
  const t = useT();
  return (
    <section id='expertise' tabIndex={-1} aria-labelledby='expertise-title' className='w-full max-w-7xl mx-auto px-4 sm:px-margin py-space-3xl'>
      <div className='text-center mb-16'>
        <h2 id='expertise-title' className='font-display text-headline-xl text-text-primary'>{t('site.expertise.title')}</h2>
        <p className='font-mono text-code-snippet text-text-muted mt-2'>{t('site.expertise.subtitle')}</p>
      </div>

      <ul className='grid grid-cols-1 md:grid-cols-3 border border-border-subtle bg-surface-card'>
        {expertise.map(({ id, icon, accent, stack }, i) => {
          const a = ACCENT[accent];
          return (
            <li
              key={id}
              className={`p-8 sm:p-10 flex flex-col justify-between hover:bg-surface-card-hover transition-colors ${i < expertise.length - 1 ? 'border-b md:border-b-0 md:border-r border-border-subtle' : ''}`}
            >
              <div>
                <div className='flex items-center gap-3 mb-6'>
                  <Icon name={icon} className={`w-7 h-7 shrink-0 ${a.text}`} />
                  <h3 className='font-display text-headline-sm font-bold text-text-primary'>
                    <span className={`inline-block border-b-2 pb-0.5 ${a.border}`}>{t(`site.expertise.${id}.line1`)}</span>
                    <span className='block'>{t(`site.expertise.${id}.line2`)}</span>
                  </h3>
                </div>
                <p aria-hidden='true' className='font-mono text-code-snippet text-text-muted mb-2'>&lt;p&gt;</p>
                <p className='text-body-md text-text-secondary leading-relaxed pl-4 border-l border-border-prominent'>
                  {t(`site.expertise.${id}.body`)}
                </p>
                <p aria-hidden='true' className='font-mono text-code-snippet text-text-muted mt-2'>&lt;/p&gt;</p>
              </div>
              <ul className='mt-8 pt-4 border-t border-border-subtle flex flex-wrap gap-1.5 font-mono text-code-badge'>
                {stack.map((tech, j) => (
                  <li key={tech} className={`bg-surface-high px-2 py-0.5 ${j === 0 ? a.text : j === stack.length - 1 ? 'text-syntax-comment' : 'text-on-surface'}`}>
                    {tech}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      <ProfileSnippet />
    </section>
  );
};

export default Expertise
