// Content for «اللغة العربية - الأول الابتدائي» — the first Arabic test (Sunday 25 Oct 2026).
// The school's card: units 1 and 2, the letters from أ to ظ, and six skills —
//   1. join a letter to the picture it starts   → topic `picture` (letter → picture, boards)
//   2. circle the letter in a word              → topic `find`
//   3. write the letter a picture starts with   → topic `picture` (picture → letter)
//   4. complete a word with the right letter form → topic `form`
//   5. build a word from ordered letters with short vowels → topic `blend`
//   6. copy two letters                         → topic `copy`
//
// Voices: letters, words and syllables in Modern Standard Arabic (Layla, the approved Arabic
// phonics reference) with full diacritics so ظ, ض, ذ and ث keep their sounds; instructions and
// cheers in Kuwaiti dialect (Maryam), sent without diacritics. Screen text has no diacritics
// except where the short vowels are the thing being learned (the blend topic).
// Wording never speaks to a girl or a boy. Question keys are permanent Hub identifiers.
// This file is self-contained so Node scripts can import it directly.

export const QUIZ_ID = 'arabic-grade1'

export type TopicId = 'picture' | 'find' | 'form' | 'blend' | 'copy'
export type QuestionKind = 'pick' | 'match' | 'tap'

/** An emoji, `txt:<text>` (letters or words in the reading font) or `pair:<a> <b>` (two letters). */
export type ArtRef = string

export interface Letter {
  char: string
  /** Name as written on screen, e.g. «الباء». */
  name: string
  /** Name with diacritics, in the genitive after «حرف». */
  spoken: string
  /** How to spot it: its dots, on screen and spoken. */
  dots: string
  dotsSpoken: string
}

const NO_DOTS = { dots: 'ليس فيه نقاط', dotsSpoken: 'لَيْسَ فِيهِ نِقَاطٌ' }
const ONE_ABOVE = { dots: 'فوقه نقطة واحدة', dotsSpoken: 'فَوْقَهُ نُقْطَةٌ وَاحِدَةٌ' }
const ONE_BELOW = { dots: 'تحته نقطة واحدة', dotsSpoken: 'تَحْتَهُ نُقْطَةٌ وَاحِدَةٌ' }
const TWO_ABOVE = { dots: 'فوقه نقطتان', dotsSpoken: 'فَوْقَهُ نُقْطَتَانِ' }
const THREE_ABOVE = { dots: 'فوقه ثلاث نقاط', dotsSpoken: 'فَوْقَهُ ثَلَاثُ نِقَاطٍ' }

export const LETTERS: Letter[] = [
  { char: 'أ', name: 'الألف', spoken: 'الأَلِفِ', dots: 'فوقه همزة', dotsSpoken: 'فَوْقَهُ هَمْزَةٌ' },
  { char: 'ب', name: 'الباء', spoken: 'البَاءِ', ...ONE_BELOW },
  { char: 'ت', name: 'التاء', spoken: 'التَّاءِ', ...TWO_ABOVE },
  { char: 'ث', name: 'الثاء', spoken: 'الثَّاءِ', ...THREE_ABOVE },
  { char: 'ج', name: 'الجيم', spoken: 'الجِيمِ', ...ONE_BELOW },
  { char: 'ح', name: 'الحاء', spoken: 'الحَاءِ', ...NO_DOTS },
  { char: 'خ', name: 'الخاء', spoken: 'الخَاءِ', ...ONE_ABOVE },
  { char: 'د', name: 'الدال', spoken: 'الدَّالِ', ...NO_DOTS },
  { char: 'ذ', name: 'الذال', spoken: 'الذَّالِ', ...ONE_ABOVE },
  { char: 'ر', name: 'الراء', spoken: 'الرَّاءِ', ...NO_DOTS },
  { char: 'ز', name: 'الزاي', spoken: 'الزَّايِ', ...ONE_ABOVE },
  { char: 'س', name: 'السين', spoken: 'السِّينِ', ...NO_DOTS },
  { char: 'ش', name: 'الشين', spoken: 'الشِّينِ', ...THREE_ABOVE },
  { char: 'ص', name: 'الصاد', spoken: 'الصَّادِ', ...NO_DOTS },
  { char: 'ض', name: 'الضاد', spoken: 'الضَّادِ', ...ONE_ABOVE },
  { char: 'ط', name: 'الطاء', spoken: 'الطَّاءِ', ...NO_DOTS },
  { char: 'ظ', name: 'الظاء', spoken: 'الظَّاءِ', ...ONE_ABOVE },
]

const LETTER = new Map(LETTERS.map((letter) => [letter.char, letter]))
export function letterOf(char: string): Letter {
  const letter = LETTER.get(char)
  if (!letter) throw new Error(`Unknown letter ${char}`)
  return letter
}

export interface Word {
  /** Permanent Latin id, used in question keys and clip names. */
  id: string
  art: string
  /** With diacritics, for the voice (pausal form). */
  spoken: string
}

