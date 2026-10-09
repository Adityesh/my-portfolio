import { Environment } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import Headlights from './Headlights.tsx'
import { INTRO, lightLevel, screenLevel, useAnimationsEnabled, useIntroTime } from './introTimeline.ts'
import { FLOOR_Y, SCREEN_CENTER, SCREEN_SIZE, WINDOW_CENTER } from './roomLayout.ts'

// Required once for rectAreaLight to affect MeshStandardMaterial.
RectAreaLightUniformsLib.init()

// Late-night mood: the monitor is the main light source, the window adds a soft glow.
// Final intensities; the intro fades lights up from 0 to these.
const INTENSITY = {
  ambient: 0.1,
  environment: 0.15,
  monitorArea: 6,
  monitorFill: 4,
  windowSpot: 40,
  windowGlow: 2,
}

// Where the window light lands on the floor.
const WINDOW_LIGHT_TARGET: [number, number, number] = [WINDOW_CENTER[0] + 1, FLOOR_Y, WINDOW_CENTER[2] + 3]

type LightsProps = {
  shadows: boolean
}

function Lights({ shadows }: LightsProps) {
  const getTime = useIntroTime()
  const animate = useAnimationsEnabled()

  // A spot light's target must be in the scene for its position to take effect.
  const [windowTarget] = useState(() => {
    const target = new THREE.Object3D()
    target.position.set(...WINDOW_LIGHT_TARGET)
    return target
  })

  const ambient = useRef<THREE.AmbientLight>(null)
  const monitorArea = useRef<THREE.RectAreaLight>(null)
  const monitorFill = useRef<THREE.PointLight>(null)
  const windowSpot = useRef<THREE.SpotLight>(null)
  const windowGlow = useRef<THREE.PointLight>(null)
  const introDone = useRef(false)

  // Intro: monitor light follows the screen flicker, room lights fade up after it.
  useFrame((state) => {
    if (introDone.current) return
    const t = getTime()
    const room = lightLevel(t)
    const screen = screenLevel(t)
    if (ambient.current) ambient.current.intensity = INTENSITY.ambient * room
    if (monitorArea.current) monitorArea.current.intensity = INTENSITY.monitorArea * screen
    if (monitorFill.current) monitorFill.current.intensity = INTENSITY.monitorFill * screen
    if (windowSpot.current) windowSpot.current.intensity = INTENSITY.windowSpot * room
    if (windowGlow.current) windowGlow.current.intensity = INTENSITY.windowGlow * room
    state.scene.environmentIntensity = INTENSITY.environment * room
    if (t > INTRO.total) introDone.current = true
  })

  return (
    <>
      <primitive object={windowTarget} />
      <ambientLight ref={ambient} intensity={0} color="#8a9cff" />
      {/* Self-hosted "Dikhololo Night" HDRI (Poly Haven, CC0), downscaled to 256x128; same image as drei's "night" preset. */}
      <Environment files="/hdri/night_256.hdr" environmentIntensity={0} />

      {/* Monitor: area light just in front of the screen facing into the room (+x), plus a soft spill on the desk. */}
      <rectAreaLight
        ref={monitorArea}
        position={[SCREEN_CENTER[0] + 0.08, SCREEN_CENTER[1], SCREEN_CENTER[2]]}
        rotation={[0, -Math.PI / 2, 0]}
        width={SCREEN_SIZE[0]}
        height={SCREEN_SIZE[1]}
        intensity={0}
        color="#a8c8ff"
      />
      <pointLight
        ref={monitorFill}
        position={[SCREEN_CENTER[0] + 1.3, SCREEN_CENTER[1] - 0.3, SCREEN_CENTER[2]]}
        intensity={0}
        distance={8}
        color="#7fb0ff"
      />

      {/* Window: warm streetlight spilling in, placed just inside the opening (the walls would block it from outside). */}
      <spotLight
        ref={windowSpot}
        position={[WINDOW_CENTER[0], WINDOW_CENTER[1] + 0.8, WINDOW_CENTER[2] + 0.4]}
        target={windowTarget}
        angle={0.7}
        penumbra={1}
        intensity={0}
        distance={10}
        color="#ffb36b"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      <pointLight
        ref={windowGlow}
        position={[WINDOW_CENTER[0], WINDOW_CENTER[1], WINDOW_CENTER[2] + 0.6]}
        intensity={0}
        distance={5}
        color="#ffc58a"
      />

      {animate && <Headlights />}
    </>
  )
}

export default Lights
