/**
 * Image Compression Module
 * Resizes image preserving aspect ratio to maxWidth 1024px, converts to JPEG,
 * targets <= 800KB, and falls back to quality 0.4 if still over 800KB.
 */

export async function compressImage(file: File): Promise<File> {
  const originalSizeKB = Math.round(file.size / 1024);

  return new Promise((resolve) => {
    // If not an image or SVG, return as is
    if (!file.type.startsWith('image/') || file.type.includes('svg')) {
      console.log(`[compress] Skipped non-raster image: ${originalSizeKB} KB`);
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const maxWidth = 1024;
        let width = img.width;
        let height = img.height;

        // Preserve aspect ratio with maxWidth 1024px
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.warn('[compress] Could not get 2D canvas context');
          resolve(file);
          return;
        }

        // Fill white background for transparent PNGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const targetMaxBytes = 800 * 1024; // 800KB

        // Try quality 0.6 first
        canvas.toBlob(
          (blob1) => {
            if (!blob1) {
              resolve(file);
              return;
            }

            // If still > 800KB, re-compress at 0.4 quality
            if (blob1.size > targetMaxBytes) {
              canvas.toBlob(
                (blob2) => {
                  const finalBlob = blob2 || blob1;
                  const finalFile = new File([finalBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  const finalSizeKB = Math.round(finalFile.size / 1024);
                  console.log(`[compress] ${file.name}: ${originalSizeKB} KB -> ${finalSizeKB} KB (quality 0.4)`);
                  resolve(finalFile);
                },
                'image/jpeg',
                0.4
              );
            } else {
              const finalFile = new File([blob1], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              const finalSizeKB = Math.round(finalFile.size / 1024);
              console.log(`[compress] ${file.name}: ${originalSizeKB} KB -> ${finalSizeKB} KB (quality 0.6)`);
              resolve(finalFile);
            }
          },
          'image/jpeg',
          0.6
        );
      };

      img.onerror = (err) => {
        console.warn('[compress] Image load error:', err);
        resolve(file);
      };
    };

    reader.onerror = (err) => {
      console.warn('[compress] FileReader error:', err);
      resolve(file);
    };
  });
}

/**
 * Converts File or Blob to Base64 Data URL (safe fallback helper)
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
