import { sanjose, consigna1, AgileFlow2, LernaCourses, exeoLogo, tenlek } from "../assets/images";
import {
    AgileFlowLogo,
    css,
    express,
    git,
    github,
    html,
    javascript,
    linkedin,
    mongodb,
    nextjs,
    nodejs,
    faviconOcularVet,
    LernaLogo,
    oilPump,
    babyIcon,
    react,
    sass,
    tailwindcss,
    typescript,
    angularIcon,
    redux,
    mui,
    glass,
    wildfire
} from "../assets/icons";

export const skills = [
    {
        imageUrl: react,
        name: "React",
        type: "Frontend",
    },

    {
        imageUrl: angularIcon,
        name: "Angular",
        type: "Frontend",
    },
    {
        imageUrl: nodejs,
        name: "Node.js",
        type: "Backend",
    },
    {
        imageUrl: css,
        name: "CSS",
        type: "Frontend",
    },
    {
        imageUrl: express,
        name: "Express",
        type: "Backend",
    },
    {
        imageUrl: git,
        name: "Git",
        type: "Version Control",
    },
    {
        imageUrl: github,
        name: "GitHub",
        type: "Version Control",
    },
    {
        imageUrl: html,
        name: "HTML",
        type: "Frontend",
    },
    {
        imageUrl: javascript,
        name: "JavaScript",
        type: "Frontend",
    },
    {
        imageUrl: mongodb,
        name: "MongoDB",
        type: "Database",
    },
    {
        imageUrl: nextjs,
        name: "Next.js",
        type: "Frontend",
    },
    
    {
        imageUrl: redux,
        name: "Redux",
        type: "State Management",
    },
    {
        imageUrl: mui,
        name: "MUI",
        type: "Frontend",
    },
    {
        imageUrl: sass,
        name: "Sass",
        type: "Frontend",
    },
    {
        imageUrl: tailwindcss,
        name: "Tailwind CSS",
        type: "Frontend",
    },
    {
        imageUrl: typescript,
        name: "TypeScript",
        type: "Frontend",
    }
];

export const experiences = [
    {
    i18nKey: 'experiences.exeo',
    icon: exeoLogo,
    iconBg: "#accbe1",
    },
    {
    i18nKey: 'experiences.teacher',
    icon: sanjose,
    iconBg: "#accbe1",
    },
    {
    i18nKey: 'experiences.internship',
    icon: faviconOcularVet,
    iconBg: "#accbe1",
    },

];

export const socialLinks = [
    {
        name: 'GitHub',
        iconUrl: github,
        link: 'https://github.com/FacuMozo',
    },
    {
        name: 'LinkedIn',
        iconUrl: linkedin,
        link: 'https://www.linkedin.com/in/facundo-mozo/',
    }
];

export const projects = [
    {
    iconUrl: glass,
    theme: 'btn-back-blue',
    i18nKey: 'projects_list.inovaGlass',
    },
    {
    iconUrl: wildfire,
    theme: 'btn-back-orange',
    i18nKey: 'projects_list.wildfire',
    },
    {
    iconUrl: oilPump,
    theme: 'btn-back-blue',
    i18nKey: 'projects_list.oil',
    imageUrl: tenlek,
    },
    {
    iconUrl: babyIcon,
    theme: 'btn-back-red',
    i18nKey: 'projects_list.pregnancyApp',
    },
    {
    iconUrl: faviconOcularVet,
    theme: 'btn-back-pink',
    i18nKey: 'projects_list.ocularVet',
    link: 'https://ocular-vet.exa.unicen.edu.ar/#/auth/login',
    imageUrl: consigna1
    },
    {
    iconUrl: AgileFlowLogo,
    theme: 'btn-back-green',
    i18nKey: 'projects_list.agileFlow',
    link: 'https://agile-flow.vercel.app/login',
    imageUrl: AgileFlow2
    },
    {
    iconUrl: LernaLogo,
    theme: 'btn-back-pink',
    i18nKey: 'projects_list.lernaCourses',
    link: 'https://catalog-front-coral.vercel.app/',
    imageUrl: LernaCourses
    },
    
];

// CV PDFs, served from /public so the URLs stay stable and shareable.
export const cvFiles = [
    { lang: 'es', href: '/cv/CV_Facundo_Mozo_ES.pdf', file: 'CV_Facundo_Mozo_ES.pdf' },
    { lang: 'en', href: '/cv/CV_Facundo_Mozo_EN.pdf', file: 'CV_Facundo_Mozo_EN.pdf' },
];
