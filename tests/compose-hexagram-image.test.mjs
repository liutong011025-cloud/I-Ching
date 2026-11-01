import test from 'node:test'
import assert from 'node:assert/strict'
import { composeHexagramImage } from '../lib/compose-hexagram-image.ts'

test('draws the primary hexagram from top to bottom with moving lines highlighted', async t => {
  const originalImage = Object.getOwnPropertyDescriptor(globalThis, 'Image')
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document')
  t.after(() => {
    if (originalImage) Object.defineProperty(globalThis, 'Image', originalImage); else delete globalThis.Image
    if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument); else delete globalThis.document
  })
  const rectangles = []
  const context = {
    fillStyle: '', strokeStyle: '', lineWidth: 1,
    drawImage() {}, strokeRect() {},
    fillRect(x, y, width, height) { rectangles.push({ x, y, width, height, color: this.fillStyle }) },
  }
  Object.defineProperty(globalThis, 'Image', { configurable: true, value: class {
    naturalWidth = 1200; naturalHeight = 1800
    set src(_value) { queueMicrotask(() => this.onload()) }
  } })
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    createElement(tag) { assert.equal(tag, 'canvas'); return { getContext: () => context, toBlob: cb => cb(new Blob(['composed'], { type: 'image/jpeg' })) } },
  } })
  t.mock.method(URL, 'createObjectURL', () => 'blob:source')
  let revoked = false
  t.mock.method(URL, 'revokeObjectURL', () => { revoked = true })
  // 豫: from bottom to top 老阴、老阴、少阴、少阳、少阴、老阴.
  const result = await composeHexagramImage(new File(['image'], 'art.png', { type: 'image/png' }), [6, 6, 8, 7, 8, 6])
  assert.equal(result.name, 'art.jpg')
  assert.equal(result.type, 'image/jpeg')
  assert.equal(revoked, true)
  const marks = rectangles.slice(1)
  assert.equal(marks.length, 11) // Five broken lines and one solid line.
  const rows = [...new Set(marks.map(mark => mark.y))].sort((a, b) => a - b)
  assert.deepEqual(rows.map(y => marks.filter(mark => mark.y === y).length), [2, 2, 1, 2, 2, 2])
  assert.deepEqual(rows.map(y => marks.find(mark => mark.y === y).color), ['#d4b67d', '#f4efe4', '#f4efe4', '#f4efe4', '#d4b67d', '#d4b67d'])
  rectangles.length = 0
  await composeHexagramImage(new File(['image'], 'art.jpg', { type: 'image/jpeg' }), [7, 8, 9, 6, 7, 8])
  const allTypes = rectangles.slice(1)
  const typeRows = [...new Set(allTypes.map(mark => mark.y))].sort((a, b) => a - b)
  assert.deepEqual(typeRows.map(y => allTypes.filter(mark => mark.y === y).length), [2, 1, 2, 1, 2, 1])
  assert.deepEqual(typeRows.map(y => allTypes.find(mark => mark.y === y).color), ['#f4efe4', '#f4efe4', '#d4b67d', '#d4b67d', '#f4efe4', '#f4efe4'])
})

test('rejects invalid hexagrams before opening a file', async () => {
  await assert.rejects(composeHexagramImage(new File(['image'], 'art.jpg'), [6, 6, 8]), /INVALID_HEXAGRAM/)
  await assert.rejects(composeHexagramImage(new File(['image'], 'art.jpg'), [6, 6, 8, 7, 8, 2]), /INVALID_HEXAGRAM/)
})
