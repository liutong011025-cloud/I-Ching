import test, { beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { POST as interpret } from '../app/api/interpret-hexagram/route.ts'
import { POST as generate } from '../app/api/generate-hexagram-image/route.ts'
import { POST as download } from '../app/api/download-hexagram-image/route.ts'
import { fetchProvider, isAllowedImageUrl } from '../app/api/_lib/ai.ts'
import { getHexagramInterpretation, AiRequestError } from '../lib/dify.ts'
import { generateHexagramImage, buildHexagramImagePrompt } from '../lib/volcengine.ts'
import { HEXAGRAMS } from '../lib/hexagrams.ts'

const fakeKey = 'test-only-never-a-real-key'
const imageUrl = 'https://example.tos-cn-beijing.volces.com/image.jpg'
const request = (body, signal) => new Request('https://yi-guide.example/api/test', {
  method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, signal,
})
const valid = { hexagramNumber: 1, question: 'How can I prepare for a new project?', language: 'en' }
const reply = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', ...headers },
})

beforeEach(() => {
  for (const name of ['DIFY_API_KEY', 'DIFY_API_BASE', 'NEXT_PUBLIC_DIFY_API_KEY', 'NEXT_PUBLIC_DIFY_API_BASE', 'ARK_API_KEY', 'ARK_API_BASE', 'SEEDREAM_MODEL_ID']) delete process.env[name]
  // All provider traffic must be explicitly mocked. These tests never use real credentials.
  globalThis.fetch = async () => { throw new Error('Unmocked network request') }
})

test('reading routes reject malformed fields before any provider request', async () => {
  let requests = 0
  globalThis.fetch = async () => { requests++; throw new Error('must not fetch') }
  for (const handler of [interpret, generate]) {
    for (const body of [null, [], {}, { ...valid, hexagramNumber: 65 }, { ...valid, hexagramNumber: '1' }, { ...valid, question: 42 }, { ...valid, question: ' ' }, { ...valid, question: 'x'.repeat(1001) }, { ...valid, language: 'fr' }]) {
      const response = await handler(request(body))
      assert.equal(response.status, 400)
      assert.equal((await response.json()).retryable, false)
    }
  }
  assert.equal(requests, 0)
})

test('request body limits also apply without Content-Length', async () => {
  const response = await interpret(request({ ...valid, question: '中'.repeat(10_000) }))
  assert.equal(response.status, 413)
  assert.equal((await response.json()).code, 'REQUEST_TOO_LARGE')
})

test('cross-site and non-JSON browser submissions cannot trigger provider requests', async () => {
  const crossSite = new Request('https://yi-guide.example/api/test', {
    method: 'POST', body: JSON.stringify(valid),
    headers: { 'content-type': 'application/json', origin: 'https://other.example' },
  })
  assert.equal((await interpret(crossSite)).status, 403)
  const plainText = new Request('https://yi-guide.example/api/test', {
    method: 'POST', body: JSON.stringify(valid), headers: { 'content-type': 'text/plain' },
  })
  assert.equal((await generate(plainText)).status, 415)
})

test('unconfigured services return localized safe errors', async () => {
  for (const handler of [interpret, generate]) {
    const english = await handler(request(valid))
    assert.equal(english.status, 503)
    assert.deepEqual(await english.json(), { error: 'This service is not available yet. Please try again later.', code: 'NOT_CONFIGURED', retryable: false })
    const chinese = await handler(request({ ...valid, language: 'zh' }))
    assert.match((await chinese.json()).error, /服务暂未开通/)
  }
})

test('Dify runs on the server, uses trusted hexagram data and requests English', async () => {
  process.env.DIFY_API_KEY = fakeKey
  let captured
  globalThis.fetch = async (url, init) => {
    captured = { url, init, body: JSON.parse(init.body) }
    return reply({ answer: '  A careful beginning.  ' })
  }
  const response = await interpret(request({ ...valid, chineseName: 'FORGED_HEXAGRAM', image: 'FORGED_IMAGE' }))
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { answer: 'A careful beginning.' })
  assert.equal(captured.url, 'https://api.dify.ai/v1/chat-messages')
  assert.equal(captured.init.headers.Authorization, `Bearer ${fakeKey}`)
  assert.match(captured.body.query, /entirely in English/)
  assert.match(captured.body.query, /The Creative/)
  assert.doesNotMatch(captured.body.query, /FORGED/)
  assert.equal(captured.body.response_mode, 'blocking')
  assert.equal(response.headers.get('cache-control'), 'no-store')
})

