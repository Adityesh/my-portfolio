import React from 'react';
import "./landing.css";
import {Download, ArrowRight} from '../../icons/icons'

const ParticleContainer = React.lazy(() => import('../particles/ParticleContainer'))
const Landing = () => {
    return (
        
        <div className="landing-section">
            <h1>HI. I'M ADITYESH</h1>
            <h2>I'm a full stack developer</h2>
            <div className="landing-buttons">
                <button>View my work <ArrowRight /></button>
                <button>Resume <Download /></button>
            </div>
            
            
        </div>

    )
}

export default Landing;