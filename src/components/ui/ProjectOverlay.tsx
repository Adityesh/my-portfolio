import { projects } from '../../data/projects.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import BackButton from './BackButton.tsx'
import ProjectCard from './ProjectCard.tsx'

// The window sits just inside the screen's glass rather than on the bezel: a small inset, in CSS px, from each edge
// (a fraction of the screen's width, with a floor for small screens).
const INSET_FRACTION = 0.012
const MIN_INSET_PX = 3

/**
 * The projects, shown as an app window on the in-room monitor: once the camera has zoomed in, the window is placed
 * exactly over the screen (scene/MonitorScreenRect publishes its on-page rectangle), so the bezel and glow stay
 * visible around it. Styled like the editor on that screen. Always in the DOM (for SEO); inert and invisible until
 * the camera has reached the monitor. Its layout follows the screen's width (container queries), not the page's.
 */
function ProjectOverlay() {
  const open = useAppStore((state) => state.view === 'monitor' && !state.transitioning)
  // The last measured screen rectangle (kept after closing, so the window fades out where it was).
  const at = useAppStore((state) => state.monitorRect)
  const inset = at ? Math.max(MIN_INSET_PX, at.width * INSET_FRACTION) : 0

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      inert={!open}
      // Visibility switches on at once when opening (a transitioning `visibility` is still hidden on the first frame,
      // which made the Back button's auto-focus fail) and only transitions when closing, so the window fades out.
      className={`fixed z-10 flex origin-center duration-250 ease-out motion-reduce:transition-none ${at ? '' : 'inset-0'} ${
        open && at
          ? 'visible scale-100 opacity-100 transition-[opacity,scale]'
          : 'invisible scale-[0.94] opacity-0 transition-[opacity,scale,visibility]'
      }`}
      style={
        at
          ? { left: at.left + inset, top: at.top + inset, width: at.width - inset * 2, height: at.height - inset * 2 }
          : undefined
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-white/10 bg-[#16203a]">
        {/* Title bar */}
        <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#0f1729] px-3 py-1.5">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-[#ff5f56]" />
            <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="size-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="hidden font-mono text-xs text-neutral-400 sm:inline">~/projects</span>
          <div className="ml-auto">
            <BackButton autoFocus={open} />
          </div>
        </header>

        {/* Scrollable content; a container, so the layout follows the screen's size. */}
        <div className="@container min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 @xl:px-6 @xl:py-6">
          <div className="mx-auto max-w-6xl">
            <p className="font-mono text-xs text-sky-300/80 @xl:text-sm">
              <span className="text-pink-400">const</span> projects = <span className="text-neutral-400">[</span>
            </p>
            <h2 id="projects-heading" className="mt-1 text-xl font-semibold text-neutral-100 @xl:mt-2 @xl:text-3xl">
              Projects
            </h2>
            <p className="mt-1 text-xs text-neutral-400 @xl:text-sm">
              {projects.length} things I've built. Each one opens the live site.
            </p>

            <ul className="mt-4 grid grid-cols-1 gap-3 @xl:mt-6 @xl:grid-cols-2 @xl:gap-4 @4xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </ul>

            <p className="mt-4 font-mono text-xs text-neutral-400 @xl:mt-6 @xl:text-sm">]</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProjectOverlay
