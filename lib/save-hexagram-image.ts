/** Prepare the image before the click so native sharing keeps the user gesture. */
export async function prepareHexagramImage(imageUrl: string, filename: string, signal?: AbortSignal): Promise<File> {
  const res = await fetch('/api/download-hexagram-image', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: imageUrl }), signal,
  })
  if (!res.ok) throw new Error(res.status === 413 ? 'IMAGE_TOO_LARGE' : 'DOWNLOAD_FAILED')
  const blob = await res.blob()
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
    'image/gif': 'gif', 'image/avif': 'avif',
  }
  const suffix = extensions[blob.type] || 'jpg'
  return new File([blob], `${filename.replace(/\.[^.]+$/, '')}.${suffix}`, { type: blob.type || 'image/jpeg' })
}

/** Call directly from a user gesture; do not await a network request first. */
export function saveHexagramImage(file: File): Promise<void> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    return navigator.share({ files: [file] }).catch(error => {
      if (error instanceof Error && error.name === 'AbortError') return
      throw error
    })
  }
  const blobUrl = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = file.name
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000)
  return Promise.resolve()
}
