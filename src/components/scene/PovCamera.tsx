import { PerspectiveCamera } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { PovViewpoint } from '../../store/viewpoints.ts'
import { useAnimationsEnabled } from './introTimeline.ts'
import { VIEWPOINT_POSES } from './roomLayout.ts'

const DEG = Math.PI / 180
// Moving between first-person viewpoints: an eased glide (instant with animations off).
const GLIDE_SECONDS = 1.4
// Look-around: degrees per pixel dragged ("grab the view": drag right to look left).
const DRAG_DEGREES_PER_PIXEL = 0.22
// After letting go, the view eases back to centre: wait this long, then damp at this rate.
const SPRING_DELAY_SECONDS = 0.6
const SPRING_RATE = 2.2
const UP = new THREE.Vector3(0, 1, 0)
const RIGHT = new THREE.Vector3(1, 0, 0)

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2)
const now = () => performance.now() / 1000

// Scratch objects for the per-frame maths (nothing is allocated inside the frame loop).
const _m = new THREE.Matrix4()
const _eye = new THREE.Vector3()
const _target = new THREE.Vector3()

/** Orientation looking from `eye` to `target`. */
function lookRotation(eye: THREE.Vector3Tuple, target: THREE.Vector3Tuple, out: THREE.Quaternion): THREE.Quaternion {
  _m.lookAt(_eye.set(...eye), _target.set(...target), UP)
  return out.setFromRotationMatrix(_m)
}

type PovCameraProps = {
  viewpoint: PovViewpoint
}

/**
 * Perspective camera for the first-person viewpoints (mounted only while one is active; the room view's
 * orthographic camera comes back when it unmounts). Glides between viewpoints and lets you drag to look around
 * within each viewpoint's limits, easing back to centre when you let go.
 */
function PovCamera({ viewpoint }: PovCameraProps) {
  const camera = useRef<THREE.PerspectiveCamera>(null)
  const dom = useThree((state) => state.gl.domElement)
  const invalidate = useThree((state) => state.invalidate)
  const animate = useAnimationsEnabled()

  // Where a glide starts from (null = no glide, just sit at the pose).
  const glide = useRef<{ start: number; position: THREE.Vector3; quaternion: THREE.Quaternion; fov: number } | null>(null)
  const look = useRef({ yaw: 0, pitch: 0, dragging: false, releasedAt: -Infinity, x: 0, y: 0 })
  const scratch = useRef({ base: new THREE.Quaternion(), yaw: new THREE.Quaternion(), pitch: new THREE.Quaternion(), q: new THREE.Quaternion() })
  const shown = useRef<PovViewpoint | null>(null)

  // A new viewpoint while one is already showing: glide from the current camera pose.
  useEffect(() => {
    const cam = camera.current
    if (cam && shown.current !== null && shown.current !== viewpoint && animate) {
      glide.current = { start: now(), position: cam.position.clone(), quaternion: cam.quaternion.clone(), fov: cam.fov }
    }
    shown.current = viewpoint
    invalidate()
  }, [viewpoint, animate, invalidate])

  // Drag to look around (pointer events on the canvas; taps on objects still work, they barely move).
  useEffect(() => {
    const l = look.current
    const onDown = (e: PointerEvent) => {
      if (!e.isPrimary || e.button !== 0) return
      l.dragging = true
      l.x = e.clientX
      l.y = e.clientY
    }
    const onMove = (e: PointerEvent) => {
      if (!l.dragging || !e.isPrimary) return
      const pose = VIEWPOINT_POSES[shown.current ?? viewpoint]
      l.yaw = THREE.MathUtils.clamp(l.yaw + (e.clientX - l.x) * DRAG_DEGREES_PER_PIXEL * DEG, -pose.yaw * DEG, pose.yaw * DEG)
      l.pitch = THREE.MathUtils.clamp(l.pitch + (e.clientY - l.y) * DRAG_DEGREES_PER_PIXEL * DEG, -pose.pitch * DEG, pose.pitch * DEG)
      l.x = e.clientX
      l.y = e.clientY
      invalidate()
    }
    const onUp = () => {
      if (!l.dragging) return
      l.dragging = false
      l.releasedAt = now()
      invalidate()
    }
    dom.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      dom.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [dom, invalidate, viewpoint])

  useFrame((_, delta) => {
    const cam = camera.current
    if (!cam) return
    const pose = VIEWPOINT_POSES[viewpoint]
    const l = look.current
    const s = scratch.current

    // Ease the head back to centre a moment after letting go.
    let moving = l.dragging
    if (!l.dragging && now() - l.releasedAt > SPRING_DELAY_SECONDS && (l.yaw !== 0 || l.pitch !== 0)) {
      const k = animate ? 1 - Math.exp(-SPRING_RATE * delta) : 1
      l.yaw = Math.abs(l.yaw) < 1e-4 ? 0 : l.yaw * (1 - k)
      l.pitch = Math.abs(l.pitch) < 1e-4 ? 0 : l.pitch * (1 - k)
      moving = true
    } else if (!l.dragging && (l.yaw !== 0 || l.pitch !== 0)) {
      moving = true
    }

    // Target orientation: look at the pose's target, then turn the head (yaw about world up, pitch about the
    // camera's own right axis).
    lookRotation(pose.eye, pose.target, s.base)
    s.yaw.setFromAxisAngle(UP, l.yaw)
    s.pitch.setFromAxisAngle(RIGHT, l.pitch)
    s.q.copy(s.yaw).multiply(s.base).multiply(s.pitch)

    const g = glide.current
    const p = g ? (now() - g.start) / GLIDE_SECONDS : 1
    if (g && p < 1) {
      const t = ease(p)
      cam.position.lerpVectors(g.position, _eye.set(...pose.eye), t)
      cam.quaternion.slerpQuaternions(g.quaternion, s.q, t)
      cam.fov = THREE.MathUtils.lerp(g.fov, pose.fov, t)
      moving = true
    } else {
      glide.current = null
      cam.position.set(...pose.eye)
      cam.quaternion.copy(s.q)
      cam.fov = pose.fov
    }
    cam.updateProjectionMatrix()
    // Frames are on demand: keep them coming while anything is moving.
    if (moving) invalidate()
  })

  const pose = VIEWPOINT_POSES[viewpoint]
  return <PerspectiveCamera ref={camera} makeDefault position={pose.eye} fov={pose.fov} near={0.05} far={60} />
}

export default PovCamera
