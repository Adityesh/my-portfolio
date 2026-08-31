import React from 'react';
import { resume } from '../../prototype/projects';
import { Download } from '../../icons/icons';

interface TerminalNavbarProps {
  onNavClick: (section: 'landing' | 'about' | 'projects' | 'contact') => void;
  activeSection: string;
}

export const TerminalNavbar: React.FC<TerminalNavbarProps> = ({ onNavClick, activeSection }) => {
  return (
    <nav className="terminal-nav" aria-label="Terminal Navigation">
      <div className="terminal-tabs">
        <button
          className={`nav-tab ${activeSection === 'landing' ? 'active' : ''}`}
          onClick={() => onNavClick('landing')}
        >
          <span className="num">1:</span>
          <span className="tab-label-full">~/whoami</span>
          <span className="tab-label-short">~</span>
        </button>
        <button
          className={`nav-tab ${activeSection === 'about' ? 'active' : ''}`}
          onClick={() => onNavClick('about')}
        >
          <span className="num">2:</span>
          <span className="tab-label-full">~/about.md</span>
          <span className="tab-label-short">about</span>
        </button>
        <button
          className={`nav-tab ${activeSection === 'projects' ? 'active' : ''}`}
          onClick={() => onNavClick('projects')}
        >
          <span className="num">3:</span>
          <span className="tab-label-full">~/projects/</span>
          <span className="tab-label-short">work</span>
        </button>
        <button
          className={`nav-tab ${activeSection === 'contact' ? 'active' : ''}`}
          onClick={() => onNavClick('contact')}
        >
          <span className="num">4:</span>
          <span className="tab-label-full">~/contact.sh</span>
          <span className="tab-label-short">contact</span>
        </button>
      </div>

      <a
        href={resume}
        target="_blank"
        rel="noopener noreferrer"
        className="nav-resume-btn"
        title="Open Resume"
      >
        <Download />
        <span className="tab-label-full">resume.pdf</span>
        <span className="tab-label-short">cv</span>
      </a>
    </nav>
  );
};

export default TerminalNavbar;
