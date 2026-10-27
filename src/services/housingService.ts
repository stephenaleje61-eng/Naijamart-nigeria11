import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  deleteDoc,
  increment,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { HouseListing, RoommateListing } from '../types/housing';
import { compressImage, fileToDataUrl } from '../utils/compress';

/**
 * Upload housing or roommate images:
 * - Compresses each image (max 1024px, <= 800KB)
 * - Uploads to Firebase Storage path: {folder}/{uid}/{Date.now()}_{index}.jpg
 * - Uses onProgress callback
 * - Safe fallback to Data URL if Storage network stalls or rules block
 */
export async function uploadHousingImages(
  files: File[],
  uid: string,
  folder: 'houses' | 'roommates',
  onProgress?: (percent: number) => void
): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const urls: string[] = [];
  const total = files.length;

  for (let index = 0; index < total; index++) {
    const rawFile = files[index];
    const compressed = await compressImage(rawFile);
    const timestamp = Date.now();
    const filePath = `${folder}/${uid}/${timestamp}_${index}.jpg`;
    const storageRef = ref(storage, filePath);

    const uploadedUrl = await new Promise<string>(async (resolve, reject) => {
      let settled = false;
      const timeoutId = setTimeout(async () => {
        if (!settled) {
          settled = true;
          try {
            const dataUrl = await fileToDataUrl(compressed);
            resolve(dataUrl);
          } catch {
            reject(new Error(`Failed to process image ${index + 1}`));
          }
        }
      }, 10000);

      try {
        const uploadTask = uploadBytesResumable(storageRef, compressed, {
          contentType: 'image/jpeg',
          cacheControl: 'public,max-age=31536000',
        });

        uploadTask.on(
          'state_changed',
          (snap) => {
            if (snap.totalBytes > 0) {
              const filePercent = (snap.bytesTransferred / snap.totalBytes) * 100;
              const overall = Math.round(((index + filePercent / 100) / total) * 100);
              if (onProgress) onProgress(Math.min(99, overall));
            }
          },
          async (err) => {
            clearTimeout(timeoutId);
            if (!settled) {
              settled = true;
              console.warn(`[housing upload] Storage fallback for photo ${index + 1}:`, err.message);
              try {
                const dataUrl = await fileToDataUrl(compressed);
                resolve(dataUrl);
              } catch (convErr) {
                reject(new Error(`Could not upload photo ${index + 1}`));
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
              } catch {
                const dataUrl = await fileToDataUrl(compressed);
                resolve(dataUrl);
              }
            }
          }
        );
      } catch {
        clearTimeout(timeoutId);
        if (!settled) {
          settled = true;
          const dataUrl = await fileToDataUrl(compressed);
          resolve(dataUrl);
        }
      }
    });

    urls.push(uploadedUrl);
    if (onProgress) {
      onProgress(Math.round(((index + 1) / total) * 100));
    }
  }

  return urls;
}

/**
 * Real-time subscription to Houses collection
 * Excludes listings that have been hidden or reported 3+ times
 */
