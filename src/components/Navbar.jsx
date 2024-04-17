import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home_logo } from '../assets/icons'
import { arrow } from '../assets/icons'



const Navbar = () => {
  return (
    <header className='header'>
        <NavLink to="/" className="w-auto h-10 rounded-lg bg-white items-center justify-center flex  font-bold shadow-md p-3">
            <img className='w-auto h-7 filter()' src={Home_logo} alt="" />
            <p className='pl-3 blue-gradient_text'> Inicio</p>
        </NavLink>
            <img src="arrow" alt="" />
        <nav className='flex tex-lg gap-2 font-medium rounded-lg bg-white w-auto h-10 shadow-md p-5 items-center justify-center flex  font-bold '>
            <NavLink to="/about" className={({isActive}) => isActive ? 'text-blue-500' : ' text-black'}>
                Acerca de
            </NavLink>
            <div className='w-0.5 h-5 bg-slate-400'></div>
            <NavLink to="/projects" className={({isActive}) => isActive ? 'text-blue-500 ' : ' text-black' }     >
                Proyectos
            </NavLink>
        </nav>
    </header>
  )
}

export default Navbar