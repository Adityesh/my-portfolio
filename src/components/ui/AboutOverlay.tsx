import { about } from '../../data/about.ts'
import { profile } from '../../data/profile.ts'
import { socials } from '../../data/socials.ts'
import BackButton from './BackButton.tsx'
import FocusWindow from './FocusWindow.tsx'

// The board sits just inside the whiteboard's frame: a small inset, in CSS px, from each edge of the writing surface.
const INSET = { fraction: 0.008, minPx: 2 }
// Marker colours, cycled through the skill groups (same inks as the drawing on the board in the room).
const INKS = ['text-[#1d4ed8]', 'text-[#15803d]', 'text-[#dc2626]', 'text-[#7c3aed]', 'text-[#c2410c]']
// Sticky notes for the links, each a little askew.
const NOTE_TILTS = ['-rotate-2', 'rotate-1', '-rotate-1']

/**
 * "About me", written on the whiteboard: once the camera has zoomed in to the board, this sits exactly over its
 * writing surface (scene/FocusRect publishes the on-page rectangle). Bio, skills, and sticky notes linking the résumé
 * and profiles. Always in the DOM (for SEO); inert and invisible until the camera reaches the board. Its layout
 * follows the board's width (container queries), not the page's; on phones it fills the page (FocusWindow).
 */
function AboutOverlay() {
  const notes = [
    { label: 'Résumé', url: about.resumeUrl, className: 'bg-[#fde68a]' },
    ...socials.map((social, i) => ({
      label: social.label,
      url: social.url,
      className: i % 2 ? 'bg-[#bae6fd]' : 'bg-[#fbcfe8]',
    })),
  ]

  return (
    <FocusWindow view="whiteboard" id="about" labelledBy="about-heading" inset={INSET}>
      {(open) => (
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-sm bg-[#eeede6] font-marker text-[#1f2937] shadow-[inset_0_0_40px_rgba(0,0,0,0.12)]">
          <div className="absolute top-1 right-1 z-10 rounded-md bg-[#eeede6]/90">
            <BackButton autoFocus={open} tone="dark" />
          </div>

          {/* Scrollable content; a container, so the layout follows the board's size. */}
          <div className="@container min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-3 pb-5 @xl:px-8 @xl:pt-6 @xl:pb-8">
            <header className="pr-28">
              <h2 id="about-heading" className="text-2xl leading-tight font-bold @xl:text-4xl">
                {profile.name}
              </h2>
              <p className="mt-1 inline-block -rotate-1 border-b-2 border-[#dc2626] text-sm text-[#dc2626] @xl:text-lg">
                {profile.role}
              </p>
            </header>

            <p className="mt-3 text-sm font-semibold text-[#1d4ed8] @xl:mt-5 @xl:text-lg">{about.headline}</p>
            {about.bio.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="mt-2 text-xs leading-relaxed @xl:text-sm @3xl:text-base">
                {paragraph}
              </p>
            ))}

            <h3 className="mt-4 text-lg font-bold @xl:mt-6 @xl:text-2xl">
              Skills <span aria-hidden="true">✎</span>
            </h3>
            <div className="mt-2 grid grid-cols-1 gap-3 @xl:grid-cols-2 @xl:gap-x-8 @4xl:grid-cols-3">
              {about.skills.map((group, i) => (
                <div key={group.label} className={INKS[i % INKS.length]}>
                  <h4 className="text-sm font-bold underline decoration-2 underline-offset-4 @xl:text-base">{group.label}</h4>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {group.skills.map((skill) => (
                      <li key={skill} className="rounded-full border-2 border-current px-2 py-px text-[11px] @xl:text-xs">
                        <span className="text-[#1f2937]">{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <nav aria-label="Résumé and profiles" className="mt-5 flex flex-wrap gap-3 @xl:mt-7 @xl:gap-5">
              {notes.map((note, i) => (
                <a
                  key={note.label}
                  href={note.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${note.className} ${NOTE_TILTS[i % NOTE_TILTS.length]} px-4 py-2 text-sm font-bold text-[#1f2937] shadow-md transition hover:rotate-0 hover:shadow-lg focus-visible:rotate-0 focus-visible:ring-2 focus-visible:ring-[#1d4ed8] focus-visible:outline-none motion-reduce:transition-none @xl:text-base`}
                >
                  {note.label} <span aria-hidden="true">↗&#xFE0E;</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </FocusWindow>
  )
}

export default AboutOverlay
