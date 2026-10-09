import { useEffect, useLayoutEffect, useRef } from 'react'
import { useInteractives } from '../../store/interactives.ts'

export type InteractiveInfo = {
  id: string
  name: string
  /** What it does right now (can change with state, e.g. "Turn on" / "Turn off"). */
  action: string
  anchor: [number, number, number]
  /** Offer it in the keyboard list (default true). */
  keyboard?: boolean
  order: number
}

/**
 * Registers a 3D object for the hover label and the keyboard list. `activate` always calls the latest handler, so
 * keyboard activation sees current state. Returns a hover setter for the object's pointer handlers.
 */
export function useInteractive(info: InteractiveInfo, onActivate: () => void): (hovered: boolean) => void {
  const handler = useRef(onActivate)
  useLayoutEffect(() => {
    handler.current = onActivate
  })
  const { id, name, action, order, keyboard = true } = info
  const [ax, ay, az] = info.anchor

  useEffect(() => {
    useInteractives.getState().register({
      id,
      name,
      action,
      order,
      keyboard,
      anchor: [ax, ay, az],
      activate: () => handler.current(),
    })
  }, [id, name, action, order, keyboard, ax, ay, az])

  useEffect(() => () => useInteractives.getState().unregister(id), [id])

  return (hovered: boolean) => {
    const store = useInteractives.getState()
    if (hovered) store.setHovered(id)
    else if (store.hovered === id) store.setHovered(null)
  }
}
