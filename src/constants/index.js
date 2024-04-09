import { meta, shopify, sanjose, tesla,consigna1 } from "../assets/images";
import {
    car,
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
    pricewise,
    react,
    redux,
    sass,
    snapgram,
    summiz,
    tailwindcss,
    threads,
    typescript
} from "../assets/icons";

export const skills = [
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
        imageUrl: nodejs,
        name: "Node.js",
        type: "Backend",
    },
    {
        imageUrl: react,
        name: "React",
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
        title: "Profesor de Informatica",
        company_name: "Colegio San Jose",
        icon: sanjose,
        iconBg: "#accbe1",
        date: "Agosto 2023 - Diciembre 2023",
        points: [
            "Como maestro sustituto de informática en una escuela primaria, impartí clases a cinco grupos de 40 estudiantes cada uno, centrándome en conceptos esenciales de programación, conceptos informáticos, comprensión del alcance de la tecnología y aplicaciones prácticas.",
            " Más allá de la teoría, guié a los estudiantes a través de ejercicios prácticos con herramientas como Office, Gmail, Classroom, Canva y Pilas Bloques (programación), haciendo hincapié en su uso práctico",
            "Mi objetivo era equipar a las mentes jóvenes no solo con habilidades técnicas, sino también con una comprensión integral del papel de la tecnología en nuestro mundo.",
            
        ],
    },   
    
];

export const socialLinks = [
    {
        name: 'Contact',
        iconUrl: contact,
        link: '/contact',
    },
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
        iconUrl: faviconOcularVet,
        theme: 'btn-back-pink',
        name: 'Ocular Vet',
        description: 'Aplicación web para el curso de Fisiología de los Sistemas Nervioso y Muscular en la Facultad de Ciencias Veterinarias, donde los estudiantes pueden autoevaluar los reflejos oculares en perros a través de simulaciones basadas en casos de práctica profesional real. La autoevaluación les permite, por un lado, identificar los componentes del arco reflejo al visualizar su funcionamiento normal, y por otro lado, detectar qué estructura está dañada en presencia de un reflejo pupilar alterado.',
        link: 'https://ocular-vet.exa.unicen.edu.ar/#/auth/login',
        imageUrl: consigna1
    },
    {
        iconUrl: threads,
        theme: 'btn-back-green',
        name: 'Full Stack Threads Clone',
        description: 'Created a full-stack replica of the popular discussion platform "Threads," enabling users to post and engage in threaded conversations.',
        link: 'https://github.com/adrianhajdin/threads',
    },
    {
        iconUrl: car,
        theme: 'btn-back-blue',
        name: 'Car Finding App',
        description: 'Designed and built a mobile app for finding and comparing cars on the market, streamlining the car-buying process.',
        link: 'https://github.com/adrianhajdin/project_next13_car_showcase',
    },
    {
        iconUrl: snapgram,
        theme: 'btn-back-pink',
        name: 'Full Stack Instagram Clone',
        description: 'Built a complete clone of Instagram, allowing users to share photos and connect with friends in a familiar social media environment.',
        link: 'https://github.com/adrianhajdin/social_media_app',
    },
    {
        iconUrl: estate,
        theme: 'btn-back-black',
        name: 'Real-Estate Application',
        description: 'Developed a web application for real estate listings, facilitating property searches and connecting buyers with sellers.',
        link: 'https://github.com/adrianhajdin/projects_realestate',
    },
    {
        iconUrl: summiz,
        theme: 'btn-back-yellow',
        name: 'AI Summarizer Application',
        description: 'App that leverages AI to automatically generate concise & informative summaries from lengthy text content, or blogs.',
        link: 'https://github.com/adrianhajdin/project_ai_summarizer',
    }
];