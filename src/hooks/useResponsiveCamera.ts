import type { CameraControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { SCREEN_CENTER, SCREEN_SIZE } from '../components/scene/roomLayout.ts'
import { useAppStore, type View } from '../store/useAppStore.ts'

const DEG = Math.PI / 180
// Camera angles around the room center. Azimuth 45° faces the room's open corner.
// Polar is measured from straight up: true isometric is ~54.7°, higher values look more from the side.
export const CAMERA_POLAR = 62 * DEG
export const CAMERA_AZIMUTH = 45 * DEG
export const VIEW_DIRECTION = new THREE.Vector3().setFromSphericalCoords(1, CAMERA_POLAR, CAMERA_AZIMUTH)
const CAMERA_DISTANCE = 20
// Fraction of the viewport the room should fill. Portrait screens are width-limited, so use a tighter margin there.
const FILL = 0.9
const FILL_PORTRAIT = 0.97
// Zoom limits relative to the fitted zoom.
const MIN_ZOOM_FACTOR = 0.9
const MAX_ZOOM_FACTOR = 2.5
// Rotation is kept close to the default view so the open (cut-away) sides of the room always face the camera.
const POLAR_RANGE: [number, number] = [CAMERA_POLAR - 12 * DEG, CAMERA_POLAR + 8 * DEG]
const AZIMUTH_RANGE: [number, number] = [CAMERA_AZIMUTH - 20 * DEG, CAMERA_AZIMUTH + 20 * DEG]

// Intro: the camera starts rotated and zoomed out, then eases into the fitted view.
const INTRO_AZIMUTH_OFFSET = 18 * DEG
const INTRO_POLAR_OFFSET = -8 * DEG
const INTRO_ZOOM_FACTOR = 0.8
const INTRO_SMOOTH_TIME = 0.9

// Monitor view: camera faces the screen head-on. It sits close so the chair ends up behind it
// (the camera is orthographic, so distance doesn't change the image size).
const MONITOR_DISTANCE = 1.2
// Fraction of the viewport the screen should fill.
const MONITOR_FILL = 0.88
// Seconds-ish for camera-controls to settle a view change.
const VIEW_SMOOTH_TIME = 0.4
// A view change counts as finished once zoom is within this fraction and position within this distance.
// (camera-controls' own rest check uses an absolute zoom threshold, which takes ages at high zoom.)
const ARRIVE_ZOOM_TOLERANCE = 0.015
const ARRIVE_DISTANCE = 0.05

const WORLD_UP = new THREE.Vector3(0, 1, 0)

type PendingArrival = {
  position: THREE.Vector3
  zoom: number
  onArrive: () => void
}

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

  return Math.min(width / (maxX - minX), height / (maxY - minY)) * (height > width ? FILL_PORTRAIT : FILL)
}

function setRoomLimits(controls: CameraControls, zoom: number) {
  controls.minPolarAngle = POLAR_RANGE[0]
  controls.maxPolarAngle = POLAR_RANGE[1]
  controls.minAzimuthAngle = AZIMUTH_RANGE[0]
  controls.maxAzimuthAngle = AZIMUTH_RANGE[1]
  controls.minZoom = zoom * MIN_ZOOM_FACTOR
  controls.maxZoom = zoom * MAX_ZOOM_FACTOR
}

function clearLimits(controls: CameraControls) {
  controls.minPolarAngle = 0
  controls.maxPolarAngle = Math.PI
  controls.minAzimuthAngle = -Infinity
  controls.maxAzimuthAngle = Infinity
  controls.minZoom = 0.01
  controls.maxZoom = Infinity
}

type Options = {
  /** Ease in from a rotated, zoomed-out pose on the first fit. */
  intro: boolean
  view: View
  /** Called when the camera settles after a view change. */
  onTransitionEnd: () => void
}

/**
 * Frames the room (`targetRef`) or the monitor screen depending on `view`, refitting on resize.
 * View changes animate; resizes snap unless a transition is already running.
 */
export function useResponsiveCamera(
  controlsRef: RefObject<CameraControls | null>,
  targetRef: RefObject<THREE.Object3D | null>,
  { intro, view, onTransitionEnd }: Options,
) {
  const hasFitted = useRef(false)
  const lastView = useRef<View>(view)
  const pending = useRef<PendingArrival | null>(null)
  const width = useThree((state) => state.size.width)
  const height = useThree((state) => state.size.height)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    const controls = controlsRef.current
    const target = targetRef.current
    if (!controls || !target) return

    const viewChanged = lastView.current !== view
    lastView.current = view
    const animate = viewChanged || useAppStore.getState().transitioning

    if (view === 'monitor') {
      const [x, y, z] = SCREEN_CENTER
      const zoom = Math.min(width / SCREEN_SIZE[0], height / SCREEN_SIZE[1]) * MONITOR_FILL
      controls.enabled = false
      controls.smoothTime = VIEW_SMOOTH_TIME
      clearLimits(controls)
      void controls.setLookAt(x + MONITOR_DISTANCE, y, z, x, y, z, animate)
      void controls.zoomTo(zoom, animate)
      pending.current = { position: new THREE.Vector3(x + MONITOR_DISTANCE, y, z), zoom, onArrive: onTransitionEnd }
      invalidate()
      return
    }

    const box = new THREE.Box3().setFromObject(target)
    const center = box.getCenter(new THREE.Vector3())
    const position = center.clone().addScaledVector(VIEW_DIRECTION, CAMERA_DISTANCE)
    const zoom = computeFitZoom(box, width, height)

    if (intro && !hasFitted.current) {
      const start = new THREE.Vector3()
        .setFromSphericalCoords(CAMERA_DISTANCE, CAMERA_POLAR + INTRO_POLAR_OFFSET, CAMERA_AZIMUTH + INTRO_AZIMUTH_OFFSET)
        .add(center)
      setRoomLimits(controls, zoom)
      controls.minZoom = zoom * INTRO_ZOOM_FACTOR
      controls.smoothTime = INTRO_SMOOTH_TIME
      void controls.setLookAt(start.x, start.y, start.z, center.x, center.y, center.z, false)
      void controls.zoomTo(zoom * INTRO_ZOOM_FACTOR, false)
      void controls.setLookAt(position.x, position.y, position.z, center.x, center.y, center.z, true)
      void controls.zoomTo(zoom, true).then(() => {
        controls.minZoom = zoom * MIN_ZOOM_FACTOR
      })
    } else {
      controls.smoothTime = VIEW_SMOOTH_TIME
      // Coming back from the monitor: limits stay open until the camera is home, so the path isn't clamped.
      if (!animate) setRoomLimits(controls, zoom)
      void controls.setLookAt(position.x, position.y, position.z, center.x, center.y, center.z, animate)
      void controls.zoomTo(zoom, animate)
      pending.current = {
        position,
        zoom,
        onArrive: () => {
          setRoomLimits(controls, zoom)
          controls.enabled = true
          onTransitionEnd()
        },
      }
    }
    hasFitted.current = true
    invalidate()
  }, [controlsRef, targetRef, width, height, invalidate, intro, view, onTransitionEnd])

  // Finish a pending view change once the camera is visually there.
  useFrame(({ camera }) => {
    const arrival = pending.current
    if (!arrival) return
    const zoomClose = Math.abs(camera.zoom - arrival.zoom) / arrival.zoom < ARRIVE_ZOOM_TOLERANCE
    if (zoomClose && camera.position.distanceTo(arrival.position) < ARRIVE_DISTANCE) {
      pending.current = null
      arrival.onArrive()
    }
  })
}
