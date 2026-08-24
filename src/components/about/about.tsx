import React from 'react';
import './about.css';

interface AboutProps {
  scroll: () => void;
}

const About: React.FC<AboutProps> = ({ scroll }) => {
  return (
    <section className="about-block" id="about">
      <div className="terminal-prompt-line">
        <span className="prompt-host">adityesh@portfolio</span>
        <span className="prompt-symbol">:</span>
        <span className="prompt-path">~</span>
        <span className="prompt-symbol">$</span>
        <span className="prompt-cmd">cat about.md</span>
      </div>

      <div className="about-output">
        <h2 className="markdown-header">
          <span>## Engineering Philosophy &amp; Background</span>
        </h2>

        <p className="about-text">
          I am a software engineer with a strong foundation in Computer Science &amp; Engineering from CET, Bhubaneswar.
          I specialize in building scalable web applications and resilient backend services, bridging intuitive user interfaces with robust server architectures.
          My development workflow emphasizes clean architecture, modular TypeScript code, and reliable API pipelines.
        </p>

        <p className="about-text" style={{ marginTop: '-6px' }}>
          When I'm not writing code, I explore distributed systems patterns, experiment with developer tooling, and contribute to modern open-source web technologies.
          If you are looking for an engineer to help build high-quality products or solve challenging problems, feel free to{' '}
          <span onClick={scroll} className="about-link">
            dispatch a message
          </span>.
        </p>

        <div className="skills-matrix">
          <div className="skill-category">
            <span className="category-title">// Frontend Ecosystem</span>
            <div className="category-skills">
              {['React 18', 'TypeScript', 'Next.js', 'Redux Toolkit', 'JavaScript (ES6+)', 'HTML5 / CSS3', 'Tailwind CSS'].map((s) => (
                <span key={s} className="skill-badge">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="skill-category">
            <span className="category-title">// Backend &amp; Architecture</span>
            <div className="category-skills">
              {['Node.js', 'Express', 'RESTful APIs', 'JWT Authentication', 'PassportJS', 'Puppeteer'].map((s) => (
                <span key={s} className="skill-badge">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="skill-category">
            <span className="category-title">// Databases &amp; Tooling</span>
            <div className="category-skills">
              {['MongoDB', 'Mongoose', 'Git / GitHub', 'Vite', 'pnpm', 'Linux / Bash', 'Docker Basics'].map((s) => (
                <span key={s} className="skill-badge">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
