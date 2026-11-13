import { useCallback, useEffect, useRef, useState } from 'react'

const HIDDEN = { show: false, text: '', type: 'danger' };

// Shows an alert and hides it automatically after `duration` ms.
// The timer is cleared on unmount and when a new alert replaces the current one.
const useAlert = () => {
  const [alert, setAlert] = useState(HIDDEN);
  const timer = useRef();

  const hideAlert = useCallback(() => {
    clearTimeout(timer.current);
    setAlert(HIDDEN);
  }, []);

  const showAlert = useCallback(({ text, type = 'danger', duration = 4000 }) => {
    clearTimeout(timer.current);
    setAlert({ show: true, text, type });
    timer.current = setTimeout(() => setAlert(HIDDEN), duration);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { alert, showAlert, hideAlert };
}

export default useAlert
