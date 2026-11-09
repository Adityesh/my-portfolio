import { useAppStore } from '../../store/useAppStore.ts'
import { WHITEBOARD_SURFACE } from './roomLayout.ts'
import { useTapTarget } from './useTapTarget.ts'

// Hit area relative to the writing surface (covers the frame too).
const PADDING = 1.1

const [X, Y, Z] = WHITEBOARD_SURFACE.center
const [WIDTH, HEIGHT] = WHITEBOARD_SURFACE.size

/** Invisible plane over the whiteboard: tap it to zoom in to the "about me" board. */
function WhiteboardHitArea() {
  const openView = useAppStore((state) => state.openView)
  const { bind } = useTapTarget(() => openView('whiteboard'), {
    id: 'whiteboard',
    name: 'Whiteboard',
    action: 'About me',
    anchor: [X, Y + HEIGHT / 2 + 0.25, Z],
    // Right after the monitor in the interactions menu: the two "content" objects come first.
    order: 0.5,
  })

  return (
    <mesh position={[X + 0.02, Y, Z]} rotation={[0, Math.PI / 2, 0]} {...bind}>
      <planeGeometry args={[WIDTH * PADDING, HEIGHT * PADDING]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

export default WhiteboardHitArea
