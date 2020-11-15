import React from 'react';
import './about.css'
const About = (props) => {
    return(
        <div className="about-section">
            <h1 className="about-header">About Me</h1>
            <p className="about-content">
                I am full stack developer/student in my final year of Bachelor in Technology (C.S.E). 
                I enjoy building everything from small business sites to rich interactive mobile and web apps and everything in between.
                If you are a business seeking a web presence or an employer looking to hire, you can get in touch with me <span onClick={() => props.scroll()} className="contact-link">here.</span> 
            </p>
            
        </div>
    )
}

export default About;