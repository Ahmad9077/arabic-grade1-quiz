import type { TopicId } from './catalog'

export type ToneId = TopicId | 'test'

// Each lesson keeps one colour everywhere it appears.
export const TONES: Record<ToneId, { tone: string; tint: string; deep: string }> = {
  picture: { tone: '#0f8b8d', tint: '#d9f1ef', deep: '#0a5f60' },
  find: { tone: '#e4572e', tint: '#fde3da', deep: '#9c3216' },
  form: { tone: '#d98c0b', tint: '#fcefd2', deep: '#8f5a05' },
  blend: { tone: '#7b4b94', tint: '#efe3f5', deep: '#52306a' },
  copy: { tone: '#5a8f3c', tint: '#e5f2db', deep: '#3a6324' },
  test: { tone: '#c2185b', tint: '#fbe1ec', deep: '#86103d' },
}

export function toneStyle(id: ToneId): Record<string, string> {
  const { tone, tint, deep } = TONES[id]
  return { '--tone': tone, '--tint': tint, '--deep': deep }
}
