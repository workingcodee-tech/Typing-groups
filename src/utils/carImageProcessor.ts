/**
 * REAL-LIFE AUTOMOTIVE IMAGE PROCESSOR
 * Avtomobil rasmlaridan fonni olib tashlab, shaffof (transparent) PNG ko'rinishida
 * trassa va garaj uchun tayyorlab beradi.
 */

const transparentCache = new Map<string, string>();

export async function getTransparentCarImage(
  src: string,
  flip: boolean = false
): Promise<string> {
  const cacheKey = `${src}_flip_${flip}`;
  if (transparentCache.has(cacheKey)) {
    return transparentCache.get(cacheKey)!;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      const width = img.naturalWidth || 640;
      const height = img.naturalHeight || 360;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        resolve(src);
        return;
      }

      // Agar o'ng tomonga qaratish kerak bo'lsa (flip horizontally)
      if (flip) {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(img, 0, 0, width, height);

      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Studiya fonining qora/to'q kulrang rangini yumshoq shaffof qilish (Studio background keying)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Juda qorong'i studiya foni (r, g, b < 28)
          const maxVal = Math.max(r, g, b);
          if (maxVal < 26) {
            data[i + 3] = 0; // Butunlay shaffof
          } else if (maxVal < 42) {
            // Chetdagi silliq gradiyent o'tishi
            const alphaFactor = (maxVal - 26) / 16;
            data[i + 3] = Math.round(data[i + 3] * alphaFactor);
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const transparentDataUrl = canvas.toDataURL('image/png');
        transparentCache.set(cacheKey, transparentDataUrl);
        resolve(transparentDataUrl);
      } catch {
        resolve(src);
      }
    };

    img.onerror = () => {
      resolve(src);
    };
  });
}
