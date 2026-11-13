import { useEffect } from 'react'

// Pointer outside the dialog box?
const isOutside = (e, dialog) => {
  const r = dialog.getBoundingClientRect();
  return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
};

/**
 * Light-dismiss fallback for modal <dialog closedby="any"> in browsers that
 * don't support `closedby` yet (e.g. Safari): a click that starts and ends on
 * the backdrop closes the dialog. No-op where `closedby` is native.
 */
const useLightDismiss = (dialogRef) => {
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;
    let pressedOutside = false;
    const onDown = (e) => { pressedOutside = isOutside(e, dialog); };
    const onUp = (e) => { if (pressedOutside && isOutside(e, dialog)) dialog.close(); };
    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);
    return () => {
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, [dialogRef]);
};

export default useLightDismiss
