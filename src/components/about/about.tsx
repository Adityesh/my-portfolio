import React from 'react';
import './about.css';

interface AboutProps {
  scroll: () => void;
}

interface SkillGroup {
  category: string;
  skills: string[];
}

const skillMatrix: SkillGroup[] = [
  {
    category: '// Backend & Architecture',
    skills: ['C#', 'ASP.NET Core', 'Entity Framework Core', 'REST API design', 'Node.js', 'Express.js', 'OOP'],
  },
  {
    category: '// Frontend Ecosystem',
    skills: [
      'React.js',
      'Next.js',
      'TypeScript',
      'JavaScript (ES6+)',
      'Redux Toolkit',
      'RTK Query',
      'React Query',
      'Micro Frontend',
      'Tailwind CSS',
      'MaterialUI',
      'HTML5',
      'CSS3',
    ],
  },
  {
    category: '// Databases & Storage',
    skills: ['Microsoft SQL Server', 'PostgreSQL', 'MongoDB', 'SQL', 'Sequelize ORM'],
  },
  {
    category: '// Testing & Developer Tools',
    skills: ['Jest', 'React Testing Library', 'Storybook', 'Postman', 'Git', 'GitHub Copilot', 'Claude'],
  },
  {
    category: '// Cloud & DevOps',
    skills: ['Docker', 'Kubernetes', 'Azure', 'Linux', 'CI/CD pipelines'],
  },
];

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
          <span
            onClick={scroll}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scroll();
              }
            }}
            role="button"
            tabIndex={0}
            className="about-link"
          >
            dispatch a message
          </span>.
        </p>

        <div className="skills-matrix">
          {skillMatrix.map((group) => (
            <div className="skill-category" key={group.category}>
              <span className="category-title">{group.category}</span>
              <div className="category-skills">
                {group.skills.map((s) => (
                  <span key={s} className="skill-badge">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