export function subscribeHouses(
  onData: (houses: HouseListing[]) => void,
  onError?: (error: Error) => void
) {
  const housesRef = collection(db, 'houses');
  const q = query(housesRef, orderBy('postedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: HouseListing[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        const reportsCount = d.reportsCount || 0;
        const status = d.status || 'active';

        // Auto-hide if 3 or more reports
        if (reportsCount >= 3 || status === 'hidden') {
          return;
        }

        list.push({
          id: docSnap.id,
          agentUid: d.agentUid || '',
          agentName: d.agentName || 'Real Estate Agent',
          agentPhone: d.agentPhone || '',
          agentPhoto: d.agentPhoto || '',
          title: d.title || 'House For Rent',
          type: d.type || 'Self-contain',
          price: Number(d.price) || 0,
          pricePer: d.pricePer || 'year',
          location: d.location || '',
          state: d.state || 'All Nigeria',
          city: d.city || '',
          area: d.area || '',
          address: d.address || '',
          description: d.description || '',
          photos: Array.isArray(d.photos) ? d.photos : [],
          bedrooms: Number(d.bedrooms) || 1,
          bathrooms: Number(d.bathrooms) || 1,
          furnished: Boolean(d.furnished),
          facilities: Array.isArray(d.facilities) ? d.facilities : [],
          available: d.available !== false,
          verified: Boolean(d.verified),
          postedAt: d.postedAt,
          reportsCount: reportsCount,
          status: status,
        });
      });
      onData(list);
    },
    (err) => {
      console.warn('Houses query note:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Real-time subscription to Roommates collection
 */
export function subscribeRoommates(
  onData: (roommates: RoommateListing[]) => void,
  onError?: (error: Error) => void
) {
  const roommatesRef = collection(db, 'roommates');
  const q = query(roommatesRef, orderBy('postedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: RoommateListing[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        const reportsCount = d.reportsCount || 0;
        const status = d.status || 'active';

        if (reportsCount >= 3 || status === 'hidden') {
          return;
        }

        list.push({
          id: docSnap.id,
          posterUid: d.posterUid || '',
          posterName: d.posterName || 'Fellow Student/Resident',
          posterPhone: d.posterPhone || '',
          posterPhoto: d.posterPhoto || '',
          location: d.location || '',
          state: d.state || 'All Nigeria',
          city: d.city || '',
          area: d.area || '',
          budget: Number(d.budget) || 0,
          genderPref: d.genderPref || 'Any',
          roomType: d.roomType || 'Self-contain',
          lookingFor: d.lookingFor || '1 roommate',
          aboutMe: d.aboutMe || '',
          moveInDate: d.moveInDate || 'Immediately',
          photos: Array.isArray(d.photos) ? d.photos : [],
          postedAt: d.postedAt,
          available: d.available !== false,
          reportsCount: reportsCount,
          status: status,
        });
      });
      onData(list);
    },
    (err) => {
      console.warn('Roommates query note:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribe all listings for Admin moderation (including hidden & reported)
 */
export function subscribeAdminHousing(
  onData: (data: { houses: HouseListing[]; roommates: RoommateListing[] }) => void
) {
  const housesRef = collection(db, 'houses');
  const roommatesRef = collection(db, 'roommates');

  let currentHouses: HouseListing[] = [];
  let currentRoommates: RoommateListing[] = [];

  const unsubH = onSnapshot(housesRef, (snap) => {
    currentHouses = snap.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        agentUid: d.agentUid || '',
        agentName: d.agentName || 'Agent',
        agentPhone: d.agentPhone || '',
        agentPhoto: d.agentPhoto || '',
        title: d.title || 'House',
        type: d.type || 'Self-contain',
        price: Number(d.price) || 0,
        pricePer: d.pricePer || 'year',
        location: d.location || '',
        state: d.state || '',
        city: d.city || '',
        area: d.area || '',
        address: d.address || '',
        description: d.description || '',
        photos: Array.isArray(d.photos) ? d.photos : [],
        bedrooms: Number(d.bedrooms) || 1,
        bathrooms: Number(d.bathrooms) || 1,
        furnished: Boolean(d.furnished),
        facilities: Array.isArray(d.facilities) ? d.facilities : [],
        available: d.available !== false,
        verified: Boolean(d.verified),
        postedAt: d.postedAt,
        reportsCount: d.reportsCount || 0,
        status: d.status || 'active',
      };
    });
    onData({ houses: currentHouses, roommates: currentRoommates });
  });

  const unsubR = onSnapshot(roommatesRef, (snap) => {
    currentRoommates = snap.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        posterUid: d.posterUid || '',
        posterName: d.posterName || 'Poster',
        posterPhone: d.posterPhone || '',
        posterPhoto: d.posterPhoto || '',
        location: d.location || '',
        state: d.state || '',
        city: d.city || '',
        area: d.area || '',
        budget: Number(d.budget) || 0,
        genderPref: d.genderPref || 'Any',
        roomType: d.roomType || '',
        lookingFor: d.lookingFor || '',
        aboutMe: d.aboutMe || '',
        moveInDate: d.moveInDate || '',
        photos: Array.isArray(d.photos) ? d.photos : [],
        postedAt: d.postedAt,
        available: d.available !== false,
        reportsCount: d.reportsCount || 0,
        status: d.status || 'active',
      };
    });
    onData({ houses: currentHouses, roommates: currentRoommates });
  });

  return () => {
    unsubH();
    unsubR();
  };
}

