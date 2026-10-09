import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useAnimationsEnabled } from './introTimeline.ts'
import { SKY_PANEL as PANEL } from './roomLayout.ts'
import WindowCloud from './WindowCloud.tsx'
import WindowStars from './WindowStars.tsx'

// Night sky seen through the window: gradient + moon on a panel, with twinkling stars and a drifting cloud.
const PANEL_WIDTH = PANEL.maxX - PANEL.minX
const PANEL_HEIGHT = PANEL.maxY - PANEL.minY
const PANEL_POSITION: [number, number, number] = [(PANEL.minX + PANEL.maxX) / 2, (PANEL.minY + PANEL.maxY) / 2, PANEL.z]

// Moon position in world units on the panel (upper part of the left pane in the default view).
const MOON = { x: -0.9, y: 4.0, radius: 0.28 }
const TEXTURE_SIZE = 512

function createSkyTexture(): THREE.CanvasTexture {
  const size = TEXTURE_SIZE
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Deep navy sky fading to a warm city-light haze near the horizon.
  const sky = ctx.createLinearGradient(0, 0, 0, size)
  sky.addColorStop(0, '#070b24')
  sky.addColorStop(0.55, '#141c46')
  sky.addColorStop(0.82, '#3a2f52')
  sky.addColorStop(1, '#7a4a3c')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, size, size)

  // Moon with a soft halo.
  const mx = ((MOON.x - PANEL.minX) / PANEL_WIDTH) * size
  const my = (1 - (MOON.y - PANEL.minY) / PANEL_HEIGHT) * size
  const mr = (MOON.radius / PANEL_WIDTH) * size
  const halo = ctx.createRadialGradient(mx, my, mr * 0.8, mx, my, mr * 4)
  halo.addColorStop(0, 'rgba(200, 215, 255, 0.35)')
  halo.addColorStop(1, 'rgba(200, 215, 255, 0)')
  ctx.fillStyle = halo
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#f2f4ff'
  ctx.beginPath()
  ctx.arc(mx, my, mr, 0, Math.PI * 2)
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function WindowBackdrop() {
  const animate = useAnimationsEnabled()
  const texture = useMemo(() => createSkyTexture(), [])
  useEffect(() => () => texture.dispose(), [texture])

  return (
    <>
      <mesh position={PANEL_POSITION}>
        <planeGeometry args={[PANEL_WIDTH, PANEL_HEIGHT]} />
        {/* Unlit and not tone mapped so the sky keeps its colors; the moon is bright enough to bloom. */}
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <WindowStars animate={animate} />
      <WindowCloud animate={animate} />
    </>
  )
}

export default WindowBackdrop
