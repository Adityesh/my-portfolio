import { Sparkles } from '@react-three/drei'
import { useAppStore } from '../../store/useAppStore.ts'
import { SCREEN_CENTER, WINDOW_CENTER } from './roomLayout.ts'

type DustMotesProps = {
  /** Fewer particles on mobile. */
  density: number
}

// Slow-drifting dust caught in the monitor glow and the window light.
function DustMotes({ density }: DustMotesProps) {
  // Hidden outside the room view: up close the particles turn into large blurry squares.
  const inRoom = useAppStore((state) => state.view === 'room' && !state.transitioning)
  if (!inRoom) return null

  return (
    <>
      <Sparkles
        position={[SCREEN_CENTER[0] + 1.3, SCREEN_CENTER[1] + 0.2, SCREEN_CENTER[2]]}
        scale={[2.2, 2.4, 3.2]}
        count={Math.round(30 * density)}
        size={2.5}
        speed={0.15}
        noise={0.6}
        opacity={0.55}
        color="#b4d0ff"
      />
      <Sparkles
        position={[WINDOW_CENTER[0] + 0.4, WINDOW_CENTER[1] - 0.6, WINDOW_CENTER[2] + 1.6]}
        scale={[3.2, 3.4, 2.6]}
        count={Math.round(35 * density)}
        size={2.5}
        speed={0.12}
        noise={0.6}
        opacity={0.5}
        color="#ffd6a8"
      />
    </>
  )
}

export default DustMotes
