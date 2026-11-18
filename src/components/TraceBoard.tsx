import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type RefObject } from 'react'

// «أكتب بخط واضح وجميل»: the book's copying pages are notebook lines. The sentence is drawn in
// grey in the reading font (Noto Naskh Arabic, the school-book Naskh), word by word from the
// right, and the child writes over it with a finger. Arabic letters join, so each word is one
// piece to cover; the full stop is drawn but not asked for.
const FONT = '"Noto Naskh Arabic", "Geeza Pro", serif'
const WEIGHT = 700
const PAD_X = 18

const LINE_BLUE = '#9cc8e6'
const LINE_MARGIN = '#f2a7b8'
const GUIDE = '#b9b4c8'
const PEN = '#2e5bd8'
const INK = '#2b2d55'

/** One scoring cell is this many CSS pixels square. */
const CELL = 3
/** Each word must be this much covered by the child's writing (its short vowels are small). */
const COVER_NEED = 0.66
/** At most this share of the writing may wander away from the words. */
const STRAY_LIMIT = 0.32
/** Checks that find the writing off the words before the answer counts as missed. */
const TRIES = 2

interface Placed {
  /** What is drawn: the word, with the full stop when it ends the sentence. */
  text: string
  /** Whether it is a word to write (the full stop alone is not). */
  scored: boolean
  /** The right edge: Arabic runs from the right. */
  right: number
  width: number
}

interface Layout {
  width: number
  height: number
  /** The baseline the words sit on. */
  baseline: number
  /** A faint line above, as on the notebook page. */
  top: number
  size: number
  stroke: number
  placed: Placed[]
}

function fontAt(size: number): string {
  return `${WEIGHT} ${size}px ${FONT}`
}

/** Arabic text runs right to left, letters joined. */
function rightToLeft(ctx: CanvasRenderingContext2D) {
  ctx.direction = 'rtl'
  ctx.textAlign = 'right'
}

/** The sentence's words placed from the right, as large as the strip allows. */
export function layoutText(ctx: CanvasRenderingContext2D, text: string, width: number, height: number): Layout {
  // The full stop rides with the last word; it is drawn but not scored.
  const words = text.trim().split(/\s+/)
  const items = words.flatMap((word) => {
    const stop = /[.،؟!]$/.exec(word)
    return stop ? [{ text: word.slice(0, -1), scored: true }, { text: stop[0], scored: false }] : [{ text: word, scored: true }]
  })
  let size = height * 0.42
  const measure = (at: number) => {
    ctx.font = fontAt(at)
    const gap = at * 0.42
    const widths = items.map((item) => ctx.measureText(item.text).width)
    const total = widths.reduce((sum, value) => sum + value, 0) + gap * words.length
    return { widths, gap, total }
  }
  let sizes = measure(size)
  if (sizes.total > width - 2 * PAD_X) {
    size *= (width - 2 * PAD_X) / sizes.total
    sizes = measure(size)
  }
  let right = (width + sizes.total) / 2
  const placed: Placed[] = []
  items.forEach((item, n) => {
    placed.push({ text: item.text, scored: item.scored, right, width: sizes.widths[n]! })
    // A full stop sits close to its word; words are a gap apart.
    const next = items[n + 1]
    right -= sizes.widths[n]! + (next && !next.scored ? size * 0.06 : sizes.gap)
  })
  const baseline = height * 0.64
  return { width, height, baseline, top: baseline - size * 1.05, size, stroke: size * 0.1, placed }
}

export function drawLines(ctx: CanvasRenderingContext2D, layout: Layout) {
  ctx.save()
  ctx.lineWidth = 2
  ctx.strokeStyle = LINE_BLUE
  for (const y of [layout.top, layout.baseline]) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(layout.width, y)
    ctx.stroke()
  }
  // The red margin on the right of an Arabic notebook page.
  ctx.strokeStyle = LINE_MARGIN
  ctx.beginPath()
  ctx.moveTo(layout.width - 8, 0)
  ctx.lineTo(layout.width - 8, layout.height)
  ctx.stroke()
  ctx.restore()
}

function setupCanvas(canvas: HTMLCanvasElement, width: number, height: number): CanvasRenderingContext2D {
  const ratio = window.devicePixelRatio || 1
  canvas.width = Math.round(width * ratio)
  canvas.height = Math.round(height * ratio)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  rightToLeft(ctx)
  return ctx
}

/** Waits for the reading font, so words are measured and drawn in it. */
function useReadingFont(): boolean {
  const [ready, setReady] = useState(() => document.fonts?.check?.(fontAt(40), 'قرأ') ?? true)
  useEffect(() => {
    if (ready) return
    let alive = true
    const done = () => alive && setReady(true)
    void document.fonts.load(fontAt(40), 'قرأ').then(done, done)
    const timer = window.setTimeout(done, 2500)
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [ready])
  return ready
}

/** The strip's size, following its box. */
function useBoxSize(ref: RefObject<HTMLElement | null>): { width: number; height: number } | null {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const read = () => {
      const width = Math.round(node.clientWidth)
      const height = Math.round(node.clientHeight)
      setSize((old) => (old && old.width === width && old.height === height ? old : { width, height }))
    }
    read()
    const observer = new ResizeObserver(read)
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref])
  return size
}

