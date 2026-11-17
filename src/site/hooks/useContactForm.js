import { useCallback, useState } from 'react'
import { contactEmail } from '../../constants'

const EMPTY_FORM = { name: '', email: '', message: '' };

const env = import.meta.env;

/**
 * Contact form state + EmailJS submission (logic moved from the old /contact page).
 * The EmailJS SDK is imported on submit only, so it never weighs on the initial load.
 * status: 'idle' | 'sending' | 'success' | 'error'
 * `send` is injectable for tests.
 */
const useContactForm = ({ send } = {}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle');

  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setStatus((s) => (s === 'sending' ? s : 'idle'));
  }, []);

  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const sendEmail = send ?? (await import('@emailjs/browser')).default.send;
      await sendEmail(
        env.VITE_APP_EMAILJS_SERVICE_ID,
        env.VITE_APP_EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          to_name: 'Facundo',
          from_email: form.email,
          to_email: contactEmail,
          message: form.message,
        },
        { publicKey: env.VITE_APP_EMAILJS_PUBLIC_KEY },
      );
      setForm(EMPTY_FORM);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  }, [form, send]);

  return { form, status, onChange, onSubmit };
};

export default useContactForm
