import { useCursor } from '@react-three/drei'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { useIsMobile } from '../../hooks/useIsMobile.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import { SCREEN_CENTER, SCREEN_SIZE } from './roomLayout.ts'

// Pixels the pointer may move between down and up and still count as a click (vs. a camera drag).
const CLICK_TOLERANCE = 6
// Hit area relative to the screen size; bigger on touch devices.
const PADDING = 1.2
const PADDING_TOUCH = 1.6

/** Invisible plane over the monitor that opens the projects view. */
function MonitorHitArea() {
  const isMobile = useIsMobile()
  const active = useAppStore((state) => state.view === 'room' && !state.transitioning)
  const hovered = useAppStore((state) => state.monitorHovered)
  const openMonitor = useAppStore((state) => state.openMonitor)
  const setHovered = useAppStore((state) => state.setMonitorHovered)
  const invalidate = useThree((state) => state.invalidate)
  // Redraw so the hover brightness shows even when no animation frames are running.
  const setMonitorHovered = (value: boolean) => {
    setHovered(value)
    invalidate()
  }
  useCursor(active && hovered)

  const padding = isMobile ? PADDING_TOUCH : PADDING

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!active || e.delta > CLICK_TOLERANCE) return
    e.stopPropagation()
    openMonitor()
  }

  return (
    <mesh
      // Slightly in front of the screen, facing +x into the room.
      position={[SCREEN_CENTER[0] + 0.05, SCREEN_CENTER[1], SCREEN_CENTER[2]]}
      rotation={[0, Math.PI / 2, 0]}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        setMonitorHovered(true)
      }}
      onPointerOut={() => setMonitorHovered(false)}
    >
      <planeGeometry args={[SCREEN_SIZE[0] * padding, SCREEN_SIZE[1] * padding]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

export default MonitorHitArea
