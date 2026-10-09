import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { INTRO, lightLevel, useIntroTime } from './introTimeline.ts'
import { WINDOW } from './roomLayout.ts'
import { sky } from './skyTimeline.ts'

// Soft visible beam of light falling from the window into the room.
// Direction the light travels per unit (downward and into the room); the beam ends where its
// lower edge would reach the floor.
const DIRECTION = new THREE.Vector3(0.3, -0.8, 1.0)
const LENGTH = 2.5
// How much wider the beam gets at its far end.
const SPREAD = 1.2
const COLOR = '#ffd9a8'
const OPACITY = 0.07
// Extra beam strength in full daylight (OPACITY x (1 + this)).
const DAYLIGHT_BOOST = 1.5

const vertexShader = /* glsl */ `
  attribute float aT;
  attribute float aU;
  varying float vT;
  varying float vU;
  varying float vFacing;
  void main() {
    vT = aT;
    vU = aU;
    // Faces seen edge-on fade out, which softens the beam's silhouette.
    // normalize() of a zero vector is NaN, so guard the length (a NaN here would reach the additive output).
    vec3 viewNormal = normalMatrix * normal;
    float len = length(viewNormal);
    vFacing = len > 1e-6 ? abs(viewNormal.z) / len : 0.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vT;
  varying float vU;
  varying float vFacing;
  void main() {
    // Fade along the beam, in from the window, and across each face so there are no hard edges.
    // pow() of a negative number is undefined: interpolation can push these a hair below zero at the edges
    // (sin(pi) ~ -1e-7), and some mobile GPUs then return NaN, which showed as white lines/flashes. Clamp first.
    float along = pow(clamp(1.0 - vT, 0.0, 1.0), 1.6) * smoothstep(0.0, 0.25, vT);
    float across = pow(clamp(sin(3.14159 * vU), 0.0, 1.0), 1.5);
    gl_FragColor = vec4(uColor, clamp(uOpacity * along * across * vFacing, 0.0, 1.0));
  }
`

/** Builds the four side faces of a frustum from the window opening to the beam's far end. */
function createShaftGeometry(): THREE.BufferGeometry {
  const z = WINDOW.insideZ
  const near = [
    new THREE.Vector3(WINDOW.minX, WINDOW.minY, z),
    new THREE.Vector3(WINDOW.maxX, WINDOW.minY, z),
    new THREE.Vector3(WINDOW.maxX, WINDOW.maxY, z),
    new THREE.Vector3(WINDOW.minX, WINDOW.maxY, z),
  ]
  const nearCenter = near.reduce((c, p) => c.add(p), new THREE.Vector3()).multiplyScalar(0.25)
  const farCenter = nearCenter.clone().addScaledVector(DIRECTION, LENGTH)
  const far = near.map((p) => p.clone().sub(nearCenter).multiplyScalar(SPREAD).add(farCenter))

  const positions: number[] = []
  const ts: number[] = []
  const us: number[] = []
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4
    // Two triangles per side: near[i], near[j], far[j] / near[i], far[j], far[i]
    for (const [p, t, u] of [
      [near[i], 0, 0],
      [near[j], 0, 1],
      [far[j], 1, 1],
      [near[i], 0, 0],
      [far[j], 1, 1],
      [far[i], 1, 0],
    ] as const) {
      positions.push(p.x, p.y, p.z)
      ts.push(t)
      us.push(u)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('aT', new THREE.Float32BufferAttribute(ts, 1))
  geometry.setAttribute('aU', new THREE.Float32BufferAttribute(us, 1))
  geometry.computeVertexNormals()
  return geometry
}

function WindowShaft() {
  const geometry = useMemo(() => createShaftGeometry(), [])
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: { uColor: { value: new THREE.Color(COLOR) }, uOpacity: { value: 0 } },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  // Fades in with the room lights during the intro; afterwards it follows the time of day (a faint
  // streetlight beam at night, a stronger sunbeam by day).
  const getTime = useIntroTime()
  const introDone = useRef(false)
  const seen = useRef(-1)
  useFrame(() => {
    if (introDone.current && seen.current === sky.version) return
    seen.current = sky.version
    const t = getTime()
    material.uniforms.uOpacity.value = OPACITY * (1 + DAYLIGHT_BOOST * sky.daylight) * lightLevel(t)
    material.uniforms.uColor.value.copy(sky.windowLight)
    if (t > INTRO.total) introDone.current = true
  })

  return <mesh geometry={geometry} material={material} renderOrder={1} />
}

export default WindowShaft
