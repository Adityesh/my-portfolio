import type { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'

const DEG = Math.PI / 180
// Camera angles around the room center. Azimuth 45° faces the room's open corner.
// Polar is measured from straight up: true isometric is ~54.7°, higher values look more from the side.
export const CAMERA_POLAR = 62 * DEG
export const CAMERA_AZIMUTH = 45 * DEG
export const VIEW_DIRECTION = new THREE.Vector3().setFromSphericalCoords(1, CAMERA_POLAR, CAMERA_AZIMUTH)
const CAMERA_DISTANCE = 20
// Fraction of the viewport the room should fill.
const FILL = 0.9
// Zoom limits relative to the fitted zoom.
const MIN_ZOOM_FACTOR = 0.9
const MAX_ZOOM_FACTOR = 2.5
// Intro: the camera starts rotated and zoomed out, then eases into the fitted view.
const INTRO_AZIMUTH_OFFSET = 18 * DEG
const INTRO_POLAR_OFFSET = -8 * DEG
const INTRO_ZOOM_FACTOR = 0.8

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

/**
 * Frames `targetRef` and refits the zoom whenever the viewport resizes.
 * With `intro`, the first fit eases in from a rotated, zoomed-out pose.
 */
export function useResponsiveCamera(
  controlsRef: RefObject<CameraControls | null>,
  targetRef: RefObject<THREE.Object3D | null>,
  intro: boolean,
) {
  const hasFitted = useRef(false)
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

    controls.minZoom = zoom * MIN_ZOOM_FACTOR * (intro && !hasFitted.current ? INTRO_ZOOM_FACTOR : 1)
    controls.maxZoom = zoom * MAX_ZOOM_FACTOR

    if (intro && !hasFitted.current) {
      const start = new THREE.Vector3()
        .setFromSphericalCoords(CAMERA_DISTANCE, CAMERA_POLAR + INTRO_POLAR_OFFSET, CAMERA_AZIMUTH + INTRO_AZIMUTH_OFFSET)
        .add(center)
      void controls.setLookAt(start.x, start.y, start.z, center.x, center.y, center.z, false)
      void controls.zoomTo(zoom * INTRO_ZOOM_FACTOR, false)
      void controls.setLookAt(position.x, position.y, position.z, center.x, center.y, center.z, true)
      void controls.zoomTo(zoom, true).then(() => {
        controls.minZoom = zoom * MIN_ZOOM_FACTOR
      })
    } else {
      void controls.setLookAt(position.x, position.y, position.z, center.x, center.y, center.z, false)
      void controls.zoomTo(zoom, false)
    }
    hasFitted.current = true
    invalidate()
  }, [controlsRef, targetRef, width, height, invalidate, intro])
}
