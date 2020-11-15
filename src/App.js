import './App.css';
import React, {lazy, Suspense, useState} from 'react';
import { ThemeProvider } from './context/ThemeContext';

const Landing = lazy(() => import('./components/landing/landing'));
const Project = lazy(() => import('./components/project/projectSection'));
const Contact = lazy(() => import('./components/contact/contact'));
const Footer = lazy(() => import('./components/footer/footer'));
const LoaderBalls = lazy(() => import('./components/loader/loaderBalls'));
function App() {
  const [isDark, setDark] = useState(false);
  return (
    <ThemeProvider value={[isDark, setDark]}>
      <div className="App" style={{position : 'relative'}}>
      <Suspense fallback={() => <LoaderBalls/>}>
        <Landing />
        <Project />
        <Contact/>
        <Footer />
      </Suspense>
    </div>
    </ThemeProvider>
  );
}

export default App;
