import { CameraControls, CameraControlsImpl } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import type * as THREE from 'three'
import { CAMERA_AZIMUTH, CAMERA_POLAR, useResponsiveCamera } from '../../hooks/useResponsiveCamera.ts'
import { INTRO, useAnimationsEnabled, useIntroTime } from './introTimeline.ts'

const { ACTION } = CameraControlsImpl
const DEG = Math.PI / 180
// Rotation is kept close to the default view so the open (cut-away) sides of the room always face the camera.
const POLAR_RANGE: [number, number] = [CAMERA_POLAR - 12 * DEG, CAMERA_POLAR + 8 * DEG]
const AZIMUTH_RANGE: [number, number] = [CAMERA_AZIMUTH - 20 * DEG, CAMERA_AZIMUTH + 20 * DEG]

// Seconds a programmatic transition takes to settle (intro, idle drift returning to centre).
const SMOOTH_TIME = 0.9
// Idle drift: starts after this many seconds without input, sways gently around the default view.
const IDLE_SECONDS = 4
const DRIFT_AZIMUTH = 3 * DEG
const DRIFT_POLAR = 1.2 * DEG
const DRIFT_AZIMUTH_SPEED = 0.18
const DRIFT_POLAR_SPEED = 0.11

type CameraRigProps = {
  targetRef: RefObject<THREE.Object3D | null>
}

function CameraRig({ targetRef }: CameraRigProps) {
  const controlsRef = useRef<CameraControls>(null)
  const animate = useAnimationsEnabled()
  const getTime = useIntroTime()
  const lastInput = useRef(0)
  const dom = useThree((state) => state.gl.domElement)

  useResponsiveCamera(controlsRef, targetRef, animate)

  // Rotate + zoom only; no panning, so the room can't be dragged out of frame.
  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    controls.mouseButtons.right = ACTION.NONE
    controls.mouseButtons.middle = ACTION.ZOOM
    controls.touches.two = ACTION.TOUCH_ZOOM
    controls.touches.three = ACTION.NONE
    controls.smoothTime = SMOOTH_TIME

    const markInput = () => {
      lastInput.current = performance.now()
    }
    markInput()
    controls.addEventListener('controlstart', markInput)
    controls.addEventListener('control', markInput)
    // Wheel zoom doesn't emit controlstart/control.
    dom.addEventListener('wheel', markInput, { passive: true })
    return () => {
      controls.removeEventListener('controlstart', markInput)
      controls.removeEventListener('control', markInput)
      dom.removeEventListener('wheel', markInput)
    }
  }, [dom])

  // Idle drift around the default view.
  useFrame((state) => {
    const controls = controlsRef.current
    if (!controls || !animate || getTime() < INTRO.total) return
    if (performance.now() - lastInput.current < IDLE_SECONDS * 1000) return
    const t = state.clock.elapsedTime
    void controls.rotateTo(
      CAMERA_AZIMUTH + Math.sin(t * DRIFT_AZIMUTH_SPEED) * DRIFT_AZIMUTH,
      CAMERA_POLAR + Math.sin(t * DRIFT_POLAR_SPEED) * DRIFT_POLAR,
      true,
    )
  })

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minPolarAngle={POLAR_RANGE[0]}
      maxPolarAngle={POLAR_RANGE[1]}
      minAzimuthAngle={AZIMUTH_RANGE[0]}
      maxAzimuthAngle={AZIMUTH_RANGE[1]}
    />
  )
}

export default CameraRig
