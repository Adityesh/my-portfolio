import { Environment } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { useAppStore } from '../../store/useAppStore.ts'
import DeskLeds from './DeskLeds.tsx'
import Headlights from './Headlights.tsx'
import { INTRO, lightLevel, screenLevel, useAnimationsEnabled, useIntroTime } from './introTimeline.ts'
import { CEILING_LIGHT, CURTAIN_DAMPING, FLOOR_Y, LAMP_BULB, SCREEN_CENTER, SCREEN_SIZE, WINDOW_CENTER } from './roomLayout.ts'
import { sky } from './skyTimeline.ts'

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
}

// Room light (the wall switch): a warm ceiling bulb, plus a lift in ambient and environment so the shadowed
// corners open up too. Always mounted (at 0 when off) so switching doesn't change the light count and recompile shaders.
const ROOM_LIGHT = { ceiling: 40, ambient: 0.35, environment: 0.45, color: '#ffd9a8', ambientColor: '#ffe6c7' }
const NIGHT_AMBIENT_COLOR = '#8a9cff'
// How quickly the room light fades on/off (damping rate; higher is snappier, ~0.3 s here).
const ROOM_LIGHT_FADE = 12
// Daylight through the window (time of day, skyTimeline.ts), added in full daylight. The window lights take
// their colour from the sky: warm streetlight at night, sun by day.
const DAYLIGHT = { ambient: 0.3, environment: 0.5, windowSpot: 2.5, windowGlow: 3, ambientColor: '#d6e4ff' }

// Drawn curtains block most of the light coming in through the window (and the daylight lift with it).
const CURTAIN_BLOCK = 0.88

// Where the window light lands on the floor.
const WINDOW_LIGHT_TARGET: [number, number, number] = [WINDOW_CENTER[0] + 1, FLOOR_Y, WINDOW_CENTER[2] + 3]

type LightsProps = {
  /**
   * Lower quality levels: only the lights that shape the room (ambient, environment, monitor, window spot, lamp).
   * Decorative washes (window glow, LED backlight/underglow, headlights) are skipped; their glowing surfaces remain.
   */
  lite: boolean
  /** The window spotlight casts shadows. */
  shadows: boolean
}

function Lights({ lite, shadows }: LightsProps) {
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
  const ceiling = useRef<THREE.PointLight>(null)
  const introDone = useRef(false)
  const invalidate = useThree((state) => state.invalidate)
  const roomLight = useAppStore((state) => state.roomLight)
  // 0 = night (switch off), 1 = room light fully on.
  const switchLevel = useRef(0)
  // Bedside lamp (tap the lamp): 1 = on (the default), 0 = off.
  const bedLamp = useAppStore((state) => state.bedLamp)
  const lampLevel = useRef(1)
  // Curtains (tap a curtain): 0 = open, 1 = drawn. Same easing as Curtains.tsx so light and fabric move together.
  const curtainsClosed = useAppStore((state) => state.curtainsClosed)
  const curtainLevel = useRef(0)
  const nightAmbient = useMemo(() => new THREE.Color(NIGHT_AMBIENT_COLOR), [])
  const litAmbient = useMemo(() => new THREE.Color(ROOM_LIGHT.ambientColor), [])
  const dayAmbient = useMemo(() => new THREE.Color(DAYLIGHT.ambientColor), [])
  const seenSky = useRef(-1)

  // Intro: monitor light follows the screen flicker, room lights fade up after it. Afterwards this only does
  // work while the room light is fading or the sky changes.
  useFrame((state, delta) => {
    const target = roomLight ? 1 : 0
    const lampTarget = bedLamp ? 1 : 0
    const curtainTarget = curtainsClosed ? 1 : 0
    const fading = switchLevel.current !== target || lampLevel.current !== lampTarget || curtainLevel.current !== curtainTarget
    if (introDone.current && !fading && seenSky.current === sky.version) return
    seenSky.current = sky.version
    if (fading) {
      const ease = (from: number, to: number, rate: number) => {
        const next = THREE.MathUtils.damp(from, to, rate, delta)
        return Math.abs(next - to) < 0.002 ? to : next
      }
      switchLevel.current = ease(switchLevel.current, target, ROOM_LIGHT_FADE)
      lampLevel.current = ease(lampLevel.current, lampTarget, ROOM_LIGHT_FADE)
      curtainLevel.current = ease(curtainLevel.current, curtainTarget, CURTAIN_DAMPING)
      // Nothing else may be requesting frames (animations off), so keep the fade going.
      invalidate()
    }
    const lit = switchLevel.current
    // How much light still gets in through the window.
    const open = 1 - CURTAIN_BLOCK * curtainLevel.current
    const day = sky.daylight * open
    const t = getTime()
    const room = lightLevel(t)
    const screen = screenLevel(t)
    if (ambient.current) {
      ambient.current.intensity = (INTENSITY.ambient + DAYLIGHT.ambient * day + ROOM_LIGHT.ambient * lit) * room
      // Night blue toward daylight, then toward the warm room light when it's switched on.
      ambient.current.color.lerpColors(nightAmbient, dayAmbient, day).lerp(litAmbient, lit)
    }
    if (ceiling.current) ceiling.current.intensity = ROOM_LIGHT.ceiling * lit * room
    if (monitorArea.current) monitorArea.current.intensity = INTENSITY.monitorArea * screen
    if (monitorFill.current) monitorFill.current.intensity = INTENSITY.monitorFill * screen
    if (windowSpot.current) {
      windowSpot.current.intensity = INTENSITY.windowSpot * (1 + DAYLIGHT.windowSpot * day) * open * room
      windowSpot.current.color.copy(sky.windowLight)
    }
    if (windowGlow.current) {
      windowGlow.current.intensity = INTENSITY.windowGlow * (1 + DAYLIGHT.windowGlow * day) * open * room
      windowGlow.current.color.copy(sky.windowLight)
    }
    if (lamp.current) lamp.current.intensity = INTENSITY.lamp * lampLevel.current * room
    state.scene.environmentIntensity = (INTENSITY.environment + DAYLIGHT.environment * day + ROOM_LIGHT.environment * lit) * room
    if (t > INTRO.total) introDone.current = true
  })

  return (
    <>
      <primitive object={windowTarget} />
      <ambientLight ref={ambient} intensity={0} color={NIGHT_AMBIENT_COLOR} />
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

      {/* Ceiling light, switched by the wall switch by the door (off by default). */}
      <pointLight ref={ceiling} position={CEILING_LIGHT} intensity={0} distance={16} color={ROOM_LIGHT.color} />

      {/* Bedside lamp: warm pool around the nightstand and bed. */}
      <pointLight ref={lamp} position={LAMP_BULB} intensity={0} distance={5} color="#ffae5c" />

      {/* LEDs around the desk (backlight, underglow), following the RGB lighting mode. */}
      <DeskLeds lite={lite} />

      {animate && !lite && <Headlights />}
    </>
  )
}

export default Lights
