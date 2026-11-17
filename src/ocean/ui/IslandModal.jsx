import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ISLANDS } from '../config'
import { closeIsland, input, useUi } from '../store'
import { useT } from '../../i18n/LanguageProvider'
import useLightDismiss from '../../hooks/useLightDismiss'
import { AboutIsland, CvContent, FortContent, HelpContent, ProjectsIsland } from './IslandContent'

const CONTENT = {
  help: HelpContent,
  about: AboutIsland,
  projects: ProjectsIsland,
  cv: CvContent,
  fort: FortContent,
};
const WIDE = new Set(['about', 'projects']);

/** One native modal <dialog> showing whichever island the player docked at. */
const IslandModal = () => {
  const t = useT();
  const openId = useUi((s) => s.openIsland);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const bodyRef = useRef(null);
  const titleId = useId();

  // Keep the last island rendered while the dialog plays its exit transition.
  const [shownId, setShownId] = useState(openId);
  if (openId && openId !== shownId) setShownId(openId);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openId && !dialog.open) {
      // Drop held keys so the ship doesn't keep sailing behind the modal.
      Object.keys(input).forEach((k) => { input[k] = typeof input[k] === 'number' ? 0 : false; });
      dialog.showModal();
      if (bodyRef.current) bodyRef.current.scrollTop = 0;
      closeRef.current?.focus();
    } else if (!openId && dialog.open) {
      dialog.close();
    }
  }, [openId]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const onClose = () => closeIsland();
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, []);

  useLightDismiss(dialogRef);

  const island = ISLANDS.find((i) => i.id === shownId);
  const Content = CONTENT[shownId];

  return (
    <dialog
      ref={dialogRef}
      // eslint-disable-next-line react/no-unknown-property -- native <dialog closedby>, not yet in React's list
      closedby='any'
      aria-labelledby={titleId}
      className={`scroll-dialog w-[min(var(--w),calc(100vw-2.5rem))] ${WIDE.has(shownId) ? '[--w:56rem]' : '[--w:36rem]'}`}
    >
      {island && (
        // A parchment scroll: the bottom rod rolls down revealing the paper (see .scroll-dialog in index.css).
        <div className='scroll-wrap'>
          <span aria-hidden='true' className='scroll-rod scroll-rod--top' />
          {/* Only the body scrolls; header and footer stay put on the paper. */}
          <div className='scroll-paper flex flex-col max-h-[calc(88dvh-2.75rem)]'>
            <header className='shrink-0 flex items-center justify-between gap-4 px-5 sm:px-8 pt-5 pb-4 border-b-2' style={{ borderColor: island.color }}>
              <h2 id={titleId} className='font-poppins font-semibold text-xl sm:text-2xl text-[#3b2a14] flex items-center gap-2'>
                <span aria-hidden='true'>{t(`ocean.islands.${island.id}.icon`)}</span>
                {t(`ocean.islands.${island.id}.title`)}
              </h2>
              <form method='dialog'>
                <button
                  ref={closeRef}
                  type='submit'
                  aria-label={t('ocean.modal.close')}
                  className='w-10 h-10 rounded-full text-[#6b4a22] text-2xl leading-none flex items-center justify-center hover:bg-[#e8d4a6] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#8a4b0f]'
                >
                  <span aria-hidden='true'>&times;</span>
                </button>
              </form>
            </header>

            <div ref={bodyRef} className='modal-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-8 py-6'>
              {Content && <Content />}
            </div>

            {island.page && (
              <footer className='shrink-0 border-t border-[#d8c08f] px-5 sm:px-8 py-4 flex justify-end'>
                <Link to={island.page} className='font-semibold text-[#8a4b0f] hover:underline'>
                  {t(`ocean.islands.${island.id}.page_link`)} →
                </Link>
              </footer>
            )}
          </div>
          <span aria-hidden='true' className='scroll-rod scroll-rod--bottom' />
        </div>
      )}
    </dialog>
  );
};

export default IslandModal
