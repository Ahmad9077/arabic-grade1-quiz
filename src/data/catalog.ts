// Content for «اللغة العربية - الأول الابتدائي» — the second short Arabic test (Sunday 22 Nov 2026).
// The school's card (Mishref Primary, girls): unit 3 of the Ministry book «لغتي العربية», Grade 1,
// term 1, part 2 (2026/2027), pages 145–196: the letters غ ف ق ك ل م ن ه و ي, and five skills —
//   1. تحديد الصورة المناسبة للحرف المحدد     → topic `picture`     (a letter, three pictures)
//   2. كتابة صوت الحرف الدال على الصورة      → topic `sound`       (a picture, write its first letter)
//   3. إكمال الكلمة بالحرف الناقص            → topic `missing`     (the book's «أكمل» words)
//   4. تركيب الحروف لتكوين كلمة              → topic `blend`       (the book's «أركب» rows)
//   5. نسخ جملة بخط جميل                    → topic `handwriting` (the book's «أقرأ» sentences)
// Each question carries the book's own instruction line (Modern Standard Arabic, as printed in the
// unit's review on pages 195–196); the mock test follows the card's order, «السؤال الأول» to
// «السؤال الخامس».
//
// Voices: letters, words and sentences in Modern Standard Arabic with full diacritics (Layla, the
// approved Arabic phonics voice); everything else in Kuwaiti (Maryam), written for this quiz only,
// several lines for every moment, dealt so the same words do not come twice running. Spoken lines
// carry no «…» (the voice reads it as a sigh). Wording never speaks to a girl or a boy.
// Question keys are permanent Hub identifiers: never rename or reuse one.
// This file is self-contained so Node scripts can import it directly.

export const QUIZ_ID = 'arabic-grade1'

export type TopicId = 'picture' | 'sound' | 'missing' | 'blend' | 'handwriting'
export type QuestionKind = 'pick' | 'keys' | 'trace'
export type Format = 'pic-for-letter' | 'letter-sound' | 'missing' | 'blend' | 'copy'

/** An emoji, or `txt:<text>` (letters or words in the reading font). */
export type ArtRef = string

export type Random = () => number

export interface Option {
  id: string
  art: ArtRef
  /** Accessible name. */
  label: string
  /** Said while the tile lights up after the question (picture names). */
  clip?: string
}

/** A clip, or one of Maryam's connecting lines (a round picks which of its variants). */
export type Spoken = string | { line: ArGroup }

/** The parts of a question that a round may draw afresh. */
export interface Dress {
  ask?: string[]
  subject?: ArtRef
  word?: string
  options?: Option[]
  answer?: string
  reveal?: string[]
  explain?: Spoken[]
  note?: string
}

export interface Question {
  key: string
  topic: TopicId
  kind: QuestionKind
  format: Format
  /** The letter the question is about (a mock test asks about each letter once where it can). */
  letter?: string
  /** What the question says, in order: Layla's letter, word or sentence, then Maryam's line. */
  ask: string[]
  /** The style's set of Maryam's lines; each round says one of them. */
  lines: LineGroup
  /** The Arabic line under the instruction: the one Maryam says. */
  help: string
  /** The big letter or picture the question is about. */
  subject?: ArtRef
  /** letter-sound and missing: the picture's word. */
  word?: string
  /** missing: the index of the missing letter in `word`. */
  gap?: number
  /** blend: the letters with their short vowels, in order. */
  syllables?: string[]
  /** copy: the sentence to write over, with its diacritics as printed in the book. */
  text?: string
  options: Option[]
  answer: string
  /** Said after a right answer. */
  reveal: string[]
  /** Said after a miss, after a kind word: how to find the answer. */
  explain: Spoken[]
  /** Shown in the feedback. */
  note: string
  difficulty: number
  skills: string[]
  /** Draws new pictures or keys for each round; the key and its skill stay the same. */
  vary?: (random: Random) => Dress
}

export interface Topic {
  id: TopicId
  title: string
  /** The skill as the school's card words it. */
  card: string
  /** Two pictures for the lesson card. */
  art: [ArtRef, ArtRef]
}

export interface FormatInfo {
  /** The book's instruction line. */
  instruction: string
  /** The question's number on the mock test. */
  part: 1 | 2 | 3 | 4 | 5
}

// ── Letters ───────────────────────────────────────────────────────────────
export interface Letter {
  char: string
  /** Permanent Latin id, used in question keys and clip names. */
  id: string
  /** Name as written on screen, e.g. «الفاء». */
  name: string
  /** Name with diacritics, in the genitive after «حرف». */
  spoken: string
}

/** The ten letters of unit 3, in the book's order. */
export const LETTERS: Letter[] = [
  { char: 'غ', id: 'ghayn', name: 'الغين', spoken: 'الغَيْنِ' },
  { char: 'ف', id: 'fa', name: 'الفاء', spoken: 'الفَاءِ' },
  { char: 'ق', id: 'qaf', name: 'القاف', spoken: 'القَافِ' },
  { char: 'ك', id: 'kaf', name: 'الكاف', spoken: 'الكَافِ' },
  { char: 'ل', id: 'lam', name: 'اللام', spoken: 'اللَّامِ' },
  { char: 'م', id: 'mim', name: 'الميم', spoken: 'المِيمِ' },
  { char: 'ن', id: 'nun', name: 'النون', spoken: 'النُّونِ' },
  { char: 'ه', id: 'haa', name: 'الهاء', spoken: 'الهَاءِ' },
  { char: 'و', id: 'waw', name: 'الواو', spoken: 'الوَاوِ' },
  { char: 'ي', id: 'ya', name: 'الياء', spoken: 'اليَاءِ' },
]

const LETTER = new Map(LETTERS.map((letter) => [letter.char, letter]))
export function letterOf(char: string): Letter {
  const letter = LETTER.get(char)
  if (!letter) throw new Error(`Unknown letter ${char}`)
  return letter
}

