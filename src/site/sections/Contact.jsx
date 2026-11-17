import { useId } from 'react'
import { useT } from '../../i18n/LanguageProvider'
import { contactEmail, socialLinks } from '../../constants'
import useContactForm from '../hooks/useContactForm'
import Icon from '../components/Icon'

const socialHandle = { GitHub: '/FacuMozo', LinkedIn: '/in/facundo-mozo' };

export const ContactForm = ({ send }) => {
  const t = useT();
  const { form, status, onChange, onSubmit } = useContactForm({ send });
  const titleId = useId();
  const sending = status === 'sending';

  return (
    <form onSubmit={onSubmit} aria-labelledby={titleId} className='bg-surface-card border border-border-subtle p-6 sm:p-8 flex flex-col gap-5'>
      <h3 id={titleId} className='font-display text-headline-md text-text-primary'>{t('site.contact.form_title')}</h3>

      <label className='font-mono text-code-badge uppercase text-text-secondary'>
        {t('contact.name_label')}
        <input
          type='text'
          name='name'
          autoComplete='name'
          maxLength={100}
          required
          value={form.name}
          onChange={onChange}
          placeholder={t('contact.name_placeholder')}
          className='site-field normal-case font-sans text-body-md'
        />
      </label>
      <label className='font-mono text-code-badge uppercase text-text-secondary'>
        {t('contact.email_label')}
        <input
          type='email'
          name='email'
          inputMode='email'
          autoComplete='email'
          autoCapitalize='none'
          spellCheck={false}
          maxLength={254}
          required
          value={form.email}
          onChange={onChange}
          placeholder={t('contact.email_placeholder')}
          className='site-field normal-case font-sans text-body-md'
        />
      </label>
      <label className='font-mono text-code-badge uppercase text-text-secondary'>
        {t('contact.message_label')}
        <textarea
          name='message'
          rows={5}
          maxLength={2000}
          required
          value={form.message}
          onChange={onChange}
          placeholder={t('contact.message_placeholder')}
          className='site-field normal-case font-sans text-body-md'
        />
      </label>

      <div className='flex flex-wrap items-center gap-4'>
        <button
          type='submit'
          disabled={sending}
          aria-busy={sending}
          data-magnetic
          className='inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-white font-mono text-code-badge font-bold uppercase tracking-wider hover:bg-inverse-primary transition-colors disabled:opacity-70 disabled:cursor-wait'
        >
          <Icon name='mail' className='w-4 h-4' />
          {sending ? t('contact.sending_btn') : t('contact.send_btn')}
        </button>
        {/* Polite live region: the result is announced without stealing focus. */}
        <p role='status' className='text-body-sm'>
          {status === 'success' && <span className='text-syntax-comment'>{t('contact.success')}</span>}
          {status === 'error' && (
            <span className='text-error'>
              {t('contact.error')} {t('site.contact.error_fallback').replace('{email}', contactEmail)}
            </span>
          )}
        </p>
      </div>
    </form>
  );
};

const Contact = () => {
  const t = useT();
  return (
    <section id='contact' tabIndex={-1} aria-labelledby='contact-title' className='w-full max-w-7xl mx-auto px-4 sm:px-margin py-space-3xl border-t border-border-subtle'>
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 items-start'>
        <div className='lg:col-span-5 flex flex-col gap-8'>
          <div>
            <p className='font-mono text-code-badge text-syntax-comment tracking-wider mb-2 uppercase'>{t('site.contact.kicker')}</p>
            <h2 id='contact-title' className='font-display text-headline-xl text-text-primary mb-4'>{t('site.contact.title')}</h2>
            <p className='text-body-md text-text-secondary leading-relaxed mb-6'>{t('site.contact.body')}</p>
            <p className='font-mono text-code-badge uppercase text-text-muted mb-1'>{t('site.contact.email_label')}</p>
            {/* Shown as text too: mailto links aren't reliable everywhere. */}
            <a
              href={`mailto:${contactEmail}`}
              className='font-mono text-body-lg font-semibold text-accent-cyan hover:text-white transition-colors underline decoration-2 decoration-accent-violet underline-offset-4 break-all'
            >
              {contactEmail}
            </a>
          </div>

          <ul className='flex flex-col gap-2 font-mono text-code-badge text-text-secondary border-t border-border-subtle pt-6'>
            {socialLinks.map((link) => (
              <li key={link.name}>
                <a href={link.link} target='_blank' rel='noopener noreferrer' className='inline-flex items-center gap-2 hover:text-accent-cyan transition-colors'>
                  <span aria-hidden='true'>&gt;</span> {link.name} {socialHandle[link.name]}
                  <span className='sr-only'> ({t('common.new_tab')})</span>
                </a>
              </li>
            ))}
            <li className='text-text-muted pt-2 flex items-center gap-2'>
              <Icon name='pin' className='w-4 h-4 text-syntax-comment' />
              {t('site.contact.location')}
            </li>
          </ul>
        </div>

        <div className='lg:col-span-7'>
          <ContactForm />
        </div>
      </div>
    </section>
  );
};

export default Contact
