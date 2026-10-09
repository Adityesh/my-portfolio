import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore.ts'
import { screenLevel, useAnimationsEnabled, useIntroTime } from './introTimeline.ts'
import { DESK, LEFT_WALL_X, SCREEN_CENTER } from './roomLayout.ts'
import { RGB_FADE, rgbTarget } from './rgbLighting.ts'

// LEDs around the desk: a backlight on the wall behind the monitor and a strip under the desk's front edge
// (visible strip + a light washing the floor and chair). They come on with the monitor during the intro and follow
// the RGB lighting mode (tap the PC tower).
const INTENSITY = { backlight: 3, underglow: 4 }
// Brightness of the visible strip under the desk (unlit, not tone mapped, so >1 blooms).
const STRIP_BRIGHTNESS = 2.2
const DESK_DEPTH = DESK.maxZ - DESK.minZ
const DESK_CENTER_Z = (DESK.minZ + DESK.maxZ) / 2

type DeskLedsProps = {
  /** Lower quality levels skip the real lights (the strip itself still glows). */
  lite: boolean
}

function DeskLeds({ lite }: DeskLedsProps) {
  const animate = useAnimationsEnabled()
  const getTime = useIntroTime()
  const mode = useAppStore((state) => state.rgbMode)
  const backlight = useRef<THREE.PointLight>(null)
  const underglow = useRef<THREE.RectAreaLight>(null)
  const strip = useRef<THREE.MeshBasicMaterial>(null)
  // Current (crossfading) colours and levels per part, and a scratch target.
  const state = useMemo(
    () => ({
      backlight: { color: new THREE.Color('#8b5cf6'), level: 1 },
      underglow: { color: new THREE.Color('#6366f1'), level: 1 },
      target: new THREE.Color(),
    }),
    [],
  )

  useFrame((frame, delta) => {
    const t = animate ? frame.clock.elapsedTime : 0
    const k = animate ? 1 - Math.exp(-RGB_FADE * delta) : 1
    const screen = screenLevel(getTime())
    for (const role of ['backlight', 'underglow'] as const) {
      const part = state[role]
      const level = rgbTarget(mode, role, t, state.target)
      part.color.lerp(state.target, k)
      part.level = THREE.MathUtils.lerp(part.level, level, k)
    }
    if (backlight.current) {
      backlight.current.color.copy(state.backlight.color)
      backlight.current.intensity = INTENSITY.backlight * state.backlight.level * screen
    }
    if (underglow.current) {
      underglow.current.color.copy(state.underglow.color)
      underglow.current.intensity = INTENSITY.underglow * state.underglow.level * screen
    }
    strip.current?.color.copy(state.underglow.color).multiplyScalar(STRIP_BRIGHTNESS * state.underglow.level * screen)
  })

  return (
    <>
      {/* Monitor backlight: soft LED glow on the wall behind the screen (a point light, so the halo has no hard edges). */}
      {!lite && (
        <pointLight
          ref={backlight}
          position={[LEFT_WALL_X + 0.08, SCREEN_CENTER[1] + 0.1, SCREEN_CENTER[2]]}
          intensity={0}
          distance={2.4}
        />
      )}
      {/* Desk underglow: LED strip under the desk's front edge, facing down onto the floor and chair. */}
      {!lite && (
        <rectAreaLight
          ref={underglow}
          position={[DESK.frontX - 0.15, DESK.topY - 0.12, DESK_CENTER_Z]}
          rotation={[-Math.PI / 2, 0, 0]}
          width={0.3}
          height={DESK_DEPTH * 0.95}
          intensity={0}
        />
      )}
      <mesh position={[DESK.frontX - 0.06, DESK.topY - 0.1, DESK_CENTER_Z]}>
        <boxGeometry args={[0.03, 0.03, DESK_DEPTH * 0.95]} />
        <meshBasicMaterial ref={strip} color="#000000" toneMapped={false} />
      </mesh>
    </>
  )
}

export default DeskLeds
