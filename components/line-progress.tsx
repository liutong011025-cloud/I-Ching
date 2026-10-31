'use client'

import { getLineType } from '@/lib/hexagrams'

interface LineProgressProps {
  completedLines: { value: number; coins: number[] }[]
  currentRound: number
  language?: 'zh' | 'en'
}

const chineseNames: Record<number, string> = { 6: '老阴，动爻', 7: '少阳', 8: '少阴', 9: '老阳，动爻' }

export function LineProgress({ completedLines, currentRound, language = 'zh' }: LineProgressProps) {
  const zh = language === 'zh'
  return (
    <div className="line-stack" role="list" aria-live="polite" aria-relevant="text"
      aria-label={zh ? '六爻进度，由上爻至初爻排列' : 'Hexagram progress, displayed from top to bottom'}>
      {Array.from({ length: 6 }, (_, index) => {
        const lineNumber = 6 - index
        const completed = completedLines[lineNumber - 1]
        const isCurrent = lineNumber === currentRound && !completed
        const line = completed ? getLineType(completed.value) : null
        const label = completed
          ? zh ? `第 ${lineNumber} 爻：${chineseNames[completed.value]}，${completed.value}` : `Line ${lineNumber}: ${line?.label}, ${completed.value}`
          : zh ? `第 ${lineNumber} 爻：${isCurrent ? '正在生成' : '尚未完成'}` : `Line ${lineNumber}: ${isCurrent ? 'current line' : 'not yet cast'}`
        return (
          <div key={lineNumber} className={`line-row${isCurrent ? ' is-current' : ''}`}
            role="listitem" aria-label={label} aria-current={isCurrent ? 'step' : undefined}>
            <span className="line-number" aria-hidden="true">{String(lineNumber).padStart(2, '0')}</span>
            <div className="line-bars" aria-hidden="true">
              {line ? line.type === 'yang'
                ? <span className={`line-bar${line.changing ? ' changing' : ''}`} />
                : <><span className={`line-bar${line.changing ? ' changing' : ''}`} /><span className={`line-bar${line.changing ? ' changing' : ''}`} /></>
                : <span className="line-bar waiting" />}
            </div>
            <span className="line-value" aria-hidden="true">{completed ? completed.value : isCurrent ? '·' : ''}</span>
          </div>
        )
      })}
    </div>
  )
}
