import { expect, type Locator, type Page } from '@playwright/test'
import { QUESTIONS, lettersOf, type Question } from '../../src/data/catalog'

export async function start(page: Page, path = '/') {
  await page.goto(path)
  await page.getByRole('button', { name: /هيا نبدأ/ }).click()
  await expect(page.locator('.home')).toBeVisible()
}

const lastKey = new WeakMap<Page, string>()

/** Writes over every word of a copy question, one dab at a time along the word. */
export async function trace(page: Page, section: Locator) {
  const pad = section.locator('.trace-pad')
  await expect(pad).toHaveAttribute('data-trace-ready', 'true')
  const canvas = section.locator('.trace-ink')
  const points = JSON.parse((await canvas.getAttribute('data-trace-points')) ?? '[]') as [number, number][][]
  // The question slides in: write only once the pad has stopped moving.
  let box = (await canvas.boundingBox())!
  for (let tries = 0; tries < 20; tries += 1) {
    await page.waitForTimeout(120)
    const next = (await canvas.boundingBox())!
    if (next.x === box.x && next.y === box.y && next.width === box.width) break
    box = next
  }
  for (const word of points) {
    for (const [x, y] of word) {
      await page.mouse.move(box.x + x, box.y + y)
      await page.mouse.down()
      await page.mouse.move(box.x + x + 1, box.y + y + 1)
      await page.mouse.up()
    }
  }
}

/** Which question is on screen: its key and its place in the round. */
async function marker(page: Page): Promise<string> {
  const key = await page.locator('section.question').getAttribute('data-question-key')
  const count = await page.locator('.quiz-count').textContent()
  return `${key}|${count}`
}

/** The question on screen, after the previous one has left. */
export async function current(page: Page, record = true): Promise<{ section: Locator; question: Question }> {
  const previous = lastKey.get(page)
  await expect(page.locator('section.question')).toHaveCount(1)
  if (previous) await expect.poll(() => marker(page)).not.toBe(previous)
  const section = page.locator('section.question')
  const key = await section.getAttribute('data-question-key')
  if (key && record) lastKey.set(page, await marker(page))
  const question = QUESTIONS.find((q) => q.key === key)
  if (!question) throw new Error(`Unknown question on screen: ${key}`)
  return { section, question }
}

/** Answers the visible question; `correct` picks the right answer. */
export async function answer(page: Page, correct: boolean): Promise<Question> {
  const { section, question } = await current(page)

  if (question.kind === 'trace') {
    if (correct) await trace(page, section)
    else {
      // Scribble in a corner, then check twice.
      const box = (await section.locator('.trace-ink').boundingBox())!
      for (let n = 0; n < 2; n += 1) {
        await page.mouse.move(box.x + 6, box.y + 6)
        await page.mouse.down()
        await page.mouse.move(box.x + 30, box.y + 10)
        await page.mouse.up()
        await section.getByRole('button', { name: 'خلصت' }).click()
        await page.waitForTimeout(1300)
      }
    }
  } else {
    // A picture, a word or a letter key: the right one, or any other.
    const tiles = section.locator('[data-option]')
    const ids = await tiles.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-option') ?? ''))
    const answerId = rightOption(question, ids)
    const id = correct ? answerId : ids.find((entry) => entry !== answerId)!
    await section.locator(`[data-option="${id}"]`).click()
  }
  await expect(page.locator('.feedback')).toBeVisible()
  return question
}

/** A picture question's answer is drawn per round: the only picture whose word starts with the letter. */
function rightOption(question: Question, ids: string[]): string {
  if (question.format !== 'pic-for-letter') return question.answer
  return ids.find((id) => lettersOf(id)[0] === question.letter)!
}

export async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
}
