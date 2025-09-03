import React, { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import Alert from '../components/Alert';
import useAlert from '../hooks/useAlert';
import { useT } from '../i18n/LanguageProvider';

const Contact = () => {
  const formRef = useRef(null)
  const t = useT();
  const { alert, showAlert, hideAlert } = useAlert();

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  // form = {name:'', email:'',message:'' }
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  };
  const handleSubmit = (e) => { 
    e.preventDefault();
    setIsLoading(true);

    emailjs.send(
      import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
      {
        from_name: form.name,
        to_name: "Facundo",
        from_email: form.email,
        to_email: 'facumozo98@gmail.com',
        message: form.message
      },
      import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY,
      
    ).then(()=>{
      setIsLoading(false);
  showAlert({show:true,text:t('contact.success'), type:'success'})
      setTimeout(()=>{
        setForm({name:'',email:'',message:''})
        hideAlert();
      },[3000])
    }).catch((error)=>{
      setIsLoading(false);
      console.log(error);
  showAlert({show:true,text:t('contact.success'), type:'success'})
  showAlert({show:true,text:t('contact.error'), type:'danger'})
      setTimeout(()=>{
        hideAlert();
      },[4000])
    })
  };
const handleFocus = () => { }
const handleBlur = () => { };


return (
  <section className="relative flex lg:flex-row flex-col max-container h-[100vh]">
    {alert.show && <Alert {...alert}/>}
  
    <div className="flex-1 min-w-[50%] flex flex-col">
  <h1 className='head-text'>{t('contact.title')}</h1>

      <form className='w-full flex flex-col gap-7 mt-14'
        onSubmit={handleSubmit}
      >
        <label className='text-black-500 font-semibold'>
          {t('contact.name_label')}
          <input
            type="text"
            name="name"
            className='input'
            placeholder={t('contact.name_placeholder')}
            required
            value={form.name}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </label>
        <label className='text-black-500 font-semibold'>
          {t('contact.email_label')}
          <input
            type="email"
            name="email"
            className='input'
            placeholder={t('contact.email_placeholder')}
            required
            value={form.email}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </label>
        <label className='text-black-500 font-semibold'>
          {t('contact.message_label')}
          <textarea
            name="message"
            rows={4}
            className='input'
            placeholder={t('contact.message_placeholder')}
            required
            value={form.message}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </label>
        <button
          type='submit'
          className='btn'
          disabled={isLoading}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          {isLoading ? t('contact.sending_btn') : t('contact.send_btn')}
        </button>
      </form>
    </div>

  </section>
)
}

export default Contact