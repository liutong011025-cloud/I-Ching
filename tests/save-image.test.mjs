import test from 'node:test'
import assert from 'node:assert/strict'
import { saveHexagramImage } from '../lib/save-hexagram-image.ts'

function setup(t, { type = 'image/png', share, ok = true } = {}) {
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
    return { ok, blob: async () => new Blob(['picture'], { type }) }
  })
  set('navigator', share ? {
    canShare: () => true,
    share: async payload => { calls.shared.push(payload); return share(payload) },
  } : {})
  set('document', {
    createElement: tag => {
      assert.equal(tag, 'a')
      return { click() { calls.clicks.push({ href: this.href, download: this.download }) } }
    },
    body: { appendChild() {}, removeChild() {} },
  })
  set('window', { setTimeout: (fn, delay) => { calls.timers.push({ fn, delay }); return 1 } })
  t.mock.method(URL, 'createObjectURL', () => 'blob:generated-picture')
  t.mock.method(URL, 'revokeObjectURL', url => calls.revoked.push(url))
  return calls
}

test('downloads using the actual image format and releases the URL after the browser starts', async t => {
  const calls = setup(t, { type: 'image/png' })
  await saveHexagramImage('https://example.volces.com/image', 'eguide-1.jpg')
  assert.equal(calls.requests[0].url, '/api/download-hexagram-image')
  assert.deepEqual(JSON.parse(calls.requests[0].init.body), { url: 'https://example.volces.com/image' })
  assert.deepEqual(calls.clicks, [{ href: 'blob:generated-picture', download: 'eguide-1.png' }])
  assert.equal(calls.timers[0].delay, 30_000)
  assert.deepEqual(calls.revoked, [])
  calls.timers[0].fn()
  assert.deepEqual(calls.revoked, ['blob:generated-picture'])
})

test('passes a correctly named image file to the native share sheet', async t => {
  const calls = setup(t, { type: 'image/webp', share: async () => {} })
  await saveHexagramImage('https://example.volces.com/image', 'eguide-1.jpg')
  assert.equal(calls.shared[0].files[0].name, 'eguide-1.webp')
  assert.equal(calls.shared[0].files[0].type, 'image/webp')
  assert.equal(calls.clicks.length, 0)
})

test('canceling the share sheet does not start another download', async t => {
  const calls = setup(t, { share: async () => { throw new DOMException('Canceled', 'AbortError') } })
  await saveHexagramImage('https://example.volces.com/image', 'eguide-1.jpg')
  assert.equal(calls.clicks.length, 0)
  assert.equal(calls.timers.length, 0)
})

test('falls back to browser download when the share sheet cannot open', async t => {
  const calls = setup(t, { share: async () => { throw new DOMException('Gesture expired', 'NotAllowedError') } })
  await saveHexagramImage('https://example.volces.com/image', 'eguide-1.jpg')
  assert.equal(calls.clicks[0].download, 'eguide-1.png')
  assert.equal(calls.timers.length, 1)
})

test('reports a failed download instead of saving an invalid response', async t => {
  const calls = setup(t, { ok: false })
  await assert.rejects(saveHexagramImage('https://example.volces.com/image', 'eguide-1.jpg'), /Failed to download image/)
  assert.equal(calls.clicks.length, 0)
  assert.equal(calls.timers.length, 0)
})
