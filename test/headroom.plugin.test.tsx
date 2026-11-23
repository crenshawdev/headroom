import { expect, mock, test } from 'claude-code/testing'
import type { Engine, On } from 'claude-code/testing'

// Nothing sits beneath the plugin: these hooks stand for the engine.
function engine(on: On) {
  const toasts: { text: string; timeoutMs?: number }[] = []

  on('session.measure', (_, e) => ({ changed: e.changed }))
  on('ui.toast', (_, e) => {
    toasts.push({ text: e.text, timeoutMs: e.timeoutMs })

    return { value: undefined }
  })

  return toasts
}

const measure = ($: Engine, percent: number) =>
  $.session.measure({
    context: { window: 200000, percent },
    rateLimits: [],
    changed: ['context'],
  })

test('the manifest defaults reach the mod', async ($, on) => {
  const toasts = engine(on)

  for (const percent of [32, 33, 40, 42, 43]) await measure($, percent)

  expect(toasts.length).toBe(2)
  expect(toasts[0].text).toMatch(/\/clear/)
  expect(toasts.map(t => t.timeoutMs)).toEqual([15000, 15000])
})

test('options set in settings change the timing and the duration', { options: { firstPoint: 20, step: 5, toastSeconds: 30 } }, async ($, on) => {
  const toasts = engine(on)

  await measure($, 20)
  expect(toasts.map(t => t.timeoutMs)).toEqual([30000])

  for (const percent of [21, 24]) await measure($, percent)
  expect(toasts.length).toBe(1)

  await measure($, 25)
  expect(toasts.length).toBe(2)
})

test('the reminders add nothing to the session', async ($, on) => {
  const toasts = engine(on)
  const session = mock.session(on)

  for (const percent of [32, 33, 40, 42, 43]) await measure($, percent)

  expect(toasts.length).toBe(2)
  expect(session.appended().length).toBe(0)
})
