import type { Project } from '../../data/projects.ts'
import TagChip from './TagChip.tsx'

type ProjectCardProps = {
  project: Project
}

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <li>
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0f1729] transition hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-sky-500/10 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <div className="aspect-[16/10] overflow-hidden bg-black/30">
          <img
            src={project.image}
            alt={`Screenshot of ${project.title}`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="flex items-start justify-between gap-2 text-base font-semibold text-neutral-100">
            {project.title}
            <span aria-hidden="true" className="text-sky-300 transition group-hover:translate-x-0.5 motion-reduce:transition-none">
              ↗
            </span>
          </h3>
          {project.description && <p className="line-clamp-3 text-sm text-neutral-400">{project.description}</p>}
          <ul className="mt-auto flex flex-wrap gap-1.5" aria-label="Technologies">
            {project.tags.map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
          </ul>
        </div>
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </li>
  )
}

export default ProjectCard
