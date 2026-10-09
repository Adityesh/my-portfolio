import { useEffect, useId, useRef, useState } from 'react'
import { useAppStore } from '../../store/useAppStore.ts'
import { useInteractives } from '../../store/interactives.ts'

/**
 * Top-left menu listing everything you can poke in the room, mirroring the settings menu on the right. Each row says
 * what the object does right now; clicking it does that (the menu stays open so you can see the result). Hovering or
 * focusing a row shows that object's label in the room. Also the keyboard/screen-reader route to the 3D objects.
 */
function InteractionsMenu() {
  const inRoom = useAppStore((state) => state.view === 'room')
  const loading = useAppStore((state) => state.loading.active)
  const entries = useInteractives((state) => state.entries)
  const setFocused = useInteractives((state) => state.setFocused)
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close on Esc (returning focus to the button) or on a click outside the menu.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  // Clear the room label when the menu closes.
  useEffect(() => {
    if (!open) setFocused(null)
  }, [open, setFocused])

  // Hidden while the scene loads and in the projects view, like the settings menu.
  if (!inRoom || loading) return null

  const items = Object.values(entries)
    .filter((entry) => entry.keyboard)
    .sort((a, b) => a.order - b.order)

  return (
    <div ref={containerRef} className="absolute top-4 left-4 z-30">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Things to do in the room"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-neutral-200 backdrop-blur transition hover:bg-black/70 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <>
              {/* Pointer with a little burst: "click things". */}
              <path d="M9 9l10 4.5-4.2 1.5-1.5 4.2z" />
              <path d="M5 5l1.6 1.6M9 3v2.2M3 9h2.2M4.8 13.2l1.5-1.5M13.2 4.8l-1.5 1.5" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <div
          id={panelId}
          role="group"
          aria-label="Things to do in the room"
          className="mt-2 max-h-[calc(100vh-9rem)] w-72 overflow-y-auto rounded-xl border border-white/10 bg-[#0f1729]/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-sm motion-safe:animate-[fade-in_150ms_ease-out]"
        >
          <p className="px-3 pt-1 pb-2 font-mono text-xs text-neutral-500">// interactions</p>
          <ul className="flex flex-col gap-0.5" onMouseLeave={() => setFocused(null)}>
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  aria-label={`${item.name}: ${item.action}`}
                  onFocus={() => setFocused(item.id)}
                  onBlur={() => setFocused(null)}
                  onMouseEnter={() => setFocused(item.id)}
                  onClick={item.activate}
                  className="flex w-full items-baseline justify-between gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                >
                  <span className="text-sm font-medium text-neutral-100">{item.name}</span>
                  <span className="truncate text-xs text-neutral-400">{item.action}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default InteractionsMenu
