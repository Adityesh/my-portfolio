import { useAppStore } from '../store/useAppStore.ts'
import { useSettingsStore } from '../store/useSettingsStore.ts'
import { getContext } from './sfx.ts'

// Soft outdoor air through the open window: looping low-passed noise with slow, uneven gusts. Synthesised, so
// there's nothing to download. Plays while the window is open, Sound is on and the page is visible.
const LOOP_SECONDS = 4
const VOLUME = 0.12
const LOWPASS_HZ = 520
// Gusts: two slow wobbles of the volume that drift in and out of step.
const GUSTS = [
  { rate: 0.11, depth: 0.35 },
  { rate: 0.27, depth: 0.2 },
]
const FADE_IN_SECONDS = 1.5
const FADE_OUT_SECONDS = 1

type Player = { ctx: AudioContext; out: GainNode }

let player: Player | null = null
let playing = false

function getPlayer(): Player | null {
  if (player) return player
  const ctx = getContext()
  if (!ctx) return null
  // Brown-ish noise (each sample a small step from the last) sounds like air rather than hiss.
  const length = Math.round(ctx.sampleRate * LOOP_SECONDS)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < length; i++) {
    last = (last + (Math.random() * 2 - 1) * 0.04) * 0.995
    data[i] = last * 6
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = LOWPASS_HZ
  const gust = ctx.createGain()
  gust.gain.value = 1 - GUSTS.reduce((sum, g) => sum + g.depth, 0) / 2
  for (const g of GUSTS) {
    const lfo = ctx.createOscillator()
    lfo.frequency.value = g.rate
    const depth = ctx.createGain()
    depth.gain.value = g.depth / 2
    lfo.connect(depth).connect(gust.gain)
    lfo.start()
  }
  const out = ctx.createGain()
  out.gain.value = 0
  source.connect(filter).connect(gust).connect(out).connect(ctx.destination)
  source.start()
  player = { ctx, out }
  return player
}

function fadeTo(p: Player, value: number, seconds: number): void {
  const now = p.ctx.currentTime
  p.out.gain.cancelScheduledValues(now)
  p.out.gain.setValueAtTime(p.out.gain.value, now)
  p.out.gain.linearRampToValueAtTime(value, now + seconds)
}

function sync(): void {
  const want = useAppStore.getState().windowOpen && useSettingsStore.getState().sound && !document.hidden
  if (want === playing) return
  playing = want
  if (want) {
    const p = getPlayer()
    if (p) fadeTo(p, VOLUME, FADE_IN_SECONDS)
  } else if (player) {
    // The loop keeps running silently (cheap) so reopening the window doesn't restart it with a click.
    fadeTo(player, 0, FADE_OUT_SECONDS)
  }
}

// Importing this module wires it up (WindowSash.tsx does).
if (typeof window !== 'undefined') {
  useAppStore.subscribe(sync)
  useSettingsStore.subscribe(sync)
  document.addEventListener('visibilitychange', sync)
}
