const KEY = 'eguide-result-v1'
type CacheScope = 'default' | 'lines'
const storageKey = (scope: CacheScope) => scope === 'lines' ? `${KEY}-lines` : KEY
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

export function readResultCache(id: string, scope: CacheScope = 'default'): ResultCache | null {
  try {
    const cached: unknown = JSON.parse(sessionStorage.getItem(storageKey(scope)) || 'null')
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

export function cacheResult(id: string, patch: { language?: 'zh' | 'en'; answer?: string; image?: string }, scope: CacheScope = 'default') {
  try {
    const previous = readResultCache(id, scope)
    const answers = { ...previous?.answers }
    if ((patch.language === 'zh' || patch.language === 'en') && isText(patch.answer)) answers[patch.language] = patch.answer
    const image = isText(patch.image) ? patch.image : previous?.image
    const result: ResultCache = { id, updatedAt: Date.now(), answers, ...(image ? { image } : {}) }
    sessionStorage.setItem(storageKey(scope), JSON.stringify(result))
  } catch {}
}

export function clearResultCache() {
  try { sessionStorage.removeItem(KEY); sessionStorage.removeItem(storageKey('lines')) } catch {}
}

export function invalidateCachedResult(id: string, kind: 'text' | 'image', language: 'zh' | 'en', scope: CacheScope = 'default') {
  try {
    const cached = readResultCache(id, scope)
    if (!cached) return
    const answers = { ...cached.answers }
    if (kind === 'text') delete answers[language]
    const image = kind === 'image' ? undefined : cached.image
    if (!image && !answers.zh && !answers.en) {
      sessionStorage.removeItem(storageKey(scope))
      return
    }
    sessionStorage.setItem(storageKey(scope), JSON.stringify({
      id, updatedAt: cached.updatedAt, answers, ...(image ? { image } : {}),
    }))
  } catch {}
}
