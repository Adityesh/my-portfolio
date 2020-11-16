import React from 'react';
import { Github, Linkedin, Youtube } from '../../icons/icons';
import logo from '../../assets/ic_launcher.png'
const Footer = (props) => {
    return (
        <div className="footer-section">
        
        <div className="footer-logo footer-element" onClick={() => props.scroll()} style={{cursor : 'pointer'}}>
            <img src={logo} height={50} width={50}/>
        </div>
        <div className="footer-social footer-element">
            <a href="" target="_blank"><Github /></a>
            <a href="" target="_blank"><Linkedin/></a>
            <a href="" target="_blank"><Youtube/></a>

            
        </div>
        <p className="footer-rights footer-element"> © 2020 Adityesh Mishra</p>
    </div>
    )
};


export default Footer;