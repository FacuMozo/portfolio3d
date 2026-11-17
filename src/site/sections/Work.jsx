import { useMemo, useState } from 'react'
import { useT } from '../../i18n/LanguageProvider'
import { projectCategories, projects } from '../../constants'
import Icon from '../components/Icon'
import { filterProjects } from '../sections'

// Per-category accent (badge + hover). Small text uses lilac, not violet, for AA contrast.
const CATEGORY_STYLE = {
  realtime: { text: 'text-accent-cyan', count: 'text-accent-cyan' },
  mobile: { text: 'text-accent-coral', count: 'text-accent-coral' },
  data: { text: 'text-syntax-comment', count: 'text-syntax-comment' },
  web: { text: 'text-accent-lilac', count: 'text-accent-lilac' },
  all: { count: 'text-accent-lilac' },
};

const projectKey = (project) => project.i18nKey.split('.').pop();
const pad = (n) => String(n).padStart(2, '0');


/** Live-telemetry illustration for the featured project (decorative). */
const TelemetryMockup = () => {
  const t = useT();
  return (
    <div aria-hidden='true' className='relative bg-surface-lowest border border-border-prominent p-3 aspect-[4/3] flex flex-col justify-between overflow-hidden'>
      <div className='flex items-center justify-between gap-2 text-[11px] font-mono text-text-muted border-b border-border-subtle pb-2'>
        <span className='text-syntax-comment truncate'>{t('site.work.live')}</span>
        <span className='pulse-dot text-accent-coral shrink-0'>● REC</span>
      </div>
      <svg className='my-auto w-full h-24' viewBox='0 0 240 80' fill='none'>
        <path d='M0,50 Q20,20 40,45 T80,30 T120,60 T160,20 T200,40 T240,25' stroke='#66D9ED' strokeWidth='2.5' />
        <path d='M0,65 Q30,55 60,70 T120,45 T180,65 T240,50' stroke='#A855F7' strokeDasharray='4 2' strokeWidth='1.5' />
        <circle cx='160' cy='20' r='4' fill='#00E599' />
      </svg>
      <div className='grid grid-cols-3 gap-2 pt-2 border-t border-border-subtle text-center text-[10px] font-mono text-text-secondary'>
        <div>TORQUE <span className='block text-text-primary'>14.2 kNm</span></div>
        <div>ROP <span className='block text-syntax-comment'>38.4 m/h</span></div>
        <div>PRES <span className='block text-accent-cyan'>3,450 PSI</span></div>
      </div>
    </div>
  );
};

/** Placeholder art for projects without a public screenshot: project icon on a blueprint grid. */
const ProjectMockup = ({ project }) => (
  <div aria-hidden='true' className='relative w-full aspect-[16/9] bg-surface-container overflow-hidden flex items-center justify-center'>
    <div className='absolute inset-0 opacity-40 [background-image:linear-gradient(#282830_1px,transparent_1px),linear-gradient(90deg,#282830_1px,transparent_1px)] [background-size:24px_24px]' />
    <div className='absolute w-48 h-48 rounded-full bg-primary-container/20 blur-3xl' />
    <div className='relative w-24 h-24 bg-surface-card border border-border-prominent flex items-center justify-center shadow-2xl'>
      <img src={project.iconUrl} alt='' className='w-14 h-14 object-contain' loading='lazy' decoding='async' />
    </div>
  </div>
);

const FeaturedProject = ({ project }) => {
  const t = useT();
  const data = t(project.i18nKey);
  return (
    <article className='featured-card lg:col-span-7 bg-surface-card border border-border-subtle p-6 sm:p-8'>
      <p className='flex items-center gap-3 mb-4 font-mono text-code-badge text-accent-lilac font-bold uppercase tracking-wider'>
        <Icon name='arrowRight' className='w-6 h-6' />
        {t('site.work.featured')}
      </p>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-center'>
        <div className='space-y-4'>
          <h3 className='font-display text-headline-lg text-text-primary'>{data?.name}</h3>
          <p className='text-body-sm text-text-secondary leading-relaxed'>{data?.description}</p>
          <ul className='flex flex-wrap gap-1.5 font-mono text-code-badge text-accent-cyan pt-1'>
            {project.stack.map((tech) => (
              <li key={tech} className='tech-chip bg-surface-high border border-transparent px-2 py-1'>{tech}</li>
            ))}
          </ul>
          <a
            href={`#project-${projectKey(project)}`}
            data-magnetic
            className='inline-flex items-center gap-2 px-6 py-2.5 bg-primary-container text-white font-mono text-code-badge font-bold uppercase tracking-wider hover:bg-inverse-primary transition-colors'
          >
            {t('site.work.details')}
            <Icon name='arrowRight' className='w-4 h-4' />
          </a>
        </div>
        <TelemetryMockup />
      </div>
    </article>
  );
};

