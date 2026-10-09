import { Environment } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import Headlights from './Headlights.tsx'
import { INTRO, lightLevel, screenLevel, useAnimationsEnabled, useIntroTime } from './introTimeline.ts'
import { DESK, FLOOR_Y, LAMP_BULB, LEFT_WALL_X, SCREEN_CENTER, SCREEN_SIZE, WINDOW_CENTER } from './roomLayout.ts'

// Required once for rectAreaLight to affect MeshStandardMaterial.
RectAreaLightUniformsLib.init()

// Late-night mood: the monitor is the main light source, the window adds a soft glow.
// Final intensities; the intro fades lights up from 0 to these.
const INTENSITY = {
  ambient: 0.18,
  environment: 0.25,
  monitorArea: 6,
  monitorFill: 4,
  windowSpot: 40,
  windowGlow: 2,
  lamp: 3,
  monitorBacklight: 3,
  deskUnderglow: 4,
}

// LED colours for the desk setup.
const BACKLIGHT_COLOR = '#8b5cf6'
const UNDERGLOW_COLOR = '#6366f1'
// Brightness of the visible LED strip under the desk (unlit, not tone mapped, so >1 blooms).
const STRIP_BRIGHTNESS = 2.2
const DESK_DEPTH = DESK.maxZ - DESK.minZ
const DESK_CENTER_Z = (DESK.minZ + DESK.maxZ) / 2

// Where the window light lands on the floor.
const WINDOW_LIGHT_TARGET: [number, number, number] = [WINDOW_CENTER[0] + 1, FLOOR_Y, WINDOW_CENTER[2] + 3]

type LightsProps = {
  /**
   * Mobile: no shadows and only the lights that shape the room (ambient, environment, monitor, window spot, lamp).
   * Decorative washes (window glow, LED backlight/underglow, headlights) are skipped; their glowing surfaces remain.
   */
  lite: boolean
}

function Lights({ lite }: LightsProps) {
  const shadows = !lite
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
  const lamp = useRef<THREE.PointLight>(null)
  const monitorBacklight = useRef<THREE.PointLight>(null)
  const deskUnderglow = useRef<THREE.RectAreaLight>(null)
  const ledStrip = useRef<THREE.MeshBasicMaterial>(null)
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
    if (lamp.current) lamp.current.intensity = INTENSITY.lamp * room
    // The LEDs come on with the monitor.
    if (monitorBacklight.current) monitorBacklight.current.intensity = INTENSITY.monitorBacklight * screen
    if (deskUnderglow.current) deskUnderglow.current.intensity = INTENSITY.deskUnderglow * screen
    if (ledStrip.current) ledStrip.current.color.set(UNDERGLOW_COLOR).multiplyScalar(STRIP_BRIGHTNESS * screen)
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
      {!lite && (
        <pointLight
          ref={windowGlow}
          position={[WINDOW_CENTER[0], WINDOW_CENTER[1], WINDOW_CENTER[2] + 0.6]}
          intensity={0}
          distance={5}
          color="#ffc58a"
        />
      )}

      {/* Bedside lamp: warm pool around the nightstand and bed. */}
      <pointLight ref={lamp} position={LAMP_BULB} intensity={0} distance={5} color="#ffae5c" />

      {/* Monitor backlight: soft LED glow on the wall behind the screen (a point light, so the halo has no hard edges). */}
      {!lite && (
        <pointLight
          ref={monitorBacklight}
          position={[LEFT_WALL_X + 0.08, SCREEN_CENTER[1] + 0.1, SCREEN_CENTER[2]]}
          intensity={0}
          distance={2.4}
          color={BACKLIGHT_COLOR}
        />
      )}

      {/* Desk underglow: LED strip under the desk's front edge, facing down onto the floor and chair. */}
      {!lite && (
        <rectAreaLight
          ref={deskUnderglow}
          position={[DESK.frontX - 0.15, DESK.topY - 0.12, DESK_CENTER_Z]}
          rotation={[-Math.PI / 2, 0, 0]}
          width={0.3}
          height={DESK_DEPTH * 0.95}
          intensity={0}
          color={UNDERGLOW_COLOR}
        />
      )}
      <mesh position={[DESK.frontX - 0.06, DESK.topY - 0.1, DESK_CENTER_Z]}>
        <boxGeometry args={[0.03, 0.03, DESK_DEPTH * 0.95]} />
        <meshBasicMaterial ref={ledStrip} color="#000000" toneMapped={false} />
      </mesh>

      {animate && !lite && <Headlights />}
    </>
  )
}

export default Lights
