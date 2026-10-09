import { useAppStore } from '../store/useAppStore.ts'
import { useSettingsStore } from '../store/useSettingsStore.ts'
import { getContext } from './sfx.ts'

// Lo-fi loop from the headphones on the desk. Streamed with an <audio> element (a ~2 minute track would take tens
// of MB decoded into an AudioBuffer) and routed through the shared audio context for smooth fades. Nothing is
// downloaded until the first time it's switched on.
const MUSIC_URL = '/sounds/lofi.mp3'
// Kept under the sound effects; it's background.
const VOLUME = 0.2
const FADE_IN_SECONDS = 1.2
const FADE_OUT_SECONDS = 0.8

type Player = { ctx: AudioContext; element: HTMLAudioElement; gain: GainNode }

let player: Player | null = null
let playing = false
let pauseTimer = 0

function getPlayer(): Player | null {
  if (player) return player
  const ctx = getContext()
  if (!ctx) return null
  const element = new Audio(MUSIC_URL)
  element.loop = true
  element.preload = 'auto'
  const gain = ctx.createGain()
  gain.gain.value = 0
  ctx.createMediaElementSource(element).connect(gain).connect(ctx.destination)
  player = { ctx, element, gain }
  return player
}

function fadeTo(p: Player, value: number, seconds: number): void {
  const now = p.ctx.currentTime
  p.gain.gain.cancelScheduledValues(now)
  p.gain.gain.setValueAtTime(p.gain.gain.value, now)
  p.gain.gain.linearRampToValueAtTime(value, now + seconds)
}

function start(): void {
  const p = getPlayer()
  if (!p) return
  window.clearTimeout(pauseTimer)
  fadeTo(p, VOLUME, FADE_IN_SECONDS)
  p.element.play().catch(() => {
    // Blocked or failed to load: reflect that in the UI instead of showing music that isn't playing.
    playing = false
    useAppStore.getState().setMusic(false)
  })
}

function stop(): void {
  if (!player) return
  const p = player
  fadeTo(p, 0, FADE_OUT_SECONDS)
  window.clearTimeout(pauseTimer)
  pauseTimer = window.setTimeout(() => p.element.pause(), FADE_OUT_SECONDS * 1000 + 50)
}

/** Plays while music is wanted, Sound is on and the page is visible. Runs synchronously inside the tap that changed
 * the store, which browsers require for starting playback. */
function sync(): void {
  const want = useAppStore.getState().music && useSettingsStore.getState().sound && !document.hidden
  if (want === playing) return
  playing = want
  if (want) start()
  else stop()
}

// Importing this module wires it up (Headphones.tsx does).
if (typeof window !== 'undefined') {
  useAppStore.subscribe(sync)
  useSettingsStore.subscribe(sync)
  document.addEventListener('visibilitychange', sync)
}
