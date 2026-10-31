'use client'

import { useEffect, useRef, useState } from 'react'
import type { Language } from './language-provider'
import './reading-tour.css'

const tourKey = 'eguide-reading-tour-v1'
type Box = { top: number; left: number; width: number; height: number }
type Phase = 'overview' | 'method' | 'cast'
type TourStep = { selector: string; fallback?: string; zh: readonly [string, string]; en: readonly [string, string] }
const overview: TourStep[] = [
  { selector: '#reading-question', fallback: '[data-tour-step="0"]', zh: ['写下你的问题', '从一个具体问题开始。你可以自己输入，也可以选择下方的示例。'], en: ['Write your question', 'Start with one specific question. Type your own or choose an example below.'] },
  { selector: '[data-tour-step="1"]', zh: ['选择起卦方式', '输入问题后，选择系统投币，或用三枚实体钱币自行投掷并录入结果。'], en: ['Choose your method', 'After entering your question, choose digital coins or toss three physical coins and enter their faces.'] },
  { selector: '[data-tour-step="2"]', zh: ['投币六次，组成一卦', '每轮投掷三枚钱币并确认，重复六轮。六爻会由下向上逐步形成。'], en: ['Cast six lines', 'Cast three coins and confirm each round. Repeat six times to build a hexagram from bottom to top.'] },
  { selector: '[data-tour-step="3"]', zh: ['阅读你的卦象', '六轮完成后，查看本卦、变化的爻与解读。把它当作一个重新思考问题的起点。'], en: ['Explore your reading', 'After all six rounds, explore your hexagram, changing lines and interpretation as a starting point for reflection.'] },
]
const methodSteps: TourStep[] = [
  { selector: '[data-tour-method="auto"]', zh: ['选择系统投币', '点击这里，让系统为你投掷三枚钱币。适合随时开始。'], en: ['Choose digital coins', 'Select this option to have the system cast three coins for you.'] },
  { selector: '[data-tour-method="manual"]', zh: ['或者亲手投币', '如果你有三枚实体钱币，点击这里，投掷后逐枚录入正反面。'], en: ['Or use your own coins', 'If you have three physical coins, select this option and enter each face after tossing.'] },
]
const castStep = (mode: 'auto' | 'manual'): TourStep => mode === 'auto'
  ? { selector: '[data-tour-cast]', zh: ['点击投掷钱币', '点击这里投掷三枚钱币。落定后确认此爻，重复六轮即可查看卦象。'], en: ['Cast your coins', 'Select this button to cast three coins. Confirm the line after they settle and repeat for six rounds.'] }
  : { selector: '[data-tour-manual-coin]', zh: ['录入每枚钱币', '先投掷三枚实体钱币，再点击这里录入第一枚的正反面，并依次设置另外两枚。确认后进入下一爻，共六轮。'], en: ['Enter each coin', 'Toss your three physical coins, then select this coin and set its face. Set the other two, then confirm each of six rounds.'] }

