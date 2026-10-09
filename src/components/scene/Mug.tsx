import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { playClink } from '../../audio/sfx.ts'
import { useIsMobile } from '../../hooks/useIsMobile.ts'
import { useSettingsStore } from '../../store/useSettingsStore.ts'
import FittedModel from './FittedModel.tsx'
import { useAnimationsEnabled } from './introTimeline.ts'
import MugSteam from './MugSteam.tsx'
import { PROPS } from './roomLayout.ts'
import { useTapTarget } from './useTapTarget.ts'

// Tap: an invisible hand picks the mug up toward the desk's front edge (+x), tips it for a sip and sets it
// back down with a clink. The steam puffs up as if freshly topped up.
const SIP = { seconds: 1.6, lift: 0.14, reach: 0.08, tilt: 0.5 }
// Phases of the sip, as fractions of SIP.seconds: rise until UP, hold the sip until DOWN, set down by the end.
const UP = 0.25
const DOWN = 0.68
// Clink when the base meets the desk again (just before the end, while it settles).
const CLINK_AT = 0.95
// Hit box hugging the mug (it's ~0.24 tall). The mug sits in front of the headphones from the camera, so a box any
// bigger than the mug steals taps meant for them. A little bigger on touch devices.
const HIT_SIZE: [number, number, number] = [0.22, 0.27, 0.22]
const HIT_PADDING_TOUCH = 1.4

const ceramicMug = (material: THREE.MeshStandardMaterial) => {
  material.color.set('#ece6dc')
  material.roughness = 0.35
  material.metalness = 0
}

const now = () => performance.now() / 1000
const smoothstep = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x))

/** Height and tilt of the mug (0..1 of the full lift) at progress p of a sip. */
function sipCurve(p: number): number {
  if (p < UP) return smoothstep(p / UP)
  if (p < DOWN) return 1
  return 1 - smoothstep((p - DOWN) / (1 - DOWN))
}

/** Coffee mug on the desk: steams, and takes a sip when tapped. */
function Mug() {
  const animate = useAnimationsEnabled()
  const isMobile = useIsMobile()
  const sound = useSettingsStore((state) => state.sound)
  const hand = useRef<THREE.Group>(null)
  const sip = useRef({ start: -Infinity, clinked: true })
  const steamBoost = useRef(-Infinity)

  const { bind } = useTapTarget(
    () => {
      const t = now()
      steamBoost.current = t
      if (!animate) {
        // No motion: just the sound of putting it down.
        if (sound) playClink(THREE.MathUtils.randFloat(0.96, 1.04))
        return
      }
      // A tap mid-sip doesn't restart it.
      if (t - sip.current.start < SIP.seconds) return
      sip.current = { start: t, clinked: false }
    },
    {
      id: 'mug',
      name: 'Coffee',
      action: 'Take a sip',
      anchor: [PROPS.mug.position[0], PROPS.mug.position[1] + 0.45, PROPS.mug.position[2]],
      order: 9,
    },
  )

  useFrame(() => {
    if (!hand.current) return
    const p = (now() - sip.current.start) / SIP.seconds
    const k = p >= 0 && p < 1 ? sipCurve(p) : 0
    hand.current.position.set(SIP.reach * k, SIP.lift * k, 0)
    // Negative z-rotation tips the top toward +x (toward whoever sits at the desk).
    hand.current.rotation.z = -SIP.tilt * k
    if (!sip.current.clinked && p >= CLINK_AT) {
      sip.current.clinked = true
      if (sound) playClink(THREE.MathUtils.randFloat(0.96, 1.04))
    }
  })

  const hitScale = isMobile ? HIT_PADDING_TOUCH : 1

  return (
    <group position={PROPS.mug.position}>
      <group ref={hand}>
        <FittedModel
          url="/models/mug.glb"
          rotation={[0, Math.PI * 0.25, 0]}
          fit={{ axis: 'y', size: PROPS.mug.height }}
          castShadow
          prepareMaterial={ceramicMug}
        >
          {animate && <MugSteam rimHeight={PROPS.mug.height} boostStart={steamBoost} />}
        </FittedModel>
      </group>

      {/* Invisible hit box. */}
      <mesh position={[0, (HIT_SIZE[1] * hitScale) / 2, 0]} {...bind}>
        <boxGeometry args={[HIT_SIZE[0] * hitScale, HIT_SIZE[1] * hitScale, HIT_SIZE[2] * hitScale]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default Mug
