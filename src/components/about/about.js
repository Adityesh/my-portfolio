import React from 'react';
import './about.css'
const About = (props) => {
    return(
        <div className="about-section">
            <div classNam="about-content">
                <h1 className="about-header">About Me</h1>
                <p className="about-content">
                    I am an undergraduate in my final year doing my Bachelor in Technology (C.S.E) from C.E.T, Bhubaneswar, Odisha. 
                    I enjoy building everything from small business sites to rich interactive mobile and web apps and everything in between.
                    If you are a business seeking a web presence or an employer looking to hire, you can get in touch with me <span onClick={() => props.scroll()} className="contact-link">here.</span> 
                </p>
            </div>
            
        </div>
    )
}

export default About;