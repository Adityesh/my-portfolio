import movieAppImg from '../assets/movie-app.png';
import pensionCalcImg from '../assets/pension-calculator.png';
import mealGeneratorImg from '../assets/meal-generator.png';
import markdownPreviewerImg from '../assets/markdown-previewer.png';
import bookManagerImg from '../assets/book-manager.webp';
import wallyImg from '../assets/wally.webp';

export interface ProjectItem {
  title: string;
  description: string;
  projectImage: string;
  projectGithub: string;
  projectDemo: string;
  projectTags: string[];
}

export const projects: ProjectItem[] = [
  {
    title: 'Movie App',
    description: 'A web application that allows users to search, explore, and view popular movies, trending TV shows, and celebrities in an authentic Windows XP-styled desktop environment.',
    projectImage: movieAppImg,
    projectGithub: 'https://github.com/Adityesh/Movie_App',
    projectDemo: 'https://movie-app-xi.vercel.app/',
    projectTags: ['React 18', 'TypeScript', 'XP.css', 'React-Query', 'Serverless', 'Vite', 'TMDB-API'],
  },
  {
    title: 'Pension-Calculator',
    description: 'Financial estimation utility designed for Indian central government employees to compute pension yields, gratuity, and retirement benefits accurately.',
    projectImage: pensionCalcImg,
    projectGithub: 'https://github.com/Adityesh/Pension-Calculator',
    projectDemo: 'https://abhishekdhal2401.github.io/pensioncalculator/',
    projectTags: ['Bootstrap', 'HTML', 'CSS', 'Javascript'],
  },
  {
    title: 'Random-Meal-Generator',
    description: 'Interactive culinary explorer fetching dynamic recipes, precise ingredient lists, and step-by-step cooking guides from public REST APIs.',
    projectImage: mealGeneratorImg,
    projectGithub: 'https://github.com/Adityesh/Random-Meal-Generator',
    projectDemo: 'https://random-meal-generator-two.vercel.app/',
    projectTags: ['React', 'HTML', 'CSS'],
  },
  {
    title: 'Book Manager',
    description: 'Full-stack web platform enabling community book discovery, real-time cataloging, and seamless peer-to-peer book trading workflows.',
    projectImage: bookManagerImg,
    projectGithub: 'https://github.com/Adityesh/bookManager',
    projectDemo: 'https://www.youtube.com/watch?v=k1gLhwjv5LQ',
    projectTags: ['React', 'Redux', 'CSS', 'NodeJS', 'Express', 'PassportJS', 'MongoDB'],
  },
  {
    title: 'Wally',
    description: 'React Native Android application integrating high-resolution Pixabay APIs with smooth infinite-scroll media galleries.',
    projectImage: wallyImg,
    projectGithub: '#',
    projectDemo: 'https://drive.google.com/file/d/1pXW7sAnGzWzxeioVMfLvLsR1Qx1EXcb3/view?usp=sharing',
    projectTags: ['React', 'ReactNative', 'React-Navigation', 'PixabayApi'],
  },
  {
    title: 'Markdown-Previewer',
    description: 'Real-time split-screen Markdown editor with live HTML rendering, syntax parsing, and customizable preview modes.',
    projectImage: markdownPreviewerImg,
    projectGithub: 'https://github.com/Adityesh/Markdown-Previewer',
    projectDemo: 'https://markdown-previewer-delta.vercel.app/',
    projectTags: ['React', 'HTML-Parser', 'CSS'],
  },
];

export const resume = 'https://drive.google.com/file/d/1kB99zaDN6x77a6003HkJtkNYq_i5Slkf/view?usp=sharing';
export const github = 'https://github.com/Adityesh';
export const linkedin = 'https://www.linkedin.com/in/adityesh-mishra-b3446716b/';
export const youtube = 'https://www.youtube.com/channel/UCsFX7Jk8vV_hQfb0rMeYxZQ';

export default {
  projects,
  resume,
  github,
  linkedin,
  youtube,
};