// Picture words a Grade 1 child knows. The first block starts with each test letter;
// the second holds test letters inside them, for finding letters and their shapes.
export const WORDS: Record<string, Word> = {
  'أسد': { id: 'asad', art: '🦁', spoken: 'أَسَد' },
  'أرنب': { id: 'arnab', art: '🐇', spoken: 'أَرْنَب' },
  'أذن': { id: 'udhun', art: '👂', spoken: 'أُذُن' },
  'بطة': { id: 'batta', art: '🦆', spoken: 'بَطَّة' },
  'باب': { id: 'bab', art: '🚪', spoken: 'بَاب' },
  'بيت': { id: 'bayt', art: '🏠', spoken: 'بَيْت' },
  'بقرة': { id: 'baqara', art: '🐄', spoken: 'بَقَرَة' },
  'تفاحة': { id: 'tuffaha', art: '🍎', spoken: 'تُفَّاحَة' },
  'تاج': { id: 'taj', art: '👑', spoken: 'تَاج' },
  'تمساح': { id: 'timsah', art: '🐊', spoken: 'تِمْسَاح' },
  'ثعلب': { id: 'thalab', art: '🦊', spoken: 'ثَعْلَب' },
  'ثوم': { id: 'thum', art: '🧄', spoken: 'ثُوم' },
  'ثلج': { id: 'thalj', art: '❄️', spoken: 'ثَلْج' },
  'جمل': { id: 'jamal', art: '🐪', spoken: 'جَمَل' },
  'جزرة': { id: 'jazara', art: '🥕', spoken: 'جَزَرَة' },
  'جرس': { id: 'jaras', art: '🔔', spoken: 'جَرَس' },
  'حصان': { id: 'hisan', art: '🐴', spoken: 'حِصَان' },
  'حليب': { id: 'halib', art: '🥛', spoken: 'حَلِيب' },
  'حذاء': { id: 'hidha', art: '👟', spoken: 'حِذَاء' },
  'خروف': { id: 'kharuf', art: '🐑', spoken: 'خَرُوف' },
  'خبز': { id: 'khubz', art: '🍞', spoken: 'خُبْز' },
  'خيمة': { id: 'khayma', art: '⛺', spoken: 'خَيْمَة' },
  'دب': { id: 'dubb', art: '🐻', spoken: 'دُبّ' },
  'دجاجة': { id: 'dajaja', art: '🐔', spoken: 'دَجَاجَة' },
  'دراجة': { id: 'darraja', art: '🚲', spoken: 'دَرَّاجَة' },
  'ذرة': { id: 'dhura', art: '🌽', spoken: 'ذُرَة' },
  'ذئب': { id: 'dhib', art: '🐺', spoken: 'ذِئْب' },
  'ذبابة': { id: 'dhubaba', art: '🪰', spoken: 'ذُبَابَة' },
  'رجل': { id: 'rajul', art: '👨', spoken: 'رَجُل' },
  'ريشة': { id: 'risha', art: '🪶', spoken: 'رِيشَة' },
  'رز': { id: 'ruzz', art: '🍚', spoken: 'رُزّ' },
  'زرافة': { id: 'zarafa', art: '🦒', spoken: 'زَرَافَة' },
  'زهرة': { id: 'zahra', art: '🌸', spoken: 'زَهْرَة' },
  'زيتون': { id: 'zaytun', art: '🫒', spoken: 'زَيْتُون' },
  'سمكة': { id: 'samaka', art: '🐟', spoken: 'سَمَكَة' },
  'سيارة': { id: 'sayyara', art: '🚗', spoken: 'سَيَّارَة' },
  'سلحفاة': { id: 'sulahfa', art: '🐢', spoken: 'سُلَحْفَاة' },
  'شمس': { id: 'shams', art: '☀️', spoken: 'شَمْس' },
  'شجرة': { id: 'shajara', art: '🌳', spoken: 'شَجَرَة' },
  'شمعة': { id: 'shama', art: '🕯️', spoken: 'شَمْعَة' },
  'صقر': { id: 'saqr', art: '🦅', spoken: 'صَقْر' },
  'صاروخ': { id: 'sarukh', art: '🚀', spoken: 'صَارُوخ' },
  'صندوق': { id: 'sunduq', art: '📦', spoken: 'صُنْدُوق' },
  'ضفدع': { id: 'difda', art: '🐸', spoken: 'ضِفْدَع' },
  'ضب': { id: 'dabb', art: '🦎', spoken: 'ضَبّ' },
  'طائرة': { id: 'taira', art: '✈️', spoken: 'طَائِرَة' },
  'طماطم': { id: 'tamatim', art: '🍅', spoken: 'طَمَاطِم' },
  'طبل': { id: 'tabl', art: '🥁', spoken: 'طَبْل' },
  'ظرف': { id: 'zarf', art: '✉️', spoken: 'ظَرْف' },
  'ظبي': { id: 'zabi', art: '🦌', spoken: 'ظَبْي' },
  'عنب': { id: 'inab', art: '🍇', spoken: 'عِنَب' },
  'قطة': { id: 'qitta', art: '🐱', spoken: 'قِطَّة' },
  'ملح': { id: 'milh', art: '🧂', spoken: 'مِلْح' },
  'نجمة': { id: 'najma', art: '⭐', spoken: 'نَجْمَة' },
  'عصفور': { id: 'usfur', art: '🐦', spoken: 'عُصْفُور' },
  'بيض': { id: 'bayd', art: '🥚', spoken: 'بَيْض' },
  'نحلة': { id: 'nahla', art: '🐝', spoken: 'نَحْلَة' },
  'خيط': { id: 'khayt', art: '🧵', spoken: 'خَيْط' },
  'يد': { id: 'yad', art: '✋', spoken: 'يَد' },
  'قمر': { id: 'qamar', art: '🌙', spoken: 'قَمَر' },
  'نظارة': { id: 'nazzara', art: '👓', spoken: 'نَظَّارَة' },
}

