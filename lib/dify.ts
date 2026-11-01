import type { Hexagram } from './hexagrams'

export type AiLanguage = 'zh' | 'en'
export interface AiRequestOptions { signal?: AbortSignal; lines?: number[] }

export class AiRequestError extends Error {
  constructor(message: string, public readonly code: string, public readonly retryable: boolean) {
    super(message)
    this.name = 'AiRequestError'
  }
}

/** Calls our server only. Provider credentials never enter the browser bundle. */
export async function requestAiResult(
  endpoint: string, hexagram: Hexagram, question: string, language: AiLanguage,
  options: AiRequestOptions = {},
): Promise<Record<string, unknown>> {
  const controller = new AbortController()
  const cancel = () => controller.abort(options.signal?.reason)
  if (options.signal?.aborted) cancel()
  else options.signal?.addEventListener('abort', cancel, { once: true })
  const timer = setTimeout(() => controller.abort(new DOMException('Timed out', 'TimeoutError')), 110_000)
  try {
    const res = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hexagramNumber: hexagram.number, question, language, ...(options.lines ? { lines: options.lines } : {}) }),
      signal: controller.signal,
    })
    const data: unknown = await res.json().catch(() => null)
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new AiRequestError(
        language === 'zh' ? '服务暂时没有返回有效内容，请稍后重试。' : 'The service returned an invalid response. Please try again.',
        'INVALID_RESPONSE', true,
      )
    }
    const payload = data as Record<string, unknown>
    if (!res.ok) {
      throw new AiRequestError(
        typeof payload.error === 'string' ? payload.error : language === 'zh' ? '请求未能完成，请稍后重试。' : 'The request could not be completed. Please try again.',
        typeof payload.code === 'string' ? payload.code : 'REQUEST_FAILED',
        payload.retryable === true,
      )
    }
    return payload
  } catch (error) {
    if (options.signal?.aborted) throw error
    if (error instanceof AiRequestError) throw error
    throw new AiRequestError(
      language === 'zh' ? '连接超时或暂时中断，请重试。' : 'The connection timed out or was interrupted. Please try again.',
      controller.signal.aborted ? 'TIMEOUT' : 'NETWORK_ERROR', true,
    )
  } finally {
    clearTimeout(timer)
    options.signal?.removeEventListener('abort', cancel)
  }
}

export async function getHexagramInterpretation(
  hexagram: Hexagram, question: string, language: AiLanguage = 'zh', options: AiRequestOptions = {},
): Promise<string> {
  const data = await requestAiResult('/api/interpret-hexagram', hexagram, question, language, options)
  if (typeof data.answer !== 'string' || !data.answer.trim()) {
    throw new AiRequestError(
      language === 'zh' ? '解读暂时没有内容，请重试。' : 'The reading is empty. Please try again.',
      'INVALID_RESPONSE', true,
    )
  }
  return data.answer.trim()
}
