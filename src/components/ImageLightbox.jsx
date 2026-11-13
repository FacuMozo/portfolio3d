import { useEffect, useId, useRef, useState } from 'react'
import { useT } from '../i18n/LanguageProvider'
import useLightDismiss from '../hooks/useLightDismiss'

/**
 * Native modal <dialog> showing a full, uncropped image.
 * `image` ({ src, alt, caption }) opens it; `onClose` fires once it has closed
 * (Esc, backdrop click, or the close button).
 */
const ImageLightbox = ({ image, onClose }) => {
  const t = useT();
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const captionId = useId();

  // Keep the last image rendered while the dialog plays its exit transition.
  const [shown, setShown] = useState(image);
  if (image && image !== shown) setShown(image);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!image || !dialog || dialog.open) return;
    dialog.showModal();
    // React handles `autoFocus` itself on mount (not via the native attribute),
    // so move focus to the close button explicitly each time the modal opens.
    closeRef.current?.focus();
  }, [image]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose?.();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  useLightDismiss(dialogRef);

  return (
    <dialog
      ref={dialogRef}
      // eslint-disable-next-line react/no-unknown-property -- native <dialog closedby>, not yet in React's list
      closedby='any'
      aria-labelledby={captionId}
      className='app-dialog bg-transparent p-0 max-w-[95vw] max-h-[90dvh]'
    >
      {shown && (
        <figure className='relative flex flex-col items-center gap-3'>
          <form method='dialog' className='absolute top-2 right-2 z-10'>
            <button
              ref={closeRef}
              type='submit'
              aria-label={t('lightbox.close')}
              className='w-10 h-10 rounded-full bg-white text-slate-900 text-2xl leading-none shadow-lg flex items-center justify-center hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400'
            >
              <span aria-hidden='true'>&times;</span>
            </button>
          </form>
          <img
            src={shown.src}
            alt={shown.alt}
            decoding='async'
            className='block w-auto h-auto max-w-[95vw] max-h-[calc(90dvh-4rem)] object-contain rounded-lg bg-white'
          />
          <figcaption id={captionId} className='text-white font-poppins font-semibold text-center px-2'>
            {shown.caption}
          </figcaption>
        </figure>
      )}
    </dialog>
  )
}

export default ImageLightbox