/** Words that start with each test letter, in teaching order. */
export const WORDS_BY_LETTER: Record<string, string[]> = {
  'أ': ['أسد', 'أرنب', 'أذن'], 'ب': ['بطة', 'باب', 'بقرة'], 'ت': ['تفاحة', 'تاج', 'تمساح'],
  'ث': ['ثعلب', 'ثوم', 'ثلج'], 'ج': ['جمل', 'جزرة', 'جرس'], 'ح': ['حصان', 'حليب', 'حذاء'],
  'خ': ['خروف', 'خبز', 'خيمة'], 'د': ['دب', 'دجاجة', 'دراجة'], 'ذ': ['ذرة', 'ذئب', 'ذبابة'],
  'ر': ['رجل', 'ريشة', 'رز'], 'ز': ['زرافة', 'زهرة', 'زيتون'], 'س': ['سمكة', 'سيارة', 'سلحفاة'],
  'ش': ['شمس', 'شجرة', 'شمعة'], 'ص': ['صقر', 'صاروخ', 'صندوق'], 'ض': ['ضفدع', 'ضب'],
  'ط': ['طائرة', 'طماطم', 'طبل'], 'ظ': ['ظرف', 'ظبي'],
}

// ── Arabic letter shapes ──────────────────────────────────────────────────
const TATWEEL = 'ـ'
const ZWJ = '‍'
/** Letters that never join the letter after them. */
const NON_JOINING = new Set(['ا', 'أ', 'إ', 'آ', 'د', 'ذ', 'ر', 'ز', 'و', 'ؤ', 'ة', 'ء', 'ى'])
const joinsNext = (char: string | undefined) => char !== undefined && !NON_JOINING.has(char)

export type Position = 'initial' | 'medial' | 'final' | 'isolated'

/** Where a letter sits in a word decides its shape. */
export function positionIn(letters: string[], index: number): Position {
  const fromPrev = index > 0 && joinsNext(letters[index - 1])
  const toNext = index < letters.length - 1 && joinsNext(letters[index])
  if (fromPrev && toNext) return 'medial'
  if (fromPrev) return 'final'
  if (toNext) return 'initial'
  return 'isolated'
}

/** A letter's shape written on its own, with tatweel showing the joins. */
export function formOf(char: string, position: Position): string {
  if (position === 'initial') return char + TATWEEL
  if (position === 'medial') return TATWEEL + char + TATWEEL
  if (position === 'final') return TATWEEL + char
  return char
}

/** Each letter of a word as shown inside the word: zero-width joiners keep the joined shape per letter. */
export function joinedPieces(letters: string[]): string[] {
  return letters.map((char, index) => {
    const position = positionIn(letters, index)
    const before = position === 'medial' || position === 'final' ? ZWJ : ''
    const after = position === 'medial' || position === 'initial' ? ZWJ : ''
    return before + char + after
  })
}

/** Unicode letters of a word (Arabic letters are single code points here). */
export const lettersOf = (word: string) => [...word]

// ── Clip ids ──────────────────────────────────────────────────────────────
// fs/… is Modern Standard Arabic (Layla, with diacritics); ar/… is Kuwaiti (Maryam).
// Permanent Latin ids: question keys and clip names never depend on list order.
const LETTER_IDS = ['alif', 'ba', 'ta', 'tha', 'jim', 'ha', 'kha', 'dal', 'dhal', 'ra', 'zay', 'sin', 'shin', 'sad', 'dad', 'tta', 'zza']
const slug = (char: string) => LETTER_IDS[LETTERS.findIndex((letter) => letter.char === char)]!
const wordSlug = (word: string) => WORDS[word]!.id

export const clip = {
  name: (char: string) => `fs/name/${slug(char)}`,
  where: (char: string) => `fs/where/${slug(char)}`,
  starts: (char: string) => `fs/starts/${slug(char)}`,
  dots: (char: string) => `fs/dots/${slug(char)}`,
  word: (word: string) => `fs/word/${wordSlug(word)}`,
  blend: (id: string) => `fs/blend/${id}`,
  ask: (id: AskClip) => `ar/q/${id}`,
  topic: (id: TopicId) => `ar/t/${id}`,
  ui: (id: UiClip) => `ar/ui/${id}`,
}

