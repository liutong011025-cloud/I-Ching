import { NextResponse } from 'next/server'
import { buildHexagramImagePrompt } from '@/lib/volcengine'
import type { Hexagram } from '@/lib/hexagrams'

const ARK_API_BASE =
  process.env.ARK_API_BASE || 'https://ark.cn-beijing.volces.com/api/v3'
const ARK_API_KEY = process.env.ARK_API_KEY || ''

const FALLBACK_MODELS = [
  'doubao-seedream-5-0-lite-260128',
  'doubao-seedream-5-0-260128',
  'doubao-seedream-4-0-250828',
]

function getModelsToTry(): string[] {
  const preferred = process.env.SEEDREAM_MODEL_ID?.trim()
  if (preferred) {
    return [preferred, ...FALLBACK_MODELS.filter((m) => m !== preferred)]
  }
  return FALLBACK_MODELS
}

interface GenerateImageRequest {
  hexagramNumber: number
  hexagramName: string
  chineseName: string
  subtitle: string
  image: string
  question: string
}

interface ArkImageResponse {
  data?: { url?: string }[]
  error?: { message?: string; code?: string }
}

function isModelNotActivated(message: string): boolean {
  return /has not activated the model/i.test(message)
}

async function requestImage(
  model: string,
  prompt: string
): Promise<{ ok: true; url: string } | { ok: false; status: number; message: string }> {
  const res = await fetch(`${ARK_API_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ARK_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      size: '2K',
      sequential_image_generation: 'disabled',
      response_format: 'url',
      stream: false,
      watermark: false,
    }),
  })

  const data = (await res.json()) as ArkImageResponse
  const message = data.error?.message || `Request failed with status ${res.status}`

  if (!res.ok) {
    return { ok: false, status: res.status, message }
  }

  const url = data.data?.[0]?.url
  if (!url) {
    return { ok: false, status: 502, message: 'No image URL returned' }
  }

  return { ok: true, url }
}

export async function POST(request: Request) {
  if (!ARK_API_KEY) {
    return NextResponse.json(
      { error: 'ARK_API_KEY is not configured in .env.local' },
      { status: 500 }
    )
  }

  let body: GenerateImageRequest
  try {
    body = (await request.json()) as GenerateImageRequest
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { hexagramNumber, hexagramName, chineseName, subtitle, image, question } =
    body

  if (!hexagramNumber || !chineseName || !question?.trim()) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  const hexagram = {
    number: hexagramNumber,
    name: hexagramName,
    chineseName,
    subtitle,
    image,
  } as Pick<Hexagram, 'number' | 'name' | 'chineseName' | 'subtitle' | 'image'>

  const prompt = buildHexagramImagePrompt(hexagram as Hexagram, question.trim())
  const models = getModelsToTry()
  const errors: string[] = []

  try {
    for (const model of models) {
      const result = await requestImage(model, prompt)

      if (result.ok) {
        return NextResponse.json({ url: result.url })
      }

      errors.push(`[${model}] ${result.message}`)

      if (!isModelNotActivated(result.message)) {
        return NextResponse.json({ error: result.message }, { status: result.status })
      }
    }

    return NextResponse.json(
      {
        error:
          'No activated Seedream model found. Please activate a model in the Ark Console. ' +
          errors.join(' | '),
      },
      { status: 403 }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Image generation failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
