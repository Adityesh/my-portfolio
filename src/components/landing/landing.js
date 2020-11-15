import React from 'react';
import "./landing.css";
import { Download, ArrowRight } from '../../icons/icons'
import { resume } from '../../prototype/projects';


const Landing = () => {
  

    return (

        <div className="landing-section">
            <div className="hero">
                <h1>HI. I'M ADITYESH</h1>
                <h2>I'm a full stack developer.</h2>
                <div className="landing-buttons">
                    <button>View Work <ArrowRight /></button>
                    <button className="resume-btn" onClick={() => window.open(resume, '_blank')}>RESUME <Download /></button>
                </div>
            </div>

            <div className="lines">
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>

            </div>
            

        </div>

    )
}

export default Landing;