import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { lightLevel, useIntroTime } from './introTimeline.ts'
import { WINDOW } from './roomLayout.ts'

// Warm string lights draped along the top of the window wall, sagging between hooks.
const HOOKS_X = [-1.9, 0.25, 2.4, 4.55]
const HOOK_Y = 6.35
const SAG = 0.38
const Z = WINDOW.insideZ + 0.06
const BULBS_PER_SPAN = 9
const BULB_RADIUS = 0.035
const BULB_COLOR = new THREE.Color('#ffc27a')
// Unlit + not tone mapped, so values above 1 bloom.
const BULB_BRIGHTNESS = 2.4
const TWINKLE = 0.35
const GLOW_INTENSITY = 1.1

/** Points along the drooping wire (parabolic sag between each pair of hooks). */
function wirePoint(span: number, t: number): THREE.Vector3 {
  const x = THREE.MathUtils.lerp(HOOKS_X[span], HOOKS_X[span + 1], t)
  const y = HOOK_Y - SAG * 4 * t * (1 - t)
  return new THREE.Vector3(x, y, Z)
}

type StringLightsProps = {
  animate: boolean
  /** Real lights that wash the wall; off on mobile to save shader cost. */
  glow: boolean
}

function StringLights({ animate, glow }: StringLightsProps) {
  const getTime = useIntroTime()
  const bulbs = useRef<THREE.InstancedMesh>(null)
  const glowLights = useRef<(THREE.PointLight | null)[]>([])
  const spans = HOOKS_X.length - 1
  const count = spans * BULBS_PER_SPAN

  const { wire, bulbPositions, phases } = useMemo(() => {
    const wirePoints: THREE.Vector3[] = []
    for (let s = 0; s < spans; s++) for (let i = 0; i <= 20; i++) wirePoints.push(wirePoint(s, i / 20))
    const wire = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wirePoints), 120, 0.008, 4, false)
    const bulbPositions: THREE.Vector3[] = []
    for (let s = 0; s < spans; s++)
      for (let i = 0; i < BULBS_PER_SPAN; i++) bulbPositions.push(wirePoint(s, (i + 0.5) / BULBS_PER_SPAN).add(new THREE.Vector3(0, -0.05, 0)))
    const phases = bulbPositions.map((_, i) => (Math.sin(i * 12.9898) * 43758.5453) % 1)
    return { wire, bulbPositions, phases }
  }, [spans])
  useEffect(() => () => wire.dispose(), [wire])

  // Place bulbs once.
  useEffect(() => {
    const mesh = bulbs.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    bulbPositions.forEach((p, i) => mesh.setMatrixAt(i, m.makeTranslation(p.x, p.y, p.z)))
    mesh.instanceMatrix.needsUpdate = true
  }, [bulbPositions])

  const color = useMemo(() => new THREE.Color(), [])
  useFrame((state) => {
    const mesh = bulbs.current
    if (!mesh) return
    const on = lightLevel(getTime())
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const twinkle = animate ? 1 + Math.sin(t * (0.8 + Math.abs(phases[i]) * 1.5) + phases[i] * 10) * TWINKLE : 1
      mesh.setColorAt(i, color.copy(BULB_COLOR).multiplyScalar(BULB_BRIGHTNESS * twinkle * on))
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    glowLights.current.forEach((light) => {
      if (light) light.intensity = GLOW_INTENSITY * on
    })
  })

  return (
    <group>
      <mesh geometry={wire}>
        <meshStandardMaterial color="#14161d" roughness={0.6} />
      </mesh>
      <instancedMesh ref={bulbs} args={[undefined, undefined, count]}>
        <sphereGeometry args={[BULB_RADIUS, 8, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {glow &&
        HOOKS_X.slice(0, -1).map((x, s) => (
          <pointLight
            key={s}
            ref={(el) => {
              glowLights.current[s] = el
            }}
            position={[(x + HOOKS_X[s + 1]) / 2, HOOK_Y - SAG - 0.1, Z + 0.35]}
            intensity={0}
            distance={3.2}
            color="#ffb46b"
          />
        ))}
    </group>
  )
}

export default StringLights
