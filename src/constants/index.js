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
        title: "Ingeniero en Sistemas",
        company_name: "Exeo Technology",
    icon: exeoLogo,
        iconBg: "#accbe1",
        date: "Sep 2024 - actualidad",
        points: [
            
            "Como Ingeniero Frontend, me encargo del diseño y desarrollo de aplicaciones web y móviles utilizando React y React Native, enfocándome en crear experiencias de usuario (UX) intuitivas y de alto impacto.",
            "Implemento arquitecturas de componentes reutilizables y escalables, gestionando el estado de la aplicación de forma eficiente con herramientas como Redux y Context API para garantizar un rendimiento óptimo.",
            "Traduzco diseños de UI/UX en interfaces funcionales, accesibles y responsivas, manteniendo la consistencia visual y aplicando las mejores prácticas de desarrollo frontend.",
            "Colaboro estrechamente con equipos de backend para integrar APIs RESTful (desarrolladas en Spring Boot y Python), asegurando una comunicación fluida y una funcionalidad robusta en todo el sistema.",
            "Participo activamente en metodologías ágiles, contribuyendo en ceremonias de Scrum, revisiones de código y procesos de CI/CD para entregar valor de forma continua y con altos estándares de calidad."
        ],
    },
    {
        title: "Profesor de Informatica",
        company_name: "Colegio San Jose",
        icon: sanjose,
        iconBg: "#accbe1",
        date: "Agosto 2023 - Diciembre 2023",
        points: [
            "Diseñé y adapté planes de estudio de informática para cinco grupos de 40 estudiantes de primaria, enfocándome en conceptos clave de programación, alfabetización digital y pensamiento computacional.",
            "Fomenté un ambiente de aprendizaje práctico y participativo, guiando a los estudiantes en el uso de herramientas como Office, G-Suite y plataformas de programación visual (Pilas Bloques) para resolver problemas del mundo real.",
            "Desarrollé la curiosidad y el pensamiento crítico de los estudiantes, equipándolos con una base sólida no solo en habilidades técnicas, sino también en la comprensión del impacto y el uso ético de la tecnología.",
            "Evalué el progreso de los estudiantes de manera continua, proporcionando retroalimentación constructiva y personalizada para apoyar su desarrollo individual."
        ],
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
        name: 'Sistema de control de equipos petroleros',
        tecnologias: 'React',
        description: 'Plataforma dedicada al monitoreo, control y registro electrónico de equipos de perforación, well workover y pulling, diseñada para ofrecer datos en tiempo real de forma robusta y confiable, especialmente en entornos industriales del sector energético. Fui responsable del desarrollo de las interfaces web, utilizando React para crear componentes UI reutilizables, visualmente consistentes, responsivos y accesibles. Implementé formularios dinámicos, dashboards informativos y módulos de visualización de datos que reflejan variables críticas del equipo en tiempo real.',
        
    },
    {
    iconUrl: babyIcon,
        theme: 'btn-back-red',
        name: 'App mobile de seguimiento de embarazo',
        tecnologias: 'React Native',
        description: 'Aplicación mobile para el seguimiento integral del embarazo, diseñada para que futuras madres registren diariamente signos vitales y compartan esta información con sus proveedores de salud en tiempo real. Participé de la refactorización completa de la UX/UI e implementación de nuevas funcionalidades, re-implementando pantallas y flujos para mejorar la usabilidad, la consistencia visual y la accesibilidad, adaptando interfaces tanto para Android como para iOS con React Native.',
        
    },
    {
        iconUrl: faviconOcularVet,
        theme: 'btn-back-pink',
        name: 'Ocular Vet',
        tecnologias: 'MEAN Stack (Mongo - Express - Angular - NodeJS)',
        description: 'Aplicación web para el curso de Fisiología de los Sistemas Nervioso y Muscular en la Facultad de Ciencias Veterinarias, donde los estudiantes pueden autoevaluar los reflejos oculares en perros a través de simulaciones basadas en casos de práctica profesional real. La autoevaluación les permite, por un lado, identificar los componentes del arco reflejo al visualizar su funcionamiento normal, y por otro lado, detectar qué estructura está dañada en presencia de un reflejo pupilar alterado.',
        link: 'https://ocular-vet.exa.unicen.edu.ar/#/auth/login',
        imageUrl: consigna1
    },
    {
        iconUrl: AgileFlowLogo,
        theme: 'btn-back-green',
        name: 'Agile Flow',
        tecnologias: 'MEAN Stack (Mongo - Express - Angular - NodeJS)',
        description: 'Plataforma web diseñada para simular las funcionalidades clave de TAIGA, facilitando la gestión eficiente de proyectos en entornos de desarrollo ágil. Ofrece la capacidad de descomponer proyectos en unidades incrementales, permitiendo la especificación y facilitando su implementación, además de posibilitar la asignación de tareas a los miembros del equipo.',
        link: 'https://agile-flow.vercel.app/login',
        imageUrl: AgileFlow2
    },
    {
        iconUrl: LernaLogo,
        theme: 'btn-back-pink',
        name: 'Lerna Courses',
        tecnologias: 'React - Bootstap - Figma',
        description: 'Plataforma web diseñada para simular las funcionalidades de un e-commerce, proyecto realizado con React, Bootstap. Se destaca que es solo la implementacion del apartado frontEnd de la pagina principal.',
        link: 'https://catalog-front-coral.vercel.app/',
        imageUrl: LernaCourses
    },
    
];
