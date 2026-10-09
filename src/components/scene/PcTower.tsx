import { playBlip } from '../../audio/sfx.ts'
import { useIsMobile } from '../../hooks/useIsMobile.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import { RGB_MODES } from '../../store/rgbModes.ts'
import { useSettingsStore } from '../../store/useSettingsStore.ts'
import { useTapTarget } from './useTapTarget.ts'

// The PC tower is part of the room model (its RGB glass is lit by usePcRgb); this is an invisible hit box around it.
// Measured: the tower stands on the desk from x -3.95 to -2.35, y 1.37 to ~3.05, z -3.5 to -2.82.
const HIT_CENTER: [number, number, number] = [-3.15, 2.22, -3.16]
const HIT_SIZE: [number, number, number] = [1.65, 1.72, 0.72]
// A little bigger on touch devices.
const HIT_PADDING_TOUCH = 1.15

/** Tap the PC tower to cycle the RGB lighting mode (PC glass and all the LED strips). */
function PcTower() {
  const isMobile = useIsMobile()
  const mode = useAppStore((state) => state.rgbMode)
  const setRgbMode = useAppStore((state) => state.setRgbMode)
  const sound = useSettingsStore((state) => state.sound)

  const { bind } = useTapTarget(() => {
    setRgbMode(RGB_MODES[(RGB_MODES.indexOf(mode) + 1) % RGB_MODES.length])
    if (sound) playBlip()
  })

  const s = isMobile ? HIT_PADDING_TOUCH : 1

  return (
    <mesh position={HIT_CENTER} {...bind}>
      <boxGeometry args={[HIT_SIZE[0] * s, HIT_SIZE[1] * s, HIT_SIZE[2] * s]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

export default PcTower
