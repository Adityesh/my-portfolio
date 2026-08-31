import React from 'react';
import './landing.css';
import { ArrowRight, Download, Github, Linkedin } from '../../icons/icons';
import { resume, github, linkedin } from '../../prototype/projects';

interface LandingProps {
  scroll: () => void;
  reference: React.RefObject<HTMLDivElement>;
}

const Landing: React.FC<LandingProps> = ({ scroll, reference }) => {
  return (
    <section className="landing-block" ref={reference} id="whoami">
      <div className="terminal-prompt-line">
        <span className="prompt-host">adityesh@portfolio</span>
        <span className="prompt-symbol">:</span>
        <span className="prompt-path">~</span>
        <span className="prompt-symbol">$</span>
        <span className="prompt-cmd">whoami</span>
        <span className="terminal-cursor"></span>
      </div>

      <div className="hero-output">
        <div className="hero-name-row">
          <h1 className="hero-name">Adityesh Mishra</h1>
          <span className="hero-tag">status: ready to build</span>
        </div>

        <div className="hero-role">&gt; Full Stack Software Engineer</div>

        <p className="hero-bio">
          Crafting scalable web architectures, resilient backend services, and pixel-precise user interfaces. Dedicated to clean code, performant systems, and modern TypeScript &amp; React engineering.
        </p>

        <div className="hero-actions">
          <button className="cli-btn primary" onClick={scroll}>
            ./view-work.sh <ArrowRight />
          </button>
          <button className="cli-btn" onClick={() => window.open(resume, '_blank')}>
            curl resume.pdf <Download />
          </button>
        </div>

        <div className="social-bar">
          <a href={github} target="_blank" rel="noreferrer" className="social-link" title="GitHub">
            <Github />
            <span className="social-full">github.com/Adityesh</span>
            <span className="social-short">GitHub</span>
          </a>
          <a href={linkedin} target="_blank" rel="noreferrer" className="social-link" title="LinkedIn">
            <Linkedin />
            <span className="social-full">linkedin.com/in/adityesh-mishra</span>
            <span className="social-short">LinkedIn</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Landing;
