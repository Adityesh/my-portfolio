import { CameraControls, CameraControlsImpl } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState, type RefObject } from 'react'
import type * as THREE from 'three'
import { CAMERA_AZIMUTH, CAMERA_POLAR, useResponsiveCamera } from '../../hooks/useResponsiveCamera.ts'
import { useSceneSettings } from '../../hooks/useSceneSettings.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import { INTRO, useAnimationsEnabled, useIntroTime } from './introTimeline.ts'

const { ACTION } = CameraControlsImpl
const DEG = Math.PI / 180

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
  const { cameraDrift } = useSceneSettings()
  const getTime = useIntroTime()
  const lastInput = useRef(0)
  const dom = useThree((state) => state.gl.domElement)
  // The Canvas's orthographic camera (the default when this mounts). First-person views swap the default camera.
  const getState = useThree((state) => state.get)
  const [roomCamera] = useState(() => getState().camera)
  const view = useAppStore((state) => state.view)
  const viewpoint = useAppStore((state) => state.viewpoint)
  const finishTransition = useAppStore((state) => state.finishTransition)

  // First-person views use their own camera (PovCamera); park the room camera's controls meanwhile so drags
  // there don't also rotate it.
  useEffect(() => {
    if (controlsRef.current) controlsRef.current.enabled = viewpoint === 'room'
    lastInput.current = performance.now()
  }, [viewpoint])

  useResponsiveCamera(controlsRef, targetRef, { intro: animate, view, onTransitionEnd: finishTransition })

  // Rotate + zoom only; no panning, so the room can't be dragged out of frame.
  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    controls.mouseButtons.right = ACTION.NONE
    controls.mouseButtons.middle = ACTION.ZOOM
    controls.touches.two = ACTION.TOUCH_ZOOM
    controls.touches.three = ACTION.NONE

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

  // Idle drift around the default view (room view only, not mid-transition).
  useFrame((state) => {
    const controls = controlsRef.current
    if (!controls || !animate || !cameraDrift || getTime() < INTRO.total) return
    const { view: currentView, transitioning, viewpoint: currentViewpoint } = useAppStore.getState()
    if (currentView !== 'room' || transitioning || currentViewpoint !== 'room') {
      lastInput.current = performance.now()
      return
    }
    if (performance.now() - lastInput.current < IDLE_SECONDS * 1000) return
    const t = state.clock.elapsedTime
    void controls.rotateTo(
      CAMERA_AZIMUTH + Math.sin(t * DRIFT_AZIMUTH_SPEED) * DRIFT_AZIMUTH,
      CAMERA_POLAR + Math.sin(t * DRIFT_POLAR_SPEED) * DRIFT_POLAR,
      true,
    )
  })

  // Bound to the room camera explicitly: by default CameraControls follows whatever the default camera is, so
  // while PovCamera is the default it would rebind to (and fight over) the first-person camera.
  return <CameraControls ref={controlsRef} camera={roomCamera} makeDefault />
}

export default CameraRig
