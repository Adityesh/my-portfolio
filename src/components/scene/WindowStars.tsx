import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { SKY_PANEL } from './roomLayout.ts'
import { sky } from './skyTimeline.ts'

const STAR_COUNT = 80
const SEED = 7

/** Deterministic PRNG so the star field is the same on every load. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const vertexShader = /* glsl */ `
  attribute float aPhase;
  attribute float aSize;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio;
    float twinkle = 0.5 + 0.5 * sin(uTime * (0.8 + aPhase * 1.6) + aPhase * 6.2831);
    vAlpha = mix(0.25, 1.0, twinkle);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uVisibility;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vec3(1.0), vAlpha * uVisibility * smoothstep(0.5, 0.05, d));
  }
`

type WindowStarsProps = {
  animate: boolean
}

/** Twinkling stars just in front of the sky panel. */
function WindowStars({ animate }: WindowStarsProps) {
  const dpr = useThree((state) => state.viewport.dpr)

  const geometry = useMemo(() => {
    const random = mulberry32(SEED)
    const positions = new Float32Array(STAR_COUNT * 3)
    const phases = new Float32Array(STAR_COUNT)
    const sizes = new Float32Array(STAR_COUNT)
    const width = SKY_PANEL.maxX - SKY_PANEL.minX
    const height = SKY_PANEL.maxY - SKY_PANEL.minY
    for (let i = 0; i < STAR_COUNT; i++) {
      // Denser toward the top, clear of the warm haze at the bottom.
      positions[i * 3] = SKY_PANEL.minX + random() * width
      positions[i * 3 + 1] = SKY_PANEL.maxY - Math.pow(random(), 1.6) * height * 0.75
      positions[i * 3 + 2] = SKY_PANEL.z + 0.01
      phases[i] = random()
      sizes[i] = 1.5 + random() * 2
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    return g
  }, [])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uVisibility: { value: 1 } },
        transparent: true,
        depthWrite: false,
      }),
    [],
  )

  useEffect(() => {
    material.uniforms.uPixelRatio.value = dpr
  }, [material, dpr])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  const points = useRef<THREE.Points>(null)
  useFrame((state) => {
    if (animate) material.uniforms.uTime.value = state.clock.elapsedTime
    // Fade out toward daytime (skyTimeline.ts); skip drawing them entirely once gone.
    material.uniforms.uVisibility.value = sky.stars
    if (points.current) points.current.visible = sky.stars > 0.001
  })

  return <points ref={points} geometry={geometry} material={material} />
}

export default WindowStars
