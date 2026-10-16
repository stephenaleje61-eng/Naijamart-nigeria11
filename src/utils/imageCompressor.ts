/**
 * Compresses an image file to max 700px width/height using HTML Canvas with JPEG quality 0.6,
 * then returns the base64 data URL string.
 * This guarantees free Firestore storage without needing Firebase Storage (Blaze plan).
 */
export async function compressImageToBase64(
  file: File | Blob,
  maxWidth = 700,
  quality = 0.6
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof Blob)) {
      reject(new Error('No valid image file provided'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (readerEvent) => {
      const dataUrl = readerEvent.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Empty image file result'));
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // Fallback to dataUrl directly if image decoding fails
        resolve(dataUrl);
      };
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        // Fill white background in case of PNG transparency before jpeg conversion
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
