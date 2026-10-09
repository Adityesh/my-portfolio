import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { useAppStore } from '../../store/useAppStore.ts'

/**
 * Tells the store once the first frame has been drawn, so the loading screen stays up through shader
 * compilation. Frame callbacks run before the render, so the second callback means the first render finished.
 */
function SceneReady() {
  const markSceneReady = useAppStore((state) => state.markSceneReady)
  const frames = useRef(0)

  useFrame(() => {
    if (frames.current > 1) return
    frames.current += 1
    if (frames.current === 2) markSceneReady()
  })

  return null
}

export default SceneReady
