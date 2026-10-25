import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Compresses an image file to a maximum of 800KB using HTML5 Canvas.
 * Automatically resizes dimensions if width/height exceed 1600px,
 * and lowers quality iteratively if the output is still over 800KB.
 */
export async function compressImageToMax800KB(file: File): Promise<Blob> {
  // If file is already under 800KB and is a valid image, still ensure standard JPEG
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if excessively large to keep canvas memory clean
        const MAX_DIM = 1600;
        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw with white background to handle transparent PNGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;

        function attemptBlob() {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              // Target: <= 800KB (800 * 1024 bytes = 819,200 bytes)
              if (blob.size > 800 * 1024 && quality > 0.35) {
                quality -= 0.15;
                attemptBlob();
              } else {
                resolve(blob);
              }
            },
            'image/jpeg',
            quality
          );
        }

        attemptBlob();
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

/**
 * Converts a Blob to a standard data URL string (fallback helper)
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

/**
 * Uploads a compressed image to Firebase Storage path: products/{uid}/{timestamp}_{index}.jpg
 * Returns downloadURL.
 */
export async function uploadProductImage(
  file: File,
  uid: string,
  index: number = 0,
  onProgress?: (percent: number) => void
): Promise<string> {
  // 1. Compress image to max 800KB
  const compressedBlob = await compressImageToMax800KB(file);

  const timestamp = Date.now();
  const storagePath = `products/${uid}/${timestamp}_${index}.jpg`;
  const storageRef = ref(storage, storagePath);

  try {
    return await new Promise<string>((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, compressedBlob, {
        contentType: 'image/jpeg',
        cacheControl: 'public,max-age=31536000',
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(Math.round(progress));
          }
        },
        async (error) => {
          console.warn('Storage upload warning, using local compressed data URL fallback:', error);
          try {
            const fallbackDataUrl = await blobToDataUrl(compressedBlob);
            resolve(fallbackDataUrl);
          } catch {
            reject(error);
          }
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (urlErr) {
            console.warn('getDownloadURL warning, using data URL fallback:', urlErr);
            const fallbackDataUrl = await blobToDataUrl(compressedBlob);
            resolve(fallbackDataUrl);
          }
        }
      );
    });
  } catch (err) {
    console.warn('Direct upload error, falling back to data URL:', err);
    return await blobToDataUrl(compressedBlob);
  }
}

/**
 * Delete a product image from Firebase Storage if URL belongs to storage
 */
export async function deleteProductImageFromStorage(imageUrl: string): Promise<void> {
  if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) {
    return;
  }
  try {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch (err) {
    console.debug('Image deletion from storage warning (ignored):', err);
  }
}