const ProjectCard = ({ project }) => {
  const t = useT();
  const data = t(project.i18nKey);
  const name = data?.name ?? project.i18nKey;
  const style = CATEGORY_STYLE[project.category];
  const [w, h] = project.imageSize ?? [];

  return (
    <li id={`project-${projectKey(project)}`} tabIndex={-1} className='scroll-mt-24'>
      <article className='project-card relative h-full bg-surface-card border border-border-subtle flex flex-col overflow-hidden'>
        <header className='order-2 px-6 sm:px-8 pt-6 sm:pt-8 flex items-start justify-between gap-4'>
          <h3 className='font-display text-headline-sm text-text-primary'>
            {project.link ? (
              <a href={project.link} target='_blank' rel='noopener noreferrer' className='card-link hover:text-accent-cyan transition-colors'>
                {name}
                <span className='sr-only'> — {t('site.work.visit')} ({t('common.new_tab')})</span>
              </a>
            ) : name}
          </h3>
          {project.link && <Icon name='northEast' className='w-5 h-5 shrink-0 mt-1 text-text-muted' />}
        </header>

        <div className='order-1 relative border-b border-border-subtle bg-surface-container overflow-hidden'>
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={t('site.work.preview').replace('{name}', name)}
              width={w}
              height={h}
              loading='lazy'
              decoding='async'
              className='w-full aspect-[16/9] object-cover object-top'
            />
          ) : (
            <ProjectMockup project={project} />
          )}
          <span className={`absolute top-4 right-4 bg-surface-lowest/90 backdrop-blur-md px-3 py-1 border border-border-subtle font-mono text-code-badge uppercase ${style.text}`}>
            {t(`site.work.categories.${project.category}`)}
          </span>
        </div>

        <p className='order-3 px-6 sm:px-8 pt-3 pb-6 text-body-sm text-text-secondary leading-relaxed flex-1'>{data?.description}</p>

        <ul className='order-4 mx-6 sm:mx-8 py-4 border-t border-border-subtle flex flex-wrap items-center gap-2 font-mono text-code-badge text-text-secondary'>
          {project.stack.map((tech, i) => (
            <li key={tech} className={`tech-chip relative z-[2] px-2 py-0.5 border border-transparent ${i === 0 ? style.text : ''}`}>{tech}</li>
          ))}
        </ul>
      </article>
    </li>
  );
};

const Work = () => {
  const t = useT();
  const [filter, setFilter] = useState('all');
  const featured = projects.find((p) => p.featured);
  const visible = useMemo(() => filterProjects(projects, filter), [filter]);
  const counts = useMemo(
    () => Object.fromEntries(projectCategories.map((c) => [c, filterProjects(projects, c).length])),
    [],
  );

  return (
    <section id='work' tabIndex={-1} aria-labelledby='work-title' className='w-full max-w-7xl mx-auto px-4 sm:px-margin py-space-3xl'>
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16'>
        <div className='lg:col-span-5'>
          <h2 id='work-title' className='font-display text-display-hero text-text-primary mb-6'>
            {t('site.work.title_1')}<br />{t('site.work.title_2')}
          </h2>
          <p className='text-body-md text-text-secondary leading-relaxed mb-6'>{t('site.work.intro')}</p>

          <div role='group' aria-label={t('site.work.filters_label')} className='flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-code-badge'>
            <span aria-hidden='true' className='text-text-muted'>{t('site.work.filter_label')}</span>
            {projectCategories.map((cat) => {
              const pressed = filter === cat;
              return (
                <button
                  key={cat}
                  type='button'
                  aria-pressed={pressed}
                  onClick={() => setFilter(cat)}
                  className={`pb-0.5 border-b-2 transition-colors ${pressed ? 'text-text-primary border-accent-violet' : 'text-text-secondary border-transparent hover:text-text-primary'}`}
                >
                  {t(`site.work.categories.${cat}`)}{' '}
                  <sup className={`font-bold ${CATEGORY_STYLE[cat].count}`}>({pad(counts[cat])})</sup>
                </button>
              );
            })}
          </div>
        </div>

        {featured && <FeaturedProject project={featured} />}
      </div>

      <p className='sr-only' aria-live='polite'>{t('site.work.results').replace('{n}', visible.length)}</p>
      <ul className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {visible.map((project) => (
          <ProjectCard key={project.i18nKey} project={project} />
        ))}
      </ul>
    </section>
  );
};

export default Work
