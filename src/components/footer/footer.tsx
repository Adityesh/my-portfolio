import React from 'react';
import './footer.css';

interface FooterProps {
  scroll: () => void;
}

const Footer: React.FC<FooterProps> = ({ scroll }) => {
  return (
    <footer className="terminal-footer">
      <div className="footer-left">
        <span className="mode-badge">NORMAL</span>
        <span className="footer-branch">git:(main ⚡)</span>
        <span className="footer-meta footer-hide-mobile">utf-8</span>
      </div>

      <div className="footer-right">
        <span className="footer-copyright">© {new Date().getFullYear()} Adityesh Mishra</span>
        <button className="back-to-top-btn" onClick={scroll} title="Scroll to Top">
          ▲ top
        </button>
      </div>
    </footer>
  );
};

export default Footer;
