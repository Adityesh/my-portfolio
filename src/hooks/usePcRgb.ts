import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { RGB_FADE, rgbTarget } from '../components/scene/rgbLighting.ts'
import { useAppStore } from '../store/useAppStore.ts'

const GLOW = 0.9

/** Makes the PC's glass panel glow in the current RGB lighting mode (tap the tower to change it). */
export function usePcRgb(material: THREE.MeshStandardMaterial, animate: boolean) {
  const mode = useAppStore((state) => state.rgbMode)
  const target = useMemo(() => new THREE.Color(), [])

  useEffect(() => {
    // Tint the panel texture itself so the glow follows its details.
    material.emissiveMap = material.map
    material.emissiveIntensity = GLOW
    material.needsUpdate = true
  }, [material])

  useFrame((state, delta) => {
    const level = rgbTarget(mode, 'pc', animate ? state.clock.elapsedTime : 0, target)
    const k = animate ? 1 - Math.exp(-RGB_FADE * delta) : 1
    material.emissive.lerp(target, k)
    material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, GLOW * level, k)
  })
}
