import { NextResponse } from 'next/server'
import { buildHexagramImagePrompt } from '@/lib/volcengine'
import type { AiLanguage } from '@/lib/dify'
import { errorResponse, fetchProvider, isAllowedImageUrl, parseReading, providerError, readJson, ServiceError } from '../_lib/ai'

export const runtime = 'nodejs'
export const maxDuration = 120

// Retain models already activated by existing deployments.
const FALLBACK_MODELS = ['doubao-seedream-5-0-lite-260128', 'doubao-seedream-5-0-260128', 'doubao-seedream-4-0-250828']

export async function POST(request: Request) {
  let language: AiLanguage = 'zh'
  try {
    const body = await readJson(request)
    if (body.language === 'en') language = 'en'
    const { hexagram, question } = parseReading(body)
    const key = process.env.ARK_API_KEY?.trim()
    const base = (process.env.ARK_API_BASE?.trim() || 'https://ark.cn-beijing.volces.com/api/v3').replace(/\/+$/, '')
    if (!key) throw new ServiceError('NOT_CONFIGURED', 503)
    const preferred = process.env.SEEDREAM_MODEL_ID?.trim()
    const models = [...new Set([...(preferred ? [preferred] : []), ...FALLBACK_MODELS])]
    const prompt = buildHexagramImagePrompt(hexagram, question, language)
    const deadline = Date.now() + 100_000

    for (const model of models) {
      const response = await fetchProvider(`${base}/images/generations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model, prompt, size: '2K', sequential_image_generation: 'disabled',
          response_format: 'url', stream: false, watermark: false,
        }),
      }, { signal: request.signal, timeoutMs: 45_000, deadline })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        const code = typeof data?.error?.code === 'string' ? data.error.code : ''
        const message = typeof data?.error?.message === 'string' ? data.error.message : ''
        // Do not switch models for authentication, safety or other request errors.
        if (/has not activated the model|model.{0,30}not (?:activated|found|available)/i.test(message) ||
            /ModelNotOpen|ModelNotFound|ModelNotActivated/i.test(code)) continue
        throw providerError(response.status, code)
      }
      const url: unknown = data?.data?.[0]?.url
      if (!isAllowedImageUrl(url)) throw new ServiceError('INVALID_RESPONSE', 502, true)
      return NextResponse.json({ url }, { headers: { 'Cache-Control': 'no-store' } })
    }
    throw new ServiceError('MODEL_UNAVAILABLE', 503)
  } catch (error) { return errorResponse(error, language) }
}
