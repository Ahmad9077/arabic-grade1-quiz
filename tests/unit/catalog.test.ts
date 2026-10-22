import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  BLENDS,
  CHEERS,
  LETTERS,
  QUESTIONS,
  QUIZ_ID,
  RETRIES,
  TOPICS,
  WORDS,
  audioCues,
  clip,
  formOf,
  joinedPieces,
  lettersOf,
  positionIn,
  roundClips,
} from '../../src/data/catalog'
import { PRACTICE_SIZE, TEST_PLAN } from '../../src/domain/round'

const TEST_LETTERS = 'أ ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ'.split(' ')
const DIACRITICS = /[ً-ْٰ]/

describe('question bank', () => {
  it('uses the permanent quiz id', () => {
    expect(QUIZ_ID).toBe('arabic-grade1')
  })

  it('keeps every published question key', () => {
    const keys = new Set(QUESTIONS.map((q) => q.key))
    const permanent = fs.readFileSync('integration/seed-arabic-grade1.sql', 'utf8').match(/'[a-z]+:[a-z0-9-]+'/g) ?? []
    expect(permanent.length).toBe(QUESTIONS.length)
    for (const key of permanent) expect(keys.has(key.slice(1, -1)), key).toBe(true)
  })

  it('has unique, well-formed permanent keys', () => {
    const keys = QUESTIONS.map((q) => q.key)
    expect(new Set(keys).size).toBe(keys.length)
    for (const q of QUESTIONS) expect(q.key).toMatch(new RegExp(`^${q.topic}:[a-z0-9-]+$`))
  })

  it('teaches exactly the letters from أ to ظ', () => {
    expect(LETTERS.map((letter) => letter.char)).toEqual(TEST_LETTERS)
  })

  it('covers every lesson with enough questions for a practice round and the mock test', () => {
    expect(TOPICS.map((t) => t.id)).toEqual(['picture', 'find', 'form', 'blend', 'copy'])
    for (const topic of TOPICS) {
      const count = QUESTIONS.filter((q) => q.topic === topic.id).length
      expect(count, topic.id).toBeGreaterThanOrEqual(PRACTICE_SIZE + 3)
      expect(count, topic.id).toBeGreaterThanOrEqual(TEST_PLAN[topic.id])
    }
  })

  it('covers every test letter in letter-and-picture and in finding a letter', () => {
    for (const char of TEST_LETTERS) {
      expect(QUESTIONS.some((q) => q.topic === 'picture' && q.kind === 'pick' && q.subject === `txt:${char}`), `picture ${char}`).toBe(true)
      expect(QUESTIONS.some((q) => q.topic === 'picture' && q.kind === 'pick' && q.answer === char), `letter for ${char}`).toBe(true)
      expect(QUESTIONS.some((q) => q.kind === 'tap' && q.prompt.includes(LETTERS.find((l) => l.char === char)!.name)), `find ${char}`).toBe(true)
    }
  })

  it('gives every choice question one right answer among distinct options', () => {
    for (const q of QUESTIONS.filter((entry) => entry.kind === 'pick')) {
      const ids = q.options.map((o) => o.id)
      expect(new Set(ids).size, q.key).toBe(ids.length)
      expect(ids, q.key).toContain(q.answer)
      if (q.topic !== 'form') expect(q.options.length, q.key).toBe(3)
    }
  })

  it('only shows pictures whose word starts with the asked letter', () => {
    for (const q of QUESTIONS.filter((entry) => entry.key.endsWith('-pic'))) {
      const letter = q.subject!.slice(4)
      for (const option of q.options) expect(lettersOf(option.id)[0] === letter, `${q.key} ${option.id}`).toBe(option.id === q.answer)
    }
  })

  it('builds matching boards of three different letters', () => {
    for (const q of QUESTIONS.filter((entry) => entry.kind === 'match')) {
      expect(q.pairs.length, q.key).toBe(3)
      expect(new Set(q.pairs.map((p) => p.id)).size, q.key).toBe(3)
    }
  })

  it('points finding questions at the letter inside the word', () => {
    for (const q of QUESTIONS.filter((entry) => entry.kind === 'tap')) {
      const letters = q.tap!.letters
      const target = q.answer.split(',').map(Number)
      expect(target.length, q.key).toBeGreaterThan(0)
      const char = letters[target[0]!]!
      for (const index of target) expect(letters[index], q.key).toBe(char)
      expect(q.prompt, q.key).toContain(LETTERS.find((l) => l.char === char)!.name)
    }
  })

  it('asks for the letter shape the word really needs, among the book shapes', () => {
    const nonJoining = new Set('أ د ذ ر ز'.split(' '))
    for (const q of QUESTIONS.filter((entry) => entry.topic === 'form')) {
      const { letters, index } = q.gap!
      const char = letters[index]!
      expect(q.answer, q.key).toBe(positionIn(letters, index))
      const right = q.options.find((o) => o.id === q.answer)!
      expect(right.art, q.key).toBe(`txt:${formOf(char, positionIn(letters, index))}`)
      // Four shapes, as in «أختار - أكمل»; two for letters that never join the next one.
      expect(new Set(q.options.map((o) => o.art)).size, q.key).toBe(nonJoining.has(char) ? 2 : 4)
      expect(TEST_LETTERS, q.key).toContain(char)
    }
  })

  it('asks the shape of every test letter at least once', () => {
    for (const char of TEST_LETTERS) expect(QUESTIONS.some((q) => q.topic === 'form' && q.gap!.letters[q.gap!.index] === char), char).toBe(true)
  })

  it('knows Arabic joining: بطة starts joined, كتاب ends alone, خبز is joined in the middle', () => {
    expect(positionIn(lettersOf('بطة'), 0)).toBe('initial')
    expect(positionIn(lettersOf('بطة'), 2)).toBe('final')
    expect(positionIn(lettersOf('خبز'), 1)).toBe('medial')
    expect(positionIn([...'كتاب'], 3)).toBe('isolated')
    expect(positionIn(lettersOf('دب'), 1)).toBe('isolated')
    expect(formOf('ب', 'medial')).toBe('ـبـ')
    expect(joinedPieces(lettersOf('خبز'))).toEqual(['خ‍', '‍ب‍', '‍ز'])
  })

  it('builds three-letter words with short vowels, each using a test letter', () => {
    for (const blend of BLENDS) {
      expect(blend.syllables.join(''), blend.id).toBe(blend.word)
      expect(blend.syllables.length, blend.id).toBe(3)
      for (const syllable of blend.syllables) expect(syllable, `${blend.id} ${syllable}`).toMatch(/^.[َُِ]$/)
      expect(blend.syllables.some((syllable) => TEST_LETTERS.includes(syllable.charAt(0))), blend.id).toBe(true)
    }
  })

  it('has adaptive difficulty in the Hub range with skill tags', () => {
    for (const q of QUESTIONS) {
      expect(q.difficulty).toBeGreaterThanOrEqual(1)
      expect(q.difficulty).toBeLessThanOrEqual(100)
      expect(q.skills.length).toBeGreaterThan(0)
    }
  })

  it('has a picture for every word in a question', () => {
    for (const q of QUESTIONS) {
      for (const option of q.options) if (!option.art.startsWith('txt:') && !option.art.startsWith('pair:')) expect(Object.values(WORDS).some((w) => w.art === option.art), `${q.key} ${option.id}`).toBe(true)
    }
  })
})

