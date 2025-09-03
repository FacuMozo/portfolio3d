import React from 'react'
import { Link } from 'react-router-dom';
import { useT } from '../i18n/LanguageProvider';

const InfoBox = ({ text, link, btnText }) => (
    <div className='info-box'>
        <p className='font-medium sm:text-xl text-center'>{text}</p>
        <Link to={link} className='neo-brutalism-white neo-btn'>
            {btnText}
        </Link>
    </div >
)

const HomeInfo = ({ currentStage }) => {
    const t = useT();
    const renderContent = {
        1: (
            <h1 className='sm:text-xl sm:leading-snug text-center neo-brutalism-blue py-4 px-8 text-white mx-5'>
                {t('home.hero.greeting')} <br /> <span className='font-semibold'>{t('home.hero.subtitle')}</span>
                <br />
                {t('home.hero.cta')} <br />
            </h1>
        ),
        2: (
            <InfoBox
                text={t('home.portfolio_question')}
                link="/projects"
                btnText={t('home.portfolio_btn')}
            />
        ),
        3: (
            <InfoBox
                text={t('home.skills_text')}
                link="/about"
                btnText={t('home.skills_btn')}
            />
        ),
        4: (
            <InfoBox
                text={t('home.hire_text')}
                link="/contact"
                btnText={t('home.hire_btn')}
            />
        ),
    }
    return renderContent[currentStage] || null;
}

export default HomeInfo