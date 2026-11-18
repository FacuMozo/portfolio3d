import { useT } from '../../i18n/LanguageProvider'
import { experiences } from '../../constants'

/**
 * Native <details> accordion: keyboard, state and find-in-page for free, no JS.
 * Not exclusive (several roles can be compared side by side) and no heading inside <summary>
 * (JAWS/TalkBack expose summary as a button and drop the heading).
 */
const Experience = () => {
  const t = useT();
  return (
    <section id='experience' tabIndex={-1} aria-labelledby='experience-title' className='w-full max-w-5xl mx-auto px-4 sm:px-margin py-space-3xl'>
      <div className='mb-12'>
        <h2 id='experience-title' className='font-display text-headline-xl text-text-primary'>{t('site.experience.title')}</h2>
        <p className='font-mono text-code-snippet text-text-muted mt-2'>{t('site.experience.subtitle')}</p>
      </div>

      <div className='space-y-4'>
        {experiences.map((experience, i) => {
          const data = t(experience.i18nKey);
          const points = Array.isArray(data?.points) ? data.points : [];
          return (
            <details key={experience.i18nKey} open={i === 0} className='xp-item border border-border-prominent bg-surface-card'>
              <summary className='group px-5 sm:px-6 py-4 bg-[rgb(var(--c-tint))] hover:bg-[rgb(var(--c-tint)/0.7)] transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                <span className='flex items-center gap-3 font-display text-headline-sm text-text-primary group-hover:text-accent-cyan transition-colors'>
                  <span className='xp-marker' aria-hidden='true' />
                  <span>
                    {data?.title} <span className='text-accent-lilac'>@</span> {data?.company}
                  </span>
                </span>
                <span className={`font-mono text-code-badge shrink-0 pl-6 sm:pl-0 ${i === 0 ? 'text-accent-cyan' : 'text-text-secondary'}`}>
                  {data?.date}
                </span>
              </summary>
              <div className='p-5 sm:p-6 border-t border-border-subtle'>
                <ul className='space-y-3 text-body-md text-text-secondary'>
                  {points.map((point) => (
                    <li key={point} className='flex items-start gap-2'>
                      <span aria-hidden='true' className='text-syntax-comment font-mono'>✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
};

export default Experience
