import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { FLOOR_Y, WINDOW, WINDOW_CENTER } from './roomLayout.ts'
import { sky } from './skyTimeline.ts'

// A passing car's headlights sweeping through the window every so often.
const SWEEP_SECONDS = 3.2
const MIN_GAP_SECONDS = 12
const MAX_GAP_SECONDS = 22
const FIRST_SWEEP_AT = 6
const PEAK_INTENSITY = 700

// The beam enters near the window and its target slides across the bed, floor and desk wall.
const SOURCE_Y = WINDOW_CENTER[1] + 0.2
const SOURCE_Z = WINDOW.insideZ + 0.2
const SWEEP_FROM = new THREE.Vector3(4.2, FLOOR_Y, -0.5)
const SWEEP_TO = new THREE.Vector3(-4.6, 1.6, 0.5)

function Headlights() {
  const light = useRef<THREE.SpotLight>(null)
  const [target] = useState(() => new THREE.Object3D())
  const sweep = useRef({ start: FIRST_SWEEP_AT, leftToRight: true })
  useFrame((state) => {
    const spot = light.current
    if (!spot) return
    const t = state.clock.elapsedTime
    const s = sweep.current
    const p = (t - s.start) / SWEEP_SECONDS

    if (p < 0) {
      spot.intensity = 0
      return
    }
    if (p > 1) {
      spot.intensity = 0
      s.start = t + MIN_GAP_SECONDS + Math.random() * (MAX_GAP_SECONDS - MIN_GAP_SECONDS)
      s.leftToRight = !s.leftToRight
      return
    }

    const k = s.leftToRight ? p : 1 - p
    // Source slides along the window as the car passes; the beam fades in and out.
    spot.position.set(THREE.MathUtils.lerp(WINDOW.maxX, WINDOW.minX, k), SOURCE_Y, SOURCE_Z)
    target.position.lerpVectors(SWEEP_FROM, SWEEP_TO, k)
    // Only noticeable after dark: fades out as daylight comes up (skyTimeline.ts).
    const night = 1 - THREE.MathUtils.smoothstep(sky.daylight, 0.1, 0.3)
    spot.intensity = PEAK_INTENSITY * Math.sin(Math.PI * p) * night
  })

  return (
    <>
      <primitive object={target} />
      <spotLight ref={light} target={target} intensity={0} angle={0.45} penumbra={0.9} distance={14} color="#fff1d6" />
    </>
  )
}

export default Headlights
