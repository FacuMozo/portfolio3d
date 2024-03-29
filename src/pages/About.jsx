import React from 'react'
import { skills } from '../constants'

const About = () => {
  return (
    <section className='max-container'>
      <h1 className='head-text'>
        Hola, mi nombre es <span className='blue-gradient_text font-semibold drop-shadow'>Facundo Mozo</span>
      </h1>
      <div className='mt-5 flex flex-col gap-3 text-slate-700'>
        <p className='text-justify'>
          Ingeniero de Sistemas, de Argentina, con conociminetos en el desarrollo de aplicaciones WEB (Full-Stack) con predileccion por el FrontEnd.
        </p>
      </div>

      <div className="py-10 flex flex-col">
        <h3 className='subhead-text'>Mis Habilidades - Skillset</h3>

        <div className='mt-16 flex flex-wrap gap-12'>
          {skills.map((skill)=>(
            <div>
              <div>
                <img 
                  src={skill.imageUrl} 
                  alt={skill.name} 
                  />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About