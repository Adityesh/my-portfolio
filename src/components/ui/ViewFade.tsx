import { useAppStore } from '../../store/useAppStore.ts'
import { CUT_FADE_MS } from '../../store/viewpoints.ts'

/** Full-screen dip to dark that hides the camera cut between the room view and a first-person view. */
function ViewFade() {
  const cutting = useAppStore((state) => state.cutting)
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-40 bg-[#05060b] transition-opacity ease-in-out ${cutting ? 'opacity-100' : 'opacity-0'}`}
      style={{ transitionDuration: `${CUT_FADE_MS}ms` }}
    />
  )
}

export default ViewFade
