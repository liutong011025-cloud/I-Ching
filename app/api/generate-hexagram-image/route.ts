import { NextResponse } from 'next/server'
import { buildHexagramImagePrompt } from '@/lib/volcengine'
import type { Hexagram } from '@/lib/hexagrams'

const ARK_API_BASE =
  process.env.ARK_API_BASE || 'https://ark.cn-beijing.volces.com/api/v3'
const ARK_API_KEY = process.env.ARK_API_KEY || ''
const SEEDREAM_MODEL =
  process.env.SEEDREAM_MODEL_ID || 'doubao-seedream-4-5-251128'

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
  error?: { message?: string }
}

export async function POST(request: Request) {
  if (!ARK_API_KEY) {
    return NextResponse.json(
      { error: '未配置 ARK_API_KEY，请在 .env.local 中设置' },
      { status: 500 }
    )
  }

  let body: GenerateImageRequest
  try {
    body = (await request.json()) as GenerateImageRequest
  } catch {
    return NextResponse.json({ error: '请求体格式错误' }, { status: 400 })
  }

  const { hexagramNumber, hexagramName, chineseName, subtitle, image, question } =
    body

  if (!hexagramNumber || !chineseName || !question?.trim()) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
  }

  const hexagram = {
    number: hexagramNumber,
    name: hexagramName,
    chineseName,
    subtitle,
    image,
  } as Pick<Hexagram, 'number' | 'name' | 'chineseName' | 'subtitle' | 'image'>

  const prompt = buildHexagramImagePrompt(hexagram as Hexagram, question.trim())

  try {
    const res = await fetch(`${ARK_API_BASE}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ARK_API_KEY}`,
      },
      body: JSON.stringify({
        model: SEEDREAM_MODEL,
        prompt,
        size: '1664x2496',
        sequential_image_generation: 'disabled',
        response_format: 'url',
        stream: false,
        watermark: false,
      }),
    })

    const data = (await res.json()) as ArkImageResponse

    if (!res.ok) {
      const msg =
        data.error?.message || `火山引擎请求失败 ${res.status}`
      return NextResponse.json({ error: msg }, { status: res.status })
    }

    const url = data.data?.[0]?.url
    if (!url) {
      return NextResponse.json({ error: '未返回图片 URL' }, { status: 502 })
    }

    return NextResponse.json({ url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '图片生成失败'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
