import { socials } from '../../data/socials.ts'
import { useAppStore } from '../../store/useAppStore.ts'

/**
 * Real links to the social profiles for keyboard, screen-reader and SEO access
 * (the 3D signs aren't focusable). Visually hidden until focused.
 */
function SocialLinks() {
  const inRoom = useAppStore((state) => state.view === 'room')
  if (!inRoom) return null

  return (
    <nav aria-label="Social profiles" className="absolute top-16 left-4 z-20 flex flex-col gap-2">
      {socials.map((social) => (
        <a
          key={social.id}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="sr-only rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:outline-none"
        >
          {social.label} <span className="sr-only">(opens in a new tab)</span>
        </a>
      ))}
    </nav>
  )
}

export default SocialLinks