/**
 * Create a new house listing
 */
export async function createHouseListing(
  data: Omit<HouseListing, 'id' | 'postedAt' | 'reportsCount' | 'status'>
): Promise<string> {
  const housesRef = collection(db, 'houses');
  const docRef = await addDoc(housesRef, {
    ...data,
    postedAt: serverTimestamp(),
    reportsCount: 0,
    status: 'active',
  });
  return docRef.id;
}

/**
 * Update house listing
 */
export async function updateHouseListing(
  id: string,
  data: Partial<HouseListing>
): Promise<void> {
  const houseDoc = doc(db, 'houses', id);
  await updateDoc(houseDoc, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a house listing
 */
export async function deleteHouseListing(id: string): Promise<void> {
  await deleteDoc(doc(db, 'houses', id));
}

/**
 * Create a new roommate listing
 */
export async function createRoommateListing(
  data: Omit<RoommateListing, 'id' | 'postedAt' | 'reportsCount' | 'status'>
): Promise<string> {
  const roommatesRef = collection(db, 'roommates');
  const docRef = await addDoc(roommatesRef, {
    ...data,
    postedAt: serverTimestamp(),
    reportsCount: 0,
    status: 'active',
  });
  return docRef.id;
}

/**
 * Delete a roommate listing
 */
export async function deleteRoommateListing(id: string): Promise<void> {
  await deleteDoc(doc(db, 'roommates', id));
}

/**
 * Report a listing (fake, duplicate, fraud).
 * If reports count >= 3, automatically set status to 'hidden'
 */
export async function reportListing(
  type: 'houses' | 'roommates',
  listingId: string,
  reason: string,
  reportedByUid: string
): Promise<{ success: boolean; newReportCount: number; isHidden: boolean }> {
  // 1. Record report in 'housingReports' collection
  await addDoc(collection(db, 'housingReports'), {
    listingType: type,
    listingId,
    reason,
    reportedByUid,
    reportedAt: serverTimestamp(),
  });

  // 2. Increment reportsCount on the item
  const itemDocRef = doc(db, type, listingId);
  const snap = await getDoc(itemDocRef);
  const currentCount = (snap.data()?.reportsCount || 0) + 1;

  const updates: any = {
    reportsCount: increment(1),
  };

  // Rule: If 3 or more reports -> auto-hide
  const isHidden = currentCount >= 3;
  if (isHidden) {
    updates.status = 'hidden';
  }

  await updateDoc(itemDocRef, updates);
  return { success: true, newReportCount: currentCount, isHidden };
}

/**
 * Admin: Toggle verification badge on house listing
 */
export async function adminVerifyHouse(houseId: string, verified: boolean): Promise<void> {
  await updateDoc(doc(db, 'houses', houseId), {
    verified,
    verifiedAt: verified ? serverTimestamp() : null,
  });
}

/**
 * Admin: Unhide / restore falsely reported listing
 */
export async function adminRestoreListing(
  collectionName: 'houses' | 'roommates',
  id: string
): Promise<void> {
  await updateDoc(doc(db, collectionName, id), {
    status: 'active',
    reportsCount: 0,
  });
}

/**
 * Favorites persistence via localStorage helper
 */
const FAV_STORAGE_KEY = 'naijamart_housing_favorites';

export function getFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAV_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(listingId: string): boolean {
  const current = getFavorites();
  let updated: string[];
  const isFav = current.includes(listingId);
  if (isFav) {
    updated = current.filter((id) => id !== listingId);
  } else {
    updated = [...current, listingId];
  }
  try {
    localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save favorite:', e);
  }
  return !isFav;
}
