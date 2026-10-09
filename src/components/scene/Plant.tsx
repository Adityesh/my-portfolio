import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { playDrips } from '../../audio/sfx.ts'
import { useIsMobile } from '../../hooks/useIsMobile.ts'
import { useSettingsStore } from '../../store/useSettingsStore.ts'
import FittedModel from './FittedModel.tsx'
import FloatingSymbols, { type SymbolBurst } from './FloatingSymbols.tsx'
import { useAnimationsEnabled } from './introTimeline.ts'
import { PROPS } from './roomLayout.ts'
import { useTapTarget } from './useTapTarget.ts'

// Idle sway: tiny rotation so the leaves feel alive.
const SWAY = 0.012
const SWAY_SPEED = 0.7
// Watering: a happy squash-and-stretch bounce, sparkles, and a little growth each time (up to a limit; per visit).
const BOUNCE = { seconds: 0.7, squash: 0.08 }
const GROWTH = { step: 0.03, max: 0.15, rate: 3 }
const SPARKLES = 5
// Hit box around the pot and leaves; a little bigger on touch devices.
const HIT_SIZE: [number, number, number] = [0.9, PROPS.plant.height, 0.9]
const HIT_PADDING_TOUCH = 1.2

const now = () => performance.now() / 1000

/** Floor plant by the nightstand: sways gently; tap to water it. */
function Plant() {
  const animate = useAnimationsEnabled()
  const isMobile = useIsMobile()
  const sound = useSettingsStore((state) => state.sound)
  const sway = useRef<THREE.Group>(null)
  const grow = useRef<THREE.Group>(null)
  const watered = useRef({ at: -Infinity, growth: 0, shown: 0 })
  const sparkles = useRef<SymbolBurst[]>([])

  const { bind } = useTapTarget(
    () => {
      const t = now()
      const w = watered.current
      w.at = t
      w.growth = Math.min(w.growth + GROWTH.step, GROWTH.max)
      for (let i = 0; i < SPARKLES; i++) {
        sparkles.current.push({ start: t + i * 0.09, offsetX: THREE.MathUtils.randFloatSpread(0.7) })
      }
      if (sound) playDrips()
    },
    {
      id: 'plant',
      name: 'Plant',
      action: 'Water it',
      anchor: [PROPS.plant.position[0], PROPS.plant.position[1] + PROPS.plant.height + 0.25, PROPS.plant.position[2]],
      order: 6,
    },
  )

  useFrame((state, delta) => {
    const w = watered.current
    if (sway.current && animate) {
      const t = state.clock.elapsedTime * SWAY_SPEED
      sway.current.rotation.z = Math.sin(t) * SWAY
      sway.current.rotation.x = Math.sin(t * 0.7 + 1) * SWAY * 0.6
    }
    // Ease the size toward its grown height (instant with animations off).
    w.shown = animate ? THREE.MathUtils.damp(w.shown, w.growth, GROWTH.rate, delta) : w.growth
    const p = (now() - w.at) / BOUNCE.seconds
    // Squash down, spring up past rest, settle: a decaying wobble.
    const bounce = animate && p >= 0 && p < 1 ? -Math.sin(p * Math.PI * 2.5) * BOUNCE.squash * (1 - p) : 0
    if (grow.current) {
      const s = 1 + w.shown
      grow.current.scale.set(s * (1 - bounce * 0.5), s * (1 + bounce), s * (1 - bounce * 0.5))
    }
  })

  const s = isMobile ? HIT_PADDING_TOUCH : 1

  return (
    <group position={PROPS.plant.position}>
      <group ref={grow}>
        <group ref={sway}>
          <FittedModel url="/models/plant.glb" fit={{ axis: 'y', size: PROPS.plant.height }} castShadow />
        </group>
      </group>
      <FloatingSymbols
        shape="sparkle"
        color="#bff7c8"
        bursts={sparkles}
        origin={[0, PROPS.plant.height * 0.75, 0]}
        duration={1.3}
        rise={0.6}
        animate={animate}
      />

      {/* Invisible hit box. */}
      <mesh position={[0, HIT_SIZE[1] / 2, 0]} {...bind}>
        <boxGeometry args={[HIT_SIZE[0] * s, HIT_SIZE[1], HIT_SIZE[2] * s]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default Plant
