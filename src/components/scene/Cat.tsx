import { useCursor } from '@react-three/drei'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { playSound, preloadSounds, type SoundId } from '../../audio/sfx.ts'
import { useIsMobile } from '../../hooks/useIsMobile.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import { useSettingsStore } from '../../store/useSettingsStore.ts'
import FloatingSymbols, { type SymbolBurst } from './FloatingSymbols.tsx'
import ContactBlob from './ContactBlob.tsx'
import FittedModel from './FittedModel.tsx'
import { useAnimationsEnabled } from './introTimeline.ts'
import { PROPS } from './roomLayout.ts'

// The cat faces +z in its own frame; this turns it toward the camera side of the bed.
const BASE_YAW = Math.PI * 0.25
// Breathing: slow rise and fall.
const BREATH = 0.022
const BREATH_SPEED = 1.5
// Tap: a squash-and-stretch hop with a little side-to-side wiggle.
const HOP = { duration: 0.55, height: 0.1, wiggle: 0.1 }
// This many taps within `window` seconds: a full spin instead (the model is Maxwell, the spinning cat).
const SPIN = { duration: 1.1, height: 0.2, taps: 3, window: 1.2, hearts: 3 }
// Hover (desktop): the cat turns toward the pointer, up to this angle either way.
const LOOK_MAX = 0.45
const LOOK_DAMPING = 6
// Idle: every so often the cat glances to one side and back.
const GLANCE = { minGap: 7, maxGap: 14, duration: 2.2, angle: 0.3 }
// Pixels the pointer may move between down and up and still count as a tap (vs. a camera drag).
const TAP_TOLERANCE = 6
// Hit box in the cat's frame (the body is ~0.63 x 0.75 x 1.3); bigger on touch devices.
const HIT_SIZE: [number, number, number] = [0.7, 0.8, 1.35]
const HIT_PADDING_TOUCH = 1.4
// Hearts start just above the head (the head is at +z).
const HEART_ORIGIN: [number, number, number] = [0, 0.85, 0.3]
// Soft contact shadow (the cat casts no real shadow). Sized to the body, shifted toward the tail since the
// head is raised off the blanket; lifted a hair to avoid z-fighting. It shrinks and fades while the cat hops.
const BLOB = { size: [0.85, 1.25] as [number, number], offsetZ: -0.08, lift: 0.004, opacity: 0.85 }
// Meow on tap, with a random pitch so repeats don't sound identical. Taps closer together than `gap` seconds
// stay quiet (except the spin), so rapid tapping doesn't become a wall of meows.
const MEOW = { clip: 'meow' as SoundId, minRate: 0.92, maxRate: 1.12, spinRate: 1.2, gap: 0.35 }

type Reaction = { kind: 'hop' | 'spin'; start: number }

/** Dark cat lit from behind by the lamp; a faint glow from its texture keeps the markings readable. */
const visibleCat = (material: THREE.MeshStandardMaterial) => {
  if (!material.map) return
  material.emissiveMap = material.map
  material.emissive.set('#ffffff')
  material.emissiveIntensity = 0.35
}

const now = () => performance.now() / 1000
const smoothstep = (x: number) => x * x * (3 - 2 * x)

/** Jump height (0..1 of the peak) and vertical squash/stretch for a hop at progress p (0..1). */
function hopCurve(p: number): { lift: number; stretch: number } {
  // Crouch, jump, land with a small squash.
  if (p < 0.15) return { lift: 0, stretch: 1 - 0.12 * smoothstep(p / 0.15) }
  if (p < 0.75) {
    const q = (p - 0.15) / 0.6
    const stretch = q < 0.3 ? THREE.MathUtils.lerp(0.88, 1.08, q / 0.3) : THREE.MathUtils.lerp(1.08, 0.96, (q - 0.3) / 0.7)
    return { lift: Math.sin(q * Math.PI), stretch }
  }
  const q = (p - 0.75) / 0.25
  return { lift: 0, stretch: 0.96 + 0.04 * q - 0.06 * Math.sin(q * Math.PI) }
}

// Scratch vector for pointer maths (pointer events, not per frame, but no need to allocate).
const localPoint = new THREE.Vector3()

