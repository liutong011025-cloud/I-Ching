import type { Hexagram } from './hexagrams'
import { getHexagramInterpretation, type AiLanguage } from './dify'
import { generateHexagramImage } from './volcengine'
import { cacheResult, clearResultCache, invalidateCachedResult, readResultCache, READING_CACHE_TTL_MS } from './reading-cache'

type ReadingJob = { promise: Promise<string>; expiresAt?: number; invalidated?: boolean }
const jobs = new Map<string, ReadingJob>()
const MAX_COMPLETED_JOBS = 12
let epoch = 0

function pruneJobs() {
  const now = Date.now()
  for (const [key, job] of jobs) {
    if (job.expiresAt !== undefined && job.expiresAt < now) jobs.delete(key)
  }
  const completed = [...jobs].filter(([, job]) => job.expiresAt !== undefined)
  for (const [key] of completed.slice(0, Math.max(0, completed.length - MAX_COMPLETED_JOBS))) jobs.delete(key)
}

/** Share work across effect cleanup/remounts. A component only cancels its own state update. */
export function getReadingJob(
  kind: 'text' | 'image', hexagram: Hexagram, question: string, language: AiLanguage,
): Promise<string> {
  pruneJobs()
  const id = JSON.stringify([hexagram.number, question])
  const key = JSON.stringify([kind, id, kind === 'text' ? language : 'shared'])
  const existing = jobs.get(key)
  if (existing) return existing.promise

  const cached = readResultCache(id)
  const value = kind === 'text' ? cached?.answers[language] : cached?.image
  if (value && cached) {
    const promise = Promise.resolve(value)
    jobs.set(key, { promise, expiresAt: cached.updatedAt + READING_CACHE_TTL_MS })
    pruneJobs()
    return promise
  }

  const currentEpoch = epoch
  const job: ReadingJob = { promise: Promise.resolve('') }
  const request = kind === 'text'
    ? getHexagramInterpretation(hexagram, question, language)
    : generateHexagramImage(hexagram, question, language)
  job.promise = request.then(result => {
    if (currentEpoch === epoch && !job.invalidated) {
      cacheResult(id, kind === 'text' ? { language, answer: result } : { image: result })
      job.expiresAt = Date.now() + READING_CACHE_TTL_MS
      pruneJobs()
    }
    return result
  }).catch(error => {
    if (jobs.get(key) === job) jobs.delete(key)
    throw error
  })
  jobs.set(key, job)
  return job.promise
}

/** Old in-flight requests may finish, but can no longer restore a cleared reading. */
export function clearReadingJobs() {
  epoch++
  jobs.clear()
  clearResultCache()
}

/** Discard a broken image URL or one language's reading while keeping other successful content. */
export function invalidateReadingJob(
  kind: 'text' | 'image', hexagram: Hexagram, question: string, language: AiLanguage,
) {
  const id = JSON.stringify([hexagram.number, question])
  const key = JSON.stringify([kind, id, kind === 'text' ? language : 'shared'])
  const existing = jobs.get(key)
  if (existing) existing.invalidated = true
  jobs.delete(key)
  invalidateCachedResult(id, kind, language)
}
