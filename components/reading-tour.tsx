'use client'

import { useEffect, useRef, useState } from 'react'
import type { Language } from './language-provider'
import './reading-tour.css'

const tourKey = 'eguide-reading-tour-v1'
type Box = { top: number; left: number; width: number; height: number }
const messages = [
  { zh: ['写下你的问题', '从一个具体问题开始。你可以自己输入，也可以选择下方的示例。'], en: ['Write your question', 'Start with one specific question. Type your own or choose an example below.'] },
  { zh: ['选择起卦方式', '输入问题后，选择系统投币，或用三枚实体钱币自行投掷并录入结果。'], en: ['Choose your method', 'After entering your question, choose digital coins or toss three physical coins and enter their faces.'] },
  { zh: ['投币六次，组成一卦', '每轮投掷三枚钱币并确认，重复六轮。六爻会由下向上逐步形成。'], en: ['Cast six lines', 'Cast three coins and confirm each round. Repeat six times to build a hexagram from bottom to top.'] },
  { zh: ['阅读你的卦象', '六轮完成后，查看本卦、变化的爻与解读。把它当作一个重新思考问题的起点。'], en: ['Explore your reading', 'After all six rounds, explore your hexagram, changing lines and interpretation as a starting point for reflection.'] },
] as const

export function ReadingTour({ language, ready }: { language: Language; ready: boolean }) {
  const [index, setIndex] = useState<number | null>(null)
  const [box, setBox] = useState<Box | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const zh = language === 'zh'

  useEffect(() => {
    if (!ready) return
    try { if (localStorage.getItem(tourKey) !== 'done') setIndex(0) } catch { setIndex(0) }
  }, [ready])
  useEffect(() => {
    if (index === null) return
    const target = document.querySelector<HTMLElement>(index === 0 ? '#reading-question' : `[data-tour-step="${index}"]`)
      || document.querySelector<HTMLElement>(`[data-tour-step="${index}"]`)
    if (!target) { setBox(null); return }
    const measure = () => {
      const rect = target.getBoundingClientRect()
      setBox({ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 })
    }
    // Run after the reading room's own initial scroll and focus effects.
    const frame = requestAnimationFrame(() => {
      const rect = target.getBoundingClientRect()
      const desiredTop = Math.min(150, Math.max(100, window.innerHeight * 0.18))
      window.scrollBy({ top: rect.top - desiredTop, behavior: 'instant' })
      measure()
    })
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', measure); window.removeEventListener('resize', measure) }
  }, [index])
  useEffect(() => { if (index !== null) dialogRef.current?.focus({ preventScroll: true }) }, [index])
  useEffect(() => {
    if (index === null) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') finish() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index])
  function finish() {
    try { localStorage.setItem(tourKey, 'done') } catch {}
    setIndex(null)
    setBox(null)
    triggerRef.current?.focus({ preventScroll: true })
  }
  return <>
    <button ref={triggerRef} className="quiet-button tour-open" type="button" onClick={() => setIndex(0)}>{zh ? '使用引导' : 'How to use'}</button>
    {index !== null && <div className="tour-overlay">
      {box && <div className="tour-spotlight" aria-hidden="true" style={{ top: box.top, left: box.left, width: box.width, height: box.height }}/>}
      {!box && <div className="tour-backdrop" aria-hidden="true"/>}
      <div className="tour-card" role="dialog" aria-labelledby="tour-title" aria-describedby="tour-description" tabIndex={-1} ref={dialogRef}>
        <div className="tour-card-top"><span>{zh ? '使用引导' : 'QUICK GUIDE'} · {index + 1} / {messages.length}</span><button type="button" onClick={finish}>{zh ? '跳过' : 'Skip'}</button></div>
        <h2 id="tour-title">{messages[index][language][0]}</h2>
        <p id="tour-description">{messages[index][language][1]}</p>
        <div className="tour-actions">{index > 0 && <button type="button" className="tour-back" onClick={() => setIndex(index - 1)}>{zh ? '上一步' : 'Back'}</button>}<button type="button" className="tour-next" onClick={() => index === messages.length - 1 ? finish() : setIndex(index + 1)}>{index === messages.length - 1 ? (zh ? '开始体验' : 'Start exploring') : (zh ? '下一步' : 'Next')} <span aria-hidden="true">↗</span></button></div>
      </div>
    </div>}
  </>
}
