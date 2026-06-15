import type { Hexagram } from './hexagrams'

const CLASSICAL_STYLE_PREFIX =
  '中国古典水墨画风格，工笔与写意结合，宣纸质感，淡雅设色，意境深远，画面统一为传统国画美学，无现代元素，无文字水印。'

export function buildHexagramImagePrompt(hexagram: Hexagram, question: string): string {
  return `${CLASSICAL_STYLE_PREFIX}
主题：易经第${hexagram.number}卦「${hexagram.chineseName}」（${hexagram.name}），${hexagram.subtitle}。
卦象意象：${hexagram.image}
求问者心中所问：「${question}」
画面需将卦象象征元素与求问主题巧妙融合，可含山水、云气、卦爻符号、传统文化意象，竖构图适合手机屏幕欣赏。`
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
