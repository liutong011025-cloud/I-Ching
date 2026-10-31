const KEY = 'eguide-result-v1'
export const READING_CACHE_TTL_MS = 20 * 60_000

type ResultCache = {
  id: string
  updatedAt: number
  answers: Partial<Record<'zh' | 'en', string>>
  image?: string
}
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
const isText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0

export function readResultCache(id: string): ResultCache | null {
  try {
    const cached: unknown = JSON.parse(sessionStorage.getItem(KEY) || 'null')
    const now = Date.now()
    if (!isRecord(cached) || cached.id !== id || typeof cached.updatedAt !== 'number' ||
        !Number.isFinite(cached.updatedAt) || cached.updatedAt > now ||
        now - cached.updatedAt > READING_CACHE_TTL_MS || !isRecord(cached.answers)) return null
    if ((cached.answers.zh !== undefined && !isText(cached.answers.zh)) ||
        (cached.answers.en !== undefined && !isText(cached.answers.en)) ||
        (cached.image !== undefined && !isText(cached.image))) return null
    const answers: ResultCache['answers'] = {}
    if (isText(cached.answers.zh)) answers.zh = cached.answers.zh
    if (isText(cached.answers.en)) answers.en = cached.answers.en
    return {
      id, updatedAt: cached.updatedAt, answers,
      ...(isText(cached.image) ? { image: cached.image } : {}),
    }
  } catch { return null }
}

export function cacheResult(id: string, patch: { language?: 'zh' | 'en'; answer?: string; image?: string }) {
  try {
    const previous = readResultCache(id)
    const answers = { ...previous?.answers }
    if ((patch.language === 'zh' || patch.language === 'en') && isText(patch.answer)) answers[patch.language] = patch.answer
    const image = isText(patch.image) ? patch.image : previous?.image
    const result: ResultCache = { id, updatedAt: Date.now(), answers, ...(image ? { image } : {}) }
    sessionStorage.setItem(KEY, JSON.stringify(result))
  } catch {}
}

export function clearResultCache() {
  try { sessionStorage.removeItem(KEY) } catch {}
}

export function invalidateCachedResult(id: string, kind: 'text' | 'image', language: 'zh' | 'en') {
  try {
    const cached = readResultCache(id)
    if (!cached) return
    const answers = { ...cached.answers }
    if (kind === 'text') delete answers[language]
    const image = kind === 'image' ? undefined : cached.image
    if (!image && !answers.zh && !answers.en) {
      sessionStorage.removeItem(KEY)
      return
    }
    sessionStorage.setItem(KEY, JSON.stringify({
      id, updatedAt: cached.updatedAt, answers, ...(image ? { image } : {}),
    }))
  } catch {}
}
