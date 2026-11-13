import { useT } from '../i18n/LanguageProvider'

// role="alert" for errors (assertive) and role="status" for success (polite),
// so screen readers announce the AJAX result without stealing focus.
const Alert = ({ text, type }) => {
  const t = useT();
  const isError = type === 'danger';
  return (
    <div className='absolute top-10 left-0 right-0 flex justify-center items-center'>
      <div
        role={isError ? 'alert' : 'status'}
        className={`${isError ? 'bg-red-800' : 'bg-blue-800'} p-2 text-indigo-100 leading-none lg:rounded-full flex lg:inline-flex items-center`}
      >
        <p className={`${isError ? 'bg-red-500' : 'bg-blue-500'} rounded-full flex uppercase px-2 py-1 font-semibold mr-3 text-xs`}>
          {isError ? t('alert.error') : t('alert.success')}
        </p>
        <p className='mr-2 text-left'>{text}</p>
      </div>
    </div>
  )
}

export default Alert
