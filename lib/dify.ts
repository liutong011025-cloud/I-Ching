import type { Hexagram } from './hexagrams'

const DIFY_API_BASE =
  typeof process !== 'undefined'
    ? (process.env.NEXT_PUBLIC_DIFY_API_BASE || 'https://api.dify.ai/v1').replace(
        /\/$/,
        ''
      )
    : 'https://api.dify.ai/v1'

const DIFY_API_KEY =
  typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_DIFY_API_KEY || '' : ''

export interface DifyChatResponse {
  event: string
  answer: string
  message_id: string
  conversation_id: string
  [key: string]: unknown
}

/**
 * 调用 Dify 对话接口，传入卦象与问题，获取 AI 解读。
 * API 部署在前端时使用 NEXT_PUBLIC_DIFY_API_KEY。
 */
export async function getHexagramInterpretation(
  hexagram: Hexagram,
  question: string
): Promise<string> {
  if (!DIFY_API_KEY) {
    throw new Error('未配置 DIFY API Key，请在 .env.local 中设置 NEXT_PUBLIC_DIFY_API_KEY')
  }

  const query = `请根据以下易经卦象信息，为求问者的问题做一段解读。

【卦象】
卦名（英文）：${hexagram.name}
卦名（中文）：${hexagram.chineseName}
卦序：${hexagram.number}
副标题：${hexagram.subtitle}
吉凶：${hexagram.rating}
卦象大意：${hexagram.description}
意象：${hexagram.image}

【求问者的问题】
${question}

请用简洁、有启发性的语言写一段针对该问题的解读（2–4 段即可），可结合卦象意象与吉凶给出建议。`

  const res = await fetch(`${DIFY_API_BASE}/chat-messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DIFY_API_KEY}`,
    },
    body: JSON.stringify({
      inputs: {},
      query,
      response_mode: 'blocking',
      user: 'iching-user',
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg =
      (err as { message?: string }).message || res.statusText || `请求失败 ${res.status}`
    throw new Error(msg)
  }

  const data = (await res.json()) as DifyChatResponse
  if (data.answer == null || typeof data.answer !== 'string') {
    throw new Error('Dify 返回格式异常，无 answer 内容')
  }
  return data.answer.trim()
}
