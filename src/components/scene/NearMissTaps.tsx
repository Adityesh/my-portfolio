import { useThree, type ThreeEvent } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore.ts'
import { useInteractives } from '../../store/interactives.ts'

// How far (CSS px) from an object's label anchor a missed tap may land and still count for it. On a portrait phone
// small things (clock, light switch, mug) are only ~15-25 px across, smaller than a fingertip.
const RADIUS_PX = 36
// Pixels the pointer may move between down and up and still count as a tap (vs. a camera drag).
const TAP_TOLERANCE = 6
// Encloses the whole room and every camera position, so a tap that hits nothing else reaches it.
const CATCHER_RADIUS = 60

/**
 * Touch devices only: a tap that misses every object goes to the nearest interactive object within RADIUS_PX
 * (measured to its label anchor on screen), as if it had been tapped. Uses an invisible sphere around the scene
 * (inside faces) that only receives taps nothing else took.
 */
function NearMissTaps() {
  const invalidate = useThree((state) => state.invalidate)
  const size = useThree((state) => state.size)
  const catcher = useRef<THREE.Mesh>(null)
  const point = useMemo(() => new THREE.Vector3(), [])

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > TAP_TOLERANCE) return
    // Another object was under the tap (one that let the event through): not a miss.
    if (e.intersections.some((hit) => hit.object !== catcher.current)) return
    const { view, transitioning, cutting } = useAppStore.getState()
    if (view !== 'room' || transitioning || cutting) return

    const tapX = ((e.pointer.x + 1) / 2) * size.width
    const tapY = ((1 - e.pointer.y) / 2) * size.height
    let nearest: (() => void) | null = null
    let nearestDistance = RADIUS_PX
    for (const entry of Object.values(useInteractives.getState().entries)) {
      point.set(...entry.anchor).project(e.camera)
      if (point.z > 1) continue // behind a first-person camera
      const distance = Math.hypot(((point.x + 1) / 2) * size.width - tapX, ((1 - point.y) / 2) * size.height - tapY)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearest = entry.activate
      }
    }
    if (nearest) {
      e.stopPropagation()
      nearest()
      invalidate()
    }
  }

  return (
    <mesh ref={catcher} visible={false} onClick={onClick}>
      <sphereGeometry args={[CATCHER_RADIUS, 8, 6]} />
      <meshBasicMaterial side={THREE.BackSide} />
    </mesh>
  )
}

export default NearMissTaps
