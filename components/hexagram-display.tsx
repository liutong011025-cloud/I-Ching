'use client'

import { getLineType } from '@/lib/hexagrams'

interface HexagramDisplayProps {
  lines: number[]
  size?: 'sm' | 'lg'
  animated?: boolean
}

export function HexagramDisplay({
  lines,
  size = 'lg',
  animated = false,
}: HexagramDisplayProps) {
  const lineHeight = size === 'lg' ? 'h-3' : 'h-2'
  const gap = size === 'lg' ? 'gap-3' : 'gap-2'
  const width = size === 'lg' ? 'w-48' : 'w-32'

  // Render from top (line 6) to bottom (line 1)
  const reversedLines = [...lines].reverse()

  return (
    <div className={`flex flex-col ${gap} ${width} mx-auto`}>
      {reversedLines.map((value, idx) => {
        const { type, changing } = getLineType(value)
        const lineIndex = lines.length - 1 - idx
        const delay = animated ? `${lineIndex * 150}ms` : '0ms'

        return (
          <div
            key={idx}
            className={`flex items-center ${lineHeight} ${animated ? 'animate-in fade-in slide-in-from-bottom-2' : ''}`}
            style={{ animationDelay: delay, animationFillMode: 'both' }}
          >
            {type === 'yang' ? (
              <div
                className={`w-full ${lineHeight} rounded-sm ${
                  changing
                    ? 'bg-primary shadow-[0_0_12px_rgba(200,160,60,0.5)]'
                    : 'bg-foreground'
                }`}
              />
            ) : (
              <div className="flex w-full gap-3">
                <div
                  className={`flex-1 ${lineHeight} rounded-sm ${
                    changing
                      ? 'bg-primary shadow-[0_0_12px_rgba(200,160,60,0.5)]'
                      : 'bg-foreground'
                  }`}
                />
                <div
                  className={`flex-1 ${lineHeight} rounded-sm ${
                    changing
                      ? 'bg-primary shadow-[0_0_12px_rgba(200,160,60,0.5)]'
                      : 'bg-foreground'
                  }`}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
