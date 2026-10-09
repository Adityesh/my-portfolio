// Short sound effects played through the Web Audio API: low latency, per-play pitch, and overlapping plays.
// Files live in public/sounds/ (sources in public/sounds/CREDITS.txt).
const SOUND_FILES = {
  meow: '/sounds/meow.mp3',
} as const

export type SoundId = keyof typeof SOUND_FILES

// Each clip is normalised to this peak so they play at the same loudness, then scaled by the master volume.
const TARGET_PEAK = 0.9
const MASTER_VOLUME = 0.25
// Samples quieter than this at the start of a clip are skipped, so the sound lands right on the tap.
// Kept low so only true silence goes, not the soft start of the sound.
const LEAD_IN_THRESHOLD = 0.005
// Short fade-in when starting mid-clip, to avoid a click.
const FADE_IN_SECONDS = 0.005

type Clip = { buffer: AudioBuffer; offset: number; gain: number }
type WindowWithWebkitAudio = Window & { webkitAudioContext?: typeof AudioContext }

let context: AudioContext | null = null
const files = new Map<SoundId, Promise<ArrayBuffer>>()
const clips = new Map<SoundId, Promise<Clip>>()

function fetchFile(id: SoundId): Promise<ArrayBuffer> {
  let file = files.get(id)
  if (!file) {
    file = fetch(SOUND_FILES[id]).then((response) => {
      if (!response.ok) throw new Error(`Sound ${id}: HTTP ${response.status}`)
      return response.arrayBuffer()
    })
    // Forget a failed download so a later play can retry it.
    file.catch(() => files.delete(id))
    files.set(id, file)
  }
  return file
}

/** Downloads the files ahead of time (decoding waits for the first play, which creates the audio context). */
export function preloadSounds(ids: SoundId[]): void {
  ids.forEach((id) => void fetchFile(id).catch(() => undefined))
}

/** Shared audio context, created on first use inside a tap so browsers allow it to start (also used by music.ts). */
export function getContext(): AudioContext | null {
  if (!context) {
    const Ctor = window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext
    if (!Ctor) return null
    context = new Ctor()
  }
  if (context.state === 'suspended') void context.resume()
  return context
}

function analyse(buffer: AudioBuffer): Clip {
  let peak = 0
  let first = -1
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c)
    for (let i = 0; i < data.length; i++) {
      const v = Math.abs(data[i])
      if (v > peak) peak = v
      if (v > LEAD_IN_THRESHOLD && (first === -1 || i < first)) first = i
    }
  }
  return {
    buffer,
    offset: Math.max(first, 0) / buffer.sampleRate,
    gain: peak > 0 ? TARGET_PEAK / peak : 1,
  }
}

function loadClip(ctx: AudioContext, id: SoundId): Promise<Clip> {
  let clip = clips.get(id)
  if (!clip) {
    // decodeAudioData takes ownership of the buffer; each file is decoded once, so the original can go in.
    clip = fetchFile(id).then((data) => ctx.decodeAudioData(data)).then(analyse)
    clip.catch(() => clips.delete(id))
    clips.set(id, clip)
  }
  return clip
}

// Switch click, synthesised (no file): a very short burst of noise through a band-pass filter, decaying fast.
const CLICK = { seconds: 0.035, decay: 0.006, frequency: 2600, q: 1.4, volume: 0.9 }
let clickNoise: AudioBuffer | null = null

/** A soft mechanical click, e.g. a light switch. `pitch` scales the filter frequency (a little lower sounds heavier). */
export function playClick(pitch = 1): void {
  const ctx = getContext()
  if (!ctx) return
  if (!clickNoise) {
    const length = Math.round(ctx.sampleRate * CLICK.seconds)
    clickNoise = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = clickNoise.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * CLICK.decay))
  }
  const source = ctx.createBufferSource()
  source.buffer = clickNoise
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = CLICK.frequency * pitch
  filter.Q.value = CLICK.q
  const gain = ctx.createGain()
  gain.gain.value = CLICK.volume * MASTER_VOLUME
  source.connect(filter).connect(gain).connect(ctx.destination)
  source.onended = () => gain.disconnect()
  source.start()
}

// Ceramic clink (the mug set down): a few inharmonic sine partials with a fast decay, like a struck cup.
const CLINK = { partials: [2350, 3870, 5620], gains: [1, 0.5, 0.25], decay: 0.12, volume: 0.6 }
// Lava lamp "bloop": a soft sine that slides up, like a bubble rising.
const BLOOP = { from: 260, to: 620, seconds: 0.18, volume: 0.5 }

