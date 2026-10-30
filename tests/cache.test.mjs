import test, { beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readResultCache, cacheResult, clearResultCache } from '../lib/reading-cache.ts'

const KEY = 'eguide-result-v1'
const TTL = 20 * 60_000
const firstId = JSON.stringify([1, '我应怎样安排接下来的学习？'])
const secondId = JSON.stringify([1, '怎样准备一次合作？'])
const realNow = Date.now
let clock
let storage

class MemorySessionStorage {
  data = new Map()
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null }
  setItem(key, value) { this.data.set(String(key), String(value)) }
  removeItem(key) { this.data.delete(key) }
}

beforeEach(() => {
  clock = 1_800_000_000_000
  Date.now = () => clock
  storage = new MemorySessionStorage()
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: storage })
})
afterEach(() => {
  Date.now = realNow
  delete globalThis.sessionStorage
})

test('successful text and image persist together for the same question and hexagram', () => {
  cacheResult(firstId, { language: 'zh', answer: '从小处开始。', image: 'https://images.example/one.jpg' })
  assert.deepEqual(readResultCache(firstId), {
    id: firstId, updatedAt: clock, answers: { zh: '从小处开始。' }, image: 'https://images.example/one.jpg',
  })
})

test('independent successful text and image completions merge in either order', () => {
  cacheResult(firstId, { language: 'zh', answer: '中文解读' })
  cacheResult(firstId, { image: 'https://images.example/one.jpg' })
  cacheResult(firstId, { language: 'en', answer: 'English reflection' })
  assert.deepEqual(readResultCache(firstId).answers, { zh: '中文解读', en: 'English reflection' })
  assert.equal(readResultCache(firstId).image, 'https://images.example/one.jpg')
  clearResultCache()
  cacheResult(firstId, { image: 'https://images.example/two.jpg' })
  cacheResult(firstId, { language: 'en', answer: 'Image arrived first.' })
  assert.deepEqual(readResultCache(firstId).answers, { en: 'Image arrived first.' })
  assert.equal(readResultCache(firstId).image, 'https://images.example/two.jpg')
})

test('updating one language preserves the other language and image', () => {
  cacheResult(firstId, { language: 'zh', answer: '原文', image: 'https://images.example/one.jpg' })
  cacheResult(firstId, { language: 'en', answer: 'English' })
  cacheResult(firstId, { language: 'zh', answer: '更新的中文' })
  assert.deepEqual(readResultCache(firstId).answers, { zh: '更新的中文', en: 'English' })
  assert.equal(readResultCache(firstId).image, 'https://images.example/one.jpg')
})

test('different questions and different hexagrams cannot read each other\'s results', () => {
  cacheResult(firstId, { language: 'zh', answer: '第一问' })
  assert.equal(readResultCache(secondId), null)
  assert.equal(readResultCache(JSON.stringify([2, '我应怎样安排接下来的学习？'])), null)
  cacheResult(secondId, { language: 'en', answer: 'Second question' })
  assert.equal(readResultCache(firstId), null)
  assert.deepEqual(readResultCache(secondId).answers, { en: 'Second question' })
})

test('cached results expire after the twenty-minute TTL', () => {
  cacheResult(firstId, { language: 'zh', answer: '中文解读' })
  clock += TTL - 1
  assert.equal(readResultCache(firstId).answers.zh, '中文解读')
  clock += 2
  assert.equal(readResultCache(firstId), null)
})

test('a new completion after expiry does not revive stale text or image', () => {
  cacheResult(firstId, { language: 'zh', answer: '过期解读', image: 'https://images.example/old.jpg' })
  clock += TTL + 1
  cacheResult(firstId, { language: 'en', answer: 'Fresh reflection' })
  const cached = readResultCache(firstId)
  assert.deepEqual(cached.answers, { en: 'Fresh reflection' })
  assert.equal(cached.image, undefined)
})

test('clearing a reading removes all its languages and image but leaves unrelated session data', () => {
  storage.setItem('unrelated-key', 'keep')
  cacheResult(firstId, { language: 'zh', answer: '解读', image: 'https://images.example/one.jpg' })
  cacheResult(firstId, { language: 'en', answer: 'Reading' })
  clearResultCache()
  assert.equal(readResultCache(firstId), null)
  assert.equal(storage.getItem(KEY), null)
  assert.equal(storage.getItem('unrelated-key'), 'keep')
})

test('missing or invalid JSON is treated as a cache miss', () => {
  assert.equal(readResultCache(firstId), null)
  for (const value of ['{invalid JSON', 'null', '[]', '{}', JSON.stringify({ id: firstId, updatedAt: 'yesterday', answers: {} })]) {
    storage.setItem(KEY, value)
    assert.equal(readResultCache(firstId), null)
  }
})

test('corrupt answer, image and timestamp shapes cannot enter the rendering flow', () => {
  const valid = { id: firstId, updatedAt: clock, answers: { zh: '正常解读' } }
  for (const patch of [
    { answers: [] }, { answers: { zh: 42 } }, { answers: { en: {} } },
    { answers: { zh: null } }, { answers: { zh: '  ' } },
    { image: {} }, { image: 42 }, { image: '' },
    { updatedAt: clock + 1 }, { updatedAt: null },
  ]) {
    storage.setItem(KEY, JSON.stringify({ ...valid, ...patch }))
    assert.equal(readResultCache(firstId), null)
  }
})

test('storage unavailable or full does not break the user flow', () => {
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: { getItem() { throw new Error('Blocked') }, setItem() { throw new Error('Full') }, removeItem() { throw new Error('Blocked') } },
  })
  assert.equal(readResultCache(firstId), null)
  assert.doesNotThrow(() => cacheResult(firstId, { language: 'zh', answer: '解读' }))
  assert.doesNotThrow(() => clearResultCache())
})

