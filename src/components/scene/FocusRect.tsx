import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { useAppStore, type FocusView } from '../../store/useAppStore.ts'
import { FOCUS_SURFACES } from './roomLayout.ts'

// Ignore sub-pixel jitter so the window doesn't re-render for nothing.
const MOVE_THRESHOLD_PX = 0.5

// Each surface faces +x: its width runs along z, its height along y.
function cornersOf(view: FocusView): [number, number, number][] {
  const [cx, cy, cz] = FOCUS_SURFACES[view].center
  const [w, h] = FOCUS_SURFACES[view].size
  return [
    [cx, cy - h / 2, cz - w / 2],
    [cx, cy - h / 2, cz + w / 2],
    [cx, cy + h / 2, cz - w / 2],
    [cx, cy + h / 2, cz + w / 2],
  ]
}
const CORNERS: Record<FocusView, [number, number, number][]> = {
  monitor: cornersOf('monitor'),
  whiteboard: cornersOf('whiteboard'),
}

/**
 * While zoomed in to the monitor or the whiteboard, projects that surface's corners to the page and publishes the
 * rectangle, so the projects / about window (ui/ProjectOverlay, ui/AboutOverlay) sits exactly on it and follows
 * resizes. Renders nothing.
 */
function FocusRect() {
  const point = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ camera, size }) => {
    const store = useAppStore.getState()
    // Only measured in a focus view; the last rectangle is kept afterwards so the window can fade out in place
    // (it's invisible in the room view, and re-measured during the next zoom-in before it opens).
    if (store.view === 'room') return
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const corner of CORNERS[store.view]) {
      point.set(...corner).project(camera)
      const x = size.left + ((point.x + 1) / 2) * size.width
      const y = size.top + ((1 - point.y) / 2) * size.height
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }
    const next = { left: minX, top: minY, width: maxX - minX, height: maxY - minY }
    const last = store.focusRect
    if (
      !last ||
      Math.abs(last.left - next.left) > MOVE_THRESHOLD_PX ||
      Math.abs(last.top - next.top) > MOVE_THRESHOLD_PX ||
      Math.abs(last.width - next.width) > MOVE_THRESHOLD_PX ||
      Math.abs(last.height - next.height) > MOVE_THRESHOLD_PX
    ) {
      store.setFocusRect(next)
    }
  })

  return null
}

export default FocusRect