/** Letters a child mixes up with each one: the same body with other dots, or a close shape. */
const LOOK_ALIKE: Record<string, string[]> = {
  غ: ['ف', 'ق'],
  ف: ['ق', 'غ'],
  ق: ['ف', 'ك'],
  ك: ['ق', 'ل'],
  ل: ['ك', 'ن'],
  م: ['ه', 'و'],
  ن: ['ي', 'ل'],
  ه: ['م', 'و'],
  و: ['م', 'ف'],
  ي: ['ن', 'ل'],
}

// ── Words and pictures from the book ──────────────────────────────────────
export interface Word {
  /** Permanent Latin id, used in question keys and clip names. */
  id: string
  art: string
  /** With diacritics, for the voice (pausal form). */
  spoken: string
}

// The unit's pictures (each lesson's «أتحدث - أحوط», «أظلل - أنطق», «أضع» and «أكمل» rows),
// drawn as emoji. Words the book shows without a clear picture are left out.
export const WORDS: Record<string, Word> = {
  // غ
  'غزال': { id: 'ghazal', art: '🦌', spoken: 'غَزَال' },
  'غيوم': { id: 'ghuyum', art: '☁️', spoken: 'غُيُوم' },
  'غوريلا': { id: 'ghurila', art: '🦍', spoken: 'غُورِيلَا' },
  'ببغاء': { id: 'babbagha', art: '🦜', spoken: 'بَبَّغَاء' },
  'مغناطيس': { id: 'maghnatis', art: '🧲', spoken: 'مِغْنَاطِيس' },
  'دماغ': { id: 'dimagh', art: '🧠', spoken: 'دِمَاغ' },
  // ف
  'فيل': { id: 'fil', art: '🐘', spoken: 'فِيل' },
  'فأس': { id: 'fas', art: '🪓', spoken: 'فَأْس' },
  'فطر': { id: 'futr', art: '🍄', spoken: 'فُطْر' },
  'فأر': { id: 'far', art: '🐭', spoken: 'فَأْر' },
  'فراشة': { id: 'farasha', art: '🦋', spoken: 'فَرَاشَة' },
  'فرشاة': { id: 'furshat', art: '🪥', spoken: 'فُرْشَاة' },
  'فلفل': { id: 'filfil', art: '🫑', spoken: 'فِلْفِل' },
  'تفاح': { id: 'tuffah', art: '🍎', spoken: 'تُفَّاح' },
  'رغيف': { id: 'raghif', art: '🍞', spoken: 'رَغِيف' },
  'صوف': { id: 'suf', art: '🧶', spoken: 'صُوف' },
  'خروف': { id: 'kharuf', art: '🐑', spoken: 'خَرُوف' },
  'ضفدع': { id: 'difda', art: '🐸', spoken: 'ضِفْدَع' },
  // ق
  'قمح': { id: 'qamh', art: '🌾', spoken: 'قَمْح' },
  'قرع': { id: 'qar', art: '🎃', spoken: 'قَرْع' },
  'قفاز': { id: 'quffaz', art: '🧤', spoken: 'قُفَّاز' },
  'قنفذ': { id: 'qunfudh', art: '🦔', spoken: 'قُنْفُذ' },
  'قلم': { id: 'qalam', art: '🖊️', spoken: 'قَلَم' },
  'قرد': { id: 'qird', art: '🐒', spoken: 'قِرْد' },
  'قرش': { id: 'qirsh', art: '🦈', spoken: 'قِرْش' },
  'قطار': { id: 'qitar', art: '🚆', spoken: 'قِطَار' },
  'نقود': { id: 'nuqud', art: '💵', spoken: 'نُقُود' },
  'ورق': { id: 'waraq', art: '📄', spoken: 'وَرَق' },
  'صندوق': { id: 'sunduq', art: '📦', spoken: 'صُنْدُوق' },
  // ك
  'كتاب': { id: 'kitab', art: '📖', spoken: 'كِتَاب' },
  'كرز': { id: 'karaz', art: '🍒', spoken: 'كَرَز' },
  'كرة': { id: 'kura', art: '⚽', spoken: 'كُرَة' },
  'كلب': { id: 'kalb', art: '🐕', spoken: 'كَلْب' },
  'كرسي': { id: 'kursi', art: '🪑', spoken: 'كُرْسِيّ' },
  'كأس': { id: 'kas', art: '🏆', spoken: 'كَأْس' },
  'كوكب': { id: 'kawkab', art: '🪐', spoken: 'كَوْكَب' },
  'سمكة': { id: 'samaka', art: '🐟', spoken: 'سَمَكَة' },
  'ديك': { id: 'dik', art: '🐓', spoken: 'دِيك' },
  'نيزك': { id: 'nayzak', art: '☄️', spoken: 'نَيْزَك' },
  'شباك': { id: 'shubbak', art: '🪟', spoken: 'شُبَّاك' },
  'مكنسة': { id: 'miknasa', art: '🧹', spoken: 'مِكْنَسَة' },
  // ل
  'ليمون': { id: 'laymun', art: '🍋', spoken: 'لَيْمُون' },
  'لحم': { id: 'lahm', art: '🥩', spoken: 'لَحْم' },
  'لوحة': { id: 'lawha', art: '🖼️', spoken: 'لَوْحَة' },
  'حليب': { id: 'halib', art: '🥛', spoken: 'حَلِيب' },
  'عسل': { id: 'asal', art: '🍯', spoken: 'عَسَل' },
  'برتقال': { id: 'burtuqal', art: '🍊', spoken: 'بُرْتُقَال' },
  'طفل': { id: 'tifl', art: '👶', spoken: 'طِفْل' },
  'جمل': { id: 'jamal', art: '🐪', spoken: 'جَمَل' },
  'بصل': { id: 'basal', art: '🧅', spoken: 'بَصَل' },
  // م
  'موز': { id: 'mawz', art: '🍌', spoken: 'مَوْز' },
  'مفتاح': { id: 'miftah', art: '🔑', spoken: 'مِفْتَاح' },
  'مقص': { id: 'miqass', art: '✂️', spoken: 'مِقَصّ' },
  'مسجد': { id: 'masjid', art: '🕌', spoken: 'مَسْجِد' },
  'مهرج': { id: 'muharrij', art: '🤡', spoken: 'مُهَرِّج' },
  'ملعب': { id: 'malab', art: '🏟️', spoken: 'مَلْعَب' },
  'مثلث': { id: 'muthallath', art: '🔺', spoken: 'مُثَلَّث' },
  'شمس': { id: 'shams', art: '☀️', spoken: 'شَمْس' },
  'سلم': { id: 'sullam', art: '🪜', spoken: 'سُلَّم' },
  'شمعة': { id: 'shama', art: '🕯️', spoken: 'شَمْعَة' },
  // ن
  'نملة': { id: 'namla', art: '🐜', spoken: 'نَمْلَة' },
  'نحلة': { id: 'nahla', art: '🐝', spoken: 'نَحْلَة' },
  'نخلة': { id: 'nakhla', art: '🌴', spoken: 'نَخْلَة' },
  'نظارة': { id: 'nazzara', art: '👓', spoken: 'نَظَّارَة' },
  'نسر': { id: 'nasr', art: '🦅', spoken: 'نَسْر' },
  'منع': { id: 'man', art: '🚫', spoken: 'مَنْع' },
  'وزن': { id: 'wazn', art: '⚖️', spoken: 'وَزْن' },
  'عين': { id: 'ayn', art: '👁️', spoken: 'عَيْن' },
  'أنف': { id: 'anf', art: '👃', spoken: 'أَنْف' },
  'سنجاب': { id: 'sinjab', art: '🐿️', spoken: 'سِنْجَاب' },
  'حصان': { id: 'hisan', art: '🐴', spoken: 'حِصَان' },
  'عنب': { id: 'inab', art: '🍇', spoken: 'عِنَب' },
  // ه
  'هدية': { id: 'hadiyya', art: '🎁', spoken: 'هَدِيَّة' },
  'هلال': { id: 'hilal', art: '🌙', spoken: 'هِلَال' },
  'هدف': { id: 'hadaf', art: '🥅', spoken: 'هَدَف' },
  'هدوء': { id: 'hudu', art: '🤫', spoken: 'هُدُوء' },
  'وجه': { id: 'wajh', art: '😊', spoken: 'وَجْه' },
  'مياه': { id: 'miyah', art: '💧', spoken: 'مِيَاه' },
  'نهر': { id: 'nahr', art: '🏞️', spoken: 'نَهْر' },
  'فهد': { id: 'fahd', art: '🐆', spoken: 'فَهْد' },
  // و
  'ورد': { id: 'ward', art: '🌹', spoken: 'وَرْد' },
  'ولد': { id: 'walad', art: '👦', spoken: 'وَلَد' },
  'وشاح': { id: 'wishah', art: '🧣', spoken: 'وِشَاح' },
  'وعاء': { id: 'wia', art: '🍲', spoken: 'وِعَاء' },
  'دلو': { id: 'dalw', art: '🪣', spoken: 'دَلْو' },
  'جرو': { id: 'jarw', art: '🐶', spoken: 'جَرْو' },
  'حوت': { id: 'hut', art: '🐳', spoken: 'حُوت' },
  'صاروخ': { id: 'sarukh', art: '🚀', spoken: 'صَارُوخ' },
  'زيتون': { id: 'zaytun', art: '🫒', spoken: 'زَيْتُون' },
  // ي
  'يد': { id: 'yad', art: '✋', spoken: 'يَد' },
  'يخت': { id: 'yakht', art: '🛥️', spoken: 'يَخْت' },
  'يمامة': { id: 'yamama', art: '🕊️', spoken: 'يَمَامَة' },
  'بيت': { id: 'bayt', art: '🏠', spoken: 'بَيْت' },
  'بيض': { id: 'bayd', art: '🥚', spoken: 'بَيْض' },
  'سيارة': { id: 'sayyara', art: '🚗', spoken: 'سَيَّارَة' },
}

