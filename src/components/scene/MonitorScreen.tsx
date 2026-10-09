import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { SCREEN_CODE, SCREEN_FILENAME } from '../../data/screenCode.ts'
import { screenLevel, useIntroTime } from './introTimeline.ts'

// Canvas matches the screen's 2.3 x 1.3 aspect.
const WIDTH = 1024
const HEIGHT = 576
const FONT = '28px ui-monospace, "SF Mono", Menlo, Consolas, monospace'
const TITLE_BAR = 44
const PADDING_TOP = 20
const LINE_HEIGHT = 40
const GUTTER = 72

const CHARS_PER_SECOND = 26
const HOLD_SECONDS = 6
const CURSOR_BLINK_SECONDS = 0.53
// Above 1 so the text catches a little bloom (the material is not tone mapped).
const BRIGHTNESS = 1.25

const COLORS = {
  background: '#16203a',
  titleBar: '#0f1729',
  tab: '#16203a',
  tabText: '#c9d1d9',
  gutter: '#5b6b8c',
  text: '#c9d1d9',
  keyword: '#ff7b72',
  string: '#a5d6ff',
  property: '#79c0ff',
  comment: '#8b949e',
  punctuation: '#8b949e',
  cursor: '#58a6ff',
}

const TOKEN = /(\/\/.*$)|('[^']*'?)|\b(const|export|function|return)\b|(\w+)(?=:)|([{}[\](),.;:])/g
const TOTAL_CHARS = SCREEN_CODE.reduce((sum, line) => sum + line.length + 1, 0)
const TYPE_SECONDS = TOTAL_CHARS / CHARS_PER_SECOND
const CYCLE_SECONDS = TYPE_SECONDS + HOLD_SECONDS

function drawLine(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  let cursor = x
  let last = 0
  const put = (s: string, color: string) => {
    ctx.fillStyle = color
    ctx.fillText(s, cursor, y)
    cursor += ctx.measureText(s).width
  }
  for (const match of text.matchAll(TOKEN)) {
    if (match.index > last) put(text.slice(last, match.index), COLORS.text)
    const [token, comment, string, keyword, property] = match
    const color = comment
      ? COLORS.comment
      : string
        ? COLORS.string
        : keyword
          ? COLORS.keyword
          : property
            ? COLORS.property
            : COLORS.punctuation
    put(token, color)
    last = match.index + token.length
  }
  if (last < text.length) put(text.slice(last), COLORS.text)
  return cursor
}

function drawScreen(ctx: CanvasRenderingContext2D, typedChars: number, cursorOn: boolean) {
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  // Title bar with window dots and a file tab.
  ctx.fillStyle = COLORS.titleBar
  ctx.fillRect(0, 0, WIDTH, TITLE_BAR)
  ;['#ff5f56', '#ffbd2e', '#27c93f'].forEach((color, i) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(24 + i * 22, TITLE_BAR / 2, 7, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.fillStyle = COLORS.tab
  ctx.fillRect(100, 8, 170, TITLE_BAR - 8)
  ctx.font = FONT
  ctx.textBaseline = 'middle'
  ctx.fillStyle = COLORS.tabText
  ctx.fillText(SCREEN_FILENAME, 116, TITLE_BAR / 2 + 4)

  // Code, typed up to `typedChars`.
  let remaining = typedChars
  let cursorX = GUTTER
  let cursorY = TITLE_BAR + PADDING_TOP + LINE_HEIGHT / 2
  SCREEN_CODE.forEach((line, i) => {
    if (remaining < 0) return
    const y = TITLE_BAR + PADDING_TOP + LINE_HEIGHT / 2 + i * LINE_HEIGHT
    ctx.fillStyle = COLORS.gutter
    ctx.textAlign = 'right'
    ctx.fillText(String(i + 1), GUTTER - 20, y)
    ctx.textAlign = 'left'
    const visible = line.slice(0, Math.max(0, remaining))
    cursorX = drawLine(ctx, visible, GUTTER, y)
    cursorY = y
    remaining -= line.length + 1
  })

  if (cursorOn) {
    ctx.fillStyle = COLORS.cursor
    ctx.fillRect(cursorX + 2, cursorY - 16, 4, 32)
  }
}

/** Animated code editor shown on the monitor. Attach as the screen mesh's material. */
function MonitorScreen() {
  const getTime = useIntroTime()
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)
  const { ctx, texture } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = WIDTH
    canvas.height = HEIGHT
    const ctx = canvas.getContext('2d')!
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    return { ctx, texture }
  }, [])
  // Last drawn state, so the canvas is only redrawn when something visible changes.
  const drawn = useRef({ chars: -1, cursor: false })

  useEffect(() => () => texture.dispose(), [texture])

  useFrame(() => {
    const t = getTime()
    // Power-on flicker during the intro.
    materialRef.current?.color.setScalar(screenLevel(t) * BRIGHTNESS)

    let chars: number
    let cursorOn: boolean
    if (t === Infinity) {
      // Reduced motion: show the finished snippet.
      chars = TOTAL_CHARS
      cursorOn = true
    } else {
      const cycleTime = Math.max(0, t - 1) % CYCLE_SECONDS
      chars = Math.min(TOTAL_CHARS, Math.floor(cycleTime * CHARS_PER_SECOND))
      // Solid cursor while typing, blinking while holding.
      cursorOn = chars < TOTAL_CHARS || Math.floor(cycleTime / CURSOR_BLINK_SECONDS) % 2 === 0
    }
    if (chars !== drawn.current.chars || cursorOn !== drawn.current.cursor) {
      drawScreen(ctx, chars, cursorOn)
      texture.needsUpdate = true
      drawn.current = { chars, cursor: cursorOn }
    }
  })

  return (
    <meshBasicMaterial ref={materialRef} attach="material" map={texture} toneMapped={false} color="#000000" />
  )
}

export default MonitorScreen
