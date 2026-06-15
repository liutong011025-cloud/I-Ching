'use client'

import { useState, useEffect } from 'react'
import type { Hexagram } from '@/lib/hexagrams'
import { HexagramDisplay } from '@/components/hexagram-display'
import { getHexagramInterpretation } from '@/lib/dify'
import { generateHexagramImage } from '@/lib/volcengine'
import { saveHexagramImage } from '@/lib/save-hexagram-image'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Download, ImageIcon, Loader2 } from 'lucide-react'

interface ReadingResultProps {
  hexagram: Hexagram
  lines: number[]
  question: string
}

function getQuestionAnalysisFallback(hexagram: Hexagram, question: string): string {
  const ratingAdvice: Record<string, string> = {
    'Highly Auspicious':
      'This is an extremely favorable reading for your question. The energies are aligned in your favor. Conditions suggest a strong potential for positive outcomes. Move forward with confidence, but remain thoughtful in your approach.',
    Auspicious:
      'The reading is positive for your question. Favorable conditions exist, though mindful action is still required. Trust in the process and maintain your current direction.',
    Favorable:
      'The reading leans positively for your question. There are supportive forces at work, but they require your active participation. Stay focused, adapt when necessary, and maintain a constructive attitude.',
    Moderate:
      'This is a balanced reading for your question. Neither strongly positive nor negative, it suggests a period of equilibrium and transition. Patience, careful observation, and measured action are advised. Wait for clearer signs before making major decisions.',
    'Moderate Challenge':
      'This reading suggests some obstacles or complications related to your question. However, challenges are not failures — they are opportunities for growth and learning. Proceed with caution, seek counsel, and be prepared to adapt your approach.',
    Challenging:
      'The reading indicates significant obstacles ahead regarding your question. This is not necessarily negative — sometimes the greatest growth comes through difficulty. Exercise extreme patience, avoid impulsive decisions, and consider waiting for a more favorable time to act.',
  }

  const baseAdvice =
    ratingAdvice[hexagram.rating] || ratingAdvice['Moderate']

  const trigramWisdom = `The ${hexagram.lowerTrigram} below meeting ${hexagram.upperTrigram} above creates the dynamic of "${hexagram.subtitle}." In relation to your inquiry — "${question}" — this configuration speaks to the interplay of forces currently at work in your situation.`

  return `${trigramWisdom}\n\n${baseAdvice}\n\nThe ancient image says: "${hexagram.image}" Reflect on how this metaphor applies to your current circumstances and the question you have posed.`
}

