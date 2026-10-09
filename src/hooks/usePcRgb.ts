import { useFrame } from '@react-three/fiber'
import { useEffect } from 'react'
import type * as THREE from 'three'

const CYCLE_SECONDS = 16
const STATIC_HUE = 0.6
const SATURATION = 0.9
const LIGHTNESS = 0.45
const GLOW = 0.9

/** Makes the PC's glass panel glow and slowly cycle through RGB colours. */
export function usePcRgb(material: THREE.MeshStandardMaterial, animate: boolean) {
  useEffect(() => {
    // Tint the panel texture itself so the glow follows its details.
    material.emissiveMap = material.map
    material.emissiveIntensity = GLOW
    material.emissive.setHSL(STATIC_HUE, SATURATION, LIGHTNESS)
    material.needsUpdate = true
  }, [material])

  useFrame((state) => {
    if (!animate) return
    const hue = (state.clock.elapsedTime / CYCLE_SECONDS) % 1
    material.emissive.setHSL(hue, SATURATION, LIGHTNESS)
  })
}
