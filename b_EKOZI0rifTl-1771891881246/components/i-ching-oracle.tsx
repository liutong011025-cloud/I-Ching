'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { CoinToss } from '@/components/coin-toss'
import { ReadingResult } from '@/components/reading-result'
import { LineProgress } from '@/components/line-progress'
import { getHexagramFromLines, type Hexagram } from '@/lib/hexagrams'
import { RotateCcw } from 'lucide-react'

type Step = 'question' | 'method' | 'tossing' | 'result'

export function IChingOracle() {
  const [step, setStep] = useState<Step>('question')
  const [question, setQuestion] = useState('')
  const [mode, setMode] = useState<'auto' | 'manual'>('auto')
  const [completedLines, setCompletedLines] = useState<
    { value: number; coins: number[] }[]
  >([])
  const [currentRound, setCurrentRound] = useState(1)
  const [hexagram, setHexagram] = useState<Hexagram | null>(null)

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim()) {
      setStep('method')
    }
  }

  const handleModeSelect = (selectedMode: 'auto' | 'manual') => {
    setMode(selectedMode)
    setStep('tossing')
  }

  const handleLineResult = useCallback(
    (value: number, coins: number[]) => {
      const newLines = [...completedLines, { value, coins }]
      setCompletedLines(newLines)

      if (newLines.length === 6) {
        const lineValues = newLines.map((l) => l.value)
        const result = getHexagramFromLines(lineValues)
        setHexagram(result)
        setTimeout(() => setStep('result'), 600)
      } else {
        setCurrentRound(currentRound + 1)
      }
    },
    [completedLines, currentRound]
  )

  const handleReset = () => {
    setStep('question')
    setQuestion('')
    setMode('auto')
    setCompletedLines([])
    setCurrentRound(1)
    setHexagram(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 py-6">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="font-serif text-3xl font-light tracking-wide text-foreground md:text-4xl">
            I Ching Oracle
          </h1>
          <p className="mt-1 text-sm tracking-[0.2em] text-muted-foreground uppercase">
            Book of Changes
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        {/* Step Indicator */}
        {step !== 'result' && (
          <div className="mb-10 flex items-center justify-center gap-2">
            {(['question', 'method', 'tossing'] as const).map(
              (s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                      step === s
                        ? 'bg-primary text-primary-foreground'
                        : i <
                            ['question', 'method', 'tossing'].indexOf(step)
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < 2 && (
                    <div
                      className={`h-px w-10 md:w-16 ${
                        i < ['question', 'method', 'tossing'].indexOf(step)
                          ? 'bg-primary/40'
                          : 'bg-border'
                      }`}
                    />
                  )}
                </div>
              )
            )}
          </div>
        )}

        {/* STEP 1: Question */}
        {step === 'question' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
                Ask Your Question
              </h2>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground leading-relaxed">
                Focus your mind and ask a single, clear question. The I Ching
                responds best to open-ended inquiries about situations and paths
                forward.
              </p>
            </div>

            <form
              onSubmit={handleQuestionSubmit}
              className="mx-auto mt-8 max-w-lg"
            >
              <div className="relative">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What guidance do I seek today..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-border bg-card px-4 py-3 font-serif text-lg text-card-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div className="mt-4 flex justify-center">
                <Button
                  type="submit"
                  disabled={!question.trim()}
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
                >
                  Proceed to Divination
                </Button>
              </div>
            </form>

            <div className="mt-10 text-center">
              <p className="text-xs text-muted-foreground/60">
                Examples: &ldquo;What should I focus on in my career?&rdquo;
                &bull; &ldquo;How can I improve my relationships?&rdquo; &bull;
                &ldquo;What does the coming period hold for me?&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Method Selection */}
        {step === 'method' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
                Choose Your Method
              </h2>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground leading-relaxed">
                The three-coin method is used to cast each of the six lines that
                form your hexagram.
              </p>
            </div>

            <div className="mx-auto mt-8 grid max-w-lg gap-4">
              <button
                onClick={() => handleModeSelect('auto')}
                className="group rounded-lg border border-border bg-card p-6 text-left transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                <h3 className="font-serif text-xl font-medium text-card-foreground group-hover:text-primary">
                  System Coin Toss
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Let the oracle cast the coins for you digitally. You simply
                  press &ldquo;Toss&rdquo; for each of the six lines. Quick and
                  convenient.
                </p>
              </button>

              <button
                onClick={() => handleModeSelect('manual')}
                className="group rounded-lg border border-border bg-card p-6 text-left transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                <h3 className="font-serif text-xl font-medium text-card-foreground group-hover:text-primary">
                  Manual Coin Entry
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Toss three real coins yourself and enter the results here.
                  Heads = 3, Tails = 2. For the traditional, hands-on
                  experience.
                </p>
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setStep('question')}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Back to question
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Coin Tossing */}
        {step === 'tossing' && (
          <div className="animate-in fade-in duration-300">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Left: Coin Toss Area */}
              <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-6 md:p-8">
                <CoinToss
                  round={currentRound}
                  onResult={handleLineResult}
                  mode={mode}
                />
              </div>

              {/* Right: Progress */}
              <div className="rounded-lg border border-border bg-card p-6 md:p-8">
                <h3 className="mb-6 text-center font-serif text-lg font-medium text-card-foreground">
                  Hexagram Progress
                </h3>
                <LineProgress
                  completedLines={completedLines}
                  currentRound={currentRound}
                />
                <div className="mt-6 border-t border-border pt-4">
                  <div className="text-center text-xs text-muted-foreground">
                    <p className="mb-1">
                      <span className="font-medium">6</span> = Old Yin
                      (changing) &bull;{' '}
                      <span className="font-medium">7</span> = Young Yang
                    </p>
                    <p>
                      <span className="font-medium">8</span> = Young Yin &bull;{' '}
                      <span className="font-medium">9</span> = Old Yang
                      (changing)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Result */}
        {step === 'result' && hexagram && (
          <div>
            <ReadingResult
              hexagram={hexagram}
              lines={completedLines.map((l) => l.value)}
              question={question}
            />

            <div className="mt-10 flex justify-center">
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="gap-2 border-border text-foreground hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4" />
                Ask Another Question
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="mx-auto max-w-3xl px-4 text-center text-xs text-muted-foreground/60 leading-relaxed">
          <p>
            Based on the I Ching (Yi Jing), the ancient Chinese Book of Changes.
            This tool is for entertainment and contemplation only. Results are
            randomly generated and should not be relied upon for any decisions.
          </p>
        </div>
      </footer>
    </div>
  )
}
