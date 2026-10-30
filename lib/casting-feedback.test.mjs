import assert from 'node:assert/strict'
import test from 'node:test'
import { startCastingFeedback } from './casting-feedback.ts'

function environment(reducedMotion = false, vibrateSupported = true) {
  const classes = new Set()
  const vibration = []
  return {
    classes,
    vibration,
    options: {
      reducedMotion,
      classList: { add: name => classes.add(name), remove: name => classes.delete(name) },
      ...(vibrateSupported ? { vibrate: pattern => vibration.push(pattern) } : {}),
    },
  }
}

test('settling coins removes screen feedback and cancels vibration', () => {
  const env = environment()
  const stop = startCastingFeedback(env.options)
  assert.equal(env.classes.has('is-casting'), true)
  assert.equal(env.vibration[0].reduce((a, b) => a + b, 0), 470)
  stop()
  assert.equal(env.classes.has('is-casting'), false)
  assert.equal(env.vibration.at(-1), 0)
  stop()
  assert.equal(env.vibration.length, 2)
})

test('cancelling a pending toss cleans up immediately without leaving the class', async () => {
  const env = environment()
  const stop = startCastingFeedback(env.options)
  let settled = false
  const timer = setTimeout(() => { settled = true; stop() }, 20)
  clearTimeout(timer)
  stop()
  await new Promise(resolve => setTimeout(resolve, 30))
  assert.equal(settled, false)
  assert.equal(env.classes.size, 0)
  assert.equal(env.vibration.at(-1), 0)
})

test('reduced motion skips both shaking and vibration', () => {
  const env = environment(true)
  const stop = startCastingFeedback(env.options)
  stop()
  assert.equal(env.classes.size, 0)
  assert.deepEqual(env.vibration, [])
})

test('screen feedback still works when the device has no vibration API', () => {
  const env = environment(false, false)
  const stop = startCastingFeedback(env.options)
  assert.equal(env.classes.has('is-casting'), true)
  stop()
  assert.equal(env.classes.size, 0)
})
