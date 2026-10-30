interface CastingFeedbackEnvironment {
  classList: Pick<DOMTokenList, 'add' | 'remove'>
  reducedMotion: boolean
  vibrate?: (pattern: number | number[]) => unknown
}

/** Starts gesture-bound feedback and returns an idempotent cleanup function. */
export function startCastingFeedback({ classList, reducedMotion, vibrate }: CastingFeedbackEnvironment): () => void {
  if (reducedMotion) return () => {}
  classList.add('is-casting')
  // Short pulses and pauses total 470 ms; vibration intensity is device-controlled.
  try { vibrate?.([30, 70, 35, 75, 35, 85, 30, 80, 30]) } catch {}
  let stopped = false
  return () => {
    if (stopped) return
    stopped = true
    classList.remove('is-casting')
    try { vibrate?.(0) } catch {}
  }
}
