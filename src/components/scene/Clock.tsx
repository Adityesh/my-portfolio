/*
Generated with gltfjsx 6.5.3 from models-src/clock.zip (scene.gltf), then edited:
  npx gltfjsx scene.gltf --transform --types --keepnames --keepmeshes --simplify --ratio 0.15 --error 0.001
Title: Clock, by hitheredearjohn (https://sketchfab.com/hitheredearjohn)
Source: https://sketchfab.com/3d-models/clock-cd0e6a816e6942b587846dd1e866d59e
License: SKETCHFAB Standard. Confirm it permits serving the model on a public website before deploying.
*/

import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { playChime, playClick } from '../../audio/sfx.ts'
import { useIsMobile } from '../../hooks/useIsMobile.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import { useSettingsStore } from '../../store/useSettingsStore.ts'
import { DRACO_PATH } from './assetPaths.ts'
import { useAnimationsEnabled } from './introTimeline.ts'
import { CLOCK_CENTER } from './roomLayout.ts'
import { TIMELAPSE_SECONDS, timelapseEase } from './skyTimeline.ts'
import { useTapTarget } from './useTapTarget.ts'

const MODEL_URL = '/models/clock.glb'
// The model's face points +y with 12 o'clock at -z and a radius of ~2.98 units.
const MODEL_RADIUS = 2.98
// Radius on the wall, in world units.
const RADIUS = 0.55
// Stand the clock against the x-min wall: face toward +x (into the room), 12 o'clock up, 3 o'clock toward -z.
const ORIENTATION = new THREE.Euler().setFromRotationMatrix(
  new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, -1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, -1, 0)),
)
const TAU = Math.PI * 2
// Seconds the second hand takes to snap to the next tick.
const TICK_SECONDS = 0.15
// During a time-lapse the second hand spins this many extra turns (a readable spin, not a strobing blur).
const TIMELAPSE_SECOND_TURNS = 20
// Hit circle relative to the face on touch devices.
const HIT_PADDING_TOUCH = 1.3
// Local time = UTC minus the timezone offset (read once at load; fine for a page visit).
const TIMEZONE_OFFSET_MS = new Date().getTimezoneOffset() * 60_000

type GLTFResult = GLTF & {
  nodes: {
    '10_0': THREE.Mesh
    '11_0': THREE.Mesh
    '12_0': THREE.Mesh
    '1_0': THREE.Mesh
    '2_0': THREE.Mesh
    '3_0': THREE.Mesh
    '4_0': THREE.Mesh
    '5_0': THREE.Mesh
    '6_0': THREE.Mesh
    '7_0': THREE.Mesh
    '8_0': THREE.Mesh
    '9_0': THREE.Mesh
    'clock_main_0': THREE.Mesh
    'clock_main_1': THREE.Mesh
    'hour_hand_0': THREE.Mesh
    'hourmark002_0': THREE.Mesh
    'hourmark003_0': THREE.Mesh
    'hourmark004_0': THREE.Mesh
    'hourmark005_0': THREE.Mesh
    'hourmark006_0': THREE.Mesh
    'hourmark007_0': THREE.Mesh
    'hourmark008_0': THREE.Mesh
    'hourmark009_0': THREE.Mesh
    'hourmark010_0': THREE.Mesh
    'hourmark011_0': THREE.Mesh
    'hourmark012_0': THREE.Mesh
    'hourmark013_0': THREE.Mesh
    'middle_0': THREE.Mesh
    'minute_hand_0': THREE.Mesh
    'minutemark002_0': THREE.Mesh
    'minutemark003_0': THREE.Mesh
    'minutemark004_0': THREE.Mesh
    'minutemark005_0': THREE.Mesh
    'minutemark006_0': THREE.Mesh
    'minutemark007_0': THREE.Mesh
    'minutemark008_0': THREE.Mesh
    'minutemark009_0': THREE.Mesh
    'minutemark010_0': THREE.Mesh
    'minutemark011_0': THREE.Mesh
    'minutemark012_0': THREE.Mesh
    'minutemark013_0': THREE.Mesh
    'second_hand_0': THREE.Mesh
  }
}