/** The cat on the bed: breathes, glances around, turns toward the pointer, and hops or spins when tapped. */
function Cat() {
  const animate = useAnimationsEnabled()
  const isMobile = useIsMobile()
  const invalidate = useThree((state) => state.invalidate)
  const active = useAppStore((state) => state.view === 'room' && !state.transitioning)
  const [hovered, setHovered] = useState(false)
  useCursor(active && hovered)

  const root = useRef<THREE.Group>(null)
  const turn = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const blob = useRef<THREE.Mesh>(null)
  const reaction = useRef<Reaction | null>(null)
  const taps = useRef<number[]>([])
  const hearts = useRef<SymbolBurst[]>([])
  const lookYaw = useRef(0)
  const nextGlance = useRef(now() + GLANCE.minGap)
  const sound = useSettingsStore((state) => state.sound)
  const lastMeow = useRef(-Infinity)

  // Download the meow once sound is on, so the first tap isn't silent while it loads.
  useEffect(() => {
    if (sound) preloadSounds([MEOW.clip])
  }, [sound])

  const meow = (t: number, spin: boolean) => {
    if (!sound || (!spin && t - lastMeow.current < MEOW.gap)) return
    lastMeow.current = t
    playSound(MEOW.clip, { rate: spin ? MEOW.spinRate : THREE.MathUtils.randFloat(MEOW.minRate, MEOW.maxRate) })
  }

  useFrame((state, delta) => {
    const t = now()
    const reacting = reaction.current
    // With animations off nothing else requests frames, so keep drawing while hearts fade.
    if (!animate) {
      if (hearts.current.length > 0) invalidate()
      return
    }

    // Turning: follow the pointer while hovered, otherwise an occasional glance, otherwise straight ahead.
    let targetYaw = 0
    if (hovered && active) {
      targetYaw = lookYaw.current
      nextGlance.current = t + GLANCE.minGap
    } else if (t > nextGlance.current) {
      const p = (t - nextGlance.current) / GLANCE.duration
      if (p >= 1) nextGlance.current = t + THREE.MathUtils.randFloat(GLANCE.minGap, GLANCE.maxGap)
      else targetYaw = Math.sin(p * Math.PI) * GLANCE.angle * (Math.floor(nextGlance.current) % 2 === 0 ? 1 : -1)
    }
    if (turn.current) turn.current.rotation.y = THREE.MathUtils.damp(turn.current.rotation.y, targetYaw, LOOK_DAMPING, delta)

    let lift = 0
    let stretch = 1
    let spin = 0
    let wiggle = 0
    if (reacting) {
      const spec = reacting.kind === 'spin' ? SPIN : HOP
      const p = (t - reacting.start) / spec.duration
      if (p >= 1) {
        reaction.current = null
      } else {
        const curve = hopCurve(p)
        lift = curve.lift * spec.height
        stretch = curve.stretch
        if (reacting.kind === 'spin') spin = smoothstep(p) * Math.PI * 2
        else wiggle = Math.sin(p * Math.PI * 3) * HOP.wiggle * (1 - p)
      }
    }

    if (body.current) {
      const b = Math.sin(state.clock.elapsedTime * BREATH_SPEED) * BREATH
      // Scales from the base (FittedModel anchors at the bottom), so the cat rises rather than grows.
      const sy = stretch * (1 + b)
      const sxz = (1 / Math.sqrt(stretch)) * (1 + b * 0.4)
      body.current.scale.set(sxz, sy, sxz)
      body.current.position.y = lift - PROPS.cat.sink
      body.current.rotation.set(0, spin, wiggle)
    }
    if (blob.current) {
      const away = Math.min(lift / SPIN.height, 1)
      blob.current.scale.set(BLOB.size[0] * (1 - away * 0.35), BLOB.size[1] * (1 - away * 0.35), 1)
      ;(blob.current.material as THREE.MeshBasicMaterial).opacity = BLOB.opacity * (1 - away * 0.6)
    }
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!active || e.delta > TAP_TOLERANCE) return
    e.stopPropagation()
    const t = now()
    taps.current = [...taps.current.filter((tap) => t - tap < SPIN.window), t]
    const spin = taps.current.length >= SPIN.taps
    if (spin) taps.current = []
    // A spin can't be interrupted by a hop, but a hop can turn into a spin.
    if (animate && reaction.current?.kind !== 'spin') reaction.current = { kind: spin ? 'spin' : 'hop', start: t }
    meow(t, spin)
    const count = spin ? SPIN.hearts : 1
    for (let i = 0; i < count; i++) {
      hearts.current.push({ start: t + i * 0.12, offsetX: THREE.MathUtils.randFloatSpread(0.25) })
    }
    invalidate()
  }

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!root.current) return
    // Angle from the cat's forward (+z) to the pointer, around its base.
    root.current.worldToLocal(localPoint.copy(e.point))
    lookYaw.current = THREE.MathUtils.clamp(Math.atan2(localPoint.x, localPoint.z), -LOOK_MAX, LOOK_MAX)
  }

  const setHover = (value: boolean) => {
    setHovered(value)
    invalidate()
  }

  const hitScale = isMobile ? HIT_PADDING_TOUCH : 1

  return (
    <group ref={root} position={PROPS.cat.position} rotation={[0, BASE_YAW, 0]}>
      <group ref={turn}>
        <group ref={body} position={[0, -PROPS.cat.sink, 0]}>
          {/* No shadow: the window spot sits behind the cat and threw a hard dark copy of it onto the bed. */}
          <FittedModel url="/models/cat.glb" fit={{ axis: 'z', size: PROPS.cat.length }} prepareMaterial={visibleCat} />
        </group>
      </group>
      <ContactBlob ref={blob} position={[0, BLOB.lift, BLOB.offsetZ]} size={BLOB.size} opacity={BLOB.opacity} />
      <FloatingSymbols shape="heart" color="#ff7aa8" bursts={hearts} origin={HEART_ORIGIN} duration={1.4} rise={0.45} animate={animate} />

      {/* Invisible hit box (larger on touch devices). */}
      <mesh
        position={[0, (HIT_SIZE[1] * hitScale) / 2, 0]}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(true)
        }}
        onPointerOut={() => setHover(false)}
        onPointerMove={onPointerMove}
      >
        <boxGeometry args={[HIT_SIZE[0] * hitScale, HIT_SIZE[1] * hitScale, HIT_SIZE[2] * hitScale]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default Cat
