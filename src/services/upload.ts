import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { compressImage, fileToDataUrl } from '../utils/compress';

/**
 * Uploads an array of product images:
 * 1. Compresses each file (maxWidth 1024px, JPEG, <= 800KB)
 * 2. Uploads to Firebase Storage path: products/{uid}/{Date.now()}_{index}.jpg
 * 3. Tracks progress via onProgress callback
 * 4. Resolves with an array of download URLs (with graceful fallback if Storage blocked)
 */
export async function uploadProductImages(
  files: File[],
  uid: string,
  onProgress?: (percent: number) => void
): Promise<string[]> {
  if (!files || files.length === 0) {
    return [];
  }

  const downloadUrls: string[] = [];
  const total = files.length;

  for (let index = 0; index < total; index++) {
    const rawFile = files[index];

    // 1. Compress image
    const compressedFile = await compressImage(rawFile);
    const timestamp = Date.now();
    const filePath = `products/${uid}/${timestamp}_${index}.jpg`;
    const storageRef = ref(storage, filePath);

    // 2. Upload with progress reporting and timeout fallback
    const url = await new Promise<string>(async (resolve, reject) => {
      let settled = false;

      // Timeout fallback after 10s if Storage upload hangs (e.g. CORS or network stall)
      const timeoutId = setTimeout(async () => {
        if (!settled) {
          settled = true;
          console.warn(`[upload] Storage upload timed out for file ${index + 1}, falling back to data URL.`);
          try {
            const dataUrl = await fileToDataUrl(compressedFile);
            resolve(dataUrl);
          } catch (e) {
            reject(new Error(`Failed to convert image ${index + 1} to Data URL`));
          }
        }
      }, 10000);

      try {
        const uploadTask = uploadBytesResumable(storageRef, compressedFile, {
          contentType: 'image/jpeg',
          cacheControl: 'public,max-age=31536000',
        });

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0) {
              const filePercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              const overallPercent = Math.round(((index + filePercent / 100) / total) * 100);
              if (onProgress) {
                onProgress(Math.min(99, overallPercent));
              }
            }
          },
          async (error) => {
            clearTimeout(timeoutId);
            if (!settled) {
              settled = true;
              console.warn(`[upload] Storage upload error on file ${index + 1}:`, error.message);
              // Fallback to data URL so listing still successfully saves
              try {
                const dataUrl = await fileToDataUrl(compressedFile);
                resolve(dataUrl);
              } catch (convErr) {
                reject(new Error(`Failed to upload photo ${index + 1}: ${error.message}`));
              }
            }
          },
          async () => {
            clearTimeout(timeoutId);
            if (!settled) {
              settled = true;
              try {
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadUrl);
              } catch (urlErr: any) {
                console.warn(`[upload] getDownloadURL error for file ${index + 1}:`, urlErr);
                const dataUrl = await fileToDataUrl(compressedFile);
                resolve(dataUrl);
              }
            }
          }
        );
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (!settled) {
          settled = true;
          console.warn(`[upload] uploadBytesResumable throw:`, err);
          const dataUrl = await fileToDataUrl(compressedFile);
          resolve(dataUrl);
        }
      }
    });

    downloadUrls.push(url);
    if (onProgress) {
      onProgress(Math.round(((index + 1) / total) * 100));
    }
  }

  return downloadUrls;
}
