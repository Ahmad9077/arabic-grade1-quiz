import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  AR_LINES,
  ASK_LINES,
  BLENDS,
  FORMATS,
  LETTERS,
  PICTURE_WORDS,
  QUESTIONS,
  QUIZ_ID,
  SENTENCES,
  TOPICS,
  WORDS,
  audioCues,
  bare,
  joinedPieces,
  lettersOf,
  positionIn,
  roundClips,
  type Question,
} from '../../src/data/catalog'
import { dressQuestion, practiceSize } from '../../src/domain/round'
import OTHER_QUIZ_LINES from './other-quiz-lines.json'

const UNIT_LETTERS = 'غ ف ق ك ل م ن ه و ي'.split(' ')
const DIACRITICS = /[ً-ْٰ]/

function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return value / 2147483647
  }
}

/** Every question as it can come up: its first draw and many random ones. */
const DRESSED: Question[] = QUESTIONS.flatMap((q) => [q, ...Array.from({ length: 40 }, (_, n) => dressQuestion(q, seeded(n + 11)))])
const byFormat = (format: Question['format']) => DRESSED.filter((q) => q.format === format)

describe('question bank', () => {
  it('uses the permanent quiz id', () => {
    expect(QUIZ_ID).toBe('arabic-grade1')
  })

  it('registers exactly these questions with the Hub, and removes the first test’s', () => {
    const seed = fs.readFileSync('integration/seed-arabic-grade1.sql', 'utf8')
    const inserted = seed.split('insert into public.question_difficulty_profiles')[1]!.match(/'[a-z]+:[a-z0-9-]+'/g) ?? []
    expect(inserted.map((key) => key.slice(1, -1))).toEqual(QUESTIONS.map((q) => q.key))
    expect(seed).toContain("delete from public.question_difficulty_profiles\nwhere quiz_id = 'arabic-grade1'")
    expect(seed).not.toMatch(/insert into public\.quiz_assignments/)
  })

  it('has unique, well-formed permanent keys', () => {
    const keys = QUESTIONS.map((q) => q.key)
    expect(new Set(keys).size).toBe(keys.length)
    for (const q of QUESTIONS) expect(q.key).toMatch(new RegExp(`^${q.topic}:[a-z0-9-]+$`))
  })

  it('follows the card: five skills in its order, each with enough for a full round', () => {
    expect(TOPICS.map((t) => t.id)).toEqual(['picture', 'sound', 'missing', 'blend', 'handwriting'])
    expect(TOPICS.map((t) => t.card)).toEqual([
      'تحديد الصورة المناسبة للحرف المحدد',
      'كتابة صوت الحرف الدال على الصورة',
      'إكمال الكلمة بالحرف الناقص',
      'تركيب الحروف لتكوين كلمة',
      'نسخ جملة بخط جميل',
    ])
    expect(Object.values(FORMATS).map((f) => f.part)).toEqual([1, 2, 3, 4, 5])
    for (const topic of TOPICS) {
      expect(QUESTIONS.filter((q) => q.topic === topic.id).length, topic.id).toBeGreaterThanOrEqual(practiceSize(topic.id) + 2)
    }
  })

  it('teaches exactly the ten letters of unit 3, each in every letter skill', () => {
    expect(LETTERS.map((letter) => letter.char)).toEqual(UNIT_LETTERS)
    for (const char of UNIT_LETTERS) {
      expect(QUESTIONS.some((q) => q.format === 'pic-for-letter' && q.letter === char), `picture ${char}`).toBe(true)
      expect(QUESTIONS.some((q) => q.format === 'letter-sound' && q.letter === char), `sound ${char}`).toBe(true)
      expect(QUESTIONS.filter((q) => q.format === 'missing' && q.letter === char).length, `missing ${char}`).toBeGreaterThanOrEqual(3)
      expect(BLENDS.some((blend) => blend.syllables.some((s) => s.startsWith(char === 'ه' ? 'ه' : char))), `blend ${char}`).toBe(true)
    }
  })

  it('gives every word its own picture, so no picture can be two words', () => {
    const arts = Object.values(WORDS).map((word) => word.art)
    expect(new Set(arts).size).toBe(arts.length)
    const ids = Object.values(WORDS).map((word) => word.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const [char, words] of Object.entries(PICTURE_WORDS)) for (const word of words) expect(lettersOf(word)[0], word).toBe(char)
  })

  it('1. shows the letter and three pictures, only one of them starting with it', () => {
    for (const q of byFormat('pic-for-letter')) {
      expect(q.subject).toBe(`txt:${q.letter}`)
      expect(q.options).toHaveLength(3)
      expect(new Set(q.options.map((o) => o.art)).size).toBe(3)
      const starting = q.options.filter((o) => lettersOf(o.id)[0] === q.letter)
      expect(starting.map((o) => o.id)).toEqual([q.answer])
      expect(q.options.every((o) => o.clip)).toBe(true)
    }
  })

  it('2. shows a picture and six letter keys: its first letter is the answer', () => {
    for (const q of byFormat('letter-sound')) {
      expect(lettersOf(q.word!)[0]).toBe(q.answer)
      expect(q.subject).toBe(WORDS[q.word!]!.art)
      expect(q.ask[0]).toBe(`fs/word/${WORDS[q.word!]!.id}`)
      expect(q.options).toHaveLength(6)
      expect(q.options.map((o) => o.id)).toContain(q.answer)
      expect(q.options.every((o) => UNIT_LETTERS.includes(o.id))).toBe(true)
    }
  })

  it('3. leaves one unit letter out of a book word, with six keys to put it back', () => {
    for (const q of byFormat('missing')) {
      expect(lettersOf(q.word!)[q.gap!]).toBe(q.answer)
      expect(UNIT_LETTERS).toContain(q.answer)
      expect(q.options).toHaveLength(6)
      expect(q.options.map((o) => o.id)).toContain(q.answer)
      // The keys keep the book's letter order.
      expect(q.options.map((o) => o.id)).toEqual(UNIT_LETTERS.filter((char) => q.options.some((o) => o.id === char)))
    }
  })

  it('4. builds each word from its own letters, among two near words', () => {
    for (const blend of BLENDS) expect(blend.syllables.map((s) => bare(s)).join(''), blend.id).toBe(bare(blend.word))
    for (const q of byFormat('blend')) {
      expect(q.options).toHaveLength(3)
      expect(new Set(q.options.map((o) => o.id)).size).toBe(3)
      expect(q.options.map((o) => o.id)).toContain(q.answer)
    }
  })

  it('5. copies the book’s sentences, with their short vowels', () => {
    const book = SENTENCES.filter((s) => s.page)
    expect(book.map((s) => bare(s.text))).toEqual(['قرأ حمد.', 'قرأ حمد مع أنس.', 'ذهب حمد.', 'ذهب حمد وأمل.', 'يقف حمد مع عمر.'])
    for (const s of SENTENCES) {
      expect(s.text).toMatch(DIACRITICS)
      if (s.page) expect(s.page >= 145 && s.page <= 196, s.id).toBe(true)
    }
  })

  it('keeps letter shapes joined around a gap', () => {
    expect(positionIn(lettersOf('تفاح'), 1)).toBe('medial')
    expect(positionIn(lettersOf('ورق'), 2)).toBe('isolated')
    expect(positionIn(lettersOf('دلو'), 2)).toBe('final')
    expect(joinedPieces(lettersOf('تفاح'))[1]).toBe('‍ف‍')
  })
})

