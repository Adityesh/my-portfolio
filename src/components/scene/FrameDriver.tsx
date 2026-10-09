import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

type FrameDriverProps = {
  fps: number
}

/**
 * The Canvas uses frameloop="demand"; this requests frames at a capped rate so ambient
 * animations run without rendering at full refresh rate. Browsers pause it in hidden tabs.
 */
function FrameDriver({ fps }: FrameDriverProps) {
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    const id = window.setInterval(() => invalidate(), 1000 / fps)
    return () => window.clearInterval(id)
  }, [fps, invalidate])

  return null
}

export default FrameDriver
