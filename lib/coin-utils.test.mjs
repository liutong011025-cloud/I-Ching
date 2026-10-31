import assert from 'node:assert/strict'
import test from 'node:test'
import { coinTotal, emptyCoins, toggleCoin, tossThreeCoins } from './coin-utils.ts'

test('manual entry stays incomplete when the third coin is selected first', () => {
  const thirdFirst = toggleCoin(emptyCoins(), 2)
  assert.equal(coinTotal(thirdFirst), null)
  assert.equal(coinTotal(toggleCoin(thirdFirst, 0)), null)
  assert.equal(coinTotal(toggleCoin(toggleCoin(thirdFirst, 0), 1)), 9)
  const sparse = new Array(3)
  sparse[2] = 3
  assert.equal(coinTotal(sparse), null)
})

test('all eight coin outcomes preserve the traditional sum frequencies', () => {
  const frequencies = {}
  for (const first of [2, 3]) {
    for (const second of [2, 3]) {
      for (const third of [2, 3]) {
        const total = coinTotal([first, second, third])
        frequencies[total] = (frequencies[total] ?? 0) + 1
      }
    }
  }
  assert.deepEqual(frequencies, { 6: 1, 7: 3, 8: 3, 9: 1 })
})

test('toggling does not mutate previous selections or accept an invalid position', () => {
  const previous = [3, 2, 3]
  assert.deepEqual(toggleCoin(previous, 1), [3, 3, 3])
  assert.deepEqual(previous, [3, 2, 3])
  assert.throws(() => toggleCoin(previous, 3), RangeError)
})

test('random casting returns exactly three valid coin faces', () => {
  for (let index = 0; index < 32; index++) {
    const coins = tossThreeCoins()
    assert.equal(coins.length, 3)
    assert.ok(coins.every((value) => value === 2 || value === 3))
    assert.ok([6, 7, 8, 9].includes(coinTotal(coins)))
  }
})
