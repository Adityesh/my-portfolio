import type { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, type RefObject } from 'react'
import * as THREE from 'three'

// Isometric view: camera sits along (1, 1, 1) from the room center.
export const VIEW_DIRECTION = new THREE.Vector3(1, 1, 1).normalize()
const CAMERA_DISTANCE = 20
// Fraction of the viewport the room should fill.
const FILL = 0.9
// Zoom limits relative to the fitted zoom.
const MIN_ZOOM_FACTOR = 0.9
const MAX_ZOOM_FACTOR = 2.5

const WORLD_UP = new THREE.Vector3(0, 1, 0)

/** Ortho zoom (pixels per world unit) that fits `box` in a width x height viewport. */
function computeFitZoom(box: THREE.Box3, width: number, height: number): number {
  const forward = VIEW_DIRECTION.clone().negate()
  const right = new THREE.Vector3().crossVectors(forward, WORLD_UP).normalize()
  const up = new THREE.Vector3().crossVectors(right, forward)

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  const corner = new THREE.Vector3()
  for (let i = 0; i < 8; i++) {
    corner.set(
      i & 1 ? box.max.x : box.min.x,
      i & 2 ? box.max.y : box.min.y,
      i & 4 ? box.max.z : box.min.z,
    )
    const x = corner.dot(right)
    const y = corner.dot(up)
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }

  return Math.min(width / (maxX - minX), height / (maxY - minY)) * FILL
}

/** Frames `targetRef` isometrically and refits the zoom whenever the viewport resizes. */
export function useResponsiveCamera(
  controlsRef: RefObject<CameraControls | null>,
  targetRef: RefObject<THREE.Object3D | null>,
) {
  const width = useThree((state) => state.size.width)
  const height = useThree((state) => state.size.height)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    const controls = controlsRef.current
    const target = targetRef.current
    if (!controls || !target) return

    const box = new THREE.Box3().setFromObject(target)
    const center = box.getCenter(new THREE.Vector3())
    const position = center.clone().addScaledVector(VIEW_DIRECTION, CAMERA_DISTANCE)
    const zoom = computeFitZoom(box, width, height)

    controls.minZoom = zoom * MIN_ZOOM_FACTOR
    controls.maxZoom = zoom * MAX_ZOOM_FACTOR
    void controls.setLookAt(position.x, position.y, position.z, center.x, center.y, center.z, false)
    void controls.zoomTo(zoom, false)
    invalidate()
  }, [controlsRef, targetRef, width, height, invalidate])
}
