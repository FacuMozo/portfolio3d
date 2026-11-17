import { sanjose, consigna1, AgileFlow2, LernaCourses, exeoLogo, tenlek, inova1, inova2, journey1, journey2 } from "../assets/images";
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

// `category` drives the filters of the professional site; `stack` its chips (proper nouns, not translated).
// Display copy (name, description) lives in i18n under `i18nKey`.
export const projects = [
    {
    iconUrl: oilPump,
    theme: 'btn-back-blue',
    i18nKey: 'projects_list.oil',
    imageUrl: tenlek,
    imageSize: [1200, 563],
    category: 'realtime',
    featured: true,
    stack: ['React', 'TypeScript', 'Redux', 'ECharts', 'WITSML'],
    },
    {
    iconUrl: glass,
    theme: 'btn-back-blue',
    i18nKey: 'projects_list.inovaGlass',
    // Portrait phone screenshots (demo data), shown side by side.
    screens: [{ src: inova1, size: [540, 1164] }, { src: inova2, size: [540, 1200] }],
    category: 'mobile',
    stack: ['React Native', 'Expo', 'TypeScript', 'PyTorch RF-DETR', 'React Query'],
    },
    {
    iconUrl: babyIcon,
    theme: 'btn-back-red',
    i18nKey: 'projects_list.pregnancyApp',
    screens: [{ src: journey1, size: [540, 960] }, { src: journey2, size: [540, 960] }],
    category: 'mobile',
    stack: ['React Native', 'TypeScript', 'Withings', 'Fitbit'],
    },
    {
    iconUrl: wildfire,
    theme: 'btn-back-orange',
    i18nKey: 'projects_list.wildfire',
    category: 'data',
    stack: ['Python', 'Parquet', 'LightGBM', 'XGBoost', 'Docker'],
    },
    {
    iconUrl: faviconOcularVet,
    theme: 'btn-back-pink',
    i18nKey: 'projects_list.ocularVet',
    link: 'https://ocular-vet.exa.unicen.edu.ar/#/auth/login',
    imageUrl: consigna1,
    imageSize: [1200, 607],
    category: 'web',
    stack: ['Angular', 'Node.js', 'Express', 'MongoDB', 'Docker'],
    },
    {
    iconUrl: AgileFlowLogo,
    theme: 'btn-back-green',
    i18nKey: 'projects_list.agileFlow',
    link: 'https://agile-flow.vercel.app/login',
    imageUrl: AgileFlow2,
    imageSize: [1200, 675],
    category: 'web',
    stack: ['Angular', 'Node.js', 'Express', 'MongoDB'],
    },
    {
    iconUrl: LernaLogo,
    theme: 'btn-back-pink',
    i18nKey: 'projects_list.lernaCourses',
    link: 'https://catalog-front-coral.vercel.app/',
    imageUrl: LernaCourses,
    imageSize: [1160, 1009],
    category: 'web',
    stack: ['React', 'Bootstrap', 'Figma'],
    },
];

// Filter order on the professional site ("all" first).
export const projectCategories = ['all', 'realtime', 'mobile', 'data', 'web'];

// Three expertise columns of the professional site; copy in i18n `site.expertise.<id>`.
export const expertise = [
    { id: 'mobile', icon: 'phone', accent: 'coral', stack: ['React Native', 'Expo', 'Zustand', 'iOS / Android'] },
    { id: 'frontend', icon: 'hub', accent: 'cyan', stack: ['React', 'TypeScript', 'Redux Toolkit', 'ECharts'] },
    { id: 'backend', icon: 'dns', accent: 'violet', stack: ['Spring Boot', 'Node.js', 'Python', 'AWS Cognito'] },
];

export const contactEmail = 'facumozo98@gmail.com';

// CV PDFs, served from /public so the URLs stay stable and shareable.
export const cvFiles = [
    { lang: 'es', href: '/cv/CV_Facundo_Mozo_ES.pdf', file: 'CV_Facundo_Mozo_ES.pdf' },
    { lang: 'en', href: '/cv/CV_Facundo_Mozo_EN.pdf', file: 'CV_Facundo_Mozo_EN.pdf' },
];