/** Plays decaying sine partials (frequencies in Hz, relative gains). */
function playPartials(frequencies: number[], gains: number[], decay: number, volume: number): void {
  const ctx = getContext()
  if (!ctx) return
  const now = ctx.currentTime
  const out = ctx.createGain()
  out.gain.value = volume * MASTER_VOLUME
  out.connect(ctx.destination)
  frequencies.forEach((frequency, i) => {
    const osc = ctx.createOscillator()
    osc.frequency.value = frequency
    const env = ctx.createGain()
    env.gain.setValueAtTime(0, now)
    env.gain.linearRampToValueAtTime(gains[i], now + 0.003)
    env.gain.exponentialRampToValueAtTime(0.0001, now + decay * (1 + i * 0.4))
    osc.connect(env).connect(out)
    osc.start(now)
    osc.stop(now + decay * 3)
  })
  window.setTimeout(() => out.disconnect(), decay * 3000 + 100)
}

/** Ceramic clink. `pitch` scales every partial (a touch of variation keeps repeats natural). */
export function playClink(pitch = 1): void {
  playPartials(CLINK.partials.map((f) => f * pitch), CLINK.gains, CLINK.decay, CLINK.volume)
}

/** Soft rising bubble sound. */
export function playBloop(pitch = 1): void {
  const ctx = getContext()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(BLOOP.from * pitch, now)
  osc.frequency.exponentialRampToValueAtTime(BLOOP.to * pitch, now + BLOOP.seconds)
  const env = ctx.createGain()
  env.gain.setValueAtTime(0, now)
  env.gain.linearRampToValueAtTime(BLOOP.volume * MASTER_VOLUME, now + 0.02)
  env.gain.exponentialRampToValueAtTime(0.0001, now + BLOOP.seconds * 1.6)
  osc.connect(env).connect(ctx.destination)
  osc.onended = () => env.disconnect()
  osc.start(now)
  osc.stop(now + BLOOP.seconds * 1.8)
}

// PC RGB mode change: two quick soft tones, rising, like a peripheral app confirming.
const BLIP = { first: 880, second: 1320, gap: 0.07, decay: 0.09, volume: 0.35 }
// Curtains: a breath of filtered noise whose pitch slides, like fabric drawn along a rail.
const SWISH = { seconds: 0.7, from: 500, to: 1600, q: 0.9, volume: 0.9 }

/** Two-tone blip. */
export function playBlip(): void {
  const ctx = getContext()
  if (!ctx) return
  const now = ctx.currentTime
  ;[BLIP.first, BLIP.second].forEach((frequency, i) => {
    const start = now + i * BLIP.gap
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = frequency
    const env = ctx.createGain()
    env.gain.setValueAtTime(0, start)
    env.gain.linearRampToValueAtTime(BLIP.volume * MASTER_VOLUME, start + 0.004)
    env.gain.exponentialRampToValueAtTime(0.0001, start + BLIP.decay)
    osc.connect(env).connect(ctx.destination)
    osc.onended = () => env.disconnect()
    osc.start(start)
    osc.stop(start + BLIP.decay * 1.5)
  })
}

/** Fabric swish; `closing` slides the pitch up, opening slides it down. */
export function playSwish(closing: boolean): void {
  const ctx = getContext()
  if (!ctx) return
  const now = ctx.currentTime
  const length = Math.round(ctx.sampleRate * SWISH.seconds)
  const noise = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  const source = ctx.createBufferSource()
  source.buffer = noise
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = SWISH.q
  const [from, to] = closing ? [SWISH.from, SWISH.to] : [SWISH.to, SWISH.from]
  filter.frequency.setValueAtTime(from, now)
  filter.frequency.exponentialRampToValueAtTime(to, now + SWISH.seconds)
  const env = ctx.createGain()
  env.gain.setValueAtTime(0, now)
  env.gain.linearRampToValueAtTime(SWISH.volume * MASTER_VOLUME, now + SWISH.seconds * 0.3)
  env.gain.linearRampToValueAtTime(0, now + SWISH.seconds)
  source.connect(filter).connect(env).connect(ctx.destination)
  source.onended = () => env.disconnect()
  source.start(now)
}

/** Plays a sound. `rate` shifts pitch and speed together (1 = original). Failures are silent. */
export function playSound(id: SoundId, { rate = 1, volume = 1 }: { rate?: number; volume?: number } = {}): void {
  const ctx = getContext()
  if (!ctx) return
  loadClip(ctx, id)
    .then((clip) => {
      const source = ctx.createBufferSource()
      source.buffer = clip.buffer
      source.playbackRate.value = rate
      const gain = ctx.createGain()
      const level = clip.gain * volume * MASTER_VOLUME
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(level, ctx.currentTime + FADE_IN_SECONDS)
      source.connect(gain).connect(ctx.destination)
      source.onended = () => gain.disconnect()
      source.start(0, clip.offset)
    })
    .catch(() => undefined)
}
