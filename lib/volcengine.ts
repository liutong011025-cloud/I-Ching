import type { Hexagram } from './hexagrams'

const CLASSICAL_STYLE_PREFIX =
  'Chinese classical ink wash painting style, combining meticulous gongbi and expressive xieyi brushwork, rice paper texture, subtle elegant colors, profound artistic atmosphere, unified traditional Chinese painting aesthetics, no modern elements, no text or watermark.'

export function buildHexagramImagePrompt(hexagram: Hexagram, question: string): string {
  return `${CLASSICAL_STYLE_PREFIX}
Subject: I Ching Hexagram ${hexagram.number} — "${hexagram.chineseName}" (${hexagram.name}), ${hexagram.subtitle}.
Hexagram imagery: ${hexagram.image}
The seeker's question: "${question}"
Blend symbolic hexagram elements with the question's theme. May include mountains, water, mist, yin-yang imagery, trigram symbols, and classical Chinese cultural motifs. Vertical portrait composition optimized for mobile viewing.`
}

export async function generateHexagramImage(
  hexagram: Hexagram,
  question: string
): Promise<string> {
  const res = await fetch('/api/generate-hexagram-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hexagramNumber: hexagram.number,
      hexagramName: hexagram.name,
      chineseName: hexagram.chineseName,
      subtitle: hexagram.subtitle,
      image: hexagram.image,
      question,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg =
      (err as { error?: string }).error || res.statusText || `请求失败 ${res.status}`
    throw new Error(msg)
  }

  const data = (await res.json()) as { url: string }
  if (!data.url) {
    throw new Error('图片生成返回格式异常')
  }
  return data.url
}
