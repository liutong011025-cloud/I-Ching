import test, { beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { getReadingJob, clearReadingJobs, invalidateReadingJob } from '../lib/reading-jobs.ts'
import { readResultCache, cacheResult, READING_CACHE_TTL_MS } from '../lib/reading-cache.ts'
import { HEXAGRAMS } from '../lib/hexagrams.ts'

const question = '如何安排接下来的学习？'
const id = JSON.stringify([1, question])
const realNow = Date.now
let clock
let calls
let pending
const reply = body => new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } })

beforeEach(() => {
  clock = 1_800_000_000_000
  Date.now = () => clock
  const storage = new Map()
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: key => storage.delete(key) },
  })
  clearReadingJobs()
  calls = []
  pending = []
  globalThis.fetch = (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) })
    return new Promise(resolve => pending.push(resolve))
  }
})
afterEach(() => {
  clearReadingJobs()
  Date.now = realNow
  delete globalThis.sessionStorage
})

test('two simultaneous subscribers share one request and one promise', async () => {
  const a = getReadingJob('text', HEXAGRAMS[0], question, 'zh')
  const b = getReadingJob('text', HEXAGRAMS[0], question, 'zh')
  assert.equal(a, b)
  assert.equal(calls.length, 1)
  pending[0](reply({ answer: '中文解读' }))
  assert.equal(await a, '中文解读')
  assert.equal(await b, '中文解读')
  assert.equal(readResultCache(id).answers.zh, '中文解读')
  assert.equal(await getReadingJob('text', HEXAGRAMS[0], question, 'zh'), '中文解读')
  assert.equal(calls.length, 1)
})

test('text jobs are isolated by language, while image jobs share the first language', async () => {
  const zh = getReadingJob('text', HEXAGRAMS[0], question, 'zh')
  const en = getReadingJob('text', HEXAGRAMS[0], question, 'en')
  const imageZh = getReadingJob('image', HEXAGRAMS[0], question, 'zh')
  const imageEn = getReadingJob('image', HEXAGRAMS[0], question, 'en')
  assert.notEqual(zh, en)
  assert.equal(imageZh, imageEn)
  assert.equal(calls.length, 3)
  assert.deepEqual(calls.map(call => call.body.language), ['zh', 'en', 'zh'])
  pending[0](reply({ answer: '中文' }))
  pending[1](reply({ answer: 'English' }))
  pending[2](reply({ url: 'https://images.example/one.jpg' }))
  await Promise.all([zh, en, imageZh, imageEn])
  assert.deepEqual(readResultCache(id).answers, { zh: '中文', en: 'English' })
  assert.equal(readResultCache(id).image, 'https://images.example/one.jpg')
})

test('failed requests leave no memoized failure and can be retried', async () => {
  const failed = getReadingJob('text', HEXAGRAMS[0], question, 'en')
  pending[0](new Response(JSON.stringify({ error: 'Busy', code: 'RATE_LIMITED', retryable: true }), { status: 429 }))
  await assert.rejects(failed, error => error.code === 'RATE_LIMITED')
  assert.equal(readResultCache(id), null)
  const retried = getReadingJob('text', HEXAGRAMS[0], question, 'en')
  assert.notEqual(retried, failed)
  assert.equal(calls.length, 2)
  pending[1](reply({ answer: 'Recovered' }))
  assert.equal(await retried, 'Recovered')
})

test('clearing starts a new epoch so old work cannot overwrite the new reading', async () => {
  const old = getReadingJob('text', HEXAGRAMS[0], question, 'zh')
  clearReadingJobs()
  const fresh = getReadingJob('text', HEXAGRAMS[0], question, 'zh')
  assert.notEqual(old, fresh)
  assert.equal(calls.length, 2)
  pending[1](reply({ answer: '新一轮' }))
  await fresh
  pending[0](reply({ answer: '上一轮' }))
  await old
  assert.equal(readResultCache(id).answers.zh, '新一轮')
  assert.equal(await getReadingJob('text', HEXAGRAMS[0], question, 'zh'), '新一轮')
  assert.equal(calls.length, 2)
  clearReadingJobs()
  assert.equal(readResultCache(id), null)
})