export function ReadingTour({ language, ready, step, mode }: { language: Language; ready: boolean; step: string; mode: 'auto' | 'manual' }) {
  const [index, setIndex] = useState<number | null>(null)
  const [phase, setPhase] = useState<Phase>('overview')
  const [box, setBox] = useState<Box | null>(null)
  const [initialized, setInitialized] = useState(false)
  const completed = useRef(new Set<string>())
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const zh = language === 'zh'
  const steps = phase === 'overview' ? overview : phase === 'method' ? methodSteps : [castStep(mode)]
  const current = index === null ? null : steps[index]
  const has = (name: string) => {
    if (completed.current.has(name)) return true
    try { return localStorage.getItem(`${tourKey}-${name}`) === 'done' } catch { return false }
  }
  const mark = (name: string) => {
    completed.current.add(name)
    try { localStorage.setItem(`${tourKey}-${name}`, 'done') } catch {}
  }
  useEffect(() => {
    if (!ready) return
    // Earlier versions already recorded a completed or skipped overview here.
    let done = has('overview')
    try { done = done || localStorage.getItem(tourKey) === 'done' } catch {}
    if (!done) { setPhase('overview'); setIndex(0) }
    else mark('overview')
    setInitialized(true)
  }, [ready])
  useEffect(() => {
    if (!initialized || index !== null || has('skipped')) return
    const next = step === 'method' ? 'method' : step === 'tossing' ? 'cast' : null
    if (next && !has(next)) { setPhase(next); setIndex(0) }
  }, [step, initialized, index])
  useEffect(() => {
    if (!current) return
    const target = document.querySelector<HTMLElement>(current.selector) || (current.fallback ? document.querySelector<HTMLElement>(current.fallback) : null)
    if (!target) { setBox(null); return }
    const measure = () => {
      const rect = target.getBoundingClientRect()
      setBox({ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 })
    }
    const frame = requestAnimationFrame(() => {
      const rect = target.getBoundingClientRect()
      const desiredTop = Math.min(150, Math.max(100, window.innerHeight * 0.18))
      window.scrollBy({ top: rect.top - desiredTop, behavior: 'instant' })
      measure()
    })
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', measure); window.removeEventListener('resize', measure) }
  }, [index, phase, mode])
  useEffect(() => { if (index !== null) dialogRef.current?.focus({ preventScroll: true }) }, [index, phase])
  useEffect(() => {
    if (index === null) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') skip() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, phase])
  // If the visitor uses the highlighted real control, let that action proceed
  // exactly once and dismiss the hint before the reading advances.
  useEffect(() => {
    if (index === null || phase === 'overview') return
    const onControlClick = (event: MouseEvent) => {
      const element = event.target instanceof Element ? event.target : null
      const selector = phase === 'method' ? '[data-tour-method]' : mode === 'manual' ? '[data-tour-manual-coin]' : '[data-tour-cast]'
      if (!element?.closest(selector)) return
      mark(phase)
      setIndex(null)
      setBox(null)
    }
    document.addEventListener('click', onControlClick, true)
    return () => document.removeEventListener('click', onControlClick, true)
  }, [index, phase, mode])
  function close() { setIndex(null); setBox(null); triggerRef.current?.focus({ preventScroll: true }) }
  function finish() {
    const target = phase !== 'overview' && current ? document.querySelector<HTMLElement>(current.selector) : null
    mark(phase); close()
    if (target) target.focus({ preventScroll: true })
  }
  function skip() { mark('overview'); mark('skipped'); close() }
  function restart() {
    for (const name of ['overview', 'method', 'cast', 'skipped']) {
      completed.current.delete(name)
      try { localStorage.removeItem(`${tourKey}-${name}`) } catch {}
    }
    try { localStorage.removeItem(tourKey) } catch {}
    setPhase('overview'); setIndex(0)
  }
  return <>
    <button ref={triggerRef} className="quiet-button tour-open" type="button" onClick={restart}>{zh ? '使用引导' : 'How to use'}</button>
    {current && index !== null && <div className="tour-overlay">
      {box && <div className="tour-spotlight" aria-hidden="true" style={{ top: box.top, left: box.left, width: box.width, height: box.height }}/>}
      {!box && <div className="tour-backdrop" aria-hidden="true"/>}
      <div className="tour-card" role="dialog" aria-labelledby="tour-title" aria-describedby="tour-description" tabIndex={-1} ref={dialogRef}>
        <div className="tour-card-top"><span>{zh ? '使用引导' : 'QUICK GUIDE'} · {index + 1} / {steps.length}</span><button type="button" onClick={skip}>{zh ? '跳过引导' : 'Skip guide'}</button></div>
        <h2 id="tour-title">{current[language][0]}</h2>
        <p id="tour-description">{current[language][1]}</p>
        <div className="tour-actions">{index > 0 && <button type="button" className="tour-back" onClick={() => setIndex(index - 1)}>{zh ? '上一步' : 'Back'}</button>}<button type="button" className="tour-next" onClick={() => index === steps.length - 1 ? finish() : setIndex(index + 1)}>{index === steps.length - 1 ? (phase === 'overview' ? (zh ? '开始体验' : 'Start exploring') : (zh ? '知道了' : 'Got it')) : (zh ? '下一步' : 'Next')} <span aria-hidden="true">↗</span></button></div>
      </div>
    </div>}
  </>
}
