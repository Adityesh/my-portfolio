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

/** Created on first use, inside a tap, so browsers allow it to start. */
function getContext(): AudioContext | null {
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
