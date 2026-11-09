// "About me" content, shown on the whiteboard (tap it in the room) and on the fallback page.
// Taken from the previous 2D portfolio (feat/v2-rewrite).

export type SkillGroup = {
  label: string
  skills: string[]
}

export const about = {
  headline: 'Full stack engineer building scalable web apps and resilient backends.',
  bio: [
    'I studied Computer Science & Engineering at CET, Bhubaneswar. I build scalable web applications and backend services, bridging intuitive interfaces with robust server architectures.',
    'I care about clean architecture, modular TypeScript and reliable API pipelines. Outside work I explore distributed systems patterns, experiment with developer tooling and contribute to open-source web tech.',
  ],
  skills: [
    { label: 'Backend', skills: ['C#', 'ASP.NET Core', 'Entity Framework Core', 'REST APIs', 'Node.js', 'Express.js'] },
    {
      label: 'Frontend',
      skills: ['React', 'Next.js', 'TypeScript', 'Redux Toolkit', 'RTK Query', 'React Query', 'Micro frontends', 'Tailwind CSS', 'Material UI'],
    },
    { label: 'Databases', skills: ['SQL Server', 'PostgreSQL', 'MongoDB', 'Sequelize'] },
    { label: 'Testing & tools', skills: ['Jest', 'React Testing Library', 'Storybook', 'Postman', 'Git'] },
    { label: 'Cloud & DevOps', skills: ['Docker', 'Kubernetes', 'Azure', 'Linux', 'CI/CD'] },
  ] satisfies SkillGroup[],
  resumeUrl: 'https://drive.google.com/file/d/1kB99zaDN6x77a6003HkJtkNYq_i5Slkf/view?usp=sharing',
}
