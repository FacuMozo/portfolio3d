import { useState } from 'react'
import emailjs from '@emailjs/browser'
import Alert from '../components/Alert';
import useAlert from '../hooks/useAlert';
import { useT } from '../i18n/LanguageProvider';

const EMPTY_FORM = { name: '', email: '', message: '' };

const Contact = () => {
  const t = useT();
  const { alert, showAlert } = useAlert();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await emailjs.send(
        import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          to_name: 'Facundo',
          from_email: form.email,
          to_email: 'facumozo98@gmail.com',
          message: form.message,
        },
        { publicKey: import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY }
      );
      setForm(EMPTY_FORM);
      showAlert({ text: t('contact.success'), type: 'success', duration: 3000 });
    } catch (error) {
      console.error(error);
      showAlert({ text: t('contact.error'), type: 'danger', duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className='relative flex lg:flex-row flex-col max-container'>
      {alert.show && <Alert {...alert} />}

      <div className='flex-1 min-w-[50%] flex flex-col'>
        <h1 className='head-text'>{t('contact.title')}</h1>

        <form className='w-full flex flex-col gap-7 mt-14' onSubmit={handleSubmit}>
          <label className='text-black-500 font-semibold'>
            {t('contact.name_label')}
            <input
              type='text'
              name='name'
              autoComplete='name'
              maxLength={100}
              className='input'
              placeholder={t('contact.name_placeholder')}
              required
              value={form.name}
              onChange={handleChange}
            />
          </label>
          <label className='text-black-500 font-semibold'>
            {t('contact.email_label')}
            <input
              type='email'
              name='email'
              inputMode='email'
              autoComplete='email'
              autoCapitalize='none'
              spellCheck={false}
              maxLength={254}
              className='input'
              placeholder={t('contact.email_placeholder')}
              required
              value={form.email}
              onChange={handleChange}
            />
          </label>
          <label className='text-black-500 font-semibold'>
            {t('contact.message_label')}
            <textarea
              name='message'
              rows={4}
              maxLength={2000}
              className='textarea'
              placeholder={t('contact.message_placeholder')}
              required
              value={form.message}
              onChange={handleChange}
            />
          </label>
          <button type='submit' className='btn' disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? t('contact.sending_btn') : t('contact.send_btn')}
          </button>
        </form>
      </div>
    </section>
  )
}

export default Contact
