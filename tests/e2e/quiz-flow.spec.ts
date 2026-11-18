import { expect, test } from '@playwright/test'
import { ASK_LINES, FORMATS, shown } from '../../src/data/catalog'
import { PRACTICE_SIZE, TEST_SIZE } from '../../src/domain/round'
import { answer, current, noHorizontalScroll, start, trace } from './helpers'

test('home lists the card’s five skills in order and the mock test, in Arabic RTL', async ({ page }) => {
  await start(page)
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('.topic-card')).toHaveCount(5)
  await expect(page.locator('.topic-card').evaluateAll((cards) => cards.map((card) => card.getAttribute('data-topic')))).resolves.toEqual([
    'picture',
    'sound',
    'missing',
    'blend',
    'handwriting',
  ])
  await expect(page.locator('.section-sub')).toContainText('ص ١٤٥–١٩٦')
  await expect(page.locator('.test-banner')).toBeVisible()
  await expect(page.locator('.preview-badge').first()).toBeVisible()
  await noHorizontalScroll(page)
})

test('picture for the letter: the book’s line, three pictures, and a new help line each time', async ({ page }) => {
  await start(page)
  await page.locator('.topic-card[data-topic="picture"]').click()
  await expect(page.locator('.paper-instruction')).toHaveText(FORMATS['pic-for-letter'].instruction)
  const lines = ASK_LINES['pic-for-letter'].map(shown)
  const seen: string[] = []
  for (let n = 0; n < 3; n += 1) {
    await expect(page.locator('.option')).toHaveCount(3)
    const help = (await page.locator('.paper-help p').textContent())!
    expect(lines).toContain(help)
    expect(seen.at(-1)).not.toBe(help)
    seen.push(help)
    await answer(page, true)
    await expect(page.locator('.feedback-good')).toBeVisible()
    await expect(page.locator('.ink-good')).toHaveCount(1)
    await page.locator('.next-button').click()
  }
})

test('a full missing-letter round writes the letter into the word, gives stars and a review of misses', async ({ page }) => {
  test.setTimeout(150_000)
  await start(page)
  await page.locator('.topic-card[data-topic="missing"]').click()
  for (let n = 0; n < PRACTICE_SIZE; n += 1) {
    const correct = n !== 2 && n !== 5
    const { section } = await current(page, false)
    await expect(section.locator('.gap-slot')).toHaveText(' ')
    await answer(page, correct)
    await expect(page.locator(correct ? '.feedback-good' : '.feedback-miss')).toBeVisible()
    await expect(section.locator(correct ? '.gap-slot.is-good' : '.gap-slot.is-miss')).toHaveCount(1)
    await expect(page.locator('.letter-key.is-correct, .letter-key.is-reveal')).toHaveCount(1)
    await expect(page.locator('.letter-key')).toHaveCount(6)
    await noHorizontalScroll(page)
    await page.locator('.next-button').click()
  }
  await expect(page.locator('.results-card')).toBeVisible()
  await expect(page.locator('.results-number')).toHaveText('٦')
  await expect(page.locator('.review-item')).toHaveCount(2)
  await page.getByRole('button', { name: /الدروس/ }).click()
  await expect(page.locator('.topic-card[data-topic="missing"] .star-icon.is-filled')).toHaveCount(2)
})

test('the sound of the picture: a letter key writes the letter in the box', async ({ page }) => {
  await start(page)
  await page.locator('.topic-card[data-topic="sound"]').click()
  const { section, question } = await current(page, false)
  await expect(page.locator('.paper-instruction')).toHaveText(FORMATS['letter-sound'].instruction)
  await expect(section.locator('.sound-box')).toHaveText('')
  await answer(page, true)
  await expect(section.locator('.sound-box.is-good')).toHaveText(question.answer)
  await expect(page.locator('.feedback-note')).toContainText(question.answer)
})

test('building a word: letters joined with plus signs, the word fills the box', async ({ page }) => {
  await start(page)
  await page.locator('.topic-card[data-topic="blend"]').click()
  const { section, question } = await current(page, false)
  await expect(section.locator('.build-tile')).toHaveCount(3)
  await expect(section.locator('.option')).toHaveCount(3)
  await answer(page, true)
  await expect(section.locator('.build-answer.is-filled')).toHaveText(question.options.find((o) => o.id === question.answer)!.label)
})

test('copying: writing over the grey sentence completes it; scribbling twice does not', async ({ page }) => {
  test.setTimeout(150_000)
  await start(page)
  await page.locator('.topic-card[data-topic="handwriting"]').click()
  const first = await current(page)
  await trace(page, first.section)
  await expect(page.locator('.feedback-good')).toBeVisible()
  await expect(first.section.locator('.trace-board.is-good')).toHaveCount(1)
  await page.locator('.next-button').click()

  const second = await current(page)
  const box = (await second.section.locator('.trace-ink').boundingBox())!
  await page.mouse.move(box.x + 6, box.y + 6)
  await page.mouse.down()
  await page.mouse.move(box.x + 40, box.y + 10)
  await page.mouse.up()
  await second.section.getByRole('button', { name: 'خلصت' }).click()
  // One more try: the ink is cleared, nothing is marked yet.
  await expect(page.locator('.feedback')).toHaveCount(0)
  await expect(second.section.getByRole('button', { name: 'خلصت' })).toBeDisabled({ timeout: 3000 })
  await page.mouse.move(box.x + 6, box.y + 6)
  await page.mouse.down()
  await page.mouse.move(box.x + 40, box.y + 10)
  await page.mouse.up()
  await second.section.getByRole('button', { name: 'خلصت' }).click()
  await expect(page.locator('.feedback-miss')).toBeVisible()
  await noHorizontalScroll(page)
})

test('the mock test follows the card: «السؤال الأول» to «السؤال الخامس»', async ({ page }) => {
  test.setTimeout(240_000)
  await start(page)
  await page.locator('.test-banner').click()
  const parts: string[] = []
  for (let n = 0; n < TEST_SIZE; n += 1) {
    await expect(page.locator('section.question')).toHaveCount(1)
    parts.push((await page.locator('.paper-part').textContent()) ?? '')
    await answer(page, true)
    await page.locator('.next-button').click()
  }
  expect(parts).toEqual([
    'السؤال الأول:', 'السؤال الأول:', 'السؤال الأول:',
    'السؤال الثاني:', 'السؤال الثاني:', 'السؤال الثاني:',
    'السؤال الثالث:', 'السؤال الثالث:', 'السؤال الثالث:',
    'السؤال الرابع:', 'السؤال الرابع:',
    'السؤال الخامس:',
  ])
  await expect(page.locator('.results-number')).toHaveText('١٢')
})
