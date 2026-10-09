import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// Side effect: starts/stops the lo-fi track when the store's `music` (or the Sound setting) changes.
import '../../audio/music.ts'
import { useIsMobile } from '../../hooks/useIsMobile.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import { useSettingsStore } from '../../store/useSettingsStore.ts'
import FittedModel from './FittedModel.tsx'
import FloatingSymbols, { type SymbolBurst } from './FloatingSymbols.tsx'
import { useAnimationsEnabled } from './introTimeline.ts'
import { PROPS } from './roomLayout.ts'
import { useTapTarget } from './useTapTarget.ts'

// While the music plays the headphones bob gently, as if picking up the beat, and notes drift up.
const BOB = { height: 0.012, tilt: 0.04, speed: 2.6 }
const NOTE_EVERY_SECONDS = 0.9
// Hit box around the headphones lying on the desk; a little bigger on touch devices, kept clear of the mug.
const HIT_SIZE: [number, number, number] = [0.55, 0.2, 0.5]
const HIT_PADDING_TOUCH = 1.25

/** Dark headphones on a dark desk: a faint glow from the texture keeps them readable. */
const visibleHeadphones = (material: THREE.MeshStandardMaterial) => {
  if (!material.map) return
  material.emissiveMap = material.map
  material.emissive.set('#ffffff')
  material.emissiveIntensity = 0.3
}

/** Headphones on the desk; tap to play or stop the lo-fi music. */
function Headphones() {
  const animate = useAnimationsEnabled()
  const isMobile = useIsMobile()
  const music = useAppStore((state) => state.music)
  const setMusic = useAppStore((state) => state.setMusic)
  const sound = useSettingsStore((state) => state.sound)
  const playing = music && sound

  const bob = useRef<THREE.Group>(null)
  const notes = useRef<SymbolBurst[]>([])
  const nextNote = useRef(0)

  const { bind } = useTapTarget(() => setMusic(!music), {
    id: 'headphones',
    name: 'Headphones',
    action: !sound ? 'Lo-fi music (sound is off)' : music ? 'Stop the music' : 'Play lo-fi',
    anchor: [PROPS.headphones.position[0], PROPS.headphones.position[1] + 0.3, PROPS.headphones.position[2]],
    order: 10,
  })

  useFrame((state) => {
    const t = performance.now() / 1000
    if (bob.current) {
      const b = playing && animate ? Math.sin(state.clock.elapsedTime * BOB.speed) : 0
      bob.current.position.y = Math.max(b, 0) * BOB.height
      bob.current.rotation.z = b * BOB.tilt
    }
    if (playing && animate && t >= nextNote.current) {
      nextNote.current = t + NOTE_EVERY_SECONDS * THREE.MathUtils.randFloat(0.8, 1.25)
      notes.current.push({ start: t, offsetX: THREE.MathUtils.randFloatSpread(0.3) })
    }
  })

  const hitScale = isMobile ? HIT_PADDING_TOUCH : 1

  return (
    <group position={PROPS.headphones.position}>
      <group ref={bob}>
        {/* Lying flat on the desk behind the mug (the model stands upright, so tip it onto its back). */}
        <FittedModel
          url="/models/headphones.glb"
          rotation={[0, PROPS.headphones.turn, 0]}
          modelRotation={[-Math.PI / 2, 0, 0]}
          fit={{ axis: 'x', size: PROPS.headphones.width }}
          castShadow
          prepareMaterial={visibleHeadphones}
        />
      </group>
      <FloatingSymbols shape="note" color="#9fd4ff" bursts={notes} origin={[0, 0.2, 0]} duration={2.2} rise={0.7} animate={animate} />

      {/* Invisible hit box. */}
      <mesh position={[0, (HIT_SIZE[1] * hitScale) / 2, 0]} rotation={[0, PROPS.headphones.turn, 0]} {...bind}>
        <boxGeometry args={[HIT_SIZE[0] * hitScale, HIT_SIZE[1] * hitScale, HIT_SIZE[2] * hitScale]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default Headphones
