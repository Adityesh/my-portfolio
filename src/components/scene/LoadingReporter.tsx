import { useProgress } from '@react-three/drei'
import { useEffect } from 'react'
import { useAppStore } from '../../store/useAppStore.ts'

/** Publishes drei's asset-loading progress to the app store for the DOM loading screen. */
function LoadingReporter() {
  const active = useProgress((state) => state.active)
  const progress = useProgress((state) => state.progress)
  const setLoading = useAppStore((state) => state.setLoading)

  const sceneReady = useAppStore((state) => state.sceneReady)

  useEffect(() => {
    // drei reports "inactive" before any download starts; only finish once everything has loaded
    // and the first frame has been drawn (compiling shaders can take a few seconds on slow GPUs).
    setLoading({ active: active || progress < 100 || !sceneReady, progress })
  }, [active, progress, sceneReady, setLoading])

  return null
}

export default LoadingReporter
