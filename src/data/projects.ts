export type Project = {
  id: string
  title: string
  description?: string
  /** Path under /images/projects/ */
  image: string
  /** Technologies used, e.g. ['ASP.NET Core', 'React'] */
  tags: string[]
  /** Live site */
  url: string
}

// SAMPLE DATA: replace with your real projects. Drop screenshots (16:10 works best) in
// public/images/projects/ and point `image` at them. No component changes are needed.
export const projects: Project[] = [
  {
    id: 'sample-storefront',
    title: 'Sample: Storefront',
    description: 'An e-commerce site with product search, cart and checkout. Replace this with a real project.',
    image: '/images/projects/sample-1.svg',
    tags: ['React', 'TypeScript', 'ASP.NET Core'],
    url: 'https://example.com',
  },
  {
    id: 'sample-dashboard',
    title: 'Sample: Analytics Dashboard',
    description: 'Real-time charts and reports for a small business. Replace this with a real project.',
    image: '/images/projects/sample-2.svg',
    tags: ['React', 'SQL Server', 'SignalR'],
    url: 'https://example.com',
  },
  {
    id: 'sample-booking',
    title: 'Sample: Booking App',
    description: 'Appointment scheduling with reminders and payments. Replace this with a real project.',
    image: '/images/projects/sample-3.svg',
    tags: ['ASP.NET Core', 'Blazor', 'Azure'],
    url: 'https://example.com',
  },
  {
    id: 'sample-blog',
    title: 'Sample: Developer Blog',
    description: 'A fast, statically generated blog with Markdown posts. Replace this with a real project.',
    image: '/images/projects/sample-1.svg',
    tags: ['Next.js', 'Tailwind CSS'],
    url: 'https://example.com',
  },
  {
    id: 'sample-api',
    title: 'Sample: Public REST API',
    description: 'A documented API with auth, rate limiting and versioning. Replace this with a real project.',
    image: '/images/projects/sample-2.svg',
    tags: ['ASP.NET Core', 'PostgreSQL', 'Docker'],
    url: 'https://example.com',
  },
  {
    id: 'sample-chat',
    title: 'Sample: Team Chat',
    description: 'Channels, direct messages and file sharing in the browser. Replace this with a real project.',
    image: '/images/projects/sample-3.svg',
    tags: ['React', 'Node.js', 'WebSockets'],
    url: 'https://example.com',
  },
]