interface Target {
  cols: number
  rows: number
  /** Scoring cells of each word. */
  words: number[][]
  /** Cells close enough to a word that writing there is not wandering. */
  near: Uint8Array
  /** Sample points per word, for automated checks. */
  points: [number, number][][]
}

function buildTarget(layout: Layout): Target {
  const cols = Math.ceil(layout.width / CELL)
  const rows = Math.ceil(layout.height / CELL)
  const canvas = document.createElement('canvas')
  canvas.width = cols * CELL
  canvas.height = rows * CELL
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  rightToLeft(ctx)
  const all = new Uint8Array(cols * rows)
  const pen = penWidth(layout)
  const step = Math.max(1, Math.floor(pen / 2 / CELL))
  const words: number[][] = []
  const points: [number, number][][] = []
  for (const entry of layout.placed) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = fontAt(layout.size)
    ctx.fillStyle = '#000'
    ctx.fillText(entry.text, entry.right, layout.baseline)
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    const cells: number[] = []
    const samples: [number, number][] = []
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const px = col * CELL + 1
        const py = row * CELL + 1
        if (data[(py * canvas.width + px) * 4 + 3]! > 110) {
          all[row * cols + col] = 1
          if (!entry.scored) continue
          cells.push(row * cols + col)
          if (row % step === 0 && col % step === 0) samples.push([col * CELL + 1.5, row * CELL + 1.5])
        }
      }
    }
    if (!entry.scored) continue
    words.push(cells)
    points.push(samples)
  }
  // Writing within about one stroke of a word still counts as on it.
  const reach = Math.ceil((layout.stroke * 1.3) / CELL)
  const near = new Uint8Array(cols * rows)
  for (let index = 0; index < all.length; index += 1) {
    if (!all[index]) continue
    const row = Math.floor(index / cols)
    const col = index % cols
    for (let dy = -reach; dy <= reach; dy += 1) {
      for (let dx = -reach; dx <= reach; dx += 1) {
        const r = row + dy
        const c = col + dx
        if (r >= 0 && r < rows && c >= 0 && c < cols && dx * dx + dy * dy <= reach * reach) near[r * cols + c] = 1
      }
    }
  }
  return { cols, rows, words, near, points }
}

function penWidth(layout: Layout): number {
  return Math.max(11, layout.stroke * 1.8)
}

interface TraceBoardProps {
  text: string
  locked: boolean
  /** A check found the writing off the words (one more try left). */
  onMiss: () => void
  onDone: (correct: boolean, board: HTMLElement | null) => void
}

