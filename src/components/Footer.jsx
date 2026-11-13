import { socialLinks } from "../constants";
import { useT } from '../i18n/LanguageProvider';

const Footer = () => {
  const t = useT();
  return (
    <footer className='footer font-poppins'>
      <hr className='border-slate-200' />

      <div className='footer-container'>
        <p>
          © {new Date().getFullYear()} <strong>Facundo Mozo</strong>. {t('footer.rights')}
        </p>

        <ul className='flex gap-3 justify-center items-center'>
          {socialLinks.map((link) => (
            <li key={link.name}>
              {/* External URL: a plain <a>, not react-router's <Link> */}
              <a href={link.link} target='_blank' rel='noopener noreferrer'>
                <img src={link.iconUrl} alt={`${link.name} (${t('common.new_tab')})`} className='w-6 h-6 object-contain' />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