/** Words for each letter that start with it and have a clear picture. */
export const PICTURE_WORDS: Record<string, string[]> = {
  غ: ['غزال', 'غيوم', 'غوريلا'],
  ف: ['فيل', 'فأس', 'فطر', 'فأر', 'فراشة', 'فرشاة', 'فلفل'],
  ق: ['قمح', 'قرع', 'قفاز', 'قنفذ', 'قلم', 'قرد', 'قرش', 'قطار'],
  ك: ['كتاب', 'كرز', 'كرة', 'كلب', 'كرسي', 'كأس', 'كوكب'],
  ل: ['ليمون', 'لحم', 'لوحة'],
  م: ['موز', 'مفتاح', 'مقص', 'مسجد', 'مهرج', 'ملعب', 'مثلث'],
  ن: ['نملة', 'نحلة', 'نخلة', 'نظارة', 'نسر', 'نقود'],
  ه: ['هدية', 'هلال', 'هدف', 'هدوء'],
  و: ['ورد', 'ولد', 'وجه', 'ورق', 'وشاح', 'وعاء'],
  ي: ['يد', 'يخت', 'يمامة'],
}

// ── Arabic letter shapes ──────────────────────────────────────────────────
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

// ── Building words and the book's sentences ───────────────────────────────
export interface Blend {
  id: string
  /** With its short vowels. */
  word: string
  syllables: string[]
}

