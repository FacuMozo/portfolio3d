import { experiences, skills } from '../../constants'
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { useT } from '../../i18n/LanguageProvider';

/** Profile, skills and work timeline. Shared by the /about page and the ocean "About" island. */
const AboutContent = ({ animate = true }) => {
  const t = useT();
  return (
    <>
      <div className='mt-5 flex flex-col gap-3 text-slate-700'>
        <p className='text-pretty'>{t('about.profession')}</p>
      </div>

      <div className='py-10 flex flex-col'>
        <h2 className='subhead-text'>{t('about.skills_header')}</h2>

        <ul className='mt-16 flex flex-wrap gap-12'>
          {skills.map((skill) => (
            <li key={skill.name} className='block-container w-20 h-20'>
              <div className='btn-back rounded-xl' />
              <div className='btn-front rounded-xl flex flex-col justify-center items-center'>
                <img className='h-14' src={skill.imageUrl} alt='' loading='lazy' decoding='async' />
                <p className='font-normal text-center flex-nowrap'>{skill.name}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className='py-16'>
        <h2 className='subhead-text'>{t('about.work_experience_header')}</h2>
        <div className='mt-5 flex flex-col gap-3 text-slate-700'>
          <p className='text-pretty'>{t('about.bio')}</p>
          <p className='text-pretty'>{t('about.bio_personal')}</p>
        </div>

        <div className='mt-12 flex'>
          <VerticalTimeline animate={animate}>
            {experiences.map((experience) => {
              const data = t(experience.i18nKey);
              const title = data?.title || experience.i18nKey;
              const company = data?.company;
              const points = data?.points || [];
              return (
                <VerticalTimelineElement
                  key={experience.i18nKey}
                  date={data?.date}
                  icon={
                    <div className='flex justify-center items-center w-full h-full'>
                      <img src={experience.icon} alt={company} className='w-[60%] h-[60%] object-contain' />
                    </div>
                  }
                  iconStyle={{ backgroundColor: experience.iconBg }}
                  contentStyle={{
                    borderBottom: `8px solid ${experience.iconBg}`,
                    boxShadow: 'none'
                  }}
                >
                  <div>
                    <h3 className='text-black text-xl font-poppins font-semibold'>{title}</h3>
                    <p className='text-black font-medium font-base' style={{ margin: 0 }}>{company}</p>
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
    </>
  )
}

export default AboutContent
