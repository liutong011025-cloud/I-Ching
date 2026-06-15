import { NextResponse } from 'next/server'

const ALLOWED_HOST_SUFFIX = '.volces.com'

function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname.endsWith(ALLOWED_HOST_SUFFIX)
    )
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  let body: { url?: string }
  try {
    body = (await request.json()) as { url?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { url } = body
  if (!url || !isAllowedImageUrl(url)) {
    return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
  }

  try {
    const res = await fetch(url)
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 })
    }

    const buffer = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || 'image/jpeg'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Download failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
