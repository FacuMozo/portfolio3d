import { useCallback, useState } from 'react'
import { projects } from '../../constants'
import { arrow } from '../../assets/icons'
import ImageLightbox from '../ImageLightbox'
import { useT } from '../../i18n/LanguageProvider'

/** Project cards + image lightbox. Shared by the /projects page and the ocean "Projects" island. */
const ProjectsContent = ({ compact = false }) => {
  const t = useT();
  const [preview, setPreview] = useState(null);
  const closePreview = useCallback(() => setPreview(null), []);
  return (
    <>
      {/* 1 column on mobile, 2 on large screens */}
      <ul className={`grid grid-cols-1 ${compact ? 'mt-8 gap-10' : 'mt-16 lg:grid-cols-2 gap-12'}`}>
        {projects.map((project) => {
          const data = t(project.i18nKey);
          const name = data?.name || project.i18nKey;
          return (
            <li key={project.i18nKey}>
              <article className='flex flex-col h-full'>
                <div className='flex items-start'>
                  <div className='mr-6 md:mr-8 shrink-0 relative'>
                    <div className='block-container w-16 h-16 md:w-14 md:h-14'>
                      <div className={`btn-back rounded-xl ${project.theme}`} />
                      <div className='btn-front rounded-xl flex justify-center items-center'>
                        <img src={project.iconUrl} alt='' className='w-3/4 h-3/4 object-contain' loading='lazy' decoding='async' />
                      </div>
                    </div>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h2 className='text-2xl font-poppins font-semibold leading-snug break-words'>{name}</h2>
                    <p className='mt-1 text-slate-500 text-sm md:text-base'>{data?.tech}</p>
                  </div>
                </div>

                <p className='mt-4 text-slate-600 text-sm md:text-base flex-1'>{data?.description}</p>

                {project.imageUrl && (
                  <button
                    type='button'
                    onClick={() => setPreview({ src: project.imageUrl, alt: `${name} preview`, caption: name })}
                    aria-label={`${t('lightbox.open')}: ${name}`}
                    className='mt-4 block w-full rounded-lg cursor-zoom-in transition hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:ring-offset-2'
                  >
                    <img
                      className='rounded-lg border border-slate-200 object-cover max-h-48 w-full'
                      src={project.imageUrl}
                      alt=''
                      loading='lazy'
                      decoding='async'
                    />
                  </button>
                )}
                {project.link && (
                  <div className='mt-5 flex items-center gap-2 font-poppins'>
                    {/* External URL: a plain <a>, not react-router's <Link> */}
                    <a
                      href={project.link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='group font-semibold text-blue-500 hover:underline inline-flex items-center gap-1'
                    >
                      {t('projects_page.link')}
                      <span className='sr-only'> {name} ({t('common.new_tab')})</span>
                      <img src={arrow} alt='' className='w-4 h-4 object-contain transition motion-safe:group-hover:translate-x-1' />
                    </a>
                  </div>
                )}
              </article>
            </li>
          )
        })}
      </ul>
      {/* One dialog for the whole page; `preview` is the selected project's image */}
      <ImageLightbox image={preview} onClose={closePreview} />
    </>
  )
}

export default ProjectsContent
