import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore.ts'
import { screenLevel, useAnimationsEnabled, useIntroTime } from './introTimeline.ts'
import { RGB_FADE, rgbTarget } from './rgbLighting.ts'
import { BED, FLOOR_Y } from './roomLayout.ts'

// LED strip under the bed frame along the two sides that face the camera: the foot (+z) and the desk side (-x).
// The desk-side run starts after the nightstand so it doesn't clip into it.
const COLOR = '#7c3aed'
const STRIP_BRIGHTNESS = 2.4
const POOL_INTENSITY = 4
const DESK_SIDE_START_Z = -2.3
const INSET = 0.06
const STRIP_Y = FLOOR_Y + 0.06
const STRIP_THICKNESS = 0.03
// Floor glow: area lights just above the floor facing down, half under the bed and half outside it.
const POOL_HEIGHT = 0.18
const POOL_DEPTH = 0.7

const deskSideLength = BED.maxZ - DESK_SIDE_START_Z
const footLength = BED.maxX - BED.minX

type BedLedStripProps = {
  /** Real light pooling on the floor (off on mobile). */
  glow: boolean
}

/** LED strip glowing under the bed (violet in the Classic mode). Comes on with the monitor's LEDs during the intro. */
function BedLedStrip({ glow }: BedLedStripProps) {
  const getTime = useIntroTime()
  const animate = useAnimationsEnabled()
  const mode = useAppStore((state) => state.rgbMode)
  const pools = useRef<(THREE.RectAreaLight | null)[]>([])
  // Current (crossfading) colour and level, and a scratch target.
  const color = useMemo(() => new THREE.Color(COLOR), [])
  const target = useMemo(() => new THREE.Color(), [])
  const level = useRef(1)
  // One material for both runs (unlit, not tone mapped, so it blooms).
  const strip = useMemo(() => new THREE.MeshBasicMaterial({ color: '#000000', toneMapped: false }), [])
  useEffect(() => () => strip.dispose(), [strip])

  useFrame((state, delta) => {
    const on = screenLevel(getTime())
    // Follows the RGB lighting mode (tap the PC tower), crossfading on a change.
    const k = animate ? 1 - Math.exp(-RGB_FADE * delta) : 1
    const targetLevel = rgbTarget(mode, 'bed', animate ? state.clock.elapsedTime : 0, target)
    color.lerp(target, k)
    level.current = THREE.MathUtils.lerp(level.current, targetLevel, k)
    strip.color.copy(color).multiplyScalar(STRIP_BRIGHTNESS * level.current * on)
    pools.current.forEach((light) => {
      if (!light) return
      light.color.copy(color)
      light.intensity = POOL_INTENSITY * level.current * on
    })
  })

  return (
    <group>
      {/* Visible strip runs along the desk side and the foot. */}
      <mesh position={[BED.minX + INSET, STRIP_Y, (DESK_SIDE_START_Z + BED.maxZ) / 2]} material={strip}>
        <boxGeometry args={[STRIP_THICKNESS, STRIP_THICKNESS, deskSideLength]} />
      </mesh>
      <mesh position={[(BED.minX + BED.maxX) / 2, STRIP_Y, BED.maxZ - INSET]} material={strip}>
        <boxGeometry args={[footLength, STRIP_THICKNESS, STRIP_THICKNESS]} />
      </mesh>

      {glow && (
        <>
          <rectAreaLight
            ref={(el) => {
              pools.current[0] = el
            }}
            position={[BED.minX, FLOOR_Y + POOL_HEIGHT, (DESK_SIDE_START_Z + BED.maxZ) / 2]}
            rotation={[-Math.PI / 2, 0, 0]}
            width={POOL_DEPTH}
            height={deskSideLength}
            intensity={0}
            color={COLOR}
          />
          <rectAreaLight
            ref={(el) => {
              pools.current[1] = el
            }}
            position={[(BED.minX + BED.maxX) / 2, FLOOR_Y + POOL_HEIGHT, BED.maxZ]}
            rotation={[-Math.PI / 2, 0, 0]}
            width={footLength}
            height={POOL_DEPTH}
            intensity={0}
            color={COLOR}
          />
        </>
      )}
    </group>
  )
}

export default BedLedStrip
