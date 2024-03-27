import React from 'react'
import { Link } from 'react-router-dom';

const InfoBox = ({ text, link, btnText }) => (
    <div className='info-box'>
        <p className='font-medium sm:text-xl text-center'>{text}</p>
        <Link to={link} className='neo-brutalism-white neo-btn'>
            {btnText}
        </Link>
    </div >
)

const renderContent = {
    1: (
        <h1 className='sm:text-xl sm:leading-snug text-center neo-brutalism-blue py-4 px-8 text-white mx-5'>
            Hola, bienvenido! Soy <span className='font-semibold'> Facundo Mozo</span>
            <br />
            y soy Ingeniero de Sistemas <br />

        </h1>
    ),
    2: (
        <InfoBox
            text="Quieres hechar un vistazo a otros proyectos mios?"
            link="/projects"
            btnText="Ver Portfolio"
        />

    ),
    3: (
        <InfoBox 
            text="Tengo 25 años y estoy comenzando mi carrera profesional, te presento mis habilidades:"
            link="/projects"
            btnText="Acerca de mi"
        />
    ),
    4: (
        <InfoBox 
            text="Necesitas un programador? Estamos a un par de clicks de distancia!"
            link="/projects"
            btnText="Hablemos!"
        />
    ),
}



const HomeInfo = ({ currentStage }) => {
    return renderContent[currentStage] || null;

}

export default HomeInfo