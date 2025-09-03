import React from 'react'
import { experiences, skills } from '../constants'
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import CTA from '../components/CTA';
import { useT } from '../i18n/LanguageProvider';


const About = () => {
  const t = useT();
  return (
    <section className='max-container'>
      <h1 className='head-text'>
        {t('about.title_intro')} <span className='blue-gradient_text font-semibold drop-shadow'>Facundo Mozo</span>
      </h1>
      <div className='mt-5 flex flex-col gap-3 text-slate-700'>
        <p className='text-justify'>
          {t('about.profession')}
        </p>
      </div>

      <div className="py-10 flex flex-col">
        <h3 className='subhead-text'>{t('about.skills_header')}</h3>

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
        <h3 className='subhead-text'>{t('about.work_experience_header')}</h3>
        <div className='mt-5 flex flex-col gap-3 text-slate-700'>
          <p className='text-justify'>

                {t('about.bio')}
            <br />
            <br />
            Me considero una persona organizada, que le gusta trabajar en equipo y que trabaja mejor bajo presion. Aunque sé que todavía tengo mucho por aprender, estoy decidido a crecer y hacer contribuciones valiosas en el campo del desarrollo web. Estoy seguro de que mi actitud positiva y mi dedicación serán útiles en cualquier equipo en el que trabaje.
          </p>
        </div>

        <div className='mt-12 flex'>
          <VerticalTimeline>

            {experiences.map((experience) => {
              const data = t(experience.i18nKey);
              const title = data?.title || experience.i18nKey;
              const company = data?.company;
              const date = data?.date;
              const points = data?.points || [];
              return (
              <VerticalTimelineElement
                key={experience.i18nKey}
                date={date}
                icon={
                  <div className='flex justify-center items-center w-full h-full'>
                    <img src={experience.icon}
                      alt={company}
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
                    {title}
                  </h3>
                  <p className='text-black font-medium font-base ' style={{ margin: 0 }}>
                    {company}
                  </p>
                  <ul className='my-5 list-disc ml-5 space-y-2'>
                    {points.map((point, index) => (
                      <li key={`experience-point-${index}`} className='text-black-500/50 font-normal pl-1 text-sm'>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </VerticalTimelineElement>
              )
            })}
          </VerticalTimeline>
        </div>
      </div>

      <hr className='border-slate-200'/>
      <CTA />
    </section>
  )
}

export default About