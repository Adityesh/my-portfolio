import { projects } from '../../data/projects.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import BackButton from './BackButton.tsx'
import ProjectCard from './ProjectCard.tsx'

/**
 * Full-screen "monitor" window listing the projects. Styled like the editor on the in-room screen
 * so the camera zoom flows into it. Always in the DOM (for SEO); inert and invisible until the
 * camera has reached the monitor.
 */
function ProjectOverlay() {
  const open = useAppStore((state) => state.view === 'monitor' && !state.transitioning)

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      inert={!open}
      className={`fixed inset-0 z-10 flex p-2 transition-[opacity,scale,visibility] duration-300 ease-out sm:p-4 lg:p-8 motion-reduce:transition-none ${
        open ? 'visible scale-100 opacity-100' : 'invisible scale-[0.98] opacity-0'
      }`}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#16203a]/95 shadow-2xl shadow-black/60 backdrop-blur-sm">
        {/* Title bar */}
        <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#0f1729] px-3 py-2">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-3 rounded-full bg-[#ff5f56]" />
            <span className="size-3 rounded-full bg-[#ffbd2e]" />
            <span className="size-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="hidden font-mono text-sm text-neutral-400 sm:inline">~/projects</span>
          <div className="ml-auto">
            <BackButton autoFocus={open} />
          </div>
        </header>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <p className="font-mono text-sm text-sky-300/80">
              <span className="text-pink-400">const</span> projects = <span className="text-neutral-400">[</span>
            </p>
            <h2 id="projects-heading" className="mt-2 text-2xl font-semibold text-neutral-100 sm:text-3xl">
              Projects
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              {projects.length} things I've built. Each one opens the live site.
            </p>

            <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </ul>

            <p className="mt-6 font-mono text-sm text-neutral-400">]</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProjectOverlay
