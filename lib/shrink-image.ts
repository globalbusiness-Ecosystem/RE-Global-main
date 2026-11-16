// Shrinks a picture in the browser so it uploads fast and loads fast for everyone. Longest side `maxDim`, WebP.
export function shrinkImage(file: File, maxDim = 768, quality = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const src = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(src);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('تعذر قراءة الصورة'))), 'image/webp', quality);
    };
    img.onerror = () => reject(new Error('تعذر قراءة الصورة'));
    img.src = src;
  });
}
