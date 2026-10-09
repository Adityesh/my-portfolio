import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { activeInteractive, useInteractives } from '../../store/interactives.ts'

// Ignore sub-pixel jitter so the label doesn't re-render for nothing.
const MOVE_THRESHOLD_PX = 0.5

/**
 * Projects the hovered (or keyboard-focused) object's label anchor to screen coordinates every frame and publishes
 * them, so the DOM label (ui/ObjectLabel) can follow the object as the camera drifts. Renders nothing.
 */
function LabelAnchor() {
  const point = useMemo(() => new THREE.Vector3(), [])
  // Frames are on demand: a focus change from the keyboard list (DOM) needs one to place the label.
  const invalidate = useThree((state) => state.invalidate)
  useEffect(
    () =>
      useInteractives.subscribe((state, previous) => {
        if (state.focused !== previous.focused || state.hovered !== previous.hovered) invalidate()
      }),
    [invalidate],
  )

  useFrame(({ camera, size }) => {
    const store = useInteractives.getState()
    const id = activeInteractive(store)
    const entry = id ? store.entries[id] : undefined
    if (!entry) {
      if (store.labelAt) store.setLabelAt(null)
      return
    }
    point.set(...entry.anchor).project(camera)
    // Behind the camera (first-person views can turn away from an object): hide the label.
    if (point.z > 1) {
      if (store.labelAt) store.setLabelAt(null)
      return
    }
    const x = size.left + ((point.x + 1) / 2) * size.width
    const y = size.top + ((1 - point.y) / 2) * size.height
    const last = store.labelAt
    if (!last || Math.abs(last.x - x) > MOVE_THRESHOLD_PX || Math.abs(last.y - y) > MOVE_THRESHOLD_PX) store.setLabelAt({ x, y })
  })

  return null
}

export default LabelAnchor