describe('narration', () => {
  const maryam = [...Object.values(ASK_LINES).flat(), ...Object.values(AR_LINES).flat()]

  it('has every clip a round can play', () => {
    const ids = new Set(audioCues().map((cue) => cue.id))
    const all = roundClips(DRESSED)
    for (const id of all) expect(ids.has(id), id).toBe(true)
  })

  it('has a recorded file for every clip, and no clip left over', () => {
    const manifest = JSON.parse(fs.readFileSync('public/audio/manifest.json', 'utf8')) as { clips: Record<string, unknown> }
    const ids = audioCues().map((cue) => cue.id)
    for (const id of ids) {
      expect(manifest.clips[id], id).toBeTruthy()
      expect(fs.existsSync(`public/audio/${id}.mp3`), id).toBe(true)
    }
    expect(Object.keys(manifest.clips).sort()).toEqual([...ids].sort())
  })

  it('reads letters, words and sentences with full diacritics, and Maryam without', () => {
    for (const cue of audioCues()) {
      if (cue.voice === 'fs') expect(cue.text, cue.id).toMatch(DIACRITICS)
      else expect(cue.text, cue.id).not.toMatch(DIACRITICS)
    }
  })

  it('never writes a sigh, and uses Kuwaiti words', () => {
    for (const line of maryam) {
      expect(line, line).not.toMatch(/…|\.\.|أوه|آه|همم/)
      expect(line, line).not.toMatch(/نحوط|ذبيت|نذب|فديت|سيكل|الجاية|\bثلاث\b|\bخمس\b/)
    }
  })

  it('speaks to every child alike', () => {
    for (const line of maryam) expect(line, line).not.toMatch(/عليك|عليج|أحسنت|شاطرة|شاطر\b|يا بطل|يا بطلة|حبيبتي|حبيبي/)
  })

  it('has several lines for every style and moment, none taken from the family’s other quizzes', () => {
    for (const [group, lines] of Object.entries(ASK_LINES)) expect(lines.length, group).toBeGreaterThanOrEqual(3)
    expect(AR_LINES.cheer.length).toBeGreaterThanOrEqual(16)
    const strip = (text: string) => text.replace(/[!،.؟…]/g, '').trim()
    const old = new Set((OTHER_QUIZ_LINES as string[]).map(strip))
    for (const line of maryam) expect(old.has(strip(line)), line).toBe(false)
    expect(new Set(maryam.map(strip)).size).toBe(maryam.length)
  })
})
