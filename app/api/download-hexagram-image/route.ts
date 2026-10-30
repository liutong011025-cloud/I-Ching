import { NextResponse } from 'next/server'
import type { AiLanguage } from '@/lib/dify'
import { errorResponse, isAllowedImageUrl, readJson, ServiceError } from '../_lib/ai'

export const runtime = 'nodejs'
export const maxDuration = 30
// Keep buffered responses below Vercel's 4.5 MB function payload limit.
const MAX_IMAGE_BYTES = 4 * 1024 * 1024
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])

export async function POST(request: Request) {
  let language: AiLanguage = 'zh'
  const controller = new AbortController()
  const cancel = () => controller.abort()
  if (request.signal.aborted) cancel()
  else request.signal.addEventListener('abort', cancel, { once: true })
  const timer = setTimeout(() => controller.abort(), 20_000)
  try {
    const body = await readJson(request)
    if (body.language === 'en') language = 'en'
    if (!isAllowedImageUrl(body.url)) throw new ServiceError('INVALID_IMAGE_URL', 400)
    let url = body.url
    // Validate every redirect, not only the original host.
    for (let redirects = 0; redirects <= 3; redirects++) {
      const response = await fetch(url, { signal: controller.signal, redirect: 'manual', cache: 'no-store' })
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location')
        const nextUrl = location ? new URL(location, url).href : ''
        await response.body?.cancel()
        if (!isAllowedImageUrl(nextUrl)) throw new ServiceError('INVALID_IMAGE_URL', 400)
        url = nextUrl
        continue
      }
      const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() ?? ''
      if (Number(response.headers.get('content-length')) > MAX_IMAGE_BYTES) {
        await response.body?.cancel()
        throw new ServiceError('IMAGE_TOO_LARGE', 413)
      }
      if (!response.ok || !TYPES.has(contentType)) {
        await response.body?.cancel()
        throw new ServiceError('DOWNLOAD_FAILED', 502, true)
      }
      const reader = response.body?.getReader()
      if (!reader) throw new ServiceError('DOWNLOAD_FAILED', 502, true)
      const chunks: Uint8Array[] = []
      let size = 0
      try {
        while (true) {
          const chunk = await reader.read()
          if (chunk.done) break
          size += chunk.value.byteLength
          if (size > MAX_IMAGE_BYTES) {
            await reader.cancel()
            throw new ServiceError('IMAGE_TOO_LARGE', 413)
          }
          chunks.push(chunk.value)
        }
      } finally { reader.releaseLock() }
      if (!size) throw new ServiceError('DOWNLOAD_FAILED', 502, true)
      const bytes = new Uint8Array(size)
      let offset = 0
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
      return new NextResponse(bytes, {
        headers: { 'Content-Type': contentType, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
      })
    }
    throw new ServiceError('DOWNLOAD_FAILED', 502, true)
  } catch (error) {
    if (controller.signal.aborted) return errorResponse(new ServiceError('TIMEOUT', 504, true), language)
    return errorResponse(error, language)
  } finally {
    clearTimeout(timer)
    request.signal.removeEventListener('abort', cancel)
  }
}
