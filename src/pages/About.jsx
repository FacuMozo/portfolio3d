import React from 'react'
import { experiences, skills } from '../constants'
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import CTA from '../components/CTA';


const About = () => {
  return (
    <section className='max-container'>
      <h1 className='head-text'>
        Hola, mi nombre es <span className='blue-gradient_text font-semibold drop-shadow'>Facundo Mozo</span>
      </h1>
      <div className='mt-5 flex flex-col gap-3 text-slate-700'>
        <p className='text-justify'>
          Ingeniero de Sistemas, desarrollador de aplicaciones WEB (Full-Stack) con preferencia en el desarrollo FrontEnd.
        </p>
      </div>

      <div className="py-10 flex flex-col">
        <h3 className='subhead-text'>Mis Habilidades - Conocimientos</h3>

        <div className='mt-16 flex flex-wrap gap-12'>
          {skills.map((skill) => (
            <div className='block-container w-20 h-20'>
              <div className='btn-back rounded-xl' />
              <div className='btn-front rounded-xl flex flex-col justify-center items-center'>
                <img className=' h-14'
                  src={skill.imageUrl}
                  alt={skill.name}
                />
                <p className='font-noraml text-center flex-nowrap'>{skill.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='py-16'>
        <h3 className='subhead-text'>Expriencia de trabajo</h3>
        <div className='mt-5 flex flex-col gap-3 text-slate-700'>
          <p className='text-justify'>

            Como Ingeniero de Sistemas, tengo un gran interés en el desarrollo de aplicaciones web, especialmente en la parte del diseño visual y la interactividad (FrontEnd). Aunque todavía no tengo experiencia laboral formal, estoy ansioso por aprender  y enfrentar desafíos con creatividad. Mi formación académica me ha proporcionado una buena base en tecnologías, y estoy preparado para aplicar estas habilidades en el mundo real.
            <br />
            <br />
            Me considero una persona organizada, que le gusta trabajar en equipo y que trabaja mejor bajo presion. Aunque sé que todavía tengo mucho por aprender, estoy decidido a crecer y hacer contribuciones valiosas en el campo del desarrollo web. Estoy seguro de que mi actitud positiva y mi dedicación serán útiles en cualquier equipo en el que trabaje.
          </p>
        </div>

        <div className='mt-12 flex'>
          <VerticalTimeline>

            {experiences.map((experience) => (
              <VerticalTimelineElement
                key={experience.company_name}
                date={experience.date}
                icon={
                  <div className='flex justify-center items-center w-full h-full'>
                    <img src={experience.icon}
                      alt={experience.company_name}
                      className='w-[60%] h-[60%] object-contain' />
                  </div>
                }
                iconStyle={{
                  backgroundColor: experience.iconBg
                }}
                contentStyle={{
                  borderBottom: '8px',
                  borderStyle:'solid',
                  borderBottomColor: experience.iconBg,
                  boxShadow: 'none'
                }}
              >
                <div>
                  <h3 className='text-black text-xl font-poppins font-semibold'>
                    {experience.title}
                  </h3>
                  <p className='text-black font-medium font-base ' style={{ margin: 0 }}>
                    {experience.company_name}
                  </p>
                  <ul className='my-5 list-disc ml-5 space-y-2'>
                    {experience.points.map((point, index) => (
                      <li key={`experience-point-${index}`} className='text-black-500/50 font-normal pl-1 text-sm'>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </VerticalTimelineElement>

            ))}
          </VerticalTimeline>
        </div>
      </div>

      <hr className='border-slate-200'/>
      <CTA />
    </section>
  )
}

export default About