export function ReadingResult({
  hexagram,
  lines,
  question,
}: ReadingResultProps) {
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(true)
  const [aiError, setAiError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState<string | null>(null)
  const [savingImage, setSavingImage] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setAiLoading(true)
    setAiError(null)
    setAiInterpretation(null)
    setImageLoading(true)
    setImageError(null)
    setImageUrl(null)

    getHexagramInterpretation(hexagram, question)
      .then((answer) => {
        if (!cancelled) {
          setAiInterpretation(answer)
          setAiError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setAiError(err instanceof Error ? err.message : String(err))
          setAiInterpretation(null)
        }
      })
      .finally(() => {
        if (!cancelled) setAiLoading(false)
      })

    generateHexagramImage(hexagram, question)
      .then((url) => {
        if (!cancelled) {
          setImageUrl(url)
          setImageError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setImageError(err instanceof Error ? err.message : String(err))
          setImageUrl(null)
        }
      })
      .finally(() => {
        if (!cancelled) setImageLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [hexagram.number, question])

  const fallbackAnalysis = getQuestionAnalysisFallback(hexagram, question)
  const displayContent = aiInterpretation ?? fallbackAnalysis

  const handleSaveImage = async () => {
    if (!imageUrl || savingImage) return
    setSavingImage(true)
    setSaveError(null)
    try {
      const filename = `yi-guide-hexagram-${hexagram.number}-${hexagram.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
      await saveHexagramImage(imageUrl, filename)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSavingImage(false)
    }
  }

  const ratingColor: Record<string, string> = {
    'Highly Auspicious': 'text-primary',
    Auspicious: 'text-primary',
    Favorable: 'text-primary/80',
    Moderate: 'text-muted-foreground',
    'Moderate Challenge': 'text-destructive/80',
    Challenging: 'text-destructive',
  }

  return (
    <div className="mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hexagram Header */}
      <div className="mb-10 text-center">
        <p className="mb-2 text-sm tracking-[0.3em] text-muted-foreground uppercase">
          Your Hexagram
        </p>
        <h2 className="font-serif text-5xl font-light text-foreground md:text-6xl">
          {hexagram.chineseName}
        </h2>
        <p className="mt-2 font-serif text-2xl text-foreground/80">
          {'Hexagram ' + hexagram.number + ' — ' + hexagram.name}
        </p>
        <p className="mt-1 text-lg text-muted-foreground">
          {hexagram.subtitle}
        </p>
        <p className={`mt-3 text-sm font-medium ${ratingColor[hexagram.rating] || 'text-muted-foreground'}`}>
          {hexagram.rating}
        </p>
      </div>

      {/* Hexagram Lines Visual */}
      <div className="mb-10">
        <HexagramDisplay lines={lines} size="lg" animated />
      </div>

      {/* Hexagram Description */}
      <div className="mb-8 rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 font-serif text-xl font-medium text-foreground">
          About This Hexagram
        </h3>
        <p className="leading-relaxed text-foreground/80">
          {hexagram.description}
        </p>
      </div>

      {/* Question Analysis（AI 解读 + 意境图） */}
      <div className="mb-8 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:p-6">
        <h3 className="mb-4 font-serif text-xl font-medium text-primary">
          Reading for Your Question
        </h3>
        <div className="mb-4 rounded-md border border-border bg-card/50 px-4 py-3">
          <p className="text-sm text-muted-foreground italic">
            {'"' + question + '"'}
          </p>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="min-w-0 flex-1">
            {aiLoading ? (
              <div className="flex items-center gap-3 py-4 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>AI 正在解读卦象…</span>
              </div>
            ) : (
              <>
                {aiError != null && (
                  <p className="mb-3 text-sm text-amber-600 dark:text-amber-500">
                    未能获取 AI 解读（{aiError}），以下为默认解读：
                  </p>
                )}
                {displayContent
                  .split(/\n\n+/)
                  .filter(Boolean)
                  .map((para, i) => (
                    <p
                      key={i}
                      className="mb-3 leading-relaxed text-foreground/80 last:mb-0"
                    >
                      {para}
                    </p>
                  ))}
              </>
            )}
          </div>

          <div className="mx-auto w-full max-w-[320px] shrink-0 md:mx-0 md:max-w-[280px] lg:max-w-[300px]">
            <div className="rounded-lg border border-border/60 bg-card/80 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/50 px-3 py-2">
                <ImageIcon className="h-4 w-4 text-primary/70" />
                <span className="text-xs font-medium tracking-wide text-muted-foreground">
                  Hexagram Vision
                </span>
              </div>
              <div className="p-2">
                {imageLoading ? (
                  <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 rounded-md bg-muted/30 px-4 py-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
                    <span className="text-xs text-muted-foreground">
                      Generating vision…
                    </span>
                  </div>
                ) : imageUrl ? (
                  <div className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={`${hexagram.name} hexagram vision`}
                      className="block h-auto w-full rounded-md"
                      loading="lazy"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 w-full touch-manipulation"
                      onClick={handleSaveImage}
                      disabled={savingImage}
                    >
                      {savingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      {savingImage ? 'Saving…' : 'Save Image'}
                    </Button>
                    {saveError != null && (
                      <p className="text-center text-xs text-amber-600 dark:text-amber-500">
                        {saveError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex min-h-[160px] items-center justify-center rounded-md bg-muted/20 px-3 py-6 text-center">
                    <p className="text-xs text-muted-foreground">
                      {imageError
                        ? `Vision generation failed (${imageError})`
                        : 'No vision available'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
          <div>
            <h4 className="mb-2 text-sm font-semibold text-destructive">
              Important Disclaimer
            </h4>
            <p className="text-sm leading-relaxed text-foreground/70">
              This I Ching reading is provided for entertainment and
              contemplation purposes only. It is based on an ancient Chinese
              divination system and should not be treated as factual,
              professional, or reliable advice. Do not make important life
              decisions — including financial, medical, legal, or personal
              choices — based on this reading. The results are generated
              randomly and carry no predictive validity. Always consult
              qualified professionals for matters of significance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