/** «أنسخ الجملة بخط جميل»: write over the grey sentence with a finger, on the notebook lines. */
export function TraceBoard({ text, locked, onMiss, onDone }: TraceBoardProps) {
  const fontReady = useReadingFont()
  const padRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<HTMLCanvasElement>(null)
  const inkRef = useRef<HTMLCanvasElement>(null)
  const box = useBoxSize(padRef)
  const [layout, setLayout] = useState<Layout | null>(null)
  const target = useRef<Target | null>(null)
  const ink = useRef<Uint8Array>(new Uint8Array(0))
  const samples = useRef({ total: 0, stray: 0 })
  const last = useRef<{ x: number; y: number } | null>(null)
  const [weak, setWeak] = useState<number[]>([])
  const [tries, setTries] = useState(0)
  const [state, setState] = useState<'writing' | 'good' | 'missed'>('writing')
  const [hasInk, setHasInk] = useState(false)
  const [points, setPoints] = useState('')

  // Lay out the words and draw the lines and the grey guide.
  useLayoutEffect(() => {
    const guide = guideRef.current
    const inkCanvas = inkRef.current
    if (!fontReady || !box || !guide || !inkCanvas || box.width < 40) return
    const ctx = setupCanvas(guide, box.width, box.height)
    const next = layoutText(ctx, text, box.width, box.height)
    setupCanvas(inkCanvas, box.width, box.height)
    target.current = buildTarget(next)
    ink.current = new Uint8Array(target.current.cols * target.current.rows)
    samples.current = { total: 0, stray: 0 }
    setHasInk(false)
    setLayout(next)
    setPoints(JSON.stringify(target.current.points.map((list) => list.map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]))))
  }, [fontReady, box, text])

  useEffect(() => {
    const guide = guideRef.current
    if (!guide || !layout) return
    const ctx = guide.getContext('2d')!
    ctx.clearRect(0, 0, layout.width, layout.height)
    drawLines(ctx, layout)
    ctx.font = fontAt(layout.size)
    rightToLeft(ctx)
    let word = -1
    for (const entry of layout.placed) {
      if (entry.scored) word += 1
      ctx.fillStyle = state === 'missed' ? INK : entry.scored && weak.includes(word) ? '#f4a3b6' : GUIDE
      ctx.fillText(entry.text, entry.right, layout.baseline)
    }
  }, [layout, weak, state])

  const clearInk = useCallback(() => {
    const canvas = inkRef.current
    if (!canvas || !layout) return
    canvas.getContext('2d')!.clearRect(0, 0, layout.width, layout.height)
    ink.current.fill(0)
    samples.current = { total: 0, stray: 0 }
    setHasInk(false)
  }, [layout])

  function mark(x: number, y: number) {
    const map = target.current
    if (!map || !layout) return
    const radius = penWidth(layout) / 2
    const reach = Math.ceil(radius / CELL)
    const col = Math.floor(x / CELL)
    const row = Math.floor(y / CELL)
    for (let dy = -reach; dy <= reach; dy += 1) {
      for (let dx = -reach; dx <= reach; dx += 1) {
        const r = row + dy
        const c = col + dx
        if (r >= 0 && r < map.rows && c >= 0 && c < map.cols && (dx * CELL) ** 2 + (dy * CELL) ** 2 <= radius * radius) ink.current[r * map.cols + c] = 1
      }
    }
    samples.current.total += 1
    if (col >= 0 && col < map.cols && row >= 0 && row < map.rows && !map.near[row * map.cols + col]) samples.current.stray += 1
  }

  function strokeTo(x: number, y: number) {
    const canvas = inkRef.current
    if (!canvas || !layout) return
    const ctx = canvas.getContext('2d')!
    const from = last.current ?? { x, y }
    ctx.strokeStyle = PEN
    ctx.lineWidth = penWidth(layout)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(x, y)
    ctx.stroke()
    const steps = Math.max(1, Math.ceil(Math.hypot(x - from.x, y - from.y) / CELL))
    for (let k = 1; k <= steps; k += 1) mark(from.x + ((x - from.x) * k) / steps, from.y + ((y - from.y) * k) / steps)
    last.current = { x, y }
  }

  function score(): { pass: boolean; weak: number[] } {
    const map = target.current
    if (!map || samples.current.total === 0) return { pass: false, weak: map ? map.words.map((_, n) => n) : [] }
    const lacking = map.words
      .map((cells, n) => ({ n, cover: cells.length === 0 ? 1 : cells.filter((cell) => ink.current[cell]).length / cells.length }))
      .filter((entry) => entry.cover < COVER_NEED)
      .map((entry) => entry.n)
    const stray = samples.current.stray / samples.current.total
    return { pass: lacking.length === 0 && stray <= STRAY_LIMIT, weak: lacking }
  }

  function finish(correct: boolean) {
    setState(correct ? 'good' : 'missed')
    setWeak([])
    window.setTimeout(() => onDone(correct, padRef.current), correct ? 250 : 500)
  }

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  function down(event: PointerEvent<HTMLCanvasElement>) {
    if (locked || state !== 'writing' || !layout) return
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const { x, y } = point(event)
    last.current = null
    strokeTo(x, y)
    setHasInk(true)
  }

  function move(event: PointerEvent<HTMLCanvasElement>) {
    if (!last.current || locked || state !== 'writing') return
    const events = event.nativeEvent.getCoalescedEvents?.() ?? [event.nativeEvent]
    const rect = event.currentTarget.getBoundingClientRect()
    for (const entry of events.length > 0 ? events : [event.nativeEvent]) strokeTo(entry.clientX - rect.left, entry.clientY - rect.top)
  }

  function up() {
    if (!last.current) return
    last.current = null
    // Finished as soon as every word is written over.
    if (score().pass) finish(true)
  }

  function check() {
    if (locked || state !== 'writing') return
    const result = score()
    if (result.pass) {
      finish(true)
      return
    }
    const used = tries + 1
    setTries(used)
    if (used >= TRIES) {
      finish(false)
      return
    }
    setWeak(result.weak)
    onMiss()
    window.setTimeout(() => {
      clearInk()
      setWeak([])
    }, 1100)
  }

  return (
    <div className={`trace-board is-${state}`}>
      <div ref={padRef} className="trace-pad" data-trace-ready={layout ? 'true' : 'false'}>
        <canvas ref={guideRef} className="trace-guide" aria-hidden="true" />
        <canvas
          ref={inkRef}
          className="trace-ink"
          role="img"
          aria-label={`نكتب: ${text}`}
          data-trace-points={points}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        />
        {state === 'good' ? (
          <span className="trace-stamp pop" aria-hidden="true">
            ✓
          </span>
        ) : null}
      </div>
      <div className="trace-tools">
        <button type="button" className="tool-button press" onClick={clearInk} disabled={locked || state !== 'writing' || !hasInk}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.5 4.5l4 4L10 18H6l-2-2 9.5-9.5zM9 19.5h11" />
          </svg>
          نمسح
        </button>
        <button type="button" className="tool-button tool-check press" onClick={check} disabled={locked || state !== 'writing' || !hasInk}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          خلصت
        </button>
      </div>
    </div>
  )
}
