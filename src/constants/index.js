import { meta, shopify, sanjose, consigna1, AgileFlow, AgileFlow2, LernaCourses, exeoLogo } from "../assets/images";
import {
    car,
    AgileFlowLogo,
    contact,
    css,
    estate,
    express,
    git,
    github,
    html,
    javascript,
    linkedin,
    mongodb,
    motion,
    mui,
    nextjs,
    nodejs,
    faviconOcularVet,
    LernaLogo,
    oilPump,
    babyIcon,
    pricewise,
    react,
    redux,
    sass,
    snapgram,
    summiz,
    tailwindcss,
    threads,
    typescript,
    angularIcon
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
    iconUrl: oilPump,
    theme: 'btn-back-blue',
    i18nKey: 'projects_list.oil',
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
