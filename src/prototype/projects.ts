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
    title: 'Book Manager',
    description: 'Full-stack web platform enabling community book discovery, real-time cataloging, and seamless peer-to-peer book trading workflows.',
    projectImage: 'https://raw.githubusercontent.com/Adityesh/assets-portfolio/main/bookmanager.webp',
    projectGithub: 'https://github.com/Adityesh/bookManager',
    projectDemo: 'https://www.youtube.com/watch?v=k1gLhwjv5LQ',
    projectTags: ['React', 'Redux', 'CSS', 'NodeJS', 'Express', 'PassportJS', 'MongoDB'],
  },
  {
    title: 'Wally',
    description: 'React Native Android application integrating high-resolution Pixabay APIs with smooth infinite-scroll media galleries.',
    projectImage: 'https://raw.githubusercontent.com/Adityesh/assets-portfolio/main/wally.webp',
    projectGithub: '#',
    projectDemo: 'https://drive.google.com/file/d/1pXW7sAnGzWzxeioVMfLvLsR1Qx1EXcb3/view?usp=sharing',
    projectTags: ['React', 'ReactNative', 'React-Navigation', 'PixabayApi'],
  },
  {
    title: 'Safe-Keeper',
    description: 'End-to-end encrypted personal data vault featuring JWT session authentication, RESTful APIs, and secure MongoDB data persistence.',
    projectImage: 'https://raw.githubusercontent.com/Adityesh/assets-portfolio/main/safekeeper.jpg',
    projectGithub: 'https://github.com/Adityesh/Safe-Keeper-Frontend',
    projectDemo: 'https://drive.google.com/file/d/15hW3lYpEoG117r-2Qb2MOWVGGbBbDRq2/view?usp=sharing',
    projectTags: ['React', 'ReactNative', 'React-Navigation', 'Express', 'JWT', 'MongoDB', 'mongoose', 'NodeJS'],
  },
  {
    title: 'torrent-Scraper',
    description: 'Automated headless web scraping engine built with Puppeteer and Express to index, parse, and stream media metadata on-demand.',
    projectImage: 'https://raw.githubusercontent.com/Adityesh/assets-portfolio/main/torrent.webp',
    projectGithub: 'https://github.com/Adityesh/torrentScrape',
    projectDemo: 'https://torrent-scraper-frontend.vercel.app/',
    projectTags: ['React', 'ReactRouter', 'CSS', 'NodeJS', 'Express', 'Puppeteer'],
  },
  {
    title: 'Pension-Calculator',
    description: 'Financial estimation utility designed for Indian central government employees to compute pension yields, gratuity, and retirement benefits accurately.',
    projectImage: 'https://raw.githubusercontent.com/Adityesh/assets-portfolio/main/pension.webp',
    projectGithub: 'https://github.com/Adityesh/Pension-Calculator',
    projectDemo: 'https://abhishekdhal2401.github.io/pensioncalculator/',
    projectTags: ['Bootstrap', 'HTML', 'CSS', 'Javascript'],
  },
  {
    title: 'Random-Meal-Generator',
    description: 'Interactive culinary explorer fetching dynamic recipes, precise ingredient lists, and step-by-step cooking guides from public REST APIs.',
    projectImage: 'https://raw.githubusercontent.com/Adityesh/assets-portfolio/main/random.webp',
    projectGithub: 'https://github.com/Adityesh/Random-Meal-Generator',
    projectDemo: 'https://random-meal-generator-two.vercel.app/',
    projectTags: ['React', 'HTML', 'CSS'],
  },
  {
    title: 'Markdown-Previewer',
    description: 'Real-time split-screen Markdown editor with live HTML rendering, syntax parsing, and customizable preview modes.',
    projectImage: 'https://raw.githubusercontent.com/Adityesh/assets-portfolio/main/markdown.webp',
    projectGithub: 'https://github.com/Adityesh/Markdown-Previewer',
    projectDemo: 'https://markdown-previewer-delta.vercel.app/',
    projectTags: ['React', 'HTML-Parser', 'CSS'],
  },
];

export const resume = 'https://drive.google.com/file/d/1PUarr1Vlkh2lskyvBB0Uo_7d4tvMLduQ/view?usp=sharing';
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
