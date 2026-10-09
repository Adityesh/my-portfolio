import { playClick } from '../../audio/sfx.ts'
import { useIsMobile } from '../../hooks/useIsMobile.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import { useSettingsStore } from '../../store/useSettingsStore.ts'
import { LAMP_BULB } from './roomLayout.ts'
import { useTapTarget } from './useTapTarget.ts'

// The lamp itself is part of the room model (its glow is the point light inside the shade, faded in Lights.tsx);
// this is the invisible hit box around the shade and base on the nightstand.
const HIT_SIZE: [number, number, number] = [0.55, 0.8, 0.55]
// Box centre relative to the bulb (the base sits below it).
const HIT_OFFSET_Y = -0.12
const HIT_PADDING_TOUCH = 1.3
// A small inline switch: a little higher and lighter than the wall switch.
const CLICK_PITCH = 1.35

/** Tap the bedside lamp to switch it off and on. */
function BedsideLamp() {
  const isMobile = useIsMobile()
  const bedLamp = useAppStore((state) => state.bedLamp)
  const setBedLamp = useAppStore((state) => state.setBedLamp)
  const sound = useSettingsStore((state) => state.sound)

  const { bind } = useTapTarget(() => {
    setBedLamp(!bedLamp)
    if (sound) playClick(CLICK_PITCH)
  })

  const s = isMobile ? HIT_PADDING_TOUCH : 1

  return (
    <mesh position={[LAMP_BULB[0], LAMP_BULB[1] + HIT_OFFSET_Y, LAMP_BULB[2]]} {...bind}>
      <boxGeometry args={[HIT_SIZE[0] * s, HIT_SIZE[1] * s, HIT_SIZE[2] * s]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

export default BedsideLamp