// ── Explanations ──────────────────────────────────────────────────────────
/** One way to explain an answer: shown on screen and spoken as a short run of clips. */
export interface Explanation {
  text: string
  clips: string[]
}

function startsWith(word: string): Explanation[] {
  const letter = letterOf(lettersOf(word)[0]!)
  return [
    { text: `${word} تبدأ بحرف ${letter.name}`, clips: [clip.word(word), clip.starts(letter.char)] },
    { text: `${word} تبدأ بحرف ${letter.name}، و${letter.dots}`, clips: [clip.word(word), clip.starts(letter.char), clip.dots(letter.char)] },
    { text: `حرف ${letter.name}: ${word}`, clips: [clip.name(letter.char), clip.word(word)] },
  ]
}

const dotsOf = (char: string): Explanation => {
  const letter = letterOf(char)
  return { text: `حرف ${letter.name} ${letter.dots}`, clips: [clip.dots(char)] }
}

const POSITION_TEXT: Record<Position, { text: string; ui: UiClip }> = {
  initial: { text: 'في أول الكلمة يتصل بما بعده', ui: 'pos-initial' },
  medial: { text: 'في وسط الكلمة يتصل من الجهتين', ui: 'pos-medial' },
  final: { text: 'في آخر الكلمة يتصل بما قبله', ui: 'pos-final' },
  isolated: { text: 'هنا لا يتصل بغيره', ui: 'pos-isolated' },
}

// ── Topics ────────────────────────────────────────────────────────────────
export interface Topic {
  id: TopicId
  title: string
  say: string
  art: ArtRef[]
}

export const TOPICS: Topic[] = [
  { id: 'picture', title: 'الحرف والصورة', say: 'كل صورة تبدأ بحرف… نسمع اسم الصورة، ونعرف أول حرف فيها.', art: ['🦁', 'txt:أ'] },
  { id: 'find', title: 'الحرف في الكلمة', say: 'الحروف مخبية داخل الكلمات… نشوف الكلمة، ونلقى الحرف المطلوب.', art: ['🔍', 'txt:ب'] },
  { id: 'form', title: 'شكل الحرف', say: 'الحرف يتغير شكله… في أول الكلمة، وفي وسطها، وفي آخرها. نختار الشكل الصح.', art: ['🧩', 'txt:ـبـ'] },
  { id: 'blend', title: 'تركيب الكلمة', say: 'نركب الحروف مع بعض… ونقرا الكلمة كاملة.', art: ['txt:دَ', 'txt:رَ'] },
  { id: 'copy', title: 'نسخ الحرفين', say: 'نركز زين في النقاط… ونختار الحرفين نفسهم بالضبط.', art: ['✏️', 'pair:ج خ'] },
]

// ── Questions ─────────────────────────────────────────────────────────────
export interface Option {
  id: string
  art: ArtRef
  label: string
  /** Read while the tile lights up; absent when hearing it would give the answer away. */
  clip?: string
}

export interface Pair {
  id: string
  /** The letter, chosen first. */
  first: ArtRef
  /** The picture that answers it. */
  second: ArtRef
  label: string
  clip: string
}

export interface Question {
  key: string
  topic: TopicId
  kind: QuestionKind
  prompt: string
  ask: string[]
  subject?: ArtRef
  /** A word with one letter missing (shape questions). */
  gap?: { letters: string[]; index: number }
  /** A word whose letters can be tapped (finding a letter). */
  tap?: { letters: string[] }
  /** Letters with short vowels shown in order (blending). */
  syllables?: string[]
  options: Option[]
  pairs: Pair[]
  /** Option id, or for tap questions the letter index(es) joined by commas. */
  answer: string
  /** Ways to explain the answer; one is chosen each time so it does not repeat word for word. */
  explain: Explanation[]
  difficulty: number
  skills: string[]
}

type Extra = { difficulty: number }

function base(key: string, topic: TopicId, kind: QuestionKind, prompt: string, ask: string[], skills: string[], extra: Extra) {
  return { key: `${topic}:${key}`, topic, kind, prompt, ask, options: [] as Option[], pairs: [] as Pair[], skills, ...extra }
}

const letterOption = (char: string): Option => ({ id: char, art: `txt:${char}`, label: `حرف ${letterOf(char).name}` })
const pictureOption = (word: string): Option => ({ id: word, art: WORDS[word]!.art, label: word, clip: clip.word(word) })

/** A letter, then the picture that starts with it (skill 1). */
function picFor(char: string, word: string, others: string[], extra: Extra): Question {
  return {
    ...base(`${slug(char)}-pic`, 'picture', 'pick', 'أي صورة تبدأ بهذا الحرف؟', [clip.name(char), clip.ask('pic-for-letter')], ['letter_picture'], extra),
    subject: `txt:${char}`,
    options: [word, ...others].map(pictureOption),
    answer: word,
    explain: startsWith(word),
  }
}

/** A picture, then its first letter (skill 3: the letter a picture starts with). */
function letterFor(word: string, others: string[], extra: Extra): Question {
  const char = lettersOf(word)[0]!
  return {
    ...base(`${wordSlug(word)}-letter`, 'picture', 'pick', 'بأي حرف تبدأ هذه الكلمة؟', [clip.word(word), clip.ask('letter-for-pic')], ['initial_sound'], extra),
    subject: WORDS[word]!.art,
    options: [char, ...others].map(letterOption),
    answer: char,
    explain: startsWith(word),
  }
}

/** The worksheet's «join» exercise: letters first, then their pictures. */
function board(key: string, words: string[], extra: Extra): Question {
  return {
    ...base(`board-${key}`, 'picture', 'match', 'نوصل كل حرف بالصورة التي تبدأ به', [clip.ask('match-pic')], ['letter_picture', 'matching'], extra),
    pairs: words.map((word) => {
      const char = lettersOf(word)[0]!
      return { id: char, first: `txt:${char}`, second: WORDS[word]!.art, label: `حرف ${letterOf(char).name}`, clip: clip.name(char) }
    }),
    answer: '',
    explain: [{ text: words.map((word) => startsWith(word)[0]!.text).join('\n'), clips: words.flatMap((word) => startsWith(word)[0]!.clips) }],
  }
}

/** Tap the letter inside the word (skill 2: circle the letter). */
function find(char: string, word: string, extra: Extra): Question {
  const letters = lettersOf(word)
  const indexes = letters.flatMap((letter, index) => (letter === char ? [index] : []))
  if (indexes.length === 0) throw new Error(`${word} has no ${char}`)
  return {
    ...base(`${slug(char)}-${wordSlug(word)}`, 'find', 'tap', `أين حرف ${letterOf(char).name}؟`, [clip.word(word), clip.where(char)], ['letter_in_word'], extra),
    subject: WORDS[word]!.art,
    tap: { letters },
    answer: indexes.join(','),
    explain: [dotsOf(char), { text: `في كلمة ${word}: حرف ${letterOf(char).name}`, clips: [clip.word(word), clip.name(char)] }],
  }
}

const OTHER_POSITIONS: Record<Position, Position[]> = {
  initial: ['medial', 'final'],
  medial: ['initial', 'final'],
  final: ['initial', 'medial'],
  isolated: ['initial', 'medial'],
}

/** Complete the word with the right shape of the letter (skill 4). */
function shape(word: string, index: number, extra: Extra): Question {
  const letters = lettersOf(word)
  const char = letters[index]!
  const position = positionIn(letters, index)
  const forms: Position[] = [position, ...OTHER_POSITIONS[position]]
  return {
    ...base(`${wordSlug(word)}-${index + 1}`, 'form', 'pick', 'أي شكل للحرف يكمل الكلمة؟', [clip.word(word), clip.ask('form')], ['letter_form'], extra),
    subject: WORDS[word]!.art,
    gap: { letters, index },
    options: forms.map((form) => ({ id: form, art: `txt:${formOf(char, form)}`, label: formOf(char, form) })),
    answer: position,
    explain: [{ text: `حرف ${letterOf(char).name} ${POSITION_TEXT[position].text}`, clips: [clip.word(word), clip.ui(POSITION_TEXT[position].ui)] }],
  }
}

export interface Blend {
  id: string
  word: string
  syllables: string[]
}

// Words of three letters with short vowels, using only the letters from أ to ظ.
export const BLENDS: Blend[] = [
  { id: 'darasa', word: 'دَرَسَ', syllables: ['دَ', 'رَ', 'سَ'] },
  { id: 'shariba', word: 'شَرِبَ', syllables: ['شَ', 'رِ', 'بَ'] },
  { id: 'kharaja', word: 'خَرَجَ', syllables: ['خَ', 'رَ', 'جَ'] },
  { id: 'sabaha', word: 'سَبَحَ', syllables: ['سَ', 'بَ', 'حَ'] },
  { id: 'hadara', word: 'حَضَرَ', syllables: ['حَ', 'ضَ', 'رَ'] },
  { id: 'tabakha', word: 'طَبَخَ', syllables: ['طَ', 'بَ', 'خَ'] },
  { id: 'sabara', word: 'صَبَرَ', syllables: ['صَ', 'بَ', 'رَ'] },
  { id: 'bahatha', word: 'بَحَثَ', syllables: ['بَ', 'حَ', 'ثَ'] },
  { id: 'jadhaba', word: 'جَذَبَ', syllables: ['جَ', 'ذَ', 'بَ'] },
  { id: 'harasa', word: 'حَرَسَ', syllables: ['حَ', 'رَ', 'سَ'] },
  { id: 'khabaza', word: 'خَبَزَ', syllables: ['خَ', 'بَ', 'زَ'] },
  { id: 'haratha', word: 'حَرَثَ', syllables: ['حَ', 'رَ', 'ثَ'] },
  { id: 'zaara', word: 'زَأَرَ', syllables: ['زَ', 'أَ', 'رَ'] },
]

/** Letters with short vowels, then the word they make (skill 5). */
function blendQ(blend: Blend, others: string[], extra: Extra): Question {
  const byId = new Map(BLENDS.map((entry) => [entry.id, entry]))
  return {
    // The syllables are shown, not spoken: read alone, a syllable can come out as the letter's name.
    ...base(blend.id, 'blend', 'pick', 'ما الكلمة التي تتركب من هذه الحروف؟', [clip.ask('blend')], ['blending', 'short_vowels'], extra),
    syllables: blend.syllables,
    options: [blend, ...others.map((id) => byId.get(id)!)].map((entry) => ({ id: entry.id, art: `txt:${entry.word}`, label: entry.word })),
    answer: blend.id,
    explain: [{ text: `${blend.syllables.join(' + ')} = ${blend.word}`, clips: [clip.blend(blend.id)] }],
  }
}

/** Two letters, then the same two among look-alikes (skill 6: copy two letters). */
function copyQ(a: string, b: string, wrong: [string, string][], extra: Extra): Question {
  const options = [[a, b], ...wrong].map(([x, y]) => ({ id: `${x}${y}`, art: `pair:${x} ${y}`, label: `${x} ${y}` }))
  return {
    ...base(`${slug(a)}-${slug(b)}`, 'copy', 'pick', 'أين الحرفان نفسهما؟', [clip.ask('copy')], ['letter_shape', 'copying'], extra),
    subject: `pair:${a} ${b}`,
    options,
    answer: `${a}${b}`,
    explain: [{ text: `${dotsOf(a).text}\n${dotsOf(b).text}`, clips: [clip.dots(a), clip.dots(b)] }],
  }
}

const d = (difficulty: number): Extra => ({ difficulty })

export const QUESTIONS: Question[] = [
  // 1 and 3. Letter and picture
  picFor('أ', 'أسد', ['بطة', 'جمل'], d(15)),
  picFor('ب', 'بطة', ['تفاحة', 'ثعلب'], d(20)),
  picFor('ت', 'تاج', ['باب', 'ثوم'], d(30)),
  picFor('ث', 'ثعلب', ['تمساح', 'سمكة'], d(35)),
  picFor('ج', 'جمل', ['حصان', 'خروف'], d(30)),
  picFor('ح', 'حصان', ['جزرة', 'خبز'], d(35)),
  picFor('خ', 'خروف', ['حليب', 'جرس'], d(35)),
  picFor('د', 'دب', ['ذرة', 'رجل'], d(30)),
  picFor('ذ', 'ذرة', ['دجاجة', 'زرافة'], d(40)),
  picFor('ر', 'رجل', ['زهرة', 'دراجة'], d(35)),
  picFor('ز', 'زرافة', ['رز', 'ذئب'], d(35)),
  picFor('س', 'سمكة', ['شمس', 'صقر'], d(30)),
  picFor('ش', 'شجرة', ['سيارة', 'صاروخ'], d(35)),
  picFor('ص', 'صقر', ['سلحفاة', 'ضفدع'], d(40)),
  picFor('ض', 'ضفدع', ['صندوق', 'ظرف'], d(45)),
  picFor('ط', 'طائرة', ['ظبي', 'تاج'], d(40)),
  picFor('ظ', 'ظبي', ['طبل', 'ضب'], d(50)),
  letterFor('أرنب', ['ب', 'ر'], d(20)),
  letterFor('بقرة', ['ت', 'ث'], d(25)),
  letterFor('تفاحة', ['ب', 'ث'], d(30)),
  letterFor('ثلج', ['ت', 'ش'], d(40)),
  letterFor('جزرة', ['ح', 'خ'], d(35)),
  letterFor('حليب', ['ج', 'خ'], d(40)),
  letterFor('خيمة', ['ح', 'ج'], d(40)),
  letterFor('دجاجة', ['ذ', 'ر'], d(35)),
  letterFor('ذئب', ['د', 'ز'], d(45)),
  letterFor('ريشة', ['ز', 'د'], d(35)),
  letterFor('زهرة', ['ر', 'ذ'], d(40)),
  letterFor('سيارة', ['ش', 'ص'], d(35)),
  letterFor('شمعة', ['س', 'ث'], d(40)),
  letterFor('صاروخ', ['س', 'ض'], d(45)),
  letterFor('ضب', ['ص', 'ظ'], d(50)),
  letterFor('طماطم', ['ظ', 'ت'], d(45)),
  letterFor('ظرف', ['ط', 'ض'], d(55)),
  board('a', ['أسد', 'بطة', 'تاج'], d(25)),
  board('b', ['ثعلب', 'جمل', 'حصان'], d(35)),
  board('c', ['خروف', 'دب', 'ذرة'], d(40)),
  board('d', ['رجل', 'زرافة', 'سمكة'], d(35)),
  board('e', ['شمس', 'صقر', 'ضفدع'], d(45)),
  board('f', ['طائرة', 'ظبي', 'خيمة'], d(50)),

  // 2. The letter in the word
  find('أ', 'أرنب', d(20)),
  find('ب', 'عنب', d(35)),
  find('ت', 'بيت', d(35)),
  find('ث', 'ثعلب', d(25)),
  find('ج', 'نجمة', d(40)),
  find('ح', 'نحلة', d(40)),
  find('خ', 'خيمة', d(25)),
  find('د', 'يد', d(30)),
  find('ذ', 'ذئب', d(30)),
  find('ر', 'قمر', d(40)),
  find('ز', 'خبز', d(45)),
  find('س', 'شمس', d(55)),
  find('ش', 'شمعة', d(30)),
  find('ص', 'عصفور', d(45)),
  find('ض', 'بيض', d(45)),
  find('ط', 'قطة', d(40)),
  find('ظ', 'نظارة', d(50)),

  // 4. Letter shapes: start, middle and end of the word
  shape('بطة', 0, d(25)),
  shape('عنب', 2, d(40)),
  shape('خبز', 1, d(45)),
  shape('بيت', 2, d(40)),
  shape('تفاحة', 0, d(25)),
  shape('ثعلب', 0, d(30)),
  shape('نجمة', 1, d(45)),
  shape('ثلج', 2, d(45)),
  shape('جمل', 0, d(30)),
  shape('نحلة', 1, d(45)),
  shape('ملح', 2, d(45)),
  shape('حصان', 0, d(30)),
  shape('خيمة', 0, d(30)),
  shape('سمكة', 0, d(30)),
  shape('شمس', 2, d(45)),
  shape('عصفور', 1, d(50)),
  shape('بيض', 2, d(45)),
  shape('قطة', 1, d(45)),
  shape('خيط', 2, d(50)),
  shape('نظارة', 1, d(55)),

  // 5. Building a word from letters with short vowels
  blendQ(BLENDS[0]!, ['harasa', 'sabaha'], d(30)),
  blendQ(BLENDS[1]!, ['sabara', 'harasa'], d(40)),
  blendQ(BLENDS[2]!, ['khabaza', 'hadara'], d(35)),
  blendQ(BLENDS[3]!, ['sabara', 'bahatha'], d(35)),
  blendQ(BLENDS[4]!, ['harasa', 'haratha'], d(40)),
  blendQ(BLENDS[5]!, ['khabaza', 'jadhaba'], d(40)),
  blendQ(BLENDS[6]!, ['sabaha', 'shariba'], d(40)),
  blendQ(BLENDS[7]!, ['haratha', 'sabaha'], d(45)),
  blendQ(BLENDS[8]!, ['kharaja', 'khabaza'], d(45)),
  blendQ(BLENDS[9]!, ['haratha', 'darasa'], d(40)),
  blendQ(BLENDS[10]!, ['kharaja', 'tabakha'], d(40)),
  blendQ(BLENDS[11]!, ['harasa', 'bahatha'], d(45)),
  blendQ(BLENDS[12]!, ['darasa', 'hadara'], d(50)),

  // 6. Copying two letters: the same pair among look-alikes
  copyQ('ب', 'ت', [['ت', 'ث'], ['ب', 'ث']], d(30)),
  copyQ('ت', 'ث', [['ث', 'ت'], ['ب', 'ث']], d(40)),
  copyQ('ج', 'ح', [['ج', 'خ'], ['ح', 'خ']], d(35)),
  copyQ('ح', 'خ', [['ج', 'خ'], ['خ', 'ح']], d(40)),
  copyQ('ج', 'خ', [['ح', 'خ'], ['ج', 'ح']], d(40)),
  copyQ('د', 'ذ', [['ذ', 'د'], ['د', 'ر']], d(35)),
  copyQ('ر', 'ز', [['ز', 'ر'], ['ر', 'ذ']], d(35)),
  copyQ('س', 'ش', [['ش', 'س'], ['س', 'ص']], d(40)),
  copyQ('ص', 'ض', [['ض', 'ص'], ['ص', 'ط']], d(45)),
  copyQ('ط', 'ظ', [['ظ', 'ط'], ['ط', 'ض']], d(45)),
  copyQ('ب', 'ث', [['ت', 'ث'], ['ب', 'ت']], d(40)),
  copyQ('ز', 'ذ', [['ر', 'ذ'], ['ز', 'د']], d(45)),
]

// ── Narration ─────────────────────────────────────────────────────────────
// Kuwaiti (Maryam Essa): instructions, topic introductions and cheers.
export const ASK_CLIPS = {
  'pic-for-letter': 'أي صورة تبدأ بهذا الحرف؟',
  'letter-for-pic': 'بأي حرف تبدأ هذي الكلمة؟',
  form: 'أي شكل للحرف يكمل الكلمة؟',
  blend: 'شنو الكلمة اللي تتركب من هذي الحروف؟',
  copy: 'وين الحرفين نفسهم بالضبط؟',
  'match-pic': 'نوصل كل حرف بالصورة اللي تبدأ فيه… نبدأ بالحرف.',
} as const
export type AskClip = keyof typeof ASK_CLIPS

export const UI_CLIPS = {
  welcome: 'هلا والله! هذا اختبار اللغة العربية… نختار درس، ونبدأ.',
  'test-intro': 'هذا اختبار تجريبي… فيه أسئلة من كل الدروس. يلا نبدأ!',
  'match-wrong': 'لا… نجرب مرة ثانية.',
  'match-first': 'نختار الحرف أول… وبعدين الصورة.',
  review: 'خلنا نتذكر مع بعض…',
  'done-great': 'واو! نتيجة رائعة!',
  'done-good': 'حلو! نتدرب مرة ثانية… ونصير أقوى.',
  'pos-initial': 'الحرف في أول الكلمة… فيتصل باللي بعده.',
  'pos-medial': 'الحرف في وسط الكلمة… فيتصل من الجهتين.',
  'pos-final': 'الحرف في آخر الكلمة… فيتصل باللي قبله.',
  'pos-isolated': 'الحرف هنا ما يتصل… فينكتب لحاله.',
  'cheer-1': 'كفو!',
  'cheer-2': 'ما شاء الله! صح.',
  'cheer-3': 'واو! جواب صح!',
  'cheer-4': 'برافو! جواب ممتاز.',
  'cheer-5': 'الله! جواب حلو.',
  'cheer-6': 'تمام التمام!',
  'cheer-7': 'عفية!',
  'cheer-8': 'صح! رائع.',
  'cheer-9': 'زين! جواب صحيح.',
  'cheer-10': 'يا سلام! صح.',
  'retry-1': 'مو مشكلة… الجواب الصح…',
  'retry-2': 'قربنا! الجواب الصح…',
  'retry-3': 'خلنا نتعلمها مع بعض… الجواب الصح…',
  'retry-4': 'محاولة حلوة! الجواب الصح…',
  'retry-5': 'نشوف مع بعض… الجواب الصح…',
} as const
export type UiClip = keyof typeof UI_CLIPS

export interface Cheer {
  text: string
  clip: string
}

export const CHEERS: Cheer[] = (Object.keys(UI_CLIPS) as UiClip[])
  .filter((id) => id.startsWith('cheer-'))
  .map((id) => ({ text: UI_CLIPS[id], clip: clip.ui(id) }))

export const RETRIES = (Object.keys(UI_CLIPS) as UiClip[])
  .filter((id) => id.startsWith('retry-'))
  .map((id) => ({ text: UI_CLIPS[id].replace('الجواب الصح…', '').replace('…', '').trim(), clip: clip.ui(id) }))

export interface AudioCue {
  id: string
  text: string
  /** `ar` Kuwaiti (Maryam, no diacritics), `fs` standard Arabic (Layla, with diacritics). */
  voice: 'ar' | 'fs'
}

export function bare(text: string): string {
  return text.replace(/[ً-ْٰ]/g, '')
}

export function audioCues(): AudioCue[] {
  const fs = (id: string, text: string): AudioCue => ({ id, text, voice: 'fs' })
  const ar = (id: string, text: string): AudioCue => ({ id, text: bare(text), voice: 'ar' })
  return [
    ...LETTERS.flatMap((letter) => [
      fs(clip.name(letter.char), `حَرْفُ ${letter.spoken}.`),
      fs(clip.where(letter.char), `أَيْنَ حَرْفُ ${letter.spoken}؟`),
      fs(clip.starts(letter.char), `تَبْدَأُ بِحَرْفِ ${letter.spoken}.`),
      fs(clip.dots(letter.char), `حَرْفُ ${letter.spoken}، ${letter.dotsSpoken}.`),
    ]),
    ...Object.entries(WORDS).map(([word, entry]) => fs(clip.word(word), `${entry.spoken}.`)),
    ...BLENDS.map((blend) => fs(clip.blend(blend.id), `${blend.word}.`)),
    ...(Object.keys(ASK_CLIPS) as AskClip[]).map((id) => ar(clip.ask(id), ASK_CLIPS[id])),
    ...TOPICS.map((topic) => ar(clip.topic(topic.id), topic.say)),
    ...(Object.keys(UI_CLIPS) as UiClip[]).map((id) => ar(clip.ui(id), UI_CLIPS[id])),
  ]
}

/** Every clip a round needs, so it can be loaded before the first question. */
export function roundClips(questions: Question[]): string[] {
  return [
    ...questions.flatMap((question) => [
      ...question.ask,
      ...question.options.flatMap((option) => (option.clip ? [option.clip] : [])),
      ...question.pairs.map((pair) => pair.clip),
      ...question.explain.flatMap((way) => way.clips),
    ]),
    clip.ui('match-wrong'),
    clip.ui('match-first'),
    clip.ui('review'),
    ...CHEERS.map((cheer) => cheer.clip),
    ...RETRIES.map((retry) => retry.clip),
    clip.ui('done-great'),
    clip.ui('done-good'),
  ]
}
