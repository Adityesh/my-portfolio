import { useCallback, useState } from 'react'

export type RenderMode = 'full' | 'fallback'

type NavigatorWithMemory = Navigator & { deviceMemory?: number }

let webglAvailable: boolean | undefined

/** Whether the browser can create a WebGL context (checked once). */
export function hasWebGL(): boolean {
  if (webglAvailable === undefined) {
    try {
      const canvas = document.createElement('canvas')
      webglAvailable = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
    } catch {
      webglAvailable = false
    }
  }
  return webglAvailable
}

/**
 * Decides whether to render the 3D room or the plain fallback page.
 * Fallback when WebGL is missing, the device reports very little memory, or the URL has ?lite.
 * ?3d forces the room (e.g. from the fallback page's "try 3D" link).
 */
function detectRenderMode(): RenderMode {
  const params = new URLSearchParams(window.location.search)
  if (params.has('lite')) return 'fallback'
  if (!hasWebGL()) return 'fallback'
  if (params.has('3d')) return 'full'
  const memory = (navigator as NavigatorWithMemory).deviceMemory
  if (memory !== undefined && memory <= 1) return 'fallback'
  return 'full'
}

/** Render mode, plus a way to drop to the fallback at runtime (e.g. when the WebGL context is lost). */
export function useRenderMode(): [RenderMode, () => void] {
  const [mode, setMode] = useState<RenderMode>(detectRenderMode)
  const fallBack = useCallback(() => setMode('fallback'), [])
  return [mode, fallBack]
}
