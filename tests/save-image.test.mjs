import test from 'node:test'
import assert from 'node:assert/strict'
import { prepareHexagramImage, saveHexagramImage } from '../lib/save-hexagram-image.ts'

function setup(t, { type = 'image/png', share, status = 200 } = {}) {
  const calls = { clicks: [], revoked: [], timers: [], requests: [], shared: [] }
  const globals = ['fetch', 'navigator', 'document', 'window']
  const original = new Map(globals.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]))
  const set = (name, value) => Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
  t.after(() => {
    for (const name of globals) {
      const descriptor = original.get(name)
      if (descriptor) Object.defineProperty(globalThis, name, descriptor)
      else delete globalThis[name]
    }
  })
  set('fetch', async (url, init) => {
    calls.requests.push({ url, init })
    return { ok: status === 200, status, blob: async () => new Blob(['picture'], { type }) }
  })
  set('navigator', share ? {
    canShare: () => true,
    share: payload => { calls.shared.push(payload); return share(payload) },
  } : {})
  set('document', {
    createElement: tag => {
      assert.equal(tag, 'a')
      return { click() { calls.clicks.push({ href: this.href, download: this.download }) }, remove() {} }
    },
    body: { appendChild() {} },
  })
  set('window', { setTimeout: (fn, delay) => { calls.timers.push({ fn, delay }); return 1 } })
  t.mock.method(URL, 'createObjectURL', () => 'blob:generated-picture')
  t.mock.method(URL, 'revokeObjectURL', url => calls.revoked.push(url))
  return calls
}

test('prepares an image through the proxy with its real format and abort signal', async t => {
  const calls = setup(t, { type: 'image/webp' })
  const signal = new AbortController().signal
  const file = await prepareHexagramImage('https://example.volces.com/image', 'eguide-1.jpg', signal)
  assert.equal(calls.requests[0].url, '/api/download-hexagram-image')
  assert.deepEqual(JSON.parse(calls.requests[0].init.body), { url: 'https://example.volces.com/image' })
  assert.equal(calls.requests[0].init.signal, signal)
  assert.equal(file.name, 'eguide-1.webp')
  assert.equal(file.type, 'image/webp')
})

test('calls native sharing immediately on save without starting another fetch', async t => {
  const calls = setup(t, { share: async () => {} })
  const file = await prepareHexagramImage('https://example.volces.com/image', 'eguide-1.jpg')
  const promise = saveHexagramImage(file)
  assert.equal(calls.shared.length, 1, 'share must be called before returning to the event loop')
  assert.deepEqual(calls.shared[0], { files: [file] })
  assert.equal(calls.requests.length, 1)
  await promise
  assert.equal(calls.clicks.length, 0)
})

test('cancelling the share sheet does not trigger a download', async t => {
  const calls = setup(t, { share: async () => { throw new DOMException('Canceled', 'AbortError') } })
  const file = new File(['picture'], 'eguide-1.png', { type: 'image/png' })
  await saveHexagramImage(file)
  assert.equal(calls.clicks.length, 0)
})

test('propagates other share failures without silently navigating away', async t => {
  const calls = setup(t, { share: async () => { throw new DOMException('Share failed', 'NotAllowedError') } })
  const file = new File(['picture'], 'eguide-1.png', { type: 'image/png' })
  await assert.rejects(saveHexagramImage(file), { name: 'NotAllowedError' })
  assert.equal(calls.clicks.length, 0)
})

test('downloads the prepared file when native file sharing is unavailable', async t => {
  const calls = setup(t)
  const file = new File(['picture'], 'eguide-1.png', { type: 'image/png' })
  await saveHexagramImage(file)
  assert.deepEqual(calls.clicks, [{ href: 'blob:generated-picture', download: 'eguide-1.png' }])
  assert.equal(calls.timers[0].delay, 30_000)
  assert.deepEqual(calls.revoked, [])
  calls.timers[0].fn()
  assert.deepEqual(calls.revoked, ['blob:generated-picture'])
})

test('reports oversized and unsuccessful image preparation', async t => {
  setup(t, { status: 413 })
  await assert.rejects(prepareHexagramImage('https://example.volces.com/image', 'eguide-1.jpg'), /IMAGE_TOO_LARGE/)
})
