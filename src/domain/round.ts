import { FORMATS, PART_TITLES, QUESTIONS, SENTENCES, type Format, type Option, type Question, type Random, type TopicId } from '../data/catalog'
import { shuffle } from './variety'
import { voiceQuestion } from './voice'

export type { Random }
export { shuffle }

export const PRACTICE_SIZE = 8
/** Copying a sentence takes a while: a writing round is shorter. */
const PRACTICE_SIZES: Partial<Record<TopicId, number>> = { handwriting: 4 }

export function practiceSize(topic: TopicId): number {
  return PRACTICE_SIZES[topic] ?? PRACTICE_SIZE
}

/** The mock test, in the order of the school's card: «السؤال الأول» to «السؤال الخامس». */
export interface Slot {
  format: Format
  /** Only questions whose key is one of these. */
  keys?: string[]
}

const BOOK_SENTENCES = SENTENCES.filter((entry) => entry.page).map((entry) => `handwriting:${entry.id}`)

export const TEST_PLAN: Slot[] = [
  { format: 'pic-for-letter' },
  { format: 'pic-for-letter' },
  { format: 'pic-for-letter' },
  { format: 'letter-sound' },
  { format: 'letter-sound' },
  { format: 'letter-sound' },
  { format: 'missing' },
  { format: 'missing' },
  { format: 'missing' },
  { format: 'blend' },
  { format: 'blend' },
  { format: 'copy', keys: BOOK_SENTENCES },
]

export const TEST_SIZE = TEST_PLAN.length

/** Hub-preferred keys first (in plan order), then questions not seen recently, then the rest. */
export function orderQuestions(
  pool: readonly Question[],
  preferredKeys: readonly string[],
  recentKeys: readonly string[],
  random: Random = Math.random,
): Question[] {
  const byKey = new Map(pool.map((question) => [question.key, question]))
  const preferred = preferredKeys.map((key) => byKey.get(key)).filter((q): q is Question => Boolean(q))
  const used = new Set(preferred.map((question) => question.key))
  const recent = new Set(recentKeys)
  const rest = shuffle(pool.filter((question) => !used.has(question.key)), random)
  const fresh = rest.filter((question) => !recent.has(question.key))
  const stale = rest.filter((question) => recent.has(question.key))
  return [...preferred, ...fresh, ...stale]
}

export function questionsFor(topic: TopicId): Question[] {
  return QUESTIONS.filter((question) => question.topic === topic)
}

/** The question with this round's own draw of pictures or keys. */
export function dressQuestion(question: Question, random: Random = Math.random): Question {
  if (!question.vary) return question
  return { ...question, ...question.vary(random) }
}

export function buildPractice(
  topic: TopicId,
  preferredKeys: readonly string[] = [],
  recentKeys: readonly string[] = [],
  random: Random = Math.random,
): Question[] {
  const chosen = orderQuestions(questionsFor(topic), preferredKeys, recentKeys, random).slice(0, practiceSize(topic))
  return dressRound(spreadLetters(chosen), random)
}

export function buildTest(
  preferredKeys: readonly string[] = [],
  recentKeys: readonly string[] = [],
  random: Random = Math.random,
): Question[] {
  const chosen: Question[] = []
  for (const slot of TEST_PLAN) {
    const pool = QUESTIONS.filter((question) => question.format === slot.format && (!slot.keys || slot.keys.includes(question.key)) && !chosen.includes(question))
    const ordered = orderQuestions(pool, preferredKeys, recentKeys, random)
    // Each letter once across the test where the bank allows it.
    const letters = new Set(chosen.map((question) => question.letter).filter(Boolean))
    const pick = ordered.find((question) => !question.letter || !letters.has(question.letter)) ?? ordered[0]
    if (pick) chosen.push(pick)
  }
  return dressRound(chosen, random)
}

/** Each question's draw and its turn of Maryam's lines, never the same line twice in a round. */
function dressRound(questions: Question[], random: Random): Question[] {
  const said = new Map<string, number[]>()
  return questions.map((question) => {
    const dressed = dressQuestion(question, random)
    const before = said.get(dressed.lines) ?? []
    const voiced = voiceQuestion(dressed, random, before)
    said.set(dressed.lines, [...before, Number(voiced.ask.at(-1)!.split('-').at(-1)) - 1])
    return voiced
  })
}

/**
 * A practice round never asks about the same letter twice running. The order otherwise stays as
 * chosen: questions not seen lately open the round, so it never starts with the one just done.
 */
function spreadLetters(questions: Question[]): Question[] {
  const result: Question[] = []
  const pool = [...questions]
  while (pool.length > 0) {
    const last = result.at(-1)
    const index = pool.findIndex((question) => !last?.letter || question.letter !== last.letter)
    result.push(...pool.splice(index === -1 ? 0 : index, 1))
  }
  return result
}

/** The test's heading for question `index`: «السؤال الأول» and the book's instruction. */
export function testSlot(index: number): { part: number; title: string; instruction: string; first: boolean } {
  const slot = TEST_PLAN[index] ?? TEST_PLAN[0]!
  const info = FORMATS[slot.format]
  const before = TEST_PLAN[index - 1]
  return { part: info.part, title: PART_TITLES[info.part], instruction: info.instruction, first: !before || FORMATS[before.format].part !== info.part }
}

/** Picture choices are shuffled; the letter keys keep the book's letter order. */
export function arrangeOptions(question: Question, random: Random = Math.random): Option[] {
  return question.kind === 'pick' ? shuffle(question.options, random) : [...question.options]
}

export function starsFor(score: number, total: number): 1 | 2 | 3 {
  if (total === 0) return 1
  const ratio = score / total
  if (ratio >= 0.9) return 3
  if (ratio >= 0.6) return 2
  return 1
}
