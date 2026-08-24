import React from 'react';
import { projects } from '../../prototype/projects';
import ProjectCard from './projectCard';
import './project.css';

interface ProjectSectionProps {
  reference: React.RefObject<HTMLDivElement>;
}

const Project: React.FC<ProjectSectionProps> = ({ reference }) => {
  return (
    <section className="projects-block" ref={reference} id="projects">
      <div className="terminal-prompt-line">
        <span className="prompt-host">adityesh@portfolio</span>
        <span className="prompt-symbol">:</span>
        <span className="prompt-path">~</span>
        <span className="prompt-symbol">$</span>
        <span className="prompt-cmd">ls -la ./projects/</span>
      </div>

      <h2 className="projects-meta">
        <span>total {projects.length} repositories — all systems operational</span>
      </h2>

      <div className="projects-grid">
        {projects.map((project, index) => (
          <ProjectCard key={project.title} project={project} index={index} />
        ))}
      </div>
    </section>
  );
};

export default Project;