/** Wall clock above the monitor showing the visitor's local time. */
function Clock() {
  const { nodes } = useGLTF(MODEL_URL, DRACO_PATH) as unknown as GLTFResult
  const animate = useAnimationsEnabled()
  const isMobile = useIsMobile()
  const sound = useSettingsStore((state) => state.sound)
  const setTimelapseAt = useAppStore((state) => state.setTimelapseAt)
  const timelapseRunning = useAppStore((state) => state.timelapseAt !== null)

  // Replace the model's (unsupported spec-gloss) materials with ones that suit the dark room.
  const materials = useMemo(
    () => ({
      case: new THREE.MeshStandardMaterial({ color: '#1b2030', metalness: 0.6, roughness: 0.35 }),
      // Faint glow so the dial reads in the dark, like a luminous face.
      dial: new THREE.MeshStandardMaterial({ color: '#d9e2f2', roughness: 0.6, emissive: '#b8c8ff', emissiveIntensity: 0.18 }),
      marks: new THREE.MeshStandardMaterial({ color: '#141824', roughness: 0.5 }),
      hands: new THREE.MeshStandardMaterial({ color: '#10131c', roughness: 0.4, metalness: 0.3 }),
      second: new THREE.MeshStandardMaterial({ color: '#ff4d5e', roughness: 0.4, emissive: '#ff2d40', emissiveIntensity: 0.4 }),
    }),
    [],
  )
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials])

  // Redraw once a second so the time stays right even when animations are off (no frame driver running).
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    const id = window.setInterval(() => invalidate(), 1000)
    return () => window.clearInterval(id)
  }, [invalidate])

  const hourHand = useRef<THREE.Mesh>(null)
  const minuteHand = useRef<THREE.Mesh>(null)
  const secondHand = useRef<THREE.Mesh>(null)

  useFrame(() => {
    // During a time-lapse the hands race through a whole day on top of the real time (so they end where they were);
    // the second hand just spins a readable number of turns instead of an aliasing blur.
    const { timelapseAt } = useAppStore.getState()
    const p = timelapseAt === null ? 0 : timelapseEase((performance.now() - timelapseAt) / (TIMELAPSE_SECONDS * 1000))
    const seconds = (Date.now() - TIMEZONE_OFFSET_MS) / 1000 + p * 24 * 3600
    const m = (seconds / 60) % 60
    const h = (seconds / 3600) % 12
    // Second hand ticks: holds, then snaps to the next second.
    const realS = ((Date.now() - TIMEZONE_OFFSET_MS) / 1000) % 60
    const tick = Math.floor(realS) + Math.min(1, (realS % 1) / TICK_SECONDS) + p * TIMELAPSE_SECOND_TURNS * 60
    // Negative z-rotation turns the hands clockwise.
    if (secondHand.current) secondHand.current.rotation.z = -(tick / 60) * TAU
    if (minuteHand.current) minuteHand.current.rotation.z = -(m / 60) * TAU
    if (hourHand.current) hourHand.current.rotation.z = -(h / 12) * TAU
  })

  // Tap the clock: a day in ten seconds (the window, sky and room light follow; see SkyClock). With animations off,
  // just the chime.
  const { bind } = useTapTarget(
    () => {
      if (!animate) {
        if (sound) playChime()
        return
      }
      if (useAppStore.getState().timelapseAt !== null) return
      setTimelapseAt(performance.now())
      if (sound) playClick(1.6)
    },
    {
      id: 'clock',
      name: 'Wall clock',
      action: timelapseRunning ? 'Time-lapsing a day…' : 'Time-lapse a day',
      anchor: [CLOCK_CENTER[0], CLOCK_CENTER[1] + RADIUS + 0.2, CLOCK_CENTER[2]],
      order: 12,
    },
  )

  return (
    <>
      {/* Invisible hit circle over the face (facing +x, into the room); a little bigger on touch devices. */}
      <mesh position={[CLOCK_CENTER[0] + 0.08, CLOCK_CENTER[1], CLOCK_CENTER[2]]} rotation={[0, Math.PI / 2, 0]} {...bind}>
        <circleGeometry args={[RADIUS * (isMobile ? HIT_PADDING_TOUCH : 1.05), 24]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group position={CLOCK_CENTER} rotation={ORIENTATION} scale={RADIUS / MODEL_RADIUS} dispose={null}>
        <mesh geometry={nodes.clock_main_0.geometry} material={materials.case} rotation={[-Math.PI / 2, 0, 0]} />
        <mesh geometry={nodes.clock_main_1.geometry} material={materials.dial} rotation={[-Math.PI / 2, 0, 0]} />
        <mesh geometry={nodes.middle_0.geometry} material={materials.hands} position={[0, 0.455, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.055} />
        {/* Numbers and tick marks */}
        <mesh geometry={nodes['12_0'].geometry} material={materials.marks} position={[-0.15, 0.408, -1.983]} rotation={[-Math.PI / 2, 0, 0]} scale={0.658} />
        <mesh geometry={nodes['11_0'].geometry} material={materials.marks} position={[-1.128, 0.408, -1.703]} rotation={[-Math.PI / 2, 0, 0]} scale={0.658} />
        <mesh geometry={nodes['10_0'].geometry} material={materials.marks} position={[-1.858, 0.408, -0.979]} rotation={[-Math.PI / 2, 0, 0]} scale={0.658} />
        <mesh geometry={nodes['4_0'].geometry} material={materials.marks} position={[1.706, 0.408, 1.016]} rotation={[-Math.PI / 2, 0, 0]} scale={0.658} />
        <mesh geometry={nodes['5_0'].geometry} material={materials.marks} position={[0.982, 0.408, 1.703]} rotation={[-Math.PI / 2, 0, 0]} scale={0.658} />
        <mesh geometry={nodes['6_0'].geometry} material={materials.marks} position={[-0.009, 0.408, 1.983]} rotation={[-Math.PI / 2, 0, 0]} scale={0.658} />
        <mesh geometry={nodes['7_0'].geometry} material={materials.marks} position={[-1.016, 0.408, 1.706]} rotation={[-Math.PI / 2, 0, 0]} scale={0.658} />
        <mesh geometry={nodes['8_0'].geometry} material={materials.marks} position={[-1.703, 0.408, 0.982]} rotation={[-Math.PI / 2, 0, 0]} scale={0.658} />
        <mesh geometry={nodes['9_0'].geometry} material={materials.marks} position={[-1.963, 0.408, 0.009]} rotation={[-Math.PI / 2, 0, 0]} scale={0.658} />
        <mesh geometry={nodes['3_0'].geometry} material={materials.marks} position={[1.983, 0.408, 0.009]} rotation={[-Math.PI / 2, 0, 0]} scale={0.658} />
        <mesh geometry={nodes['2_0'].geometry} material={materials.marks} position={[1.703, 0.408, -0.982]} rotation={[-Math.PI / 2, 0, 0]} scale={0.658} />
        <mesh geometry={nodes['1_0'].geometry} material={materials.marks} position={[1.016, 0.408, -1.706]} rotation={[-Math.PI / 2, 0, 0]} scale={0.658} />
        <mesh geometry={nodes.minutemark002_0.geometry} material={materials.marks} position={[-0.634, 0.413, 2.369]} rotation={[-Math.PI / 2, 0, 2.723]} scale={[0.014, 0.049, 0.017]} />
        <mesh geometry={nodes.minutemark003_0.geometry} material={materials.marks} position={[0.635, 0.413, 2.369]} rotation={[-Math.PI / 2, 0, -3.036]} scale={[0.014, 0.049, 0.017]} />
        <mesh geometry={nodes.minutemark004_0.geometry} material={materials.marks} position={[1.734, 0.413, 1.733]} rotation={[-Math.PI / 2, 0, -2.514]} scale={[0.014, 0.049, 0.017]} />
        <mesh geometry={nodes.minutemark005_0.geometry} material={materials.marks} position={[2.369, 0.413, 0.634]} rotation={[-Math.PI / 2, 0, -1.99]} scale={[0.014, 0.049, 0.017]} />
        <mesh geometry={nodes.minutemark006_0.geometry} material={materials.marks} position={[2.369, 0.413, -0.635]} rotation={[-Math.PI / 2, 0, -1.465]} scale={[0.014, 0.049, 0.017]} />
        <mesh geometry={nodes.minutemark007_0.geometry} material={materials.marks} position={[1.733, 0.413, -1.734]} rotation={[-Math.PI / 2, 0, -0.943]} scale={[0.014, 0.049, 0.017]} />
        <mesh geometry={nodes.minutemark008_0.geometry} material={materials.marks} position={[0.634, 0.413, -2.369]} rotation={[-Math.PI / 2, 0, -0.419]} scale={[0.014, 0.049, 0.017]} />
        <mesh geometry={nodes.minutemark009_0.geometry} material={materials.marks} position={[-0.635, 0.413, -2.369]} rotation={[-Math.PI / 2, 0, 0.105]} scale={[0.014, 0.049, 0.017]} />
        <mesh geometry={nodes.minutemark010_0.geometry} material={materials.marks} position={[-1.734, 0.413, -1.733]} rotation={[-Math.PI / 2, 0, 0.628]} scale={[0.014, 0.049, 0.017]} />
        <mesh geometry={nodes.minutemark011_0.geometry} material={materials.marks} position={[-2.369, 0.413, -0.634]} rotation={[-Math.PI / 2, 0, 1.152]} scale={[0.014, 0.049, 0.017]} />
        <mesh geometry={nodes.minutemark012_0.geometry} material={materials.marks} position={[-2.369, 0.413, 0.635]} rotation={[-Math.PI / 2, 0, 1.676]} scale={[0.014, 0.049, 0.017]} />
        <mesh geometry={nodes.minutemark013_0.geometry} material={materials.marks} position={[-1.733, 0.413, 1.734]} rotation={[-Math.PI / 2, 0, 2.198]} scale={[0.014, 0.049, 0.017]} />
        <mesh geometry={nodes.hourmark002_0.geometry} material={materials.marks} position={[0, 0.413, 2.44]} rotation={[-Math.PI / 2, 0, -3.142]} scale={[0.024, 0.082, 0.028]} />
        <mesh geometry={nodes.hourmark003_0.geometry} material={materials.marks} position={[1.22, 0.413, 2.113]} rotation={[-Math.PI / 2, 0, -2.617]} scale={[0.024, 0.082, 0.028]} />
        <mesh geometry={nodes.hourmark004_0.geometry} material={materials.marks} position={[2.113, 0.413, 1.22]} rotation={[-Math.PI / 2, 0, -2.095]} scale={[0.024, 0.082, 0.028]} />
        <mesh geometry={nodes.hourmark005_0.geometry} material={materials.marks} position={[2.44, 0.413, 0]} rotation={[-Math.PI / 2, 0, -1.571]} scale={[0.024, 0.082, 0.028]} />
        <mesh geometry={nodes.hourmark006_0.geometry} material={materials.marks} position={[2.113, 0.413, -1.22]} rotation={[-Math.PI / 2, 0, -1.046]} scale={[0.024, 0.082, 0.028]} />
        <mesh geometry={nodes.hourmark007_0.geometry} material={materials.marks} position={[1.22, 0.413, -2.113]} rotation={[-Math.PI / 2, 0, -0.524]} scale={[0.024, 0.082, 0.028]} />
        <mesh geometry={nodes.hourmark008_0.geometry} material={materials.marks} position={[0, 0.413, -2.44]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.024, 0.082, 0.028]} />
        <mesh geometry={nodes.hourmark009_0.geometry} material={materials.marks} position={[-1.22, 0.413, -2.113]} rotation={[-Math.PI / 2, 0, 0.524]} scale={[0.024, 0.082, 0.028]} />
        <mesh geometry={nodes.hourmark010_0.geometry} material={materials.marks} position={[-2.113, 0.413, -1.22]} rotation={[-Math.PI / 2, 0, 1.047]} scale={[0.024, 0.082, 0.028]} />
        <mesh geometry={nodes.hourmark011_0.geometry} material={materials.marks} position={[-2.44, 0.413, 0]} rotation={[-Math.PI / 2, 0, 1.571]} scale={[0.024, 0.082, 0.028]} />
        <mesh geometry={nodes.hourmark012_0.geometry} material={materials.marks} position={[-2.113, 0.413, 1.22]} rotation={[-Math.PI / 2, 0, 2.095]} scale={[0.024, 0.082, 0.028]} />
        <mesh geometry={nodes.hourmark013_0.geometry} material={materials.marks} position={[-1.22, 0.413, 2.113]} rotation={[-Math.PI / 2, 0, 2.617]} scale={[0.024, 0.082, 0.028]} />
        {/* Hands */}
        <mesh ref={hourHand} geometry={nodes.hour_hand_0.geometry} material={materials.hands} position={[0, 0.469, 0]} rotation={[-Math.PI / 2, 0, 0]} />
        <mesh ref={minuteHand} geometry={nodes.minute_hand_0.geometry} material={materials.hands} position={[0, 0.499, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.089, 0.089, 0.056]} />
        <mesh ref={secondHand} geometry={nodes.second_hand_0.geometry} material={materials.second} position={[0, 0.522, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.089, 0.089, 0.026]} />
      </group>
    </>
  )
}

useGLTF.preload(MODEL_URL, DRACO_PATH)

export default Clock
