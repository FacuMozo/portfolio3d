import React from 'react'
import { projects } from '../constants'
import { Link } from 'react-router-dom'
import { arrow } from '../assets/icons'
import CTA from '../components/CTA'

const Projects = () => {
  return (
    <section className='max-container'>
      <h1 className='head-text'>
        Mis <span className='blue-gradient_text font-semibold drop-shadow'>Proyectos,</span>
      </h1>
      <div className='mt-5 flex flex-col gap-3 text-slate-700'>
        <p className='text-justify'>
          Te presento alguno de los proyectos WEB que realice recientemente, junto con una breve descripcion y las tecnologias involucradas.
        </p>
      </div>

      {/* Layout responsivo: 1 columna en mobile, 2 en pantallas grandes */}
      <div className='mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12'>
        {projects.map((project) =>(
          <div key={project.name} className='flex flex-col h-full'>
            <div className='flex items-start'>
              <div className='mr-6 md:mr-8 shrink-0 relative'>
                <div className='block-container w-16 h-16 md:w-14 md:h-14'>
                  <div className={`btn-back rounded-xl ${project.theme}`} />
                  <div className='btn-front rounded-xl flex justify-center items-center'>
                    <img 
                      src={project.iconUrl} 
                      alt={project.name + ' icon'}
                      className='w-3/4 h-3/4 object-contain'
                    />
                  </div>
                </div>
              </div>
              <div className='flex-1 min-w-0'>
                <h4 className='text-2xl font-poppins font-semibold leading-snug break-words'>
                  {project.name}
                </h4>
                <p className='mt-1 text-slate-500 text-sm md:text-base'>
                  {project.tecnologias}
                </p>
              </div>
            </div>

            <p className='mt-4 text-slate-600 text-sm md:text-base flex-1'>
              {project.description}
            </p>

            {project.imageUrl && (
              <img 
                className='mt-4 rounded-lg border border-slate-200 object-cover max-h-48 w-full' 
                src={project.imageUrl} 
                alt={project.name + ' preview'} 
                loading='lazy'
              />
            )}
            { project.link &&
            <div className='mt-5 flex items-center gap-2 font-poppins'>
              <Link to={project.link}
                target='_blank'
                rel='noopener noreferrer'
                className='font-semibold text-blue-500 hover:underline inline-flex items-center gap-1'
              >
                Link
                <img src={arrow} alt='arrow' className='w-4 h-4 object-contain transition group-hover:translate-x-1' />
              </Link>
            </div>}
          </div>
        ))}
      </div>
      <hr className='border-slate-200 mt-16'/>
      <CTA />
    </section>
  )
}

export default Projects