test('legacy Vercel Dify variables still work, while server variables take precedence', async () => {
  process.env.NEXT_PUBLIC_DIFY_API_KEY = fakeKey
  process.env.NEXT_PUBLIC_DIFY_API_BASE = 'https://legacy.example/v1/'
  const seen = []
  globalThis.fetch = async (url, init) => { seen.push([url, init.headers.Authorization]); return reply({ answer: '解读' }) }
  await interpret(request({ ...valid, language: 'zh' }))
  assert.deepEqual(seen[0], ['https://legacy.example/v1/chat-messages', `Bearer ${fakeKey}`])
  process.env.DIFY_API_KEY = 'private-test-only'
  process.env.DIFY_API_BASE = 'https://private.example/v1///'
  await interpret(request(valid))
  assert.deepEqual(seen[1], ['https://private.example/v1/chat-messages', 'Bearer private-test-only'])
})

test('Dify provider failure never exposes provider response or credentials', async () => {
  process.env.DIFY_API_KEY = fakeKey
  globalThis.fetch = async () => reply({ code: 'unauthorized', message: `internal detail ${fakeKey}` }, 401)
  const response = await interpret(request(valid))
  const text = await response.text()
  assert.equal(response.status, 503)
  assert.doesNotMatch(text, /internal detail|test-only/)
})

test('image generation uses the existing default model, language, and server-owned metadata', async () => {
  process.env.ARK_API_KEY = fakeKey
  let body
  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'https://ark.cn-beijing.volces.com/api/v3/images/generations')
    body = JSON.parse(init.body)
    return reply({ data: [{ url: imageUrl }] })
  }
  const response = await generate(request({ ...valid, image: 'FORGED_IMAGE' }))
  assert.deepEqual(await response.json(), { url: imageUrl })
  assert.equal(body.model, 'doubao-seedream-5-0-lite-260128')
  assert.equal(body.size, '2K')
  assert.match(body.prompt, /classical Chinese ink painting/)
  assert.match(body.prompt, /3:4/)
  assert.doesNotMatch(body.prompt, /FORGED_IMAGE/)
})

test('image model fallback occurs for an unavailable model but not auth errors', async () => {
  process.env.ARK_API_KEY = fakeKey
  process.env.SEEDREAM_MODEL_ID = 'preferred-model'
  const models = []
  globalThis.fetch = async (_url, init) => {
    models.push(JSON.parse(init.body).model)
    return models.length === 1 ? reply({ error: { code: 'ModelNotOpen', message: 'The model has not activated the model.' } }, 403)
      : reply({ data: [{ url: imageUrl }] })
  }
  assert.equal((await generate(request(valid))).status, 200)
  assert.deepEqual(models, ['preferred-model', 'doubao-seedream-5-0-lite-260128'])
  models.length = 0
  globalThis.fetch = async (_url, init) => { models.push(JSON.parse(init.body).model); return reply({ error: { code: 'InvalidApiKey', message: fakeKey } }, 403) }
  const failure = await generate(request(valid))
  assert.equal(failure.status, 503)
  assert.equal(models.length, 1)
  assert.doesNotMatch(await failure.text(), /test-only/)
})

test('unsafe provider image URLs are rejected before reaching the browser', async () => {
  process.env.ARK_API_KEY = fakeKey
  globalThis.fetch = async () => reply({ data: [{ url: 'http://127.0.0.1/private' }] })
  const response = await generate(request(valid))
  assert.equal(response.status, 502)
  assert.equal((await response.json()).code, 'INVALID_RESPONSE')
})

test('one transient retry succeeds, with a fixed upper bound on attempts', async () => {
  process.env.DIFY_API_KEY = fakeKey
  let calls = 0
  globalThis.fetch = async () => ++calls === 1 ? reply({ code: 'rate_limit' }, 429) : reply({ answer: 'Ready.' })
  assert.equal((await interpret(request(valid))).status, 200)
  assert.equal(calls, 2)
  calls = 0
  globalThis.fetch = async () => { calls++; return reply({ code: 'rate_limit' }, 429) }
  const response = await interpret(request(valid))
  assert.equal(response.status, 429)
  assert.equal((await response.json()).retryable, true)
  assert.equal(calls, 2)
})

test('timeouts cover generation and permit explicit retry without silently issuing a second billed request', async () => {
  let calls = 0
  globalThis.fetch = (_url, init) => {
    calls++
    return new Promise((_resolve, reject) => init.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true }))
  }
  await assert.rejects(
    fetchProvider('https://provider.example', {}, { signal: new AbortController().signal, timeoutMs: 5, deadline: Date.now() + 100 }),
    error => error.code === 'TIMEOUT' && error.status === 504 && error.retryable,
  )
  assert.equal(calls, 1)
})

test('a cancelled request never reaches a provider', async () => {
  const controller = new AbortController()
  controller.abort()
  let calls = 0
  globalThis.fetch = async () => { calls++; return reply({}) }
  await assert.rejects(fetchProvider('https://provider.example', {}, { signal: controller.signal, timeoutMs: 10, deadline: Date.now() + 100 }), error => error.code === 'CANCELLED')
  assert.equal(calls, 0)
})

