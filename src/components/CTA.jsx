import React from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../i18n/LanguageProvider'

const CTA = () => {
  const t = useT();
  return (
    <section className='cta'>
        <p className='cta-text'> {t('cta.question')} <br className='sm-block hidden'/>
            {t('cta.action')}
        </p>
        <Link to="/contact" className='btn'>{t('cta.button')}</Link>
    </section>
  )
}

export default CTA