test('old work finishing after a clear cannot restore any session cache', async () => {
  const old = getReadingJob('image', HEXAGRAMS[0], question, 'zh')
  clearReadingJobs()
  pending[0](reply({ url: 'https://images.example/old.jpg' }))
  await old
  assert.equal(readResultCache(id), null)
})

test('completed jobs survive the single-slot session cache being replaced by another question', async () => {
  const first = getReadingJob('text', HEXAGRAMS[0], question, 'zh')
  pending[0](reply({ answer: '第一问' }))
  await first
  const second = getReadingJob('text', HEXAGRAMS[0], '另一个问题', 'zh')
  pending[1](reply({ answer: '第二问' }))
  await second
  assert.equal(readResultCache(id), null)
  assert.equal(await getReadingJob('text', HEXAGRAMS[0], question, 'zh'), '第一问')
  assert.equal(calls.length, 2)
})

test('expired successful promises require fresh work', async () => {
  const first = getReadingJob('text', HEXAGRAMS[0], question, 'zh')
  pending[0](reply({ answer: '之前的解读' }))
  await first
  clock += READING_CACHE_TTL_MS + 1
  const fresh = getReadingJob('text', HEXAGRAMS[0], question, 'zh')
  assert.equal(calls.length, 2)
  pending[1](reply({ answer: '新的解读' }))
  assert.equal(await fresh, '新的解读')
})

test('only the twelve most recent completed promises are retained', async () => {
  for (let i = 0; i < 13; i++) {
    const job = getReadingJob('text', HEXAGRAMS[0], `问题 ${i}`, 'zh')
    pending[i](reply({ answer: `解读 ${i}` }))
    await job
  }
  assert.equal(await getReadingJob('text', HEXAGRAMS[0], '问题 1', 'zh'), '解读 1')
  assert.equal(calls.length, 13)
  const evicted = getReadingJob('text', HEXAGRAMS[0], '问题 0', 'zh')
  assert.equal(calls.length, 14)
  pending[13](reply({ answer: '重新生成' }))
  await evicted
})

test('a valid session cache is reused without sending a request', async () => {
  cacheResult(id, { language: 'en', answer: 'Restored', image: 'https://images.example/restored.jpg' })
  assert.equal(await getReadingJob('text', HEXAGRAMS[0], question, 'en'), 'Restored')
  assert.equal(await getReadingJob('image', HEXAGRAMS[0], question, 'zh'), 'https://images.example/restored.jpg')
  assert.equal(calls.length, 0)
})

test('invalidating a broken image URL generates a fresh image while preserving both text languages', async () => {
  cacheResult(id, { language: 'zh', answer: '中文' })
  cacheResult(id, { language: 'en', answer: 'English' })
  const first = getReadingJob('image', HEXAGRAMS[0], question, 'zh')
  pending[0](reply({ url: 'https://images.example/broken.jpg' }))
  await first
  invalidateReadingJob('image', HEXAGRAMS[0], question, 'en')
  assert.deepEqual(readResultCache(id).answers, { zh: '中文', en: 'English' })
  assert.equal(readResultCache(id).image, undefined)
  const regenerated = getReadingJob('image', HEXAGRAMS[0], question, 'en')
  assert.equal(calls.length, 2)
  pending[1](reply({ url: 'https://images.example/fresh.jpg' }))
  assert.equal(await regenerated, 'https://images.example/fresh.jpg')
  assert.equal(readResultCache(id).image, 'https://images.example/fresh.jpg')
  invalidateReadingJob('text', HEXAGRAMS[0], question, 'zh')
  assert.deepEqual(readResultCache(id).answers, { en: 'English' })
  assert.equal(readResultCache(id).image, 'https://images.example/fresh.jpg')
})

test('invalidated in-flight work cannot overwrite its replacement', async () => {
  const old = getReadingJob('image', HEXAGRAMS[0], question, 'zh')
  invalidateReadingJob('image', HEXAGRAMS[0], question, 'zh')
  const fresh = getReadingJob('image', HEXAGRAMS[0], question, 'zh')
  pending[1](reply({ url: 'https://images.example/fresh.jpg' }))
  await fresh
  pending[0](reply({ url: 'https://images.example/old.jpg' }))
  await old
  assert.equal(readResultCache(id).image, 'https://images.example/fresh.jpg')
})
