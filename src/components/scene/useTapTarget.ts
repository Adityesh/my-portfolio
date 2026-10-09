import { useCursor } from '@react-three/drei'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore.ts'

// Pixels the pointer may move between down and up and still count as a tap (vs. a camera drag).
const TAP_TOLERANCE = 6

/**
 * Click/tap handling for a 3D object in the room: ignores camera drags, only responds in the room view, shows the
 * pointer cursor on hover and redraws on hover changes (frames are on demand). Spread `bind` on the hit mesh.
 */
export function useTapTarget(onTap: () => void) {
  const invalidate = useThree((state) => state.invalidate)
  const active = useAppStore((state) => state.view === 'room' && !state.transitioning)
  const [hovered, setHovered] = useState(false)
  useCursor(active && hovered)

  const bind = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      if (!active || e.delta > TAP_TOLERANCE) return
      e.stopPropagation()
      onTap()
      invalidate()
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      setHovered(true)
      invalidate()
    },
    onPointerOut: () => {
      setHovered(false)
      invalidate()
    },
  }

  return { hovered: hovered && active, bind }
}
