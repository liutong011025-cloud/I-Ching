export type Coin = 2 | 3
export type CoinSelection = [Coin | null, Coin | null, Coin | null]
export type CompleteCoins = [Coin, Coin, Coin]

export function emptyCoins(): CoinSelection {
  return [null, null, null]
}

export function toggleCoin(coins: CoinSelection, index: number): CoinSelection {
  if (!Number.isInteger(index) || index < 0 || index > 2) {
    throw new RangeError('Coin index must be 0, 1, or 2')
  }
  const next: CoinSelection = [...coins]
  next[index] = next[index] === 3 ? 2 : 3
  return next
}

export function coinTotal(coins: CoinSelection): number | null {
  // Array.every skips holes, so each position must be checked explicitly.
  if (
    coins.length !== 3 ||
    (coins[0] !== 2 && coins[0] !== 3) ||
    (coins[1] !== 2 && coins[1] !== 3) ||
    (coins[2] !== 2 && coins[2] !== 3)
  ) return null
  return coins[0] + coins[1] + coins[2]
}

export function tossThreeCoins(): CompleteCoins {
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    const bytes = globalThis.crypto.getRandomValues(new Uint8Array(3))
    return [bytes[0] & 1 ? 3 : 2, bytes[1] & 1 ? 3 : 2, bytes[2] & 1 ? 3 : 2]
  }
  // Older browser fallback; each coin still has equal heads/tails probability.
  return [0, 1, 2].map(() => Math.random() < 0.5 ? 3 : 2) as CompleteCoins
}
