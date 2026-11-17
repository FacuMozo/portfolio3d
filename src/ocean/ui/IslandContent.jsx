import { useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AboutContent from '../../components/sections/AboutContent'
import ProjectsContent from '../../components/sections/ProjectsContent'
import { cvFiles, socialLinks } from '../../constants'
import { useLanguage, useT } from '../../i18n/LanguageProvider'
import { RACE_DIFFICULTY } from '../config'
import { readBestTimes, startCombat, startRace } from '../store'
import { formatTime } from './format'

const cardLink = 'group flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-black-500 transition hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400';

const Kbd = ({ children }) => (
  <kbd className='inline-flex min-w-7 h-7 items-center justify-center rounded-md border border-slate-300 bg-slate-50 px-1.5 font-mono text-xs font-semibold text-slate-700 shadow-[0_2px_0_#cbd5e1]'>
    {children}
  </kbd>
);

const HelpContent = () => {
  const t = useT();
  const rows = [
    { keys: ['W', 'A', 'S', 'D'], alt: ['↑', '←', '↓', '→'], label: t('ocean.help.move') },
    { keys: [t('ocean.help.space')], label: t('ocean.help.fire') },
    { keys: ['E'], alt: ['Enter', t('ocean.help.space')], label: t('ocean.help.dock') },
    { keys: ['Esc'], label: t('ocean.help.close') },
  ];
  return (
    <div className='flex flex-col gap-6 text-slate-700'>
      <p className='text-pretty'>{t('ocean.help.intro')}</p>

      <section>
        <h3 className='font-poppins font-semibold text-lg text-black-500'>{t('ocean.help.keyboard_title')}</h3>
        <ul className='mt-3 flex flex-col gap-3'>
          {rows.map((row) => (
            <li key={row.label} className='flex flex-wrap items-center gap-x-3 gap-y-1'>
              <span className='flex flex-wrap items-center gap-1'>
                {row.keys.map((k) => <Kbd key={k}>{k}</Kbd>)}
                {row.alt && <span className='mx-1 text-slate-400 text-sm'>/</span>}
                {row.alt?.map((k) => <Kbd key={k}>{k}</Kbd>)}
              </span>
              <span>{row.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className='font-poppins font-semibold text-lg text-black-500'>{t('ocean.help.touch_title')}</h3>
        <p className='mt-2 text-pretty'>{t('ocean.help.touch')}</p>
      </section>

      <section>
        <h3 className='font-poppins font-semibold text-lg text-black-500'>{t('ocean.help.islands_title')}</h3>
        <p className='mt-2 text-pretty'>{t('ocean.help.islands')}</p>
      </section>

      <section>
        <h3 className='font-poppins font-semibold text-lg text-black-500'>{t('ocean.help.combat_title')}</h3>
        <p className='mt-2 text-pretty'>{t('ocean.help.combat')}</p>
      </section>

      <section>
        <h3 className='font-poppins font-semibold text-lg text-black-500'>{t('ocean.help.race_title')}</h3>
        <p className='mt-2 text-pretty'>{t('ocean.help.race')}</p>
      </section>

      <section>
        <h3 className='font-poppins font-semibold text-lg text-black-500'>{t('ocean.help.menu_title')}</h3>
        <p className='mt-2 text-pretty'>{t('ocean.help.menu')}</p>
      </section>

      <p className='text-sm text-slate-500'>
        {t('ocean.help.classic')} <Link to='/' className='text-blue-500 font-semibold hover:underline'>{t('site.ocean.back')}</Link>
      </p>
    </div>
  );
};

const CvContent = () => {
  const t = useT();
  const { lang } = useLanguage();
  const files = [...cvFiles].sort((a, b) => (a.lang === lang ? -1 : b.lang === lang ? 1 : 0));
  return (
    <div className='flex flex-col gap-6'>
      <p className='text-slate-700 text-pretty'>{t('ocean.cv.intro')}</p>

      <section>
        <h3 className='font-poppins font-semibold text-lg text-black-500'>{t('cv.title')}</h3>
        <ul className='mt-3 grid gap-3 sm:grid-cols-2'>
          {files.map(({ lang: fileLang, href, file }) => (
            <li key={fileLang}>
              <a href={href} download={file} hrefLang={fileLang} type='application/pdf' className={cardLink}>
                <span>
                  {t(`cv.lang_${fileLang}`)}
                  <span className='block text-xs font-normal text-slate-500'>PDF</span>
                </span>
                <span aria-hidden='true' className='text-blue-500 text-xl'>⤓</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className='font-poppins font-semibold text-lg text-black-500'>{t('ocean.cv.links_title')}</h3>
        <ul className='mt-3 grid gap-3 sm:grid-cols-2'>
          {socialLinks.map((link) => (
            <li key={link.name}>
              <a href={link.link} target='_blank' rel='noopener noreferrer' className={cardLink}>
                <span className='flex items-center gap-3'>
                  <img src={link.iconUrl} alt='' className='w-6 h-6 object-contain' />
                  {link.name}
                  <span className='sr-only'> ({t('common.new_tab')})</span>
                </span>
                <span aria-hidden='true' className='text-blue-500'>↗</span>
              </a>
            </li>
          ))}
          <li>
            <Link to='/#contact' className={cardLink}>
              <span className='flex items-center gap-3'>
                <span aria-hidden='true' className='text-xl'>✉️</span>
                {t('ocean.cv.contact')}
              </span>
              <span aria-hidden='true' className='text-blue-500'>→</span>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
};

const GAME_TABS = ['combat', 'race'];

/** Game island: "Combat" / "Race" tabs (WAI-ARIA tabs, selection follows focus). */
const FortContent = () => {
  const t = useT();
  const [tab, setTab] = useState('combat');
  const [best] = useState(readBestTimes);
  const tabRefs = useRef({});
  const baseId = useId();
  const tabId = (id) => `${baseId}-tab-${id}`;
  const panelId = (id) => `${baseId}-panel-${id}`;

  const select = (id) => {
    setTab(id);
    tabRefs.current[id]?.focus();
  };
  const onKeyDown = (e) => {
    const i = GAME_TABS.indexOf(tab);
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: GAME_TABS.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(GAME_TABS[(next + GAME_TABS.length) % GAME_TABS.length]);
  };

  return (
    <div className='flex flex-col gap-5 text-slate-700'>
      <div role='tablist' aria-label={t('ocean.menu.modes')} onKeyDown={onKeyDown} className='flex gap-1 border-b border-[#d8c08f]'>
        {GAME_TABS.map((id) => (
          <button
            key={id}
            ref={(el) => { tabRefs.current[id] = el; }}
            type='button'
            role='tab'
            id={tabId(id)}
            aria-selected={tab === id}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => select(id)}
            className='game-tab relative px-4 py-2 font-poppins font-semibold text-[#6b4a22] aria-selected:text-[#3b2a14] hover:text-[#3b2a14] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#8a4b0f] rounded-t-lg'
          >
            <span aria-hidden='true' className='mr-1.5'>{id === 'combat' ? '⚔️' : '🏁'}</span>
            {t(`ocean.menu.${id}`)}
          </button>
        ))}
      </div>

      <div role='tabpanel' id={panelId('combat')} aria-labelledby={tabId('combat')} hidden={tab !== 'combat'}>
        <div className='flex flex-col gap-5'>
          <p className='text-pretty'>{t('ocean.fort.intro')}</p>
          <ul className='list-disc ml-5 space-y-1'>
            <li>{t('ocean.fort.rule_waves')}</li>
            <li>{t('ocean.fort.rule_fire')}</li>
            <li>{t('ocean.fort.rule_hp')}</li>
          </ul>
          <button type='button' onClick={startCombat} className='btn !w-full sm:!w-auto self-start text-base'>
            {t('ocean.fort.start')}
          </button>
        </div>
      </div>

      <div role='tabpanel' id={panelId('race')} aria-labelledby={tabId('race')} hidden={tab !== 'race'}>
        <div className='flex flex-col gap-5'>
          <p className='text-pretty'>{t('ocean.help.race')}</p>
          <p className='font-poppins font-semibold text-[#3b2a14]'>{t('ocean.fort.race_pick')}</p>
          <ul className='grid gap-3 sm:grid-cols-3'>
            {Object.keys(RACE_DIFFICULTY).map((d) => (
              <li key={d}>
                <button type='button' onClick={() => startRace(d)} className={`${cardLink} !items-start w-full text-left`}>
                  <span>
                    🏁 {t(`ocean.menu.difficulty.${d}`)}
                    <span className='block text-xs font-normal text-slate-600'>{t(`ocean.menu.difficulty.${d}_desc`)}</span>
                    {best[d] != null && (
                      <span className='block mt-1 text-xs font-mono text-amber-800' title={t('ocean.race.best')}>🏆 {formatTime(best[d])}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export const AboutIsland = () => <AboutContent animate={false} />;
export const ProjectsIsland = () => <ProjectsContent compact />;
export { HelpContent, CvContent, FortContent };
