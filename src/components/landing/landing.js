import React from 'react';
import "./landing.css";
import { Download, ArrowRight, GithubContact, LinkedinContact } from '../../icons/icons'
import { resume, github, linkedin } from '../../prototype/projects';


const Landing = (props) => {
  

    return (

        <div className="landing-section" ref={props.reference}>
            <div className="hero">
                <h1>HI. I'M ADITYESH</h1>
                <h2>Full Stack Developer</h2>
                <div className="landing-buttons">
                    <button onClick={() => props.scroll()}>View Work <ArrowRight /></button>
                    <button className="resume-btn" onClick={() => window.open(resume, '_blank')}>Resume <Download /></button>
                </div>
                <div className="landing-contact">
                    
                    <a href={github} target="_blank"><GithubContact /></a>
                    <a href={linkedin} target="_blank"><LinkedinContact /></a>
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