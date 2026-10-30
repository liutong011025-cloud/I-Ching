import { NextResponse } from 'next/server'
import { HEXAGRAMS, type Hexagram } from '@/lib/hexagrams'
import type { AiLanguage } from '@/lib/dify'

export class ServiceError extends Error {
  constructor(public readonly code: string, public readonly status = 503, public readonly retryable = false) {
    super(code)
    this.name = 'ServiceError'
  }
}

const messages: Record<string, [string, string]> = {
  INVALID_REQUEST: ['请填写 1 至 1000 字的问题，并选择有效的卦象与语言。', 'Enter a question of 1–1000 characters and a valid hexagram and language.'],
  REQUEST_TOO_LARGE: ['提交内容过长，请缩短问题后重试。', 'The request is too large. Please shorten your question.'],
  FORBIDDEN_REQUEST: ['请从平台页面重新发起操作。', 'Please start this request from the platform page.'],
  NOT_CONFIGURED: ['这项服务暂未开通，请稍后再试。', 'This service is not available yet. Please try again later.'],
  RATE_LIMITED: ['当前请求较多，请稍等片刻再重试。', 'The service is busy. Please wait a moment and try again.'],
  TIMEOUT: ['生成用时较长，请稍后重试。', 'Generation took too long. Please try again shortly.'],
  CANCELLED: ['请求已取消。', 'The request was cancelled.'],
  UPSTREAM_UNAVAILABLE: ['生成服务暂时不可用，请稍后重试。', 'The generation service is temporarily unavailable. Please try again.'],
  INVALID_RESPONSE: ['服务暂时没有返回有效内容，请重试。', 'The service returned an invalid response. Please try again.'],
  CONTENT_REJECTED: ['这次内容未能生成，请调整问题后再试。', 'This content could not be generated. Please rephrase your question.'],
  MODEL_UNAVAILABLE: ['图片服务暂时不可用，请稍后再试。', 'The image service is temporarily unavailable. Please try again later.'],
  INVALID_IMAGE_URL: ['这张图片暂时无法保存，请重新生成后再试。', 'This image cannot be saved. Please generate a new image and try again.'],
  DOWNLOAD_FAILED: ['图片下载未完成，请稍后重试。', 'The image could not be downloaded. Please try again.'],
  IMAGE_TOO_LARGE: ['图片较大，请打开原图后使用浏览器保存。', 'This image is large. Open the original image and save it in your browser.'],
}

export function errorResponse(error: unknown, language: AiLanguage = 'zh') {
  const failure = error instanceof ServiceError ? error : new ServiceError('UPSTREAM_UNAVAILABLE', 503, true)
  const message = messages[failure.code] ?? messages.UPSTREAM_UNAVAILABLE
  return NextResponse.json(
    { error: message[language === 'en' ? 1 : 0], code: failure.code, retryable: failure.retryable },
    { status: failure.status, headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const origin = request.headers.get('origin')
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) throw new Error('Cross-origin request')
    } catch { throw new ServiceError('FORBIDDEN_REQUEST', 403) }
  }
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new ServiceError('INVALID_REQUEST', 415)
  }
  if (Number(request.headers.get('content-length')) > 16_384) throw new ServiceError('REQUEST_TOO_LARGE', 413)
  const reader = request.body?.getReader()
  if (!reader) throw new ServiceError('INVALID_REQUEST', 400)
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const chunk = await reader.read()
      if (chunk.done) break
      size += chunk.value.byteLength
      if (size > 16_384) {
        await reader.cancel()
        throw new ServiceError('REQUEST_TOO_LARGE', 413)
      }
      chunks.push(chunk.value)
    }
    const bytes = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
    const body: unknown = JSON.parse(new TextDecoder().decode(bytes))
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ServiceError('INVALID_REQUEST', 400)
    return body as Record<string, unknown>
  } catch (error) {
    if (error instanceof ServiceError) throw error
    throw new ServiceError('INVALID_REQUEST', 400)
  } finally { reader.releaseLock() }
}

export function parseReading(body: Record<string, unknown>): { hexagram: Hexagram; question: string; language: AiLanguage } {
  const language = body.language === undefined ? 'zh' : body.language
  const question = typeof body.question === 'string' ? body.question.trim() : ''
  if ((language !== 'zh' && language !== 'en') || !Number.isInteger(body.hexagramNumber) ||
      Number(body.hexagramNumber) < 1 || Number(body.hexagramNumber) > 64 || !question || question.length > 1000) {
    throw new ServiceError('INVALID_REQUEST', 400)
  }
  return { hexagram: HEXAGRAMS[Number(body.hexagramNumber) - 1], question, language }
}

/** Restrict download targets to the image host family already used by ModelArk. */
export function isAllowedImageUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 4096) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password &&
      (!url.port || url.port === '443') && url.hostname.endsWith('.volces.com')
  } catch { return false }
}

async function retryDelay(signal: AbortSignal) {
  await new Promise<void>((resolve, reject) => {
    if (signal.aborted) { reject(new ServiceError('CANCELLED', 499)); return }
    const cancel = () => { clearTimeout(timer); reject(new ServiceError('CANCELLED', 499)) }
    const timer = setTimeout(() => { signal.removeEventListener('abort', cancel); resolve() }, 400)
    signal.addEventListener('abort', cancel, { once: true })
  })
}

/** Retry once after an explicit transient response, never after an ambiguous timeout. */
export async function fetchProvider(
  url: string, init: RequestInit,
  options: { signal: AbortSignal; timeoutMs: number; deadline: number },
): Promise<Response> {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (options.signal.aborted) throw new ServiceError('CANCELLED', 499)
    const remaining = options.deadline - Date.now()
    if (remaining <= 0) throw new ServiceError('TIMEOUT', 504, true)
    const controller = new AbortController()
    const cancel = () => controller.abort()
    options.signal.addEventListener('abort', cancel, { once: true })
    const timer = setTimeout(() => controller.abort(), Math.min(remaining, options.timeoutMs))
    try {
      // Include response-body consumption in the timeout.
      const response = await fetch(url, { ...init, signal: controller.signal, cache: 'no-store', redirect: 'error' })
      const body = await response.arrayBuffer()
      if ([429, 502, 503, 504].includes(response.status) && attempt === 0 && options.deadline - Date.now() > 1000) {
        await retryDelay(options.signal)
        continue
      }
      return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers })
    } catch (error) {
      if (options.signal.aborted) throw new ServiceError('CANCELLED', 499)
      if (controller.signal.aborted) throw new ServiceError('TIMEOUT', 504, true)
      if (error instanceof ServiceError) throw error
      throw new ServiceError('UPSTREAM_UNAVAILABLE', 503, true)
    } finally {
      clearTimeout(timer)
      options.signal.removeEventListener('abort', cancel)
    }
  }
  throw new ServiceError('UPSTREAM_UNAVAILABLE', 503, true)
}

export function providerError(status: number, code = ''): ServiceError {
  if (status === 429) return new ServiceError('RATE_LIMITED', 429, true)
  if (/content|safety|sensitive|risk/i.test(code)) return new ServiceError('CONTENT_REJECTED', 422)
  if (status === 401 || status === 403) return new ServiceError('NOT_CONFIGURED', 503)
  return new ServiceError('UPSTREAM_UNAVAILABLE', 503, true)
}
