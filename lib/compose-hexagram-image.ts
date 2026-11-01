/** Add the actual primary hexagram to the artwork, independent of AI generation. */
export async function composeHexagramImage(file: File, lines: number[], signal?: AbortSignal): Promise<File> {
  if (lines.length !== 6 || lines.some(value => ![6, 7, 8, 9].includes(value))) throw new Error('INVALID_HEXAGRAM')
  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError')
  const source = URL.createObjectURL(file)
  try {
    const image = new Image()
    await new Promise<void>((resolve, reject) => {
      const cancel = () => reject(new DOMException('Cancelled', 'AbortError'))
      signal?.addEventListener('abort', cancel, { once: true })
      image.onload = () => { signal?.removeEventListener('abort', cancel); resolve() }
      image.onerror = () => { signal?.removeEventListener('abort', cancel); reject(new Error('IMAGE_DECODE_FAILED')) }
      image.src = source
    })
    if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError')
    const width = image.naturalWidth, height = image.naturalHeight
    if (!width || !height || width * height > 24_000_000) throw new Error('IMAGE_SIZE_UNSUPPORTED')
    const canvas = document.createElement('canvas')
    canvas.width = width; canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('CANVAS_UNAVAILABLE')
    ctx.drawImage(image, 0, 0, width, height)

    // An unobtrusive ink seal keeps the six lines legible on light or dark artwork.
    const unit = Math.min(width, height)
    const panelWidth = unit * 0.19, panelHeight = panelWidth * 1.22
    const margin = unit * 0.032
    const x = width - margin - panelWidth, y = margin
    ctx.fillStyle = 'rgba(22, 25, 21, 0.88)'
    ctx.fillRect(x, y, panelWidth, panelHeight)
    ctx.strokeStyle = 'rgba(210, 181, 125, 0.9)'
    ctx.lineWidth = Math.max(1, unit * 0.0012)
    ctx.strokeRect(x, y, panelWidth, panelHeight)
    const inset = panelWidth * 0.19, length = panelWidth - 2 * inset
    const lineHeight = panelHeight * 0.055, gap = panelHeight * 0.027
    const startY = y + (panelHeight - (6 * lineHeight + 5 * gap)) / 2
    // Cast lines arrive bottom first; draw the sixth (upper) line first.
    for (let row = 0; row < 6; row++) {
      const value = lines[5 - row], top = startY + row * (lineHeight + gap)
      ctx.fillStyle = value === 6 || value === 9 ? '#d4b67d' : '#f4efe4'
      if (value === 6 || value === 8) {
        const half = length * 0.43
        ctx.fillRect(x + inset, top, half, lineHeight)
        ctx.fillRect(x + inset + length - half, top, half, lineHeight)
      } else ctx.fillRect(x + inset, top, length, lineHeight)
    }
    const output = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('IMAGE_ENCODING_FAILED')), 'image/jpeg', 0.93)
    })
    if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError')
    return new File([output], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' })
  } finally { URL.revokeObjectURL(source) }
}
