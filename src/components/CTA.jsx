import React from 'react'
import { Link } from 'react-router-dom'

const CTA = () => {
  return (
    <section className='cta'>
        <p className='cta-text'> Tienes un proyecto en mente? <br className='sm-block hidden'/>
            Desarrollemoslo juntos
        </p>
        <Link to="/contact" className='btn'>Contacto</Link>
    </section>
  )
}

export default CTA