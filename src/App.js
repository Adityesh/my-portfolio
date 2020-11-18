import './App.css';
import React, {lazy, Suspense, useState, useRef} from 'react';
import { ThemeProvider } from './context/ThemeContext';
import SnackbarProvider from 'react-simple-snackbar'

const Landing = lazy(() => import('./components/landing/landing'));
const About = lazy(() => import('./components/about/about'));
const Project = lazy(() => import('./components/project/projectSection'));
const Contact = lazy(() => import('./components/contact/contact'));
const Footer = lazy(() => import('./components/footer/footer'));
const LoaderBalls = lazy(() => import('./components/loader/loaderBalls'));
function App() {
  const myRef = useRef(null);
  const myRef2 = useRef(null);
  const myRef3 = useRef(null);
  const [isDark, setDark] = useState(false);
  const scrollToProject = () => myRef.current.scrollIntoView();
  const scrollToContact = () => myRef2.current.scrollIntoView();
  const scrollToLanding = () => myRef3.current.scrollIntoView();
  
  return (
    <SnackbarProvider>
    <ThemeProvider value={[isDark, setDark]}>
      <div className="App" style={{position : 'relative'}}>
      <Suspense fallback={() => <LoaderBalls/>}>
        <Landing scroll={scrollToProject} reference={myRef3}/>
        <About scroll={scrollToContact}/>
        <Project reference={myRef}/>
        <Contact reference={myRef2}/>
        <Footer scroll={scrollToLanding}/>
      </Suspense>
    </div>
    </ThemeProvider>
    </SnackbarProvider>
  );
}

export default App;
