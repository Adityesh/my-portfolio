export type Project = {
  id: string
  title: string
  description?: string
  /** Path under /images/projects/ */
  image: string
  /** 'contain' shows the whole screenshot (e.g. tall phone screenshots); default 'cover' fills the card. */
  imageFit?: 'cover' | 'contain'
  /** Technologies used, e.g. ['ASP.NET Core', 'React'] */
  tags: string[]
  /** Live site or demo (the card's main link). */
  url: string
  /** Label for the main link; defaults to "Live site" (e.g. "Watch demo" for a video). */
  urlLabel?: string
  /** Source code (shown as a separate "Code" link). */
  source?: string
}

// Add a project here and drop its screenshot (16:10 works best) in public/images/projects/.
// No component changes are needed.
export const projects: Project[] = [
  {
    id: 'movie-app',
    title: 'Movie App',
    description:
      'A web application that allows users to search, explore, and view popular movies, trending TV shows, and celebrities in an authentic Windows XP-styled desktop environment.',
    image: '/images/projects/movie-app.webp',
    tags: ['React 18', 'TypeScript', 'XP.css', 'React-Query', 'Serverless', 'Vite', 'TMDB-API'],
    url: 'https://movie-app-xi.vercel.app/',
    source: 'https://github.com/Adityesh/Movie_App',
  },
  {
    id: 'pension-calculator',
    title: 'Pension-Calculator',
    description:
      'Financial estimation utility designed for Indian central government employees to compute pension yields, gratuity, and retirement benefits accurately.',
    image: '/images/projects/pension-calculator.webp',
    tags: ['Bootstrap', 'HTML', 'CSS', 'Javascript'],
    url: 'https://abhishekdhal2401.github.io/pensioncalculator/',
    source: 'https://github.com/Adityesh/Pension-Calculator',
  },
  {
    id: 'random-meal-generator',
    title: 'Random-Meal-Generator',
    description:
      'Interactive culinary explorer fetching dynamic recipes, precise ingredient lists, and step-by-step cooking guides from public REST APIs.',
    image: '/images/projects/meal-generator.webp',
    tags: ['React', 'HTML', 'CSS'],
    url: 'https://random-meal-generator-two.vercel.app/',
    source: 'https://github.com/Adityesh/Random-Meal-Generator',
  },
  {
    id: 'book-manager',
    title: 'Book Manager',
    description:
      'Full-stack web platform enabling community book discovery, real-time cataloging, and seamless peer-to-peer book trading workflows.',
    image: '/images/projects/book-manager.webp',
    tags: ['React', 'Redux', 'CSS', 'NodeJS', 'Express', 'PassportJS', 'MongoDB'],
    url: 'https://www.youtube.com/watch?v=k1gLhwjv5LQ',
    urlLabel: 'Watch demo',
    source: 'https://github.com/Adityesh/bookManager',
  },
  {
    id: 'wally',
    title: 'Wally',
    description: 'React Native Android application integrating high-resolution Pixabay APIs with smooth infinite-scroll media galleries.',
    image: '/images/projects/wally.webp',
    imageFit: 'contain',
    tags: ['React', 'ReactNative', 'React-Navigation', 'PixabayApi'],
    url: 'https://drive.google.com/file/d/1pXW7sAnGzWzxeioVMfLvLsR1Qx1EXcb3/view?usp=sharing',
    urlLabel: 'Watch demo',
  },
  {
    id: 'markdown-previewer',
    title: 'Markdown-Previewer',
    description: 'Real-time split-screen Markdown editor with live HTML rendering, syntax parsing, and customizable preview modes.',
    image: '/images/projects/markdown-previewer.webp',
    tags: ['React', 'HTML-Parser', 'CSS'],
    url: 'https://markdown-previewer-delta.vercel.app/',
    source: 'https://github.com/Adityesh/Markdown-Previewer',
  },
]
