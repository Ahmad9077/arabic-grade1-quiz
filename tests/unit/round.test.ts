import { describe, expect, it } from 'vitest'
import { FORMATS, QUESTIONS, SENTENCES } from '../../src/data/catalog'
import { TEST_PLAN, TEST_SIZE, arrangeOptions, buildPractice, buildTest, orderQuestions, practiceSize, starsFor, testSlot } from '../../src/domain/round'

function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return value / 2147483647
  }
}

describe('rounds', () => {
  it('builds a practice round from one lesson without repeats or the same letter twice running', () => {
    for (const topic of ['picture', 'sound', 'missing', 'blend', 'handwriting'] as const) {
      const round = buildPractice(topic, [], [], seeded(3))
      expect(round).toHaveLength(practiceSize(topic))
      expect(new Set(round.map((q) => q.key)).size).toBe(round.length)
      expect(round.every((q) => q.topic === topic)).toBe(true)
      for (let n = 1; n < round.length; n += 1) if (round[n]!.letter) expect(round[n]!.letter).not.toBe(round[n - 1]!.letter)
    }
  })

  it('opens a practice round with questions not seen lately', () => {
    const first = buildPractice('picture', [], [], seeded(5))
    const recent = first.map((q) => q.key)
    const second = buildPractice('picture', [], recent, seeded(6))
    const unseen = second.filter((q) => !recent.includes(q.key))
    expect(unseen.length).toBeGreaterThan(0)
    expect(second.slice(0, unseen.length).every((q) => !recent.includes(q.key))).toBe(true)
  })

  it('builds the twelve-question mock test in the card’s order', () => {
    const round = buildTest([], [], seeded(7))
    expect(TEST_SIZE).toBe(12)
    expect(round).toHaveLength(TEST_SIZE)
    expect(round.map((q) => FORMATS[q.format].part)).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5])
    expect(round.map((q) => q.format)).toEqual(TEST_PLAN.map((slot) => slot.format))
    // The sentence to copy is one of the book's.
    const book = SENTENCES.filter((s) => s.page).map((s) => s.text)
    expect(book).toContain(round.at(-1)!.text)
    // A letter comes up once in the letter questions.
    const letters = round.filter((q) => q.format !== 'blend' && q.format !== 'copy').map((q) => q.letter)
    expect(new Set(letters).size).toBe(letters.length)
  })

  it('heads each part of the test like the school paper', () => {
    expect(testSlot(0)).toMatchObject({ part: 1, title: 'السؤال الأول', first: true })
    expect(testSlot(1).first).toBe(false)
    expect(testSlot(3)).toMatchObject({ part: 2, title: 'السؤال الثاني', first: true, instruction: 'أشاهد – أكتب صوت الحرف المناسب للصورة' })
    expect(testSlot(11)).toMatchObject({ part: 5, title: 'السؤال الخامس', first: true })
  })

  it('gives every attempt its own draw and its own lines', () => {
    const rounds = Array.from({ length: 6 }, (_, n) => buildTest([], [], seeded(n + 21)))
    const firstPictures = new Set(rounds.map((round) => round[0]!.options.map((o) => o.id).sort().join()))
    expect(firstPictures.size).toBeGreaterThan(3)
    for (const round of rounds) {
      const byStyle = new Map<string, string[]>()
      for (const q of round) byStyle.set(q.lines, [...(byStyle.get(q.lines) ?? []), q.ask.at(-1)!])
      for (const said of byStyle.values()) expect(new Set(said).size).toBe(said.length)
    }
  })

  it('puts Hub-selected questions first, then unseen ones', () => {
    const pool = QUESTIONS.filter((q) => q.topic === 'missing')
    const preferred = [pool[5]!.key, pool[2]!.key]
    const recent = pool.slice(0, 8).map((q) => q.key)
    const ordered = orderQuestions(pool, preferred, recent, seeded(1))
    expect(ordered.slice(0, 2).map((q) => q.key)).toEqual(preferred)
    expect(recent).not.toContain(ordered[2]!.key)
  })

  it('shuffles picture and word choices, and keeps the letter keys in order', () => {
    const moved = QUESTIONS.filter((q) => q.kind === 'pick').some((q) => arrangeOptions(q, seeded(9)).map((o) => o.id).join() !== q.options.map((o) => o.id).join())
    expect(moved).toBe(true)
    for (const q of QUESTIONS.filter((entry) => entry.kind === 'keys')) expect(arrangeOptions(q, seeded(4))).toEqual(q.options)
  })

  it('awards stars generously for young learners', () => {
    expect(starsFor(8, 8)).toBe(3)
    expect(starsFor(5, 8)).toBe(2)
    expect(starsFor(2, 8)).toBe(1)
    expect(starsFor(0, 0)).toBe(1)
  })
})
