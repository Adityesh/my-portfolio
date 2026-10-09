import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useAnimationsEnabled } from './introTimeline.ts'
import { SKY_PANEL as PANEL } from './roomLayout.ts'
import { sky } from './skyTimeline.ts'
import WindowCloud from './WindowCloud.tsx'
import WindowStars from './WindowStars.tsx'

// Sky seen through the window: a gradient with the moon and sun on a panel, plus twinkling stars and a
// drifting cloud. Everything follows the time of day (skyTimeline.ts).
const PANEL_WIDTH = PANEL.maxX - PANEL.minX
const PANEL_HEIGHT = PANEL.maxY - PANEL.minY
const PANEL_POSITION: [number, number, number] = [(PANEL.minX + PANEL.maxX) / 2, (PANEL.minY + PANEL.maxY) / 2, PANEL.z]

// Moon position in world units on the panel (upper part of the left pane in the default view).
const MOON = { x: -0.9, y: 4.0, radius: 0.28 }
// The sun sits in the right pane (clear of the curtain) and rises from just above the sill (sunHeight 0) to
// above the top of the opening (1, a high midday sun). The panel is behind the wall, so from the default view
// it shows through the window shifted down and left of where it would be on the glass.
const SUN = { x: 0.1, lowY: 2.45, highY: 4.6, radius: 0.24 }

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec2 vWorld;
  void main() {
    vUv = uv;
    vWorld = (modelMatrix * vec4(position, 1.0)).xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uMiddle;
  uniform vec3 uLow;
  uniform vec3 uHorizon;
  uniform vec3 uSunColor;
  uniform float uMoon;
  uniform float uSun;
  uniform vec2 uMoonPos;
  uniform vec2 uSunPos;
  uniform float uMoonRadius;
  uniform float uSunRadius;
  varying vec2 vUv;
  varying vec2 vWorld;
  void main() {
    // Gradient: top, middle at 55% down, low at 82%, horizon at the bottom.
    float t = 1.0 - vUv.y;
    vec3 color = t < 0.55 ? mix(uTop, uMiddle, t / 0.55)
      : t < 0.82 ? mix(uMiddle, uLow, (t - 0.55) / 0.27)
      : mix(uLow, uHorizon, (t - 0.82) / 0.18);

    // Moon with a soft halo.
    float dm = distance(vWorld, uMoonPos);
    float halo = (1.0 - smoothstep(uMoonRadius * 0.8, uMoonRadius * 4.0, dm)) * 0.35;
    color = mix(color, vec3(0.6, 0.68, 1.0), halo * uMoon);
    float moonDisc = 1.0 - smoothstep(uMoonRadius - 0.01, uMoonRadius + 0.01, dm);
    color = mix(color, vec3(0.88, 0.9, 1.0), moonDisc * uMoon);

    // Sun: a wide warm glow plus a bright disc (bright enough to bloom).
    float ds = distance(vWorld, uSunPos);
    color += uSunColor * exp(-ds * 2.2) * 0.55 * uSun;
    float sunDisc = 1.0 - smoothstep(uSunRadius - 0.01, uSunRadius + 0.01, ds);
    color = mix(color, uSunColor * 1.4, sunDisc * uSun);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

function WindowBackdrop() {
  const animate = useAnimationsEnabled()
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTop: { value: new THREE.Color() },
          uMiddle: { value: new THREE.Color() },
          uLow: { value: new THREE.Color() },
          uHorizon: { value: new THREE.Color() },
          uSunColor: { value: new THREE.Color() },
          uMoon: { value: 0 },
          uSun: { value: 0 },
          uMoonPos: { value: new THREE.Vector2(MOON.x, MOON.y) },
          uSunPos: { value: new THREE.Vector2(SUN.x, SUN.lowY) },
          uMoonRadius: { value: MOON.radius },
          uSunRadius: { value: SUN.radius },
        },
      }),
    [],
  )
  useEffect(() => () => material.dispose(), [material])

  // Last sky version copied into this material (a new material, e.g. after a hot reload, starts over).
  const seen = useRef({ material, version: -1 })
  useFrame(() => {
    if (seen.current.material === material && seen.current.version === sky.version) return
    seen.current = { material, version: sky.version }
    const u = material.uniforms
    u.uTop.value.copy(sky.top)
    u.uMiddle.value.copy(sky.middle)
    u.uLow.value.copy(sky.low)
    u.uHorizon.value.copy(sky.horizon)
    u.uSunColor.value.copy(sky.sunColor)
    u.uMoon.value = sky.moon
    u.uSun.value = sky.sun
    u.uSunPos.value.y = THREE.MathUtils.lerp(SUN.lowY, SUN.highY, sky.sunHeight)
  })

  return (
    <>
      <mesh position={PANEL_POSITION} material={material}>
        <planeGeometry args={[PANEL_WIDTH, PANEL_HEIGHT]} />
      </mesh>
      <WindowStars animate={animate} />
      <WindowCloud animate={animate} />
    </>
  )
}

export default WindowBackdrop
