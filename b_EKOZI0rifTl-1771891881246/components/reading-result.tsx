'use client'

import type { Hexagram } from '@/lib/hexagrams'
import { HexagramDisplay } from '@/components/hexagram-display'
import { AlertTriangle } from 'lucide-react'

interface ReadingResultProps {
  hexagram: Hexagram
  lines: number[]
  question: string
}

function getQuestionAnalysis(hexagram: Hexagram, question: string): string {
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
  const analysis = getQuestionAnalysis(hexagram, question)

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

      {/* Question Analysis */}
      <div className="mb-8 rounded-lg border border-primary/20 bg-primary/5 p-6">
        <h3 className="mb-4 font-serif text-xl font-medium text-primary">
          Reading for Your Question
        </h3>
        <div className="mb-4 rounded-md border border-border bg-card/50 px-4 py-3">
          <p className="text-sm text-muted-foreground italic">
            {'"' + question + '"'}
          </p>
        </div>
        {analysis.split('\n\n').map((para, i) => (
          <p
            key={i}
            className="mb-3 leading-relaxed text-foreground/80 last:mb-0"
          >
            {para}
          </p>
        ))}
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
