'use client'

import { getLineType } from '@/lib/hexagrams'

interface LineProgressProps {
  completedLines: { value: number; coins: number[] }[]
  currentRound: number
}

export function LineProgress({
  completedLines,
  currentRound,
}: LineProgressProps) {
  return (
    <div className="mx-auto w-full max-w-xs">
      <div className="flex flex-col gap-2">
        {/* Render lines from 6 (top) down to 1 (bottom) */}
        {Array.from({ length: 6 }, (_, i) => {
          const lineNum = 6 - i
          const lineIdx = lineNum - 1
          const completed = completedLines[lineIdx]
          const isCurrent = lineNum === currentRound
          const isFuture = lineNum > currentRound

          if (completed) {
            const { type, changing } = getLineType(completed.value)
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="w-4 text-right text-xs text-muted-foreground">
                  {lineNum}
                </span>
                <div className="flex flex-1 items-center">
                  {type === 'yang' ? (
                    <div
                      className={`h-2 w-full rounded-sm ${
                        changing ? 'bg-primary' : 'bg-foreground/60'
                      }`}
                    />
                  ) : (
                    <div className="flex w-full gap-2">
                      <div
                        className={`h-2 flex-1 rounded-sm ${
                          changing ? 'bg-primary' : 'bg-foreground/60'
                        }`}
                      />
                      <div
                        className={`h-2 flex-1 rounded-sm ${
                          changing ? 'bg-primary' : 'bg-foreground/60'
                        }`}
                      />
                    </div>
                  )}
                </div>
                <span className="w-16 text-right text-xs text-muted-foreground">
                  {completed.value}
                </span>
              </div>
            )
          }

          return (
            <div key={i} className="flex items-center gap-3">
              <span
                className={`w-4 text-right text-xs ${isCurrent ? 'text-primary font-bold' : 'text-muted-foreground/40'}`}
              >
                {lineNum}
              </span>
              <div className="flex-1">
                <div
                  className={`h-2 w-full rounded-sm ${
                    isCurrent
                      ? 'animate-pulse border border-primary/40 bg-primary/10'
                      : 'bg-muted/40'
                  }`}
                />
              </div>
              <span className="w-16 text-right text-xs text-muted-foreground/40">
                {isCurrent ? '...' : isFuture ? '' : ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
