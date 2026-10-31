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
  const extension: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
    'image/gif': 'gif', 'image/avif': 'avif',
  }
  const suffix = extension[blob.type] || 'jpg'
  const downloadName = `${filename.replace(/\.[^.]+$/, '')}.${suffix}`
  const file = new File([blob], downloadName, {
    type: blob.type || 'image/jpeg',
  })

  if (
    typeof navigator !== 'undefined' &&
    'share' in navigator &&
    'canShare' in navigator &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], title: 'E-Guide' })
      return
    } catch (error) {
      // Closing the share sheet is a user choice, not a failed save.
      if (error instanceof Error && error.name === 'AbortError') return
      // Some mobile browsers lose the share gesture during the download.
    }
  }

  const blobUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = downloadName
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Give the browser time to begin reading the object URL.
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000)
}
