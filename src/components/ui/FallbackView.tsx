import { profile } from '../../data/profile.ts'
import { projects } from '../../data/projects.ts'
import { socials } from '../../data/socials.ts'
import ProjectCard from './ProjectCard.tsx'

type FallbackViewProps = {
  /** Whether this device could run the 3D room (offer a link to it). */
  canTry3D: boolean
}

/** Plain, fast version of the portfolio for devices without WebGL or with very little memory. */
function FallbackView({ canTry3D }: FallbackViewProps) {
  return (
    <div className="min-h-full bg-[#0b0b10] text-neutral-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl">{profile.name}</h1>
            <p className="mt-1 font-mono text-sky-300">{profile.role}</p>
          </div>
          <nav aria-label="Social profiles" className="flex gap-2">
            {socials.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-neutral-200 transition hover:border-sky-400/50 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
              >
                {social.label} <span className="sr-only">(opens in a new tab)</span>
              </a>
            ))}
          </nav>
        </header>

        <section aria-labelledby="projects-heading" className="mt-10">
          <h2 id="projects-heading" className="text-2xl font-semibold">
            Projects
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </ul>
        </section>

        {canTry3D && (
          <p className="mt-10 text-sm text-neutral-500">
            This is the simple version.{' '}
            <a href="?3d" className="text-sky-300 underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none">
              Try the 3D room
            </a>
          </p>
        )}
      </div>
    </div>
  )
}

export default FallbackView