describe('screen text', () => {
  it('shows no diacritics except the short vowels being learned', () => {
    for (const q of QUESTIONS) {
      expect(q.prompt, q.key).not.toMatch(DIACRITICS)
      if (q.topic !== 'blend') for (const way of q.explain) expect(way.text, q.key).not.toMatch(DIACRITICS)
      if (q.topic !== 'blend') for (const option of q.options) expect(option.art, q.key).not.toMatch(DIACRITICS)
    }
    for (const topic of TOPICS) expect(topic.title, topic.id).not.toMatch(DIACRITICS)
  })

  it('speaks to every child the same way (no girl- or boy-only words)', () => {
    const words = ['أحسنتي', 'شطورة', 'بطلة', 'عليج', 'إنتي', 'أنتي', 'تبين', 'اختاري', 'شطور', 'بطل', 'عليك', 'اختار', 'اسمع', 'حاول', 'تبي', 'اختر', 'اختاري', 'صل', 'صلي']
    const gendered = new RegExp(`(?<![\\u0600-\\u06FF])(${words.join('|')})(?![\\u0600-\\u06FF])`)
    for (const cue of audioCues().filter((c) => c.voice === 'ar')) expect(cue.text, cue.id).not.toMatch(gendered)
    for (const q of QUESTIONS) expect(q.prompt, q.key).not.toMatch(gendered)
    for (const cheer of CHEERS) expect(cheer.text).not.toMatch(gendered)
  })
})

describe('narration', () => {
  const manifest = JSON.parse(fs.readFileSync('public/audio/manifest.json', 'utf8')) as {
    voices: Record<'ar' | 'fs', { name: string }>
    clips: Record<string, { text: string }>
  }

  it('uses Layla for standard Arabic and Maryam for Kuwaiti', () => {
    expect(manifest.voices.fs.name).toBe('Layla - Modern Arabic')
    expect(manifest.voices.ar.name).toBe('Maryam Essa - Kuwaiti Calm & Warm')
  })

  it('reads letters and words with full diacritics, and Kuwaiti lines without them', () => {
    for (const cue of audioCues()) {
      if (cue.voice === 'fs') expect(cue.text, cue.id).toMatch(DIACRITICS)
      else expect(cue.text, cue.id).not.toMatch(DIACRITICS)
    }
  })

  it('has a current clip for every cue', () => {
    for (const cue of audioCues()) {
      expect(manifest.clips[cue.id]?.text, cue.id).toBe(cue.text)
      expect(cue.id.startsWith(`${cue.voice}/`), cue.id).toBe(true)
      expect(fs.existsSync(`public/audio/${cue.id}.mp3`), cue.id).toBe(true)
    }
  })

  it('has a recording for every clip a round can play', () => {
    const recorded = new Set(audioCues().map((cue) => cue.id))
    for (const id of roundClips(QUESTIONS)) expect(recorded.has(id), id).toBe(true)
    for (const topic of TOPICS) expect(recorded.has(clip.topic(topic.id)), topic.id).toBe(true)
  })

  it('ends every spoken question with a complete sentence', () => {
    const texts = new Map(audioCues().map((cue) => [cue.id, cue.text]))
    for (const q of QUESTIONS) expect(texts.get(q.ask.at(-1)!), q.key).toMatch(/[؟.!]$/)
  })

  it('has many cheers and kind words, and several ways to explain picture answers', () => {
    expect(CHEERS.length).toBeGreaterThanOrEqual(10)
    expect(RETRIES.length).toBeGreaterThanOrEqual(5)
    for (const q of QUESTIONS.filter((entry) => entry.topic === 'picture' && entry.kind === 'pick')) expect(q.explain.length, q.key).toBe(3)
  })
})
