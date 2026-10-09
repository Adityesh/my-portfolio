import { useAppStore } from '../../store/useAppStore.ts'

/** Full-screen loading message while the 3D code and assets download (progress comes from the scene). */
function LoadingScreen() {
  const { active, progress } = useAppStore((state) => state.loading)

  if (!active) return null

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-[#0b0b10] text-sm text-neutral-300"
      role="status"
      aria-live="polite"
    >
      Loading {Math.round(progress)}%
    </div>
  )
}

export default LoadingScreen
