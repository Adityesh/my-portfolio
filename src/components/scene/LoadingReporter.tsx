import { useProgress } from '@react-three/drei'
import { useEffect } from 'react'
import { useAppStore } from '../../store/useAppStore.ts'

/** Publishes drei's asset-loading progress to the app store for the DOM loading screen. */
function LoadingReporter() {
  const active = useProgress((state) => state.active)
  const progress = useProgress((state) => state.progress)
  const setLoading = useAppStore((state) => state.setLoading)

  useEffect(() => {
    // drei reports "inactive" before any download starts; only finish once everything has actually loaded.
    setLoading({ active: active || progress < 100, progress })
  }, [active, progress, setLoading])

  return null
}

export default LoadingReporter
