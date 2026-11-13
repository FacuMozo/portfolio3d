import CTA from '../components/CTA'
import ProjectsContent from '../components/sections/ProjectsContent'
import { useT } from '../i18n/LanguageProvider'

const Projects = () => {
  const t = useT();
  return (
    <section className='max-container'>
      <h1 className='head-text'>
        {t('navbar.projects')}<span className='blue-gradient_text font-semibold drop-shadow'>.</span>
      </h1>
      <div className='mt-5 flex flex-col gap-3 text-slate-700'>
        <p className='text-pretty'>{t('projects_page.intro')}</p>
      </div>

      <ProjectsContent />
      <hr className='border-slate-200 mt-16' />
      <CTA />
    </section>
  )
}

export default Projects
