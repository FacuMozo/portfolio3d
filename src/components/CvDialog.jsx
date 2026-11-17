import { useId, useRef } from 'react'
import { useLanguage, useT } from '../i18n/LanguageProvider'
import useLightDismiss from '../hooks/useLightDismiss'
import { cvFiles } from '../constants'


const DownloadIcon = () => (
  <svg aria-hidden='true' viewBox='0 0 24 24' className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M12 3v12m0 0-4-4m4 4 4-4M5 21h14' />
  </svg>
);

const THEMES = {
  light: {
    dialog: 'rounded-2xl bg-white shadow-xl',
    title: 'font-poppins font-semibold text-xl text-black-500',
    close: 'rounded-full text-slate-500 hover:bg-slate-100 focus-visible:ring-4 focus-visible:ring-blue-400',
    desc: 'text-slate-600',
    option: 'rounded-xl border-slate-200 text-black-500 hover:border-blue-500 hover:bg-blue-50 focus-visible:ring-4 focus-visible:ring-blue-400',
    hint: 'text-slate-500',
    icon: 'text-blue-500',
  },
  dark: {
    dialog: 'site-dialog bg-surface-card text-on-surface border border-border-prominent shadow-2xl',
    title: 'font-display font-bold text-xl text-text-primary',
    close: 'text-text-secondary hover:text-text-primary hover:bg-surface-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-cyan',
    desc: 'text-text-secondary',
    option: 'border-border-prominent text-text-primary hover:border-accent-cyan hover:bg-surface-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-cyan',
    hint: 'text-text-muted font-mono',
    icon: 'text-accent-cyan',
  },
};

/** Button + native modal <dialog> to pick which CV language to download. */
const CvDialog = ({ buttonClassName, buttonContent, theme = 'light' }) => {
  const c = THEMES[theme];
  const t = useT();
  const { lang } = useLanguage();
  const dialogRef = useRef(null);
  const firstOptionRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  useLightDismiss(dialogRef);

  const open = () => {
    dialogRef.current?.showModal();
    // React only applies autoFocus on mount, so focus the primary option on every open.
    firstOptionRef.current?.focus();
  };

  // Show the CV in the current UI language first.
  const files = [...cvFiles].sort((a, b) => (a.lang === lang ? -1 : b.lang === lang ? 1 : 0));

  return (
    <>
      <button
        type='button'
        onClick={open}
        aria-haspopup='dialog'
        className={buttonClassName}
      >
        {buttonContent ?? <span aria-hidden='true'>CV</span>}
        <span className='sr-only'>{t('cv.open')}</span>
      </button>

      <dialog
        ref={dialogRef}
        // eslint-disable-next-line react/no-unknown-property -- native <dialog closedby>, not yet in React's list
        closedby='any'
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={`app-dialog w-[min(28rem,calc(100vw-2rem))] p-6 ${c.dialog}`}
      >
        <div className='flex items-start justify-between gap-4'>
          <h2 id={titleId} className={c.title}>{t('cv.title')}</h2>
          <form method='dialog'>
            <button
              type='submit'
              aria-label={t('cv.close')}
              className={`w-9 h-9 -mt-1 -mr-1 text-2xl leading-none flex items-center justify-center focus:outline-none ${c.close}`}
            >
              <span aria-hidden='true'>&times;</span>
            </button>
          </form>
        </div>
        <p id={descId} className={`mt-2 text-sm ${c.desc}`}>{t('cv.description')}</p>

        <ul className='mt-5 flex flex-col gap-3'>
          {files.map(({ lang: fileLang, href, file }, i) => (
            <li key={fileLang}>
              <a
                href={href}
                download={file}
                hrefLang={fileLang}
                type='application/pdf'
                ref={i === 0 ? firstOptionRef : undefined}
                className={`group flex items-center justify-between gap-3 border px-4 py-3 font-semibold transition focus:outline-none ${c.option}`}
              >
                <span>
                  {t(`cv.lang_${fileLang}`)}
                  <span className={`block text-xs font-normal ${c.hint}`}>PDF</span>
                </span>
                <span className={c.icon}><DownloadIcon /></span>
              </a>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  )
}

export default CvDialog
