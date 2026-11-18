import { useEffect, useMemo, useRef, useState } from 'react'
import { Art } from '../art/Art'
import { celebrate } from '../art/confetti'
import { useNarrator } from '../audio/NarratorContext'
import type { Cue } from '../audio/player'
import { sfx } from '../audio/sfx'
import { CHEERS, FORMATS, joinedPieces, lettersOf, roundClips, shown, type Line as Spoken, type Option, type Question } from '../data/catalog'
import { TONES, toneStyle, type ToneId } from '../data/tones'
import { arabicNumber } from '../domain/format'
import { arrangeOptions, testSlot } from '../domain/round'
import { cheerFor, explainClips, kindWord, sayLine } from '../domain/voice'
import type { Attempt } from '../hub/bridge'
import { TraceBoard } from './TraceBoard'
import { ArrowIcon, BigButton, CloseButton, SpeakerButton, StarIcon, order } from './ui'

// Narration starts once the question has settled on screen.
const ASK_DELAY_MS = 380

export interface Round {
  id: number
  kind: 'practice' | 'test'
  tone: ToneId
  questions: Question[]
}

interface QuizScreenProps {
  round: Round
  /** Play the mock-test introduction before the first question. */
  intro?: boolean
  onExit: () => void
  onFinish: (attempts: Attempt[]) => void
}

type Phase = 'asking' | 'answered'

export function QuizScreen({ round, intro = false, onExit, onFinish }: QuizScreenProps) {
  const narrator = useNarrator()
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('asking')
  const [chosen, setChosen] = useState<string | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [speakingOption, setSpeakingOption] = useState<string | null>(null)
  // What was said after the answer: the cheer or the kind word, then what «إعادة» replays.
  const [said, setSaid] = useState<{ line: Spoken; replay: Cue[] }>({ line: CHEERS[0]!, replay: [] })
  const streak = useRef(0)
  const [confirmExit, setConfirmExit] = useState(false)
  const tileRefs = useRef(new Map<string, HTMLButtonElement>())
  const bodyRef = useRef<HTMLDivElement>(null)

  const question = round.questions[index]!
  const options = useMemo(() => arrangeOptions(question), [question])
  const info = FORMATS[question.format]
  const slot = round.kind === 'test' ? testSlot(index) : null
  const tone = round.kind === 'test' ? question.topic : round.tone
  const correctOption = question.options.find((option) => option.id === question.answer)
  const revealCues: Cue[] = question.reveal.map((id, n) => ({ clip: id, gap: n === 0 ? 300 : 220 }))
  // After the question, each picture's name is read while its tile lights up.
  const askCues = useMemo<Cue[]>(
    () => [
      ...question.ask.map((id, n) => ({ clip: id, gap: n === 0 ? 0 : 160, onStart: () => setSpeakingOption(null) })),
      ...options.flatMap((option) => (option.clip ? [{ clip: option.clip, gap: 320, onStart: () => setSpeakingOption(option.id) }] : [])),
    ],
    [question, options],
  )

  // Load every clip of the round up front, so no question waits for its audio.
  useEffect(() => {
    narrator.preload(roundClips(round.questions))
  }, [narrator, round.questions])

  useEffect(() => {
    // The mock test opens with its introduction, and each of its questions with its heading.
    const before = [
      ...(intro && index === 0 ? [{ clip: sayLine('test-intro').clip }] : []),
      ...(slot?.first ? [{ clip: sayLine(`part-${slot.part}` as 'part-1').clip, gap: 300 }] : []),
    ]
    const opening = before.length > 0 ? [...before, { ...askCues[0]!, gap: 500 }, ...askCues.slice(1)] : askCues
    const timer = window.setTimeout(() => {
      void narrator.play(opening).then(() => setSpeakingOption(null))
    }, ASK_DELAY_MS)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the intro plays once, before question one
  }, [askCues, narrator])

  useEffect(() => () => narrator.stop(), [narrator])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [index])

  // Keep the answers in view above the feedback sheet on short phone screens.
  useEffect(() => {
    if (phase !== 'answered') return
    const timer = window.setTimeout(() => {
      const box = bodyRef.current?.getBoundingClientRect()
      const sheet = document.querySelector('.feedback')?.getBoundingClientRect()
      if (!box || !sheet) return
      const overlap = box.bottom + 12 - sheet.top
      if (overlap > 0) window.scrollBy({ top: overlap, behavior: 'smooth' })
    }, 650)
    return () => window.clearTimeout(timer)
  }, [phase])

  function replay() {
    void narrator.play(phase === 'asking' ? askCues : said.replay).then(() => setSpeakingOption(null))
  }

  function settle(correct: boolean, chosenId: string, anchor?: HTMLElement | null) {
    setPhase('answered')
    setSpeakingOption(null)
    setAttempts((list) => [...list, { questionKey: question.key, chosen: chosenId, correct }])
    // A miss explains the answer: how to find the picture, the letter, the word or the sentence.
    const explainCues: Cue[] = explainClips(question).map((id, n) => ({ clip: id, gap: n === 0 ? 300 : 220 }))
    if (correct) {
      sfx.correct()
      streak.current += 1
      const line = cheerFor(question, streak.current)
      setSaid({ line, replay: revealCues.length > 0 ? revealCues : explainCues })
      celebrate(anchor ?? undefined, TONES[tone].tone)
      void narrator.play([{ clip: line.clip, gap: 300 }, ...revealCues])
    } else {
      sfx.wrong()
      streak.current = 0
      const line = question.kind === 'trace' ? sayLine('review') : kindWord()
      setSaid({ line, replay: explainCues })
      void narrator.play([{ clip: line.clip, gap: 450 }, ...explainCues])
    }
  }

  function answer(option: Option) {
    if (phase !== 'asking') return
    narrator.stop()
    setChosen(option.id)
    settle(option.id === question.answer, option.id, tileRefs.current.get(option.id))
  }

  function next() {
    sfx.tap()
    narrator.stop()
    if (index + 1 >= round.questions.length) {
      onFinish(attempts)
      return
    }
    setIndex(index + 1)
    setPhase('asking')
    setChosen(null)
  }

  const lastCorrect = attempts.at(-1)?.correct ?? false
  const answered = phase === 'answered'

  function optionState(option: Option): string {
    const isChosen = chosen === option.id
    const isAnswer = option.id === question.answer
    if (!answered) return speakingOption === option.id ? 'is-speaking' : ''
    if (isChosen) return isAnswer ? 'is-correct' : 'is-wrong'
    return isAnswer ? 'is-reveal' : 'is-dim'
  }

  function tileRef(id: string) {
    return (node: HTMLButtonElement | null) => {
      if (node) tileRefs.current.set(id, node)
      else tileRefs.current.delete(id)
    }
  }

  // The letter written in the box or the gap: the child's, then the answer.
  const written = answered ? (chosen ?? question.answer) : null
  const writtenTone = answered ? (lastCorrect ? 'good' : 'miss') : null

  const keys = (
    <div className="letter-keys" dir="rtl">
      {options.map((option, n) => (
        <button
          key={option.id}
          ref={tileRef(option.id)}
          type="button"
          className={`letter-key press rise ${optionState(option)}`}
          style={order(n, { '--base-delay': '160ms' })}
          onClick={() => answer(option)}
          disabled={answered}
          aria-label={option.label}
          data-option={option.id}
        >
          {option.id}
        </button>
      ))}
    </div>
  )

  return (
    <main className={`screen quiz-screen ${answered ? 'has-feedback' : ''}`} style={toneStyle(tone)}>
      <header className="top-bar quiz-top">
        <CloseButton onClick={() => setConfirmExit(true)} />
        <div className="track" aria-label={`السؤال ${arabicNumber(index + 1)} من ${arabicNumber(round.questions.length)}`}>
          {round.questions.map((entry, n) => {
            const attempt = attempts[n]
            const state = attempt ? (attempt.correct ? 'is-right' : 'is-miss') : n === index ? 'is-current' : ''
            return (
              <span key={entry.key} className={`track-step ${state}`}>
                {attempt?.correct ? (
                  <span className="track-star pop">
                    <StarIcon />
                  </span>
                ) : null}
              </span>
            )
          })}
        </div>
        <span className="quiz-count">
          {arabicNumber(index + 1)}/{arabicNumber(round.questions.length)}
        </span>
      </header>

      <section
        key={`${round.id}-${index}`}
        className={`question question-${question.kind} format-${question.format} topic-${question.topic} question-in`}
        data-question-key={question.key}
        data-format={question.format}
      >
        <div className="paper-head">
          <div className="paper-line">
            {slot ? <span className="paper-part">{slot.title}:</span> : null}
            <h1 className="paper-instruction">{info.instruction}</h1>
          </div>
          <div className="paper-help">
            <SpeakerButton onClick={replay} />
            <p>{question.help}</p>
          </div>
        </div>

        <div ref={bodyRef} className="paper-box">
          {question.kind === 'trace' ? (
            <TraceBoard
              key={question.key}
              text={question.text ?? ''}
              locked={answered}
              onMiss={() => {
                sfx.wrong()
                void narrator.play([{ clip: sayLine('trace-again').clip }])
              }}
              onDone={(correct, board) => settle(correct, correct ? 'traced' : 'not-traced', board)}
            />
          ) : null}

          {question.format === 'letter-sound' ? (
            <div className="missing-board">
              <span className="missing-picture pop" aria-hidden="true">
                <Art art={question.subject ?? ''} />
              </span>
              <span className={`sound-box ${written ? `is-filled is-${writtenTone} pop` : ''}`} aria-label={written ? `حرف ${written}` : 'المربع فاضي'}>
                {written ?? ''}
              </span>
              {keys}
            </div>
          ) : null}

          {question.format === 'missing' && question.word !== undefined && question.gap !== undefined ? (
            <div className="missing-board">
              <span className="missing-picture pop" aria-hidden="true">
                <Art art={question.subject ?? ''} />
              </span>
              <GapWord word={question.word} index={question.gap} filled={written} tone={writtenTone} />
              {keys}
            </div>
          ) : null}

          {question.kind === 'pick' ? (
            <>
              {question.format === 'blend' && question.syllables ? (
                <div className="build-row pop" dir="rtl" aria-label={`${question.syllables.join(' و ')}`}>
                  {question.syllables.map((syllable, n) => (
                    <span key={n} className="build-group">
                      {n > 0 ? <span className="build-sign">+</span> : null}
                      <span className="build-tile rise" style={order(n, { '--base-delay': '120ms' })}>
                        {syllable}
                      </span>
                    </span>
                  ))}
                  <span className="build-sign">=</span>
                  <span className={`build-answer ${answered ? `is-filled is-${lastCorrect ? 'good' : 'miss'}` : ''}`}>{answered && correctOption ? correctOption.label : ''}</span>
                </div>
              ) : question.subject ? (
                <div className={`subject pop ${question.subject.startsWith('txt:') ? 'subject-text' : 'subject-picture'}`} style={order(0, { '--base-delay': '80ms' })} aria-hidden="true">
                  <span className="subject-art">
                    <Art art={question.subject} />
                  </span>
                </div>
              ) : null}
              <div className={`options holds-${optionKind(options[0]?.art ?? '')} count-${options.length}`} dir="rtl">
                {options.map((option, n) => {
                  const state = optionState(option)
                  return (
                    <div key={option.id} className="option-slot rise" style={order(n, { '--base-delay': '140ms' })}>
                      <button
                        ref={tileRef(option.id)}
                        type="button"
                        className={`option ${optionKind(option.art)} ${state}`}
                        onClick={() => answer(option)}
                        disabled={answered}
                        aria-label={option.label}
                        data-option={option.id}
                      >
                        <span className="option-art" aria-hidden="true">
                          <Art art={option.art} />
                        </span>
                        {state === 'is-correct' || state === 'is-reveal' ? <InkRing tone="good" /> : state === 'is-wrong' ? <InkRing tone="miss" /> : null}
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          ) : null}
        </div>
      </section>

      {answered ? (
        <aside key={`feedback-${index}`} className={`feedback ${lastCorrect ? 'feedback-good' : 'feedback-miss'}`} role="status">
          <div className="feedback-head">
            {lastCorrect ? (
              <span className="feedback-star spin-in">
                <StarIcon />
              </span>
            ) : (
              <span className="feedback-bulb" aria-hidden="true">
                <Art art="💡" />
              </span>
            )}
            <div className="feedback-titles">
              {lastCorrect ? (
                <p className="feedback-title">{shown(said.line.text)}</p>
              ) : question.kind === 'trace' ? (
                <p className="feedback-title">{shown(said.line.text)}</p>
              ) : (
                <>
                  <p className="feedback-encourage">{shown(said.line.text)}</p>
                  <p className="feedback-title">الجواب الصحيح:</p>
                  {question.format === 'pic-for-letter' && correctOption ? (
                    <span className="feedback-answer" aria-label={correctOption.label}>
                      <Art art={correctOption.art} />
                    </span>
                  ) : null}
                </>
              )}
            </div>
          </div>
          <p className="feedback-note" dir="rtl">
            <FeedbackNote question={question} />
          </p>
          <div className="feedback-actions">
            <SpeakerButton onClick={() => void narrator.play(said.replay)} label="إعادة" />
            <BigButton onClick={next} pulse className="next-button">
              {index + 1 >= round.questions.length ? 'النتيجة' : 'التالي'}
              <ArrowIcon direction="next" />
            </BigButton>
          </div>
        </aside>
      ) : null}

      {confirmExit ? (
        <div className="sheet-backdrop fade-in">
          <div className="sheet pop" role="dialog" aria-modal="true" aria-labelledby="exit-title">
            <p id="exit-title" className="sheet-title">
              نطلع من الجولة؟
            </p>
            <p className="sheet-sub">إجابات هذي الجولة ما راح تنحفظ.</p>
            <div className="sheet-actions">
              <BigButton onClick={() => setConfirmExit(false)}>نكمل</BigButton>
              <BigButton tone="paper" onClick={onExit}>
                خروج
              </BigButton>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

/** The answer in words: the word with its letter in colour, the joined word, or the sentence. */
function FeedbackNote({ question }: { question: Question }) {
  if (question.format === 'missing' && question.word !== undefined && question.gap !== undefined) {
    const pieces = joinedPieces(lettersOf(question.word))
    return (
      <>
        {pieces.slice(0, question.gap).join('')}
        <span className="first-letter">{pieces[question.gap]}</span>
        {pieces.slice(question.gap + 1).join('')}
      </>
    )
  }
  if (question.format === 'letter-sound' && question.word) {
    const pieces = joinedPieces(lettersOf(question.word))
    return (
      <>
        <span className="first-letter">{pieces[0]}</span>
        {pieces.slice(1).join('')}
        <span className="note-sep"> ← </span>
        <span className="first-letter">{question.answer}</span>
      </>
    )
  }
  return <>{question.note}</>
}

/** Letters and words are set in the reading font; pictures are emoji. */
export function optionKind(art: string): string {
  return art.startsWith('txt:') ? 'option-text' : 'option-picture'
}

/** A hand-drawn ring, like the pen circle on a marked test paper. */
function InkRing({ tone }: { tone: 'good' | 'miss' }) {
  return (
    <svg className={`ink-ring ink-${tone}`} viewBox="0 0 120 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M58 7 C 24 6, 4 24, 6 50 C 8 79, 34 95, 64 94 C 96 93, 115 74, 114 49 C 113 24, 90 8, 54 9 C 42 10, 32 13, 25 18" pathLength="100" />
    </svg>
  )
}

/** A word with one letter missing: its neighbours keep their joined shapes around a dashed box. */
function GapWord({ word, index, filled, tone }: { word: string; index: number; filled: string | null; tone: 'good' | 'miss' | null }) {
  const letters = lettersOf(word)
  // The written letter takes the shape it has in the word.
  const pieces = joinedPieces(filled ? letters.map((char, n) => (n === index ? filled : char)) : letters)
  return (
    <span className="gap-word pop" dir="rtl" role="img" aria-label={filled ? word : 'كلمة ناقصها حرف'}>
      <span>{pieces.slice(0, index).join('')}</span>
      <span className={`gap-slot ${filled ? `is-filled is-${tone}` : ''}`}>{filled ? pieces[index] : ' '}</span>
      <span>{pieces.slice(index + 1).join('')}</span>
    </span>
  )
}
