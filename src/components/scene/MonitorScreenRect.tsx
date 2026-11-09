import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore.ts'
import { SCREEN_CENTER, SCREEN_SIZE } from './roomLayout.ts'

// Ignore sub-pixel jitter so the projects window doesn't re-render for nothing.
const MOVE_THRESHOLD_PX = 0.5

// The screen faces +x: its width runs along z, its height along y.
const [CX, CY, CZ] = SCREEN_CENTER
const [W, H] = SCREEN_SIZE
const CORNERS: [number, number, number][] = [
  [CX, CY - H / 2, CZ - W / 2],
  [CX, CY - H / 2, CZ + W / 2],
  [CX, CY + H / 2, CZ - W / 2],
  [CX, CY + H / 2, CZ + W / 2],
]

/**
 * While the monitor view is open, projects the monitor screen's corners to the page and publishes the rectangle,
 * so the projects window (ui/ProjectOverlay) sits exactly on the screen and follows resizes. Renders nothing.
 */
function MonitorScreenRect() {
  const point = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ camera, size }) => {
    const store = useAppStore.getState()
    // Only measured in the monitor view; the last rectangle is kept afterwards so the window can fade out in place
    // (it's invisible in the room view, and re-measured during the next zoom-in before it opens).
    if (store.view !== 'monitor') return
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const corner of CORNERS) {
      point.set(...corner).project(camera)
      const x = size.left + ((point.x + 1) / 2) * size.width
      const y = size.top + ((1 - point.y) / 2) * size.height
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }
    const next = { left: minX, top: minY, width: maxX - minX, height: maxY - minY }
    const last = store.monitorRect
    if (
      !last ||
      Math.abs(last.left - next.left) > MOVE_THRESHOLD_PX ||
      Math.abs(last.top - next.top) > MOVE_THRESHOLD_PX ||
      Math.abs(last.width - next.width) > MOVE_THRESHOLD_PX ||
      Math.abs(last.height - next.height) > MOVE_THRESHOLD_PX
    ) {
      store.setMonitorRect(next)
    }
  })

  return null
}

export default MonitorScreenRect
