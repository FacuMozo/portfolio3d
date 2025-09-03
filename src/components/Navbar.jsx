import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home_logo } from '../assets/icons'
import { arrow } from '../assets/icons'
import { useLanguage, useT } from '../i18n/LanguageProvider'



const Navbar = () => {
    const { lang, setLang } = useLanguage();
    const t = useT();
    const toggle = () => setLang(lang === 'es' ? 'en' : 'es');
    return (
        <header className='header flex gap-4 items-center'>
            <NavLink to="/" className="w-auto h-10 rounded-lg bg-white items-center justify-center flex font-bold shadow-md px-4">
                <img className='h-7' src={Home_logo} alt="logo" />
                <p className='pl-3 blue-gradient_text'>{t('navbar.home')}</p>
            </NavLink>
            <nav className='flex tex-lg gap-3 font-medium rounded-lg bg-white h-10 shadow-md px-6 items-center font-bold'>
                <NavLink to="/about" className={({isActive}) => isActive ? 'text-blue-500' : 'text-black'}>
                    {t('navbar.about')}
                </NavLink>
                <div className='w-0.5 h-5 bg-slate-300'></div>
                <NavLink to="/projects" className={({isActive}) => isActive ? 'text-blue-500' : 'text-black'}>
                    {t('navbar.projects')}
                </NavLink>
            </nav>
            <button onClick={toggle} className='h-10 px-4 rounded-lg bg-white shadow-md font-semibold hover:scale-105 transition'>
                {t('navbar.langToggle')}
            </button>
        </header>
    )
}

export default Navbar