// The unit's «أركب - أقرأ - أكتب» rows and its «أمرح» games, in the book's order, and the
// review's «وَ + هـ + بَ» (page 196).
export const BLENDS: Blend[] = [
  { id: 'gharasa', word: 'غَرَسَ', syllables: ['غَ', 'رَ', 'سَ'] },
  { id: 'raghiba', word: 'رَغِبَ', syllables: ['رَ', 'غِ', 'بَ'] },
  { id: 'saghura', word: 'صَغُرَ', syllables: ['صَ', 'غُ', 'رَ'] },
  { id: 'daghata', word: 'ضَغَطَ', syllables: ['ضَ', 'غَ', 'طَ'] },
  { id: 'fataha', word: 'فَتَحَ', syllables: ['فَ', 'تَ', 'حَ'] },
  { id: 'fariha', word: 'فَرِحَ', syllables: ['فَ', 'رِ', 'حَ'] },
  { id: 'jarafa', word: 'جَرَفَ', syllables: ['جَ', 'رَ', 'فَ'] },
  { id: 'gharafa', word: 'غَرَفَ', syllables: ['غَ', 'رَ', 'فَ'] },
  { id: 'qaraa', word: 'قَرَأَ', syllables: ['قَ', 'رَ', 'أَ'] },
  { id: 'thaqifa', word: 'ثَقِفَ', syllables: ['ثَ', 'قِ', 'فَ'] },
  { id: 'qaruba', word: 'قَرُبَ', syllables: ['قَ', 'رُ', 'بَ'] },
  { id: 'qataa', word: 'قَطَعَ', syllables: ['قَ', 'طَ', 'عَ'] },
  { id: 'kataba', word: 'كَتَبَ', syllables: ['كَ', 'تَ', 'بَ'] },
  { id: 'dahika', word: 'ضَحِكَ', syllables: ['ضَ', 'حِ', 'كَ'] },
  { id: 'kabura', word: 'كَبُرَ', syllables: ['كَ', 'بُ', 'رَ'] },
  { id: 'rakada', word: 'رَكَضَ', syllables: ['رَ', 'كَ', 'ضَ'] },
  { id: 'saala', word: 'سَأَلَ', syllables: ['سَ', 'أَ', 'لَ'] },
  { id: 'labisa', word: 'لَبِسَ', syllables: ['لَ', 'بِ', 'سَ'] },
  { id: 'thaqula', word: 'ثَقُلَ', syllables: ['ثَ', 'قُ', 'لَ'] },
  { id: 'akala', word: 'أَكَلَ', syllables: ['أَ', 'كَ', 'لَ'] },
  { id: 'masaha', word: 'مَسَحَ', syllables: ['مَ', 'سَ', 'حَ'] },
  { id: 'hamida', word: 'حَمِدَ', syllables: ['حَ', 'مِ', 'دَ'] },
  { id: 'ghamura', word: 'غَمُرَ', syllables: ['غَ', 'مُ', 'رَ'] },
  { id: 'masaka', word: 'مَسَكَ', syllables: ['مَ', 'سَ', 'كَ'] },
  { id: 'najaha', word: 'نَجَحَ', syllables: ['نَ', 'جَ', 'حَ'] },
  { id: 'amina', word: 'أَمِنَ', syllables: ['أَ', 'مِ', 'نَ'] },
  { id: 'nabata', word: 'نَبَتَ', syllables: ['نَ', 'بَ', 'تَ'] },
  { id: 'hatala', word: 'هَطَلَ', syllables: ['هَ', 'طَ', 'لَ'] },
  { id: 'sahira', word: 'سَهِرَ', syllables: ['سَ', 'هِ', 'رَ'] },
  { id: 'nahada', word: 'نَهَضَ', syllables: ['نَ', 'هَ', 'ضَ'] },
  { id: 'waada', word: 'وَعَدَ', syllables: ['وَ', 'عَ', 'دَ'] },
  { id: 'wasia', word: 'وَسِعَ', syllables: ['وَ', 'سِ', 'عَ'] },
  { id: 'wajada', word: 'وَجَدَ', syllables: ['وَ', 'جَ', 'دَ'] },
  { id: 'yaqifu', word: 'يَقِفُ', syllables: ['يَ', 'قِ', 'فُ'] },
  { id: 'nasiya', word: 'نَسِيَ', syllables: ['نَ', 'سِ', 'يَ'] },
  { id: 'yazinu', word: 'يَزِنُ', syllables: ['يَ', 'زِ', 'نُ'] },
  { id: 'wahaba', word: 'وَهَبَ', syllables: ['وَ', 'هَ', 'بَ'] },
]

export interface Sentence {
  id: string
  /** With its diacritics. */
  text: string
  /** The page it is printed on, or none for practice sentences in the book's pattern. */
  page?: number
}

export const SENTENCES: Sentence[] = [
  { id: 'qaraa-hamad', text: 'قَرَأَ حَمَدٌ.', page: 173 },
  { id: 'qaraa-hamad-anas', text: 'قَرَأَ حَمَدٌ مَعَ أَنَسٍ.', page: 178 },
  { id: 'dhahaba-hamad', text: 'ذَهَبَ حَمَدٌ.', page: 183 },
  { id: 'dhahaba-hamad-amal', text: 'ذَهَبَ حَمَدٌ وَأَمَلُ.', page: 188 },
  { id: 'yaqifu-hamad-umar', text: 'يَقِفُ حَمَدٌ مَعَ عُمَرَ.', page: 193 },
  // The same pattern with the unit's words (page 197).
  { id: 'saala-anas', text: 'سَأَلَ أَنَسٌ.' },
  { id: 'fariha-umar', text: 'فَرِحَ عُمَرُ.' },
  { id: 'laiba-hamad-anas', text: 'لَعِبَ حَمَدٌ مَعَ أَنَسٍ.' },
]

// ── Clip ids ──────────────────────────────────────────────────────────────
// fs/… is Modern Standard Arabic (Layla, with diacritics); ar/… is Kuwaiti (Maryam).
const letterId = (char: string) => letterOf(char).id
const wordId = (word: string) => {
  const entry = WORDS[word]
  if (!entry) throw new Error(`${word} is not in WORDS`)
  return entry.id
}

export const clip = {
  name: (char: string) => `fs/name/${letterId(char)}`,
  starts: (char: string) => `fs/starts/${letterId(char)}`,
  word: (word: string) => `fs/word/${wordId(word)}`,
  blend: (id: string) => `fs/blend/${id}`,
  sentence: (id: string) => `fs/sentence/${id}`,
  /** Maryam's line `n` (from 0) for a question style. */
  line: (group: LineGroup, n = 0) => `ar/q/${group}-${n + 1}`,
  ar: (group: ArGroup, n = 0) => `ar/ui/${group}-${n + 1}`,
}

// ── Lessons and the book's instruction lines ──────────────────────────────
export const TOPICS: Topic[] = [
  { id: 'picture', title: 'الصورة المناسبة للحرف', card: 'تحديد الصورة المناسبة للحرف المحدد', art: ['txt:ف', '🐘'] },
  { id: 'sound', title: 'صوت الحرف والصورة', card: 'كتابة صوت الحرف الدال على الصورة', art: ['🦌', 'txt:غ'] },
  { id: 'missing', title: 'الحرف الناقص', card: 'إكمال الكلمة بالحرف الناقص', art: ['🍎', 'txt:؟'] },
  { id: 'blend', title: 'تركيب الكلمة', card: 'تركيب الحروف لتكوين كلمة', art: ['🧩', 'txt:+'] },
  { id: 'handwriting', title: 'نسخ الجملة', card: 'نسخ جملة بخط جميل', art: ['✏️', 'txt:م'] },
]

export const FORMATS: Record<Format, FormatInfo> = {
  'pic-for-letter': { instruction: 'أختار الصورة المناسبة للحرف', part: 1 },
  'letter-sound': { instruction: 'أشاهد – أكتب صوت الحرف المناسب للصورة', part: 2 },
  missing: { instruction: 'أكمل الكلمة بالحرف الناقص', part: 3 },
  blend: { instruction: 'أركب الحروف لتكوين كلمة', part: 4 },
  copy: { instruction: 'أنسخ الجملة بخط جميل', part: 5 },
}

/** The mock test's question headings, as on the school's test paper. */
export const PART_TITLES = ['', 'السؤال الأول', 'السؤال الثاني', 'السؤال الثالث', 'السؤال الرابع', 'السؤال الخامس'] as const

// ── What Maryam says for each question style ──────────────────────────────
// Several lines per style, in different shapes (a question, a tip, a picture to imagine),
// written for this quiz rather than taken from the family's other quizzes. The letter, word or
// sentence (Layla) is said just before the line.
export const ASK_LINES = {
  // After the letter's name.
  'pic-for-letter': [
    'وين الصورة اللي تبدأ بهالحرف؟',
    'نسمع اسم كل صورة، ونختار اللي أولها هالحرف.',
    'أي صورة اسمها يبدأ بهالحرف؟',
    'ننتبه لأول صوت في اسم الصورة.',
  ],
  // After the picture's word.
  'letter-sound': [
    'نكتب حرف أول صوت نسمعه.',
    'نقول اسم الصورة على مهل، ونكتب أول حرف فيها.',
    'بأي حرف تبدأ هالكلمة؟ نكتبه في المربع.',
    'نسمع الكلمة زين، ونلقى حرفها الأول.',
  ],
  // After the word.
  missing: [
    'الكلمة ناقصها حرف، شنو هو؟',
    'نقرا الكلمة مع الصورة، ونكمل الحرف الناقص.',
    'حرف طاح من الكلمة، نرجعه مكانه.',
    'نسمع الكلمة على مهل، وين الحرف الناقص؟',
  ],
  blend: [
    'نركب الحروف مع بعض، شنو الكلمة؟',
    'نقرا الحروف من اليمين، حرف حرف، ونلقى الكلمة.',
    'ثلاثة حروف تصير كلمة وحدة، أي كلمة؟',
    'نجمع الحروف بالترتيب، ونختار الكلمة اللي تطلع.',
  ],
  // After the sentence.
  copy: [
    'ننسخ الجملة بخط حلو، نمشي بإصبعنا فوق الرمادي.',
    'نكتب الجملة على مهل، كلمة كلمة، من اليمين.',
    'خطنا حلو ومرتب، نكتب فوق الكتابة الرمادية.',
  ],
} as const satisfies Record<Format, readonly string[]>

export type LineGroup = keyof typeof ASK_LINES

/** Maryam's lines for the moments around the questions. */
export const AR_LINES = {
  welcome: ['هلا والله! جاهزين نتدرب على العربي؟ نختار درس.', 'يا هلا! حروف الوحدة الثالثة تنطرنا، من وين نبدأ؟'],
  'test-intro': ['اختبار تجريبي مثل ورقة المدرسة، يلا نبدأ من السؤال الأول!', 'جاهزين؟ نفس أسئلة الاختبار وبنفس الترتيب، يلا!'],
  // The mock test, as each of its questions begins.
  'part-1': ['السؤال الأول'],
  'part-2': ['السؤال الثاني'],
  'part-3': ['السؤال الثالث'],
  'part-4': ['السؤال الرابع'],
  'part-5': ['السؤال الخامس'],
  /** Copying: the first check did not pass. */
  'trace-again': ['شوي بعد! نكتب فوق الخط الرمادي بالضبط.', 'باقي كلمات ما كتبناها، نكملها فوق الرمادي.'],
  /** A copy that missed: before the sentence is said. */
  review: ['نطالعها مع بعض.', 'نسمع الجملة مرة ثانية.'],
  /** A wrong choice: a kind word, then the explanation. */
  retry: ['قريبة حيل!', 'ما عليه، نتعلمها الحين.', 'حلو إننا حاولنا!', 'هذي تبي تركيز شوي.', 'عادي، الغلط يعلمنا.', 'المرة الياية نضبطها!', 'نشوفها سوا.'],
  // The explanation after a miss: each line leads into the letter or word that follows it.
  'x-missing': ['الحرف الناقص هو', 'الكلمة ناقصها'],
  'x-blend': ['الحروف مع بعض تصير', 'نقراها مع بعض'],
  // Cheers: for any question, and for one kind of question.
  cheer: [
    'الحروف صارت صحابنا!',
    'قراية ولا أحلى!',
    'صح، ومن أول مرة!',
    'يا سلام على هالجواب!',
    'تبارك الله!',
    'حروفنا قوية!',
    'العربي حلو، والجواب أحلى!',
    'نجمة جديدة لنا!',
    'زين زين!',
    'الله الله، صح!',
    'عين ما تغلط!',
    'فهمناها زين!',
    'جذي الشطارة!',
    'هذا الكلام!',
    'وصلنا للجواب الصح!',
    'صح، وبسرعة!',
  ],
  'cheer-picture': ['الصورة والحرف أصحاب!', 'عرفناها من أول صوت!', 'نظرة وحدة وعرفناها!'],
  'cheer-sound': ['الأذن ذكية!', 'سمعنا الصوت صح!', 'أول صوت، وأول حرف!'],
  'cheer-missing': ['الحرف رجع لبيته!', 'كملنا الكلمة!', 'ولا حرف ناقص!'],
  'cheer-blend': ['ركبناها صح!', 'الحروف صارت كلمة!', 'تركيب مضبوط!'],
  'cheer-trace': ['خط يجنن!', 'كتبناها حلوة ومرتبة!', 'الجملة صارت أحلى بخطنا!'],
  /** Three, then five right answers running. */
  'streak-3': ['ثلاثة ورا بعض، كلها صح!', 'ثلاثة صح، نكمل!'],
  'streak-5': ['خمسة صح ورا بعض، عاش!', 'خمسة كلها صح، ما شاء الله!'],
  'done-great': ['النجوم كلها لنا، والحروف بعد!', 'جولة تفرح الأهل!'],
  'done-good': ['زين! نعيدها ونصير أشطر.', 'كل جولة نتعلم أكثر، نعيدها؟'],
} as const satisfies Record<string, readonly string[]>

export type ArGroup = keyof typeof AR_LINES

export interface Line {
  text: string
  clip: string
}

export function arLines(group: ArGroup): Line[] {
  return AR_LINES[group].map((text, n) => ({ text, clip: clip.ar(group, n) }))
}

/** A spoken line as it is shown on screen. */
export function shown(text: string): string {
  return text.trim()
}

/** A question style's line set, with its first line as the one asked until a round picks. */
function voiced(group: LineGroup, before: string[] = []): Pick<Question, 'lines' | 'ask' | 'help'> {
  return { lines: group, ask: [...before, clip.line(group)], help: shown(ASK_LINES[group][0]) }
}

// ── Question builders ─────────────────────────────────────────────────────
type Extra = { difficulty: number }

const SKILLS: Record<Format, string[]> = {
  'pic-for-letter': ['letter_picture', 'initial_sound'],
  'letter-sound': ['initial_sound', 'letter_writing'],
  missing: ['missing_letter', 'spelling'],
  blend: ['blending', 'short_vowels'],
  copy: ['handwriting', 'copying'],
}

function pickOne<T>(items: readonly T[], random: Random): T {
  return items[Math.floor(random() * items.length)] ?? items[0]!
}

/** `count` different items, in random order. */
function pickSome<T>(items: readonly T[], count: number, random: Random): T[] {
  const pool = [...items]
  const picked: T[] = []
  while (picked.length < count && pool.length > 0) picked.push(...pool.splice(Math.floor(random() * pool.length), 1))
  return picked
}

function base(key: string, topic: TopicId, kind: QuestionKind, format: Format, extra: Extra) {
  return { key: `${topic}:${key}`, topic, kind, format, options: [] as Option[], reveal: [] as string[], explain: [] as Spoken[], note: '', skills: SKILLS[format], ...extra }
}

function pictureOf(word: string): string {
  const art = WORDS[word]?.art
  if (!art) throw new Error(`${word} has no picture`)
  return art
}

const pictureOption = (word: string): Option => ({ id: word, art: pictureOf(word), label: word, clip: clip.word(word) })
const letterKey = (char: string): Option => ({ id: char, art: `txt:${char}`, label: `حرف ${letterOf(char).name}` })

/** Six letter keys in the book's order: the answer, its look-alikes and others from the unit. */
function keysFor(char: string, random?: Random): Option[] {
  const near = LOOK_ALIKE[char] ?? []
  const rest = LETTERS.map((letter) => letter.char).filter((other) => other !== char && !near.includes(other))
  const others = random ? pickSome(rest, 3, random) : rest.slice(0, 3)
  const chosen = new Set([char, ...near, ...others])
  return LETTERS.filter((letter) => chosen.has(letter.char)).map((letter) => letterKey(letter.char))
}

/** Two pictures for other letters: one for a look-alike letter where the unit has one. */
function decoyPictures(char: string, random?: Random): string[] {
  const near = (LOOK_ALIKE[char] ?? []).flatMap((other) => PICTURE_WORDS[other] ?? [])
  const far = LETTERS.filter((letter) => letter.char !== char && !(LOOK_ALIKE[char] ?? []).includes(letter.char)).flatMap((letter) => PICTURE_WORDS[letter.char] ?? [])
  if (!random) return [near[0]!, far[0]!]
  return [pickOne(near, random), pickOne(far, random)]
}

/** 1. A letter, then the picture that starts with it (three pictures, as the book circles them). */
function picFor(char: string, extra: Extra): Question {
  const letter = letterOf(char)
  const dress = (answer: string, decoys: string[]): Dress => ({
    options: [answer, ...decoys].map(pictureOption),
    answer,
    reveal: [clip.word(answer)],
    explain: [clip.word(answer), clip.starts(char)],
    note: `${answer} تبدأ بحرف ${letter.name}`,
  })
  const words = PICTURE_WORDS[char]!
  return {
    ...base(letter.id, 'picture', 'pick', 'pic-for-letter', extra),
    ...voiced('pic-for-letter', [clip.name(char)]),
    letter: char,
    subject: `txt:${char}`,
    ...(dress(words[0]!, decoyPictures(char)) as Required<Pick<Dress, 'options' | 'answer' | 'reveal' | 'explain' | 'note'>>),
    vary: (random) => dress(pickOne(words, random), decoyPictures(char, random)),
  }
}

/** 2. A picture, then its first letter written in the box (the review's «أشاهد - أكتب»). */
function soundOf(char: string, extra: Extra): Question {
  const letter = letterOf(char)
  const dress = (word: string, keys: Option[]): Dress => ({
    ask: [clip.word(word), clip.line('letter-sound')],
    subject: pictureOf(word),
    word,
    options: keys,
    explain: [clip.word(word), clip.starts(char)],
    note: `${word} تبدأ بحرف ${letter.name}`,
  })
  const words = PICTURE_WORDS[char]!
  const first = dress(words[0]!, keysFor(char))
  return {
    ...base(letter.id, 'sound', 'keys', 'letter-sound', extra),
    ...voiced('letter-sound'),
    ...first,
    ask: first.ask!,
    letter: char,
    options: first.options!,
    explain: first.explain!,
    note: first.note!,
    answer: char,
    reveal: [clip.name(char)],
    vary: (random) => dress(pickOne(words, random), keysFor(char, random)),
  }
}

/** 3. A word with one letter missing and its picture (each lesson's «أكمل»). */
function missing(word: string, index: number, extra: Extra): Question {
  const letters = lettersOf(word)
  const char = letters[index]!
  return {
    ...base(wordId(word), 'missing', 'keys', 'missing', extra),
    ...voiced('missing', [clip.word(word)]),
    letter: char,
    subject: pictureOf(word),
    word,
    gap: index,
    options: keysFor(char),
    answer: char,
    reveal: [clip.word(word)],
    explain: [clip.word(word), { line: 'x-missing' }, clip.name(char)],
    note: word,
    vary: (random) => ({ options: keysFor(char, random) }),
  }
}

const bareLetters = (blend: Blend) => blend.syllables.map((syllable) => lettersOf(syllable)[0]!)

/** Words of the bank that share the most letters with this one, closest first. */
function nearBlends(blend: Blend): Blend[] {
  const mine = bareLetters(blend)
  const score = (other: Blend) => {
    const theirs = bareLetters(other)
    const same = theirs.filter((char, n) => char === mine[n]).length
    const shared = theirs.filter((char) => mine.includes(char)).length
    return same * 2 + shared
  }
  return BLENDS.filter((other) => other.id !== blend.id)
    .map((other) => ({ other, value: score(other) }))
    .sort((a, b) => b.value - a.value || a.other.id.localeCompare(b.other.id))
    .map((entry) => entry.other)
}

/** 4. Letters with short vowels, joined into the word they make (the book's «أركب»). */
function blendQ(blend: Blend, extra: Extra): Question {
  const near = nearBlends(blend)
  const option = (entry: Blend): Option => ({ id: entry.id, art: `txt:${entry.word}`, label: entry.word })
  const dress = (others: Blend[]): Dress => ({ options: [blend, ...others].map(option) })
  return {
    ...base(blend.id, 'blend', 'pick', 'blend', extra),
    ...voiced('blend'),
    syllables: blend.syllables,
    ...(dress(near.slice(0, 2)) as Required<Pick<Dress, 'options'>>),
    answer: blend.id,
    reveal: [clip.blend(blend.id)],
    explain: [{ line: 'x-blend' }, clip.blend(blend.id)],
    note: `${blend.syllables.join(' + ')} = ${blend.word}`,
    vary: (random) => dress(pickSome(near.slice(0, 6), 2, random)),
  }
}

/** 5. Copy a sentence: write over the grey sentence with a finger. */
function copyQ(sentence: Sentence, extra: Extra): Question {
  return {
    ...base(sentence.id, 'handwriting', 'trace', 'copy', extra),
    ...voiced('copy', [clip.sentence(sentence.id)]),
    text: sentence.text,
    answer: sentence.text,
    reveal: [clip.sentence(sentence.id)],
    explain: [clip.sentence(sentence.id)],
    note: sentence.text,
  }
}

const d = (difficulty: number): Extra => ({ difficulty })
const sentence = (id: string) => SENTENCES.find((entry) => entry.id === id)!

export const QUESTIONS: Question[] = [
  // 1. The picture for the letter (look-alike letters ف ق ك and ن ي are harder)
  picFor('غ', d(30)),
  picFor('ف', d(30)),
  picFor('ق', d(35)),
  picFor('ك', d(30)),
  picFor('ل', d(25)),
  picFor('م', d(20)),
  picFor('ن', d(30)),
  picFor('ه', d(30)),
  picFor('و', d(25)),
  picFor('ي', d(30)),

  // 2. The sound of the picture's first letter
  soundOf('غ', d(40)),
  soundOf('ف', d(40)),
  soundOf('ق', d(45)),
  soundOf('ك', d(40)),
  soundOf('ل', d(35)),
  soundOf('م', d(30)),
  soundOf('ن', d(40)),
  soundOf('ه', d(40)),
  soundOf('و', d(35)),
  soundOf('ي', d(40)),

  // 3. The missing letter: each lesson's «أكمل» words, then words from its pages
  missing('ببغاء', 2, d(50)),
  missing('مغناطيس', 1, d(50)),
  missing('دماغ', 3, d(45)),
  missing('فراشة', 0, d(30)),
  missing('تفاح', 1, d(40)),
  missing('رغيف', 3, d(45)),
  missing('صوف', 2, d(40)),
  missing('خروف', 3, d(40)),
  missing('ضفدع', 1, d(45)),
  missing('قرش', 0, d(30)),
  missing('نقود', 1, d(45)),
  missing('ورق', 2, d(40)),
  missing('صندوق', 4, d(45)),
  missing('قطار', 0, d(30)),
  missing('كرة', 0, d(30)),
  missing('سمكة', 2, d(45)),
  missing('ديك', 2, d(40)),
  missing('نيزك', 3, d(45)),
  missing('شباك', 3, d(45)),
  missing('مكنسة', 1, d(45)),
  missing('حليب', 1, d(45)),
  missing('عسل', 2, d(40)),
  missing('برتقال', 5, d(50)),
  missing('طفل', 2, d(40)),
  missing('جمل', 2, d(40)),
  missing('بصل', 2, d(40)),
  missing('مقص', 0, d(30)),
  missing('شمس', 1, d(40)),
  missing('سلم', 2, d(40)),
  missing('شمعة', 1, d(45)),
  missing('نملة', 1, d(45)),
  missing('منع', 1, d(45)),
  missing('وزن', 2, d(45)),
  missing('عين', 2, d(40)),
  missing('أنف', 1, d(45)),
  missing('سنجاب', 1, d(45)),
  missing('حصان', 3, d(45)),
  missing('عنب', 1, d(45)),
  missing('وجه', 2, d(50)),
  missing('مياه', 3, d(50)),
  missing('مهرج', 1, d(50)),
  missing('نهر', 1, d(50)),
  missing('فهد', 1, d(50)),
  missing('هدية', 0, d(35)),
  missing('وعاء', 0, d(35)),
  missing('موز', 1, d(40)),
  missing('دلو', 2, d(45)),
  missing('جرو', 2, d(45)),
  missing('حوت', 1, d(45)),
  missing('صاروخ', 3, d(45)),
  missing('زيتون', 3, d(45)),
  missing('يد', 0, d(30)),
  missing('بيت', 1, d(40)),
  missing('بيض', 1, d(40)),
  missing('سيارة', 1, d(45)),
  missing('كرسي', 3, d(45)),

  // 4. Building a word: the unit's «أركب» rows
  ...BLENDS.map((blend, n) => blendQ(blend, d([30, 40, 40, 45, 30, 35, 40, 40, 35, 50, 40, 40, 30, 40, 40, 45, 35, 40, 45, 35, 35, 40, 50, 40, 35, 40, 35, 45, 40, 45, 40, 45, 40, 45, 45, 45, 40][n]!))),

  // 5. Copying a sentence: the book's five, then three in their pattern
  copyQ(sentence('qaraa-hamad'), d(30)),
  copyQ(sentence('qaraa-hamad-anas'), d(45)),
  copyQ(sentence('dhahaba-hamad'), d(30)),
  copyQ(sentence('dhahaba-hamad-amal'), d(40)),
  copyQ(sentence('yaqifu-hamad-umar'), d(45)),
  copyQ(sentence('saala-anas'), d(30)),
  copyQ(sentence('fariha-umar'), d(30)),
  copyQ(sentence('laiba-hamad-anas'), d(45)),
]

/** Cheers for any question. */
export const CHEERS: Line[] = arLines('cheer')

/** Kind words after a wrong choice. */
export const RETRIES: Line[] = arLines('retry')

const OWN_CHEERS: Record<Format, ArGroup> = {
  'pic-for-letter': 'cheer-picture',
  'letter-sound': 'cheer-sound',
  missing: 'cheer-missing',
  blend: 'cheer-blend',
  copy: 'cheer-trace',
}

/** Cheers made for this kind of question. */
export function ownCheers(question: Pick<Question, 'format'>): Line[] {
  return arLines(OWN_CHEERS[question.format])
}

/** The streak cheers, by how many right answers ran. */
export const STREAKS: Record<number, Line[]> = {
  3: arLines('streak-3'),
  5: arLines('streak-5'),
}

export interface AudioCue {
  id: string
  text: string
  /** `ar` Kuwaiti (Maryam, no diacritics), `fs` standard Arabic (Layla, with diacritics). */
  voice: 'ar' | 'fs'
}

export function bare(text: string): string {
  return text.replace(/[ً-ْٰ]/g, '')
}

function groupCues<G extends string>(lines: Record<G, readonly string[]>, id: (group: G, n: number) => string): AudioCue[] {
  return (Object.keys(lines) as G[]).flatMap((group) => lines[group].map((text, n) => ({ id: id(group, n), text: bare(text), voice: 'ar' as const })))
}

export function audioCues(): AudioCue[] {
  const fs = (id: string, text: string): AudioCue => ({ id, text, voice: 'fs' })
  return [
    ...LETTERS.flatMap((letter) => [fs(clip.name(letter.char), `حَرْفُ ${letter.spoken}.`), fs(clip.starts(letter.char), `تَبْدَأُ بِحَرْفِ ${letter.spoken}.`)]),
    ...Object.entries(WORDS).map(([word, entry]) => fs(clip.word(word), `${entry.spoken}.`)),
    ...BLENDS.map((blend) => fs(clip.blend(blend.id), `${blend.word}.`)),
    ...SENTENCES.map((entry) => fs(clip.sentence(entry.id), entry.text)),
    ...groupCues(ASK_LINES, clip.line),
    ...groupCues(AR_LINES, clip.ar),
  ]
}

/** Every clip of one of Maryam's line sets. */
export function lineClips(group: LineGroup): string[] {
  return ASK_LINES[group].map((_, n) => clip.line(group, n))
}

/** Every clip a question can play in any of its draws, with any of its lines. */
function questionClips(question: Question): string[] {
  const clips = [...question.ask, ...question.reveal, ...question.options.flatMap((option) => (option.clip ? [option.clip] : []))]
  clips.push(...lineClips(question.lines))
  for (const item of question.explain) clips.push(...(typeof item === 'string' ? [item] : arLines(item.line).map((line) => line.clip)))
  // A draw can bring any picture word of the unit, and the letter's «تبدأ بحرف».
  if (question.format === 'pic-for-letter' || question.format === 'letter-sound') {
    clips.push(...Object.values(PICTURE_WORDS).flat().map(clip.word))
  }
  return clips
}

/** Every clip a round needs, so it can be loaded before the first question. */
export function roundClips(questions: Question[]): string[] {
  const moments: ArGroup[] = ['trace-again', 'review', 'retry', 'part-1', 'part-2', 'part-3', 'part-4', 'part-5']
  return [
    ...new Set([
      ...questions.flatMap(questionClips),
      ...moments.flatMap((group) => arLines(group).map((line) => line.clip)),
      ...[...CHEERS, ...questions.flatMap(ownCheers), ...Object.values(STREAKS).flat()].map((line) => line.clip),
      ...[...arLines('done-great'), ...arLines('done-good')].map((line) => line.clip),
    ]),
  ]
}
