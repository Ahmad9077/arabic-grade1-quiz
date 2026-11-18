# اللغة العربية - الأول الابتدائي

A test-only practice site (no learn cards) for the second short Grade 1 Arabic test (Sunday 22 November 2026):
unit 3 of the Ministry book «لغتي العربية», part 2, pages 145–196 — the letters غ ف ق ك ل م ن ه و ي — and the
five skills on the school's card. The first test's lessons (letters أ to ظ) are gone.

| Lesson | Skill on the card | On screen |
| --- | --- | --- |
| الصورة المناسبة للحرف | تحديد الصورة المناسبة للحرف المحدد | a letter and three pictures, each name read aloud |
| صوت الحرف والصورة | كتابة صوت الحرف الدال على الصورة | a picture and six letter keys; the letter is written in the box (the review's «أشاهد – أكتب») |
| الحرف الناقص | إكمال الكلمة بالحرف الناقص | each lesson's «أكمل» words: the letter goes into the gap and takes its joined shape |
| تركيب الكلمة | تركيب الحروف لتكوين كلمة | the book's «أركب» rows (غَ + رَ + سَ = ؟) and three near words |
| نسخ الجملة | نسخ جملة بخط جميل | the book's sentences (pp. 173–193), written over in grey on notebook lines with a finger |

Mock test: 12 questions in the card's order, headed «السؤال الأول» to «السؤال الخامس» (3 · 3 · 3 · 2 · 1); the
sentence to copy is always one of the book's five. Each letter comes up once where the bank allows.
Every attempt is different: pictures, keys and near words are drawn afresh each round, unseen questions come first.

Voices: letters, words and sentences in Modern Standard Arabic with full diacritics (Layla, the approved Arabic
phonics voice); instructions, help lines and cheers in Kuwaiti (Maryam), written for this quiz only — several
lines for every style and moment, dealt so none repeats twice running, no «…» in a spoken line (it is read as a
sigh). Pictures are emoji, one per word. One copy for every child.

## Status
Published 18 November 2026 after the family's approval: live on the Hub at https://haya-nt3lm.com/arabic-grade1-quiz/
(Hub migration 030 registers the 121 question profiles and removes the first test's). Not assigned to any account.

## Development
```bash
npm install
npm run dev            # preview mode at http://127.0.0.1:4187
npm run check          # lint, types, unit tests, seed check, preview build
npx playwright test    # iPhone/iPad WebKit + desktop Chromium flows, sound and Hub contract
npm run build:hub      # production Hub build into dist-hub/ (base /arabic-grade1-quiz/)
```

- Content, permanent question keys and Arabic letter shapes: `src/data/catalog.ts`
- Narration: `python3 scripts/generate-audio.py` (skips unchanged clips; `--only id --force` re-records a take;
  if the balance check times out, `ELEVEN_KNOWN_REMAINING=<credits>` lets it go on),
  `python3 scripts/check-audio.py` (local whisper transcription, no cloud; one-word clips are best re-checked after a
  lead-in clip), `python3 scripts/check-breaths.py public/audio` (sighs and long breaths inside a clip).
- Hub seed: `npm run generate:hub-seed` → `integration/seed-arabic-grade1.sql` (removes the first test's profiles).
