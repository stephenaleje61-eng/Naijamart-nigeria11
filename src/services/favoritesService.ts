import { doc, setDoc, deleteDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';

const LOCAL_STORAGE_KEY = 'naijamart_saved_products';

export interface SavedProductRecord {
  productId: string;
  userId?: string;
  savedAt: string;
}

/**
 * Gets all saved product IDs from localStorage cache immediately
 */
export function getSavedProductIds(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Error reading saved products from localStorage:', err);
    return [];
  }
}

/**
 * Checks whether a given product is saved
 */
export function isProductSaved(productId: string): boolean {
  if (!productId) return false;
  const ids = getSavedProductIds();
  return ids.includes(productId);
}

/**
 * Toggles a product's saved state. Returns true if now saved, false if removed.
 */
export async function toggleSavedProduct(productId: string, userId?: string | null): Promise<boolean> {
  if (!productId) return false;

  const currentIds = getSavedProductIds();
  const exists = currentIds.includes(productId);
  let newIds: string[];
  let isNowSaved = false;

  if (exists) {
    newIds = currentIds.filter((id) => id !== productId);
    isNowSaved = false;
  } else {
    newIds = [productId, ...currentIds];
    isNowSaved = true;
  }

  // 1. Save immediately to localStorage
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newIds));
    window.dispatchEvent(new CustomEvent('savedProductsChanged', { detail: { productId, isSaved: isNowSaved, allIds: newIds } }));
  } catch (err) {
    console.warn('LocalStorage error saving favourite:', err);
  }

  // 2. Persist to Firestore if user or device ID available
  const activeUid = userId || auth.currentUser?.uid || 'guest';
  if (activeUid) {
    try {
      const docId = `${activeUid}_${productId}`;
      const docRef = doc(db, 'savedProducts', docId);

      if (isNowSaved) {
        await setDoc(docRef, {
          userId: activeUid,
          productId,
          savedAt: new Date().toISOString()
        });
      } else {
        await deleteDoc(docRef);
      }
    } catch (firebaseErr) {
      console.warn('Firestore sync notice for savedProducts:', firebaseErr);
    }
  }

  return isNowSaved;
}

/**
 * Synchronizes user's saved products from Firestore when logging in
 */
export async function syncSavedProductsFromFirestore(userId: string): Promise<string[]> {
  if (!userId) return getSavedProductIds();

  try {
    const q = query(collection(db, 'savedProducts'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const firestoreIds: string[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.productId) firestoreIds.push(data.productId);
    });

    const localIds = getSavedProductIds();
    const merged = Array.from(new Set([...localIds, ...firestoreIds]));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('savedProductsChanged', { detail: { allIds: merged } }));
    return merged;
  } catch (err) {
    console.warn('Error syncing saved products from Firestore:', err);
    return getSavedProductIds();
  }
}
