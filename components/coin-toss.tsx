'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getLineType } from '@/lib/hexagrams'
import { startCastingFeedback } from '@/lib/casting-feedback'
import { coinTotal, emptyCoins, toggleCoin, tossThreeCoins, type CoinSelection, type CompleteCoins } from '@/lib/coin-utils'

interface CoinTossProps {
  round: number
  onResult: (value: number, coins: number[]) => void
  mode: 'auto' | 'manual'
  language?: 'zh' | 'en'
}

const chineseLineNames: Record<number, string> = {
  6: '老阴 · 动爻', 7: '少阳', 8: '少阴', 9: '老阳 · 动爻',
}

// Preserve input intent when a confirmed line remounts this component.
let lastInputMethod: 'keyboard' | 'pointer' | 'unknown' = 'unknown'

export function CoinToss({ round, onResult, mode, language = 'zh' }: CoinTossProps) {
  const zh = language === 'zh'
  const [coins, setCoins] = useState<CoinSelection>(emptyCoins)
  const [flipping, setFlipping] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stopFeedback = useRef<() => void>(() => {})
  const busy = useRef(false)
  const primaryAction = useRef<HTMLButtonElement>(null)
  const firstManualCoin = useRef<HTMLButtonElement>(null)
  const total = coinTotal(coins)

  useEffect(() => {
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = null
    stopFeedback.current()
    busy.current = false
    setCoins(emptyCoins())
    setFlipping(false)
    setConfirmed(false)
    if (round > 1 && lastInputMethod === 'keyboard') {
      const nextControl = mode === 'manual' ? firstManualCoin.current : primaryAction.current
      nextControl?.focus({ preventScroll: true })
    }
    return () => {
      if (timer.current !== null) clearTimeout(timer.current)
      timer.current = null
      stopFeedback.current()
    }
  }, [round, mode])

  useEffect(() => {
    if (mode !== 'auto' || flipping || total === null || lastInputMethod !== 'keyboard') return
    // Some browsers blur a button while it is disabled for the toss animation.
    // Restore it only if the visitor has not moved focus to another control.
    if (document.activeElement === document.body || document.activeElement === primaryAction.current) {
      primaryAction.current?.focus({ preventScroll: true })
    }
  }, [mode, flipping, total])

  const flipCoins = useCallback(() => {
    if (busy.current) return
    busy.current = true
    stopFeedback.current()
    stopFeedback.current = startCastingFeedback({
      classList: document.documentElement.classList,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      vibrate: typeof navigator.vibrate === 'function' ? navigator.vibrate.bind(navigator) : undefined,
    })
    setFlipping(true)
    setCoins(emptyCoins())
    timer.current = setTimeout(() => {
      stopFeedback.current()
      setCoins(tossThreeCoins())
      setFlipping(false)
      busy.current = false
      timer.current = null
    }, 750)
  }, [])

  const confirmResult = () => {
    if (busy.current || total === null) return
    busy.current = true
    setConfirmed(true)
    onResult(total, [...(coins as CompleteCoins)])
  }

  const updateManualCoin = (index: number) => {
    if (busy.current) return
    setCoins((current) => toggleCoin(current, index))
  }

  const summary = total === null
    ? flipping
      ? zh ? '钱币落定后，即可查看本爻。' : 'Let the coins settle to reveal this line.'
      : mode === 'manual'
        ? zh ? '请设置三枚钱币的正反面。' : 'Set the face of all three coins.'
        : zh ? '三枚钱币，一次成爻。' : 'Three coins. One line at a time.'
    : zh ? `合计 ${total} · ${chineseLineNames[total]}` : `Total ${total} · ${getLineType(total).label}`

  return (
    <div className="coin-stage" aria-busy={flipping}
      onPointerDownCapture={() => { lastInputMethod = 'pointer' }}
      onKeyDownCapture={() => { lastInputMethod = 'keyboard' }}>
      <div className="coin-round">
        <span>{zh ? `第 ${round} 爻 / 共 6 爻` : `Line ${round} of 6`}</span>
        <p>{round <= 3
          ? zh ? '下卦 · 从初爻开始，自下而上' : 'Lower trigram · building from the bottom'
          : zh ? '上卦 · 继续完成上方三爻' : 'Upper trigram · completing the upper three lines'}</p>
      </div>
      {mode === 'manual' && <p className="coin-help">{zh
        ? '投掷三枚实体钱币，再点击下方币面录入。再次点击可切换。'
        : 'Toss three physical coins, then tap each face below. Tap again to switch.'}</p>}
      <div className="coin-tray" role="group" aria-label={zh ? '三枚钱币' : 'Three coins'}>
        {coins.map((value, index) => {
          const face = value === 3 ? 'heads' : value === 2 ? 'tails' : 'empty'
          const faceText = value === 3 ? zh ? '正面，3 分' : 'Heads, 3 points'
            : value === 2 ? zh ? '反面，2 分' : 'Tails, 2 points' : zh ? '尚未设置' : 'not set'
          const label = zh
            ? `第 ${index + 1} 枚钱币：${faceText}${mode === 'manual' ? '，点击切换' : ''}`
            : `Coin ${index + 1}: ${faceText}${mode === 'manual' ? ', tap to switch' : ''}`
          const className = `coin-face is-${face}${flipping ? ' is-flipping' : ''}`
          const content = <>
            <span aria-hidden="true">{flipping ? '易' : value === 3 ? zh ? '阳' : 'H' : value === 2 ? zh ? '阴' : 'T' : '?'}</span>
            <small aria-hidden="true">{value === 3 ? zh ? '正面 · 3' : 'HEADS · 3' : value === 2 ? zh ? '反面 · 2' : 'TAILS · 2' : `0${index + 1}`}</small>
          </>
          return mode === 'manual' ? (
            <button key={index} type="button" className={className} aria-label={label}
              ref={index === 0 ? firstManualCoin : undefined}
              disabled={confirmed} onClick={() => updateManualCoin(index)}>{content}</button>
          ) : (
            <div key={index} className={className} role="img" aria-label={label}
              style={{ animationDelay: `${index * 90}ms` }}>{content}</div>
          )
        })}
      </div>
      <p className="coin-summary" aria-live="polite" aria-atomic="true">{summary}</p>
      {mode === 'auto' && total === null ? (
        <button ref={primaryAction} type="button" className="primary-button" onClick={flipCoins} disabled={flipping}>
          {flipping ? zh ? '投掷中…' : 'Casting…' : zh ? '投掷钱币' : 'Cast the coins'}
        </button>
      ) : (
        <button ref={primaryAction} type="button" className="primary-button" onClick={confirmResult} disabled={total === null || confirmed}>
          {confirmed ? zh ? '已记录' : 'Recorded' : round === 6
            ? zh ? '确认，查看卦象' : 'Confirm & reveal hexagram'
            : zh ? '确认，记录此爻' : 'Confirm this line'}
        </button>
      )}
      <p className="coin-help">{zh ? '正面记 3，反面记 2。核对后确认，进入下一爻。'
        : 'Heads = 3, tails = 2. Confirm each result to continue.'}</p>
    </div>
  )
}