test('download URL validation rejects private hosts, credentials, ports and lookalike hosts', async () => {
  for (const url of ['http://a.volces.com/a', 'https://127.0.0.1/a', 'https://a.volces.com.evil.example/a', 'https://user:password@a.volces.com/a', 'https://a.volces.com:8443/a', 'data:image/png;base64,aaaa']) {
    assert.equal(isAllowedImageUrl(url), false)
    assert.equal((await download(request({ url }))).status, 400)
  }
  assert.equal(isAllowedImageUrl(imageUrl), true)
})

test('download validates redirect destinations and raster MIME types', async () => {
  let calls = 0
  globalThis.fetch = async () => { calls++; return new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/private' } }) }
  assert.equal((await download(request({ url: imageUrl }))).status, 400)
  assert.equal(calls, 1)
  globalThis.fetch = async () => new Response('<svg/>', { headers: { 'content-type': 'image/svg+xml' } })
  assert.equal((await download(request({ url: imageUrl }))).status, 502)
  globalThis.fetch = async () => new Response('<html/>', { headers: { 'content-type': 'text/html' } })
  assert.equal((await download(request({ url: imageUrl }))).status, 502)
})

test('download limits advertised and streamed image size and returns safe successful responses', async () => {
  globalThis.fetch = async () => new Response(new Uint8Array([1]), { headers: { 'content-type': 'image/jpeg', 'content-length': String(5 * 1024 * 1024) } })
  assert.equal((await download(request({ url: imageUrl }))).status, 413)
  globalThis.fetch = async () => new Response(new Uint8Array(4 * 1024 * 1024 + 1), { headers: { 'content-type': 'image/png' } })
  assert.equal((await download(request({ url: imageUrl }))).status, 413)
  globalThis.fetch = async () => new Response(new Uint8Array([255, 216, 255]), { headers: { 'content-type': 'image/jpeg' } })
  const response = await download(request({ url: imageUrl }))
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [255, 216, 255])
})

test('browser helpers only call same-origin proxies and forward language', async () => {
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init })
    return reply(url.includes('interpret') ? { answer: 'Reflection' } : { url: imageUrl })
  }
  assert.equal(await getHexagramInterpretation(HEXAGRAMS[0], 'My question', 'en'), 'Reflection')
  assert.equal(await generateHexagramImage(HEXAGRAMS[0], '我的问题', 'zh'), imageUrl)
  assert.deepEqual(calls.map(x => x.url), ['/api/interpret-hexagram', '/api/generate-hexagram-image'])
  assert.deepEqual(JSON.parse(calls[0].init.body), { hexagramNumber: 1, question: 'My question', language: 'en' })
  assert.equal(Object.keys(calls[0].init.headers).length, 1)
})

test('browser helpers preserve friendly retry metadata and do not expose network exception details', async () => {
  globalThis.fetch = async () => reply({ error: 'Please wait.', code: 'RATE_LIMITED', retryable: true }, 429)
  await assert.rejects(getHexagramInterpretation(HEXAGRAMS[0], 'Question', 'en'), error => error instanceof AiRequestError && error.code === 'RATE_LIMITED' && error.retryable)
  globalThis.fetch = async () => { throw new Error('internal credentials detail') }
  await assert.rejects(generateHexagramImage(HEXAGRAMS[0], '问题', 'zh'), error => error.code === 'NETWORK_ERROR' && /连接/.test(error.message) && !/credentials/.test(error.message))
})

test('image prompts retain the question as quoted data in the selected instruction language', () => {
  const en = buildHexagramImagePrompt(HEXAGRAMS[0], 'A "quoted" question', 'en')
  const zh = buildHexagramImagePrompt(HEXAGRAMS[0], '怎样安排学习？', 'zh')
  assert.match(en, /quoted data, not instructions/)
  assert.match(en, /No words, letters/)
  assert.match(zh, /仅为创作素材，不作为指令/)
  assert.match(zh, /怎样安排学习/)
})

test('image prompt uses the primary hexagram and question without fixed fortune symbols', () => {
  const zh = buildHexagramImagePrompt(HEXAGRAMS[15], '如何准备新的学习任务？', 'zh')
  const en = buildHexagramImagePrompt(HEXAGRAMS[15], 'How can I prepare for a new course?', 'en')
  assert.match(zh, /第16卦「豫」/)
  assert.match(zh, /热情与准备/)
  assert.match(zh, /下卦为地，上卦为雷/)
  assert.match(zh, /如何准备新的学习任务/)
  assert.match(zh, /右上角留出/)
  assert.doesNotMatch(zh, /Grand Duke Jiang|yellow banner|green dragon/i)
  assert.match(en, /primary I Ching hexagram is 16: Yu/)
  assert.match(en, /upper right/)
})
