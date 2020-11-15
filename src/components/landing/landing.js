import React from 'react';
import "./landing.css";
import { Download, ArrowRight, GithubContact, LinkedinContact } from '../../icons/icons'
import { resume } from '../../prototype/projects';


const Landing = (props) => {
  

    return (

        <div className="landing-section">
            <div className="hero">
                <h1>HI. I'M ADITYESH</h1>
                <h2>Full Stack Developer</h2>
                <div className="landing-buttons">
                    <button onClick={() => props.scroll()}>View Work <ArrowRight /></button>
                    <button className="resume-btn" onClick={() => window.open(resume, '_blank')}>RESUME <Download /></button>
                </div>
                <div className="landing-contact">
                    
                    <a href="" ><GithubContact /></a>
                    <a href="" ><LinkedinContact /></a>
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