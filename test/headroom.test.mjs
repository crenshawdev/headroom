import assert from 'node:assert/strict'
import { test } from 'node:test'

import { register } from '../src/headroom.mjs'

test('registers one pass-through hook on session.measure', async () => {
  const registered = []
  register((event, ...rest) => registered.push({ event, hook: rest.at(-1), rest }), {})

  assert.equal(registered.length, 1)
  assert.equal(registered[0].event, 'session.measure')
  assert.equal(registered[0].rest.length, 1)

  const result = await registered[0].hook({}, { context: {} }, async () => 'next-result')
  assert.equal(result, 'next-result')
})
