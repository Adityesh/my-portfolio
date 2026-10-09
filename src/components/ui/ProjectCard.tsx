import type { Project } from '../../data/projects.ts'
import TagChip from './TagChip.tsx'

type ProjectCardProps = {
  project: Project
}

// The whole card opens the live site/demo (a stretched link); the "Code" link sits above it on its own.
function ProjectCard({ project }: ProjectCardProps) {
  const contain = project.imageFit === 'contain'
  return (
    <li className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0f1729] transition focus-within:ring-2 focus-within:ring-sky-400 hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-sky-500/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="aspect-[16/10] overflow-hidden bg-black/30">
        <img
          src={project.image}
          alt={`Screenshot of ${project.title}`}
          loading="lazy"
          className={`h-full w-full transition duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
            contain ? 'object-contain' : 'object-cover object-top'
          }`}
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-base font-semibold text-neutral-100">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start justify-between gap-2 focus-visible:outline-none after:absolute after:inset-0"
          >
            {project.title}
            <span aria-hidden="true" className="text-sky-300 transition group-hover:translate-x-0.5 motion-reduce:transition-none">
              ↗
            </span>
            <span className="sr-only">({project.urlLabel ?? 'Live site'}, opens in a new tab)</span>
          </a>
        </h3>
        {project.description && <p className="line-clamp-3 text-sm text-neutral-400">{project.description}</p>}
        <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
          {project.tags.map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between pt-1 text-xs">
          <span aria-hidden="true" className="font-medium text-sky-300">
            {project.urlLabel ?? 'Live site'} →
          </span>
          {project.source && (
            <a
              href={project.source}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 rounded-md border border-white/15 px-2.5 py-1 text-neutral-300 transition hover:border-sky-400/50 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
            >
              Code
              <span className="sr-only"> for {project.title} on GitHub (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </li>
  )
}

export default ProjectCard
