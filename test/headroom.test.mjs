import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { register } from '../src/headroom.mjs'

const manifest = JSON.parse(readFileSync(new URL('../.claude-plugin/plugin.json', import.meta.url), 'utf8'))
const defaults = Object.fromEntries(Object.entries(manifest.userConfig).map(([key, field]) => [key, field.default]))

// Registers with fakes and returns a feed that raises one measure event and reports its toasts.
function load(options = defaults) {
  const registered = []
  register((event, ...rest) => registered.push({ event, hook: rest.at(-1), count: rest.length }), options)

  const toasts = []
  const $ = { ui: { toast: (text, opts) => toasts.push({ text, timeoutMs: opts?.timeoutMs }) } }

  return {
    registered,
    toasts,
    async feed(percent) {
      const before = toasts.length
      const context = percent === undefined ? { window: 200000 } : { window: 200000, percent }
      const result = await registered[0].hook($, { context }, async (e) => ({ passed: e }))
      return { result, shown: toasts.slice(before) }
    },
  }
}

// Feeds each reading and returns the readings that toasted.
async function toastedAt(mod, readings) {
  const hits = []
  for (const percent of readings) {
    const { shown } = await mod.feed(percent)
    assert.ok(shown.length <= 1)
    if (shown.length) hits.push(percent)
  }
  return hits
}

test('registers one pass-through hook on session.measure', async () => {
  const mod = load()

  assert.equal(mod.registered.length, 1)
  assert.equal(mod.registered[0].event, 'session.measure')
  assert.equal(mod.registered[0].count, 1)

  const { result } = await mod.feed(10)
  assert.equal(result.passed.context.percent, 10)
})

test('default settings: toasts at 33 and then 10 points later, 15 s, naming /clear', async () => {
  const mod = load()

  assert.deepEqual(await toastedAt(mod, [32, 33, 40, 42, 43]), [33, 43])
  assert.equal(mod.toasts.length, 2)
  for (const toast of mod.toasts) {
    assert.match(toast.text, /\/clear/)
    assert.equal(toast.timeoutMs, 15000)
  }
})

test('a jump gives one toast and the next comes a step above the jump', async () => {
  const mod = load()

  assert.deepEqual(await toastedAt(mod, [20, 60, 61, 65, 69, 70]), [60, 70])
})

test('first point, step and toast seconds come from the options', async () => {
  const mod = load({ firstPoint: 20, step: 5, toastSeconds: 30 })

  assert.deepEqual(await toastedAt(mod, [19, 20, 21, 24, 25]), [20, 25])
  assert.equal(mod.toasts[0].timeoutMs, 30000)
})

test('a missing reading shows nothing and moves nothing', async () => {
  const mod = load()

  assert.deepEqual(await toastedAt(mod, [33, undefined, 40, 43]), [33, 43])
})

test('a reading below the first point starts the reminders over', async () => {
  const mod = load()

  assert.deepEqual(await toastedAt(mod, [33, 43, 10, undefined, 33]), [33, 43, 33])
})
