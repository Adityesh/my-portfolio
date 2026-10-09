import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useState, useRef } from 'react'
import * as THREE from 'three'
import { profile } from '../../data/profile.ts'
import { INTRO, lightLevel, useAnimationsEnabled, useIntroTime } from './introTimeline.ts'
import { NAME_SIGN_CENTER, NAME_SIGN_MAX_WIDTH } from './roomLayout.ts'

// Self-hosted so the sign looks the same everywhere (Pacifico, SIL OFL 1.1; see public/fonts/Pacifico-OFL.txt).
const FONT_URL = '/fonts/Pacifico-Regular.ttf'
const NAME_COLOR = new THREE.Color('#ff4fd8')
const ROLE_COLOR = new THREE.Color('#5ee7ff')
const NAME_SIZE = 0.44
const ROLE_SIZE = 0.3
const LINE_GAP = 0.65
// Unlit + not tone mapped, so values above 1 bloom on desktop.
const BRIGHTNESS = 2.2
// Soft halo drawn by the text renderer itself, so the sign still glows on mobile without bloom.
const HALO = { outlineBlur: '45%', outlineOpacity: 0.35 } as const
const GLOW_INTENSITY = 1.6

// Power-on flicker, staggered after the monitor, then occasional buzz on the subtitle.
const POWER_ON_AT = INTRO.lightsStart + 0.4
const POWER_FLICKER = [1, 0.1, 0.9, 0.2, 0.05, 1, 0.6, 1]
const FLICKER_STEP = 0.06
const BUZZ_MIN_GAP = 8
const BUZZ_MAX_GAP = 16
const BUZZ = [0.3, 1, 0.15, 1]
const BUZZ_STEP = 0.05

function powerLevel(t: number): number {
  if (t === Infinity) return 1
  if (t < POWER_ON_AT) return 0
  return POWER_FLICKER[Math.floor((t - POWER_ON_AT) / FLICKER_STEP)] ?? 1
}

/** Neon sign with the owner's name and role on the wall above the door. */
function NeonNameSign() {
  const getTime = useIntroTime()
  const animate = useAnimationsEnabled()
  const nameMaterial = useRef<THREE.MeshBasicMaterial>(null)
  const roleMaterial = useRef<THREE.MeshBasicMaterial>(null)
  const glow = useRef<THREE.PointLight>(null)
  const nextBuzz = useRef(INTRO.total + BUZZ_MIN_GAP)
  // Scale the whole sign so the name fits within the door's width (measured once the text is laid out).
  const [fitScale, setFitScale] = useState(1)
  const onNameSync = (text: THREE.Mesh) => {
    const bounds = (text as THREE.Mesh & { textRenderInfo?: { blockBounds: number[] } }).textRenderInfo?.blockBounds
    if (!bounds) return
    const width = bounds[2] - bounds[0]
    setFitScale(Math.min(1, NAME_SIGN_MAX_WIDTH / width))
  }

  useFrame((state) => {
    const t = getTime()
    const power = powerLevel(t)
    let rolePower = power

    if (animate && t > INTRO.total) {
      const elapsed = state.clock.elapsedTime
      const buzzStep = Math.floor((elapsed - nextBuzz.current) / BUZZ_STEP)
      if (buzzStep >= BUZZ.length) {
        nextBuzz.current = elapsed + BUZZ_MIN_GAP + Math.random() * (BUZZ_MAX_GAP - BUZZ_MIN_GAP)
      } else if (buzzStep >= 0) {
        rolePower *= BUZZ[buzzStep]
      }
    }

    nameMaterial.current?.color.copy(NAME_COLOR).multiplyScalar(BRIGHTNESS * power)
    roleMaterial.current?.color.copy(ROLE_COLOR).multiplyScalar(BRIGHTNESS * rolePower)
    if (glow.current) glow.current.intensity = GLOW_INTENSITY * power * Math.max(lightLevel(t), 0.5)
  })

  return (
    <group position={NAME_SIGN_CENTER} rotation={[0, Math.PI / 2, 0]} scale={fitScale}>
      <Text
        font={FONT_URL}
        fontSize={NAME_SIZE}
        anchorX="center"
        anchorY="middle"
        position={[0, LINE_GAP / 2, 0]}
        outlineColor={NAME_COLOR}
        onSync={onNameSync}
        {...HALO}
      >
        {profile.name}
        <meshBasicMaterial ref={nameMaterial} color="#000000" toneMapped={false} />
      </Text>
      <Text
        font={FONT_URL}
        fontSize={ROLE_SIZE}
        letterSpacing={0.04}
        anchorX="center"
        anchorY="middle"
        position={[0, -LINE_GAP / 2, 0]}
        outlineColor={ROLE_COLOR}
        {...HALO}
      >
        {profile.role}
        <meshBasicMaterial ref={roleMaterial} color="#000000" toneMapped={false} />
      </Text>
      {/* Pink wash on the wall around the sign. */}
      <pointLight ref={glow} position={[0, 0, 0.5]} intensity={0} distance={3.5} color={NAME_COLOR} />
    </group>
  )
}

export default NeonNameSign
