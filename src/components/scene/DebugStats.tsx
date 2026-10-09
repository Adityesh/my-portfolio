import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore.ts'

// How often the overlay is updated (it shows averages over this window).
const REPORT_INTERVAL_MS = 500
// Runs before every other frame callback, so it sees the previous frame's totals before resetting them.
const FIRST = -Infinity

/** Measures rendered frames and renderer stats, and publishes them to the store for the debug overlay. */
function DebugStats() {
  const gl = useThree((state) => state.gl)
  const setDebugStats = useAppStore((state) => state.setDebugStats)

  const gpu = useMemo(() => {
    const context = gl.getContext()
    const info = context.getExtension('WEBGL_debug_renderer_info')
    const name = info ? context.getParameter(info.UNMASKED_RENDERER_WEBGL) : context.getParameter(context.RENDERER)
    return String(name).replace(/^ANGLE \((.*)\)$/, '$1')
  }, [gl])

  const window_ = useRef({ start: 0, frames: 0, drawCalls: 0, triangles: 0 })
  const size = useMemo(() => new THREE.Vector2(), [])

  // Count every render pass of a frame (post-processing renders several), not just the last one.
  useEffect(() => {
    const previous = gl.info.autoReset
    gl.info.autoReset = false
    gl.info.reset()
    window_.current.start = performance.now()
    return () => {
      gl.info.autoReset = previous
      setDebugStats(null)
    }
  }, [gl, setDebugStats])

  useFrame(() => {
    const w = window_.current
    w.frames += 1
    w.drawCalls += gl.info.render.calls
    w.triangles += gl.info.render.triangles
    gl.info.reset()

    const now = performance.now()
    const elapsed = now - w.start
    if (elapsed < REPORT_INTERVAL_MS) return
    gl.getSize(size)
    setDebugStats({
      fps: Math.round((w.frames * 1000) / elapsed),
      frameMs: w.frames ? elapsed / w.frames : 0,
      drawCalls: w.frames ? Math.round(w.drawCalls / w.frames) : 0,
      triangles: w.frames ? Math.round(w.triangles / w.frames) : 0,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
      programs: gl.info.programs?.length ?? 0,
      width: Math.round(size.x),
      height: Math.round(size.y),
      dpr: gl.getPixelRatio(),
      gpu,
    })
    window_.current = { start: now, frames: 0, drawCalls: 0, triangles: 0 }
  }, FIRST)

  // When nothing is animating no frames render, so publish a zero-FPS reading instead of a stale one.
  useEffect(() => {
    const id = window.setInterval(() => {
      const w = window_.current
      if (performance.now() - w.start > REPORT_INTERVAL_MS * 2 && w.frames === 0) {
        const stats = useAppStore.getState().debugStats
        if (stats && stats.fps !== 0) setDebugStats({ ...stats, fps: 0, frameMs: 0 })
      }
    }, REPORT_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [setDebugStats])

  return null
}

export default DebugStats
