import { Link } from 'react-router-dom'
import { Home_logo } from '../assets/icons'
import { useLanguage, useT } from '../i18n/LanguageProvider'
import CvDialog from './CvDialog'

const linkClass = 'text-black hover:text-blue-500';
const pillButton = 'h-10 px-3 sm:px-4 rounded-lg bg-white shadow-md font-semibold transition motion-safe:hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400';

const Navbar = () => {
    const { lang, setLang } = useLanguage();
    const t = useT();
    const nextLang = lang === 'es' ? 'en' : 'es';

    return (
        <header className='header flex gap-2 sm:gap-4 items-center'>
            <Link to='/' className='w-auto h-10 rounded-lg bg-white items-center justify-center flex font-bold shadow-md px-3 sm:px-4'>
                <img className='h-7' src={Home_logo} alt='' />
                {/* Visually hidden on phones to make room; still the link's accessible name */}
                <span className='sr-only sm:not-sr-only sm:pl-3 blue-gradient_text'>{t('navbar.home')}</span>
            </Link>
            <nav aria-label={t('navbar.main_nav')} className='flex gap-3 rounded-lg bg-white h-10 shadow-md px-4 sm:px-6 items-center font-bold'>
                <Link to='/#experience' className={linkClass}>{t('navbar.about')}</Link>
                <div aria-hidden='true' className='w-0.5 h-5 bg-slate-300'></div>
                <Link to='/#work' className={linkClass}>{t('navbar.projects')}</Link>
            </nav>
            <div className='flex gap-2 sm:gap-3'>
                <CvDialog buttonClassName={`${pillButton} text-blue-500`} />
                <button
                    type='button'
                    onClick={() => setLang(nextLang)}
                    aria-label={t('navbar.langToggle_label')}
                    lang={nextLang}
                    className={pillButton}
                >
                    {t('navbar.langToggle')}
                </button>
            </div>
        </header>
    )
}

export default Navbar
