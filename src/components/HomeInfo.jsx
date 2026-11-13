import { Link } from 'react-router-dom';
import { useT } from '../i18n/LanguageProvider';

const InfoBox = ({ text, link, btnText }) => (
    <div className='info-box'>
        <p className='font-medium sm:text-xl text-center'>{text}</p>
        {/* The overlay container is pointer-events-none so the island can be dragged;
            re-enable pointer events on the link so it stays clickable. */}
        <Link to={link} className='neo-brutalism-white neo-btn pointer-events-auto'>
            {btnText}
        </Link>
    </div>
)

const HomeInfo = ({ currentStage }) => {
    const t = useT();
    switch (currentStage) {
        case 1:
            return (
                <h1 className='sm:text-xl sm:leading-snug text-center neo-brutalism-blue py-4 px-8 text-white mx-5'>
                    {t('home.hero.greeting')} <br /> <span className='font-semibold'>{t('home.hero.subtitle')}</span>
                    <br />
                    {t('home.hero.cta')}
                </h1>
            );
        case 2:
            return <InfoBox text={t('home.portfolio_question')} link='/projects' btnText={t('home.portfolio_btn')} />;
        case 3:
            return <InfoBox text={t('home.skills_text')} link='/about' btnText={t('home.skills_btn')} />;
        case 4:
            return <InfoBox text={t('home.hire_text')} link='/contact' btnText={t('home.hire_btn')} />;
        default:
            return null;
    }
}

export default HomeInfo
