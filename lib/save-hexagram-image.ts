export async function saveHexagramImage(
  imageUrl: string,
  filename: string
): Promise<void> {
  const res = await fetch('/api/download-hexagram-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: imageUrl }),
  })

  if (!res.ok) {
    throw new Error('Failed to download image')
  }

  const blob = await res.blob()
  const file = new File([blob], filename, {
    type: blob.type || 'image/jpeg',
  })

  if (
    typeof navigator !== 'undefined' &&
    'share' in navigator &&
    'canShare' in navigator &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({ files: [file], title: 'Hexagram Vision' })
    return
  }

  const blobUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(blobUrl)
}
