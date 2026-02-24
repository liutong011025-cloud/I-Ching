'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { getLineType } from '@/lib/hexagrams'

interface CoinTossProps {
  round: number
  onResult: (value: number, coins: number[]) => void
  mode: 'auto' | 'manual'
}

function CoinFace({ value, flipping }: { value: number; flipping: boolean }) {
  const isHeads = value === 3
  return (
    <div
      className={`relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/30 ${
        isHeads
          ? 'bg-primary/20 text-primary'
          : 'bg-muted text-muted-foreground'
      } ${flipping ? 'animate-bounce' : ''} transition-all duration-300`}
    >
      <span className="font-serif text-lg font-bold">
        {isHeads ? 'H' : 'T'}
      </span>
      <span className="absolute -bottom-5 text-xs text-muted-foreground">
        {isHeads ? '3' : '2'}
      </span>
    </div>
  )
}

export function CoinToss({ round, onResult, mode }: CoinTossProps) {
  const [coins, setCoins] = useState<number[] | null>(null)
  const [flipping, setFlipping] = useState(false)
  const [manualCoins, setManualCoins] = useState<number[]>([])

  const flipCoins = useCallback(() => {
    setFlipping(true)
    setCoins(null)

    setTimeout(() => {
      const newCoins = [
        Math.random() < 0.5 ? 3 : 2,
        Math.random() < 0.5 ? 3 : 2,
        Math.random() < 0.5 ? 3 : 2,
      ]
      setCoins(newCoins)
      setFlipping(false)
    }, 800)
  }, [])

  const confirmResult = useCallback(() => {
    if (coins) {
      const sum = coins[0] + coins[1] + coins[2]
      onResult(sum, coins)
      setCoins(null)
    }
  }, [coins, onResult])

  const toggleManualCoin = (index: number) => {
    const newCoins = [...manualCoins]
    if (newCoins[index] === undefined) {
      newCoins[index] = 3
    } else {
      newCoins[index] = newCoins[index] === 3 ? 2 : 3
    }
    setManualCoins(newCoins)
  }

  const confirmManualResult = () => {
    if (manualCoins.length === 3 && manualCoins.every((c) => c !== undefined)) {
      const sum = manualCoins[0] + manualCoins[1] + manualCoins[2]
      onResult(sum, manualCoins)
      setManualCoins([])
    }
  }

  const lineValue = coins
    ? coins[0] + coins[1] + coins[2]
    : manualCoins.length === 3 && manualCoins.every((c) => c !== undefined)
      ? manualCoins[0] + manualCoins[1] + manualCoins[2]
      : null

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <p className="font-serif text-2xl font-light text-foreground">
          {'Line ' + round + ' of 6'}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {round <= 3 ? 'Lower Trigram' : 'Upper Trigram'}
        </p>
      </div>

      {mode === 'auto' ? (
        <>
          <div className="flex items-center gap-6">
            {flipping ? (
              <>
                <div className="flex h-16 w-16 animate-bounce items-center justify-center rounded-full border-2 border-primary/20 bg-muted">
                  <span className="text-lg text-muted-foreground">?</span>
                </div>
                <div
                  className="flex h-16 w-16 animate-bounce items-center justify-center rounded-full border-2 border-primary/20 bg-muted"
                  style={{ animationDelay: '100ms' }}
                >
                  <span className="text-lg text-muted-foreground">?</span>
                </div>
                <div
                  className="flex h-16 w-16 animate-bounce items-center justify-center rounded-full border-2 border-primary/20 bg-muted"
                  style={{ animationDelay: '200ms' }}
                >
                  <span className="text-lg text-muted-foreground">?</span>
                </div>
              </>
            ) : coins ? (
              coins.map((c, i) => (
                <CoinFace key={i} value={c} flipping={false} />
              ))
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted/50">
                  <span className="text-sm text-muted-foreground">1</span>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted/50">
                  <span className="text-sm text-muted-foreground">2</span>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted/50">
                  <span className="text-sm text-muted-foreground">3</span>
                </div>
              </>
            )}
          </div>

          {coins && lineValue !== null && (
            <div className="animate-in fade-in text-center">
              <p className="text-sm text-muted-foreground">
                {'Sum: ' + lineValue + ' — ' + getLineType(lineValue).label}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            {!coins ? (
              <Button
                onClick={flipCoins}
                disabled={flipping}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                {flipping ? 'Tossing...' : 'Toss Coins'}
              </Button>
            ) : (
              <Button
                onClick={confirmResult}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                Confirm & Continue
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="text-center text-sm text-muted-foreground">
            Tap each coin to toggle between Heads (H=3) and Tails (T=2)
          </p>
          <div className="flex items-center gap-6">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => toggleManualCoin(i)}
                className={`flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all ${
                  manualCoins[i] === 3
                    ? 'border-primary/30 bg-primary/20 text-primary'
                    : manualCoins[i] === 2
                      ? 'border-primary/30 bg-muted text-muted-foreground'
                      : 'border-dashed border-border bg-muted/50 text-muted-foreground'
                }`}
              >
                <span className="font-serif text-lg font-bold">
                  {manualCoins[i] === 3
                    ? 'H'
                    : manualCoins[i] === 2
                      ? 'T'
                      : '?'}
                </span>
              </button>
            ))}
          </div>

          {lineValue !== null && (
            <div className="animate-in fade-in text-center">
              <p className="text-sm text-muted-foreground">
                {'Sum: ' + lineValue + ' — ' + getLineType(lineValue).label}
              </p>
            </div>
          )}

          <Button
            onClick={confirmManualResult}
            disabled={
              manualCoins.length !== 3 ||
              !manualCoins.every((c) => c !== undefined)
            }
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            Confirm & Continue
          </Button>
        </>
      )}
    </div>
  )
}
