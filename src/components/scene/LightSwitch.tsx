import { RoundedBox, useCursor } from '@react-three/drei'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { playClick } from '../../audio/sfx.ts'
import { useIsMobile } from '../../hooks/useIsMobile.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import { useSettingsStore } from '../../store/useSettingsStore.ts'
import { INTRO, lightLevel, useAnimationsEnabled, useIntroTime } from './introTimeline.ts'
import { LIGHT_SWITCH } from './roomLayout.ts'

// Wall plate and rocker, in the switch's own frame (+z out of the wall). A little larger than life so it's
// a reasonable target at the default zoom.
const PLATE: [number, number, number] = [0.26, 0.38, 0.025]
const ROCKER: [number, number, number] = [0.1, 0.18, 0.03]
// Rocker tilt: top pressed in when on.
const ROCKER_TILT = 0.2
const ROCKER_DAMPING = 30
// Locator LED under the rocker: glows amber in the dark so the switch can be found, dims when the light is on.
const LED = { radius: 0.014, y: -0.135, color: '#ffa53d', dark: 2.2, lit: 0.35 }
// Idle pulse as a "tap me" hint (stronger on touch devices, where there is no hover).
const PULSE = { amount: 0.25, touch: 0.5, speed: 2.4 }
const HOVER_BRIGHTNESS = 1.6
// Pixels the pointer may move between down and up and still count as a click (vs. a camera drag).
const CLICK_TOLERANCE = 6
// Hit area relative to the plate; much bigger on touch devices since the switch is small.
const HIT_PADDING = 1.4
const HIT_PADDING_TOUCH = 2.4
// Turning on sounds a touch higher than turning off.
const CLICK_PITCH = { on: 1.1, off: 0.9 }

/** Wall switch by the door that turns the ceiling light on and off. */
function LightSwitch() {
  const isMobile = useIsMobile()
  const animate = useAnimationsEnabled()
  const getTime = useIntroTime()
  const invalidate = useThree((state) => state.invalidate)
  const active = useAppStore((state) => state.view === 'room' && !state.transitioning)
  const roomLight = useAppStore((state) => state.roomLight)
  const setRoomLight = useAppStore((state) => state.setRoomLight)
  const sound = useSettingsStore((state) => state.sound)
  const [hovered, setHovered] = useState(false)
  useCursor(active && hovered)

  const rocker = useRef<THREE.Mesh>(null)
  const ledMaterial = useRef<THREE.MeshBasicMaterial>(null)
  const ledColor = useMemo(() => new THREE.Color(LED.color), [])

  useFrame((state, delta) => {
    const t = getTime()
    if (rocker.current) {
      const target = roomLight ? -ROCKER_TILT : ROCKER_TILT
      const x = THREE.MathUtils.damp(rocker.current.rotation.x, target, ROCKER_DAMPING, delta)
      rocker.current.rotation.x = Math.abs(x - target) < 0.001 ? target : x
      // Keep drawing until the rocker settles (nothing else may be requesting frames).
      if (rocker.current.rotation.x !== target) invalidate()
    }
    if (ledMaterial.current) {
      const isHovered = hovered && active
      const pulseAmount = isMobile ? PULSE.touch : PULSE.amount
      const pulse =
        animate && !isHovered && !roomLight && t > INTRO.total ? 1 + Math.sin(state.clock.elapsedTime * PULSE.speed) * pulseAmount : 1
      const brightness = (roomLight ? LED.lit : LED.dark) * pulse * (isHovered ? HOVER_BRIGHTNESS : 1) * lightLevel(t)
      ledMaterial.current.color.copy(ledColor).multiplyScalar(brightness)
    }
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!active || e.delta > CLICK_TOLERANCE) return
    e.stopPropagation()
    const on = !roomLight
    setRoomLight(on)
    if (sound) playClick(on ? CLICK_PITCH.on : CLICK_PITCH.off)
    invalidate()
  }

  const setHover = (value: boolean) => {
    setHovered(value)
    invalidate()
  }

  const padding = isMobile ? HIT_PADDING_TOUCH : HIT_PADDING

  return (
    // Rotated so the switch's +z faces +x, out of the x-min wall into the room.
    <group position={LIGHT_SWITCH} rotation={[0, Math.PI / 2, 0]}>
      <RoundedBox args={PLATE} radius={0.01} smoothness={2} position={[0, 0, PLATE[2] / 2]}>
        <meshStandardMaterial color="#d9d3c7" roughness={0.55} />
      </RoundedBox>
      <mesh ref={rocker} position={[0, 0.02, PLATE[2]]} rotation={[ROCKER_TILT, 0, 0]}>
        <boxGeometry args={ROCKER} />
        <meshStandardMaterial color="#ece7dc" roughness={0.45} />
      </mesh>
      <mesh position={[0, LED.y, PLATE[2] + 0.002]}>
        <circleGeometry args={[LED.radius, 12]} />
        <meshBasicMaterial ref={ledMaterial} color="#000000" toneMapped={false} />
      </mesh>

      {/* Invisible hit area (much larger on touch devices). */}
      <mesh
        position={[0, 0, PLATE[2] + 0.06]}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(true)
        }}
        onPointerOut={() => setHover(false)}
      >
        <planeGeometry args={[PLATE[0] * padding, PLATE[1] * padding]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default LightSwitch
