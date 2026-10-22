import { describe, expect, it } from 'vitest'
import { QUESTIONS } from '../../src/data/catalog'
import { PRACTICE_SIZE, TEST_PLAN, TEST_SIZE, arrangeOptions, buildPractice, buildTest, orderQuestions, starsFor } from '../../src/domain/round'

function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return value / 2147483647
  }
}

describe('rounds', () => {
  it('builds a practice round from one lesson without repeats', () => {
    const round = buildPractice('form', [], [], seeded(3))
    expect(round).toHaveLength(PRACTICE_SIZE)
    expect(new Set(round.map((q) => q.key)).size).toBe(PRACTICE_SIZE)
    expect(round.every((q) => q.topic === 'form')).toBe(true)
  })

  it('builds the twelve-question mock test from every lesson', () => {
    const round = buildTest([], [], seeded(7))
    expect(round).toHaveLength(TEST_SIZE)
    expect(TEST_SIZE).toBe(12)
    for (const [topic, count] of Object.entries(TEST_PLAN)) expect(round.filter((q) => q.topic === topic)).toHaveLength(count)
  })

  it('puts Hub-selected questions first, then unseen ones', () => {
    const pool = QUESTIONS.filter((q) => q.topic === 'picture')
    const preferred = [pool[5]!.key, pool[2]!.key]
    const recent = pool.slice(0, 8).map((q) => q.key)
    const ordered = orderQuestions(pool, preferred, recent, seeded(1))
    expect(ordered.slice(0, 2).map((q) => q.key)).toEqual(preferred)
    const firstFresh = ordered[2]!
    expect(recent).not.toContain(firstFresh.key)
  })

  it('shuffles the choices of every pick question', () => {
    const moved = QUESTIONS.filter((q) => q.kind === 'pick').some(
      (q) => arrangeOptions(q, seeded(9)).map((o) => o.id).join() !== q.options.map((o) => o.id).join(),
    )
    expect(moved).toBe(true)
  })

  it('awards stars generously for young learners', () => {
    expect(starsFor(8, 8)).toBe(3)
    expect(starsFor(5, 8)).toBe(2)
    expect(starsFor(2, 8)).toBe(1)
    expect(starsFor(0, 0)).toBe(1)
  })
})
