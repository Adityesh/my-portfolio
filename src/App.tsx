import './App.css';
import { useState, useRef, useEffect } from 'react';
import { SnackbarProvider } from './components/common/Snackbar';
import TerminalNavbar from './components/navbar/TerminalNavbar';
import Landing from './components/landing/landing';
import About from './components/about/about';
import Project from './components/project/projectSection';
import Contact from './components/contact/contact';
import Footer from './components/footer/footer';

function App() {
  const landingRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const [activeSection, setActiveSection] = useState<'landing' | 'about' | 'projects' | 'contact'>('landing');
  const [isClosed, setIsClosed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const scrollToSection = (section: 'landing' | 'about' | 'projects' | 'contact') => {
    setActiveSection(section);
    const refMap = {
      landing: landingRef,
      about: aboutRef,
      projects: projectRef,
      contact: contactRef,
    };
    refMap[section].current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      if (contactRef.current && scrollPos >= contactRef.current.offsetTop) {
        setActiveSection('contact');
      } else if (projectRef.current && scrollPos >= projectRef.current.offsetTop) {
        setActiveSection('projects');
      } else if (aboutRef.current && scrollPos >= aboutRef.current.offsetTop) {
        setActiveSection('about');
      } else {
        setActiveSection('landing');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClose = () => {
    setIsClosed(true);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const handleMaximize = () => {
    setIsMaximized((prev) => !prev);
    setIsMinimized(false);
  };

  const handleReconnect = () => {
    setIsClosed(false);
    setIsMinimized(false);
  };

  return (
    <SnackbarProvider>
      <div className="terminal-app">
        <main className={`terminal-window ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized' : ''}`}>
          {/* Terminal Window Header */}
          <header className="terminal-header">
            <div className="terminal-controls">
              {/* Close (Red) */}
              <button
                className="control-dot-btn"
                onClick={handleClose}
                title="Close Session"
                aria-label="Close Terminal"
              >
                <span className="control-dot close">
                  <svg viewBox="0 0 10 10">
                    <line x1="2" y1="2" x2="8" y2="8" />
                    <line x1="8" y1="2" x2="2" y2="8" />
                  </svg>
                </span>
              </button>

              {/* Minimize (Yellow) */}
              <button
                className="control-dot-btn"
                onClick={handleMinimize}
                title={isMinimized ? "Restore Terminal" : "Minimize Terminal"}
                aria-label="Minimize Terminal"
              >
                <span className="control-dot minimize">
                  <svg viewBox="0 0 10 10">
                    <line x1="2" y1="5" x2="8" y2="5" />
                  </svg>
                </span>
              </button>

              {/* Maximize (Green) */}
              <button
                className="control-dot-btn"
                onClick={handleMaximize}
                title={isMaximized ? "Restore Size" : "Maximize Window"}
                aria-label="Maximize Terminal"
              >
                <span className="control-dot maximize">
                  {isMaximized ? (
                    <svg viewBox="0 0 10 10">
                      <polyline points="2,5 5,5 5,2" />
                      <polyline points="8,5 5,5 5,8" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 10 10">
                      <polyline points="6,2 8,2 8,4" />
                      <polyline points="4,8 2,8 2,6" />
                      <line x1="2" y1="8" x2="8" y2="2" />
                    </svg>
                  )}
                </span>
              </button>
            </div>

            <div className="terminal-title">
              <span className="title-full">adityesh@workstation: ~/portfolio</span>
              <span className="title-short">~/portfolio</span>
              <span className="branch">(main ⚡)</span>
            </div>

            <div className="terminal-status-badge">
              <span className="status-pulse"></span>
              <span className="status-text">{isClosed ? 'disconnected' : isMinimized ? 'minimized' : 'online'}</span>
            </div>
          </header>

          {isClosed ? (
            /* Terminal Closed Screen */
            <div className="terminal-closed-screen">
              <div className="closed-prompt">
                <span className="prompt-host">adityesh@portfolio</span>
                <span className="prompt-symbol">:</span>
                <span className="prompt-path">~</span>
                <span className="prompt-symbol">$</span> exit
              </div>
              <p className="closed-text">
                [Process completed - session terminated]. The terminal connection has been closed.
              </p>
              <button className="reconnect-btn" onClick={handleReconnect}>
                ↻ Reconnect / Start New Session
              </button>
            </div>
          ) : isMinimized ? (
            /* Minimized Hint */
            <div className="terminal-minimized-hint" onClick={handleMinimize} title="Click to expand">
              <span>[▾ Terminal Minimized — Click to Restore Session]</span>
            </div>
          ) : (
            /* Standard Terminal Window Content */
            <>
              {/* Navigation Tab Bar */}
              <TerminalNavbar onNavClick={scrollToSection} activeSection={activeSection} />

              {/* Terminal Content Body */}
              <div className="terminal-body">
                <Landing scroll={() => scrollToSection('projects')} reference={landingRef} />
                
                <div className="section-divider" ref={aboutRef}></div>
                <About scroll={() => scrollToSection('contact')} />

                <div className="section-divider"></div>
                <Project reference={projectRef} />

                <div className="section-divider"></div>
                <Contact reference={contactRef} />
              </div>

              {/* Terminal Footer Statusline */}
              <Footer scroll={() => scrollToSection('landing')} />
            </>
          )}
        </main>
      </div>
    </SnackbarProvider>
  );
}

export default App;
