/**
 * Resize image file to max dimensions and compress as JPEG base64
 * ลดขนาดรูปก่อน upload — ประหยัด bandwidth + ไม่เกิน API limit
 */
export function resizeImageToBase64(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.8,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img

      // Scale down if larger than max
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas not supported'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      const base64 = canvas.toDataURL('image/jpeg', quality)
      URL.revokeObjectURL(img.src)
      resolve(base64)
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Failed to load image'))
    }
    img.src = URL.createObjectURL(file)
  })
}
