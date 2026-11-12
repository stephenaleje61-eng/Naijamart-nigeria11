import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../firebase';

export interface WantedPost {
  id: string;
  userId?: string;
  title: string;
  description: string;
  budget: number;
  location: 'Rafin Kada' | 'Behind School' | 'Wukari Town' | string;
  whatsappNumber: string;
  buyerName?: string;
  avatarUrl?: string;
  status: 'active' | 'closed';
  createdAt: any;
  updatedAt?: any;
}

export const FUWUKARI_WANTED_LOCATIONS = [
  'Rafin Kada',
  'Behind School',
  'Wukari Town'
] as const;

/**
 * Normalizes phone numbers to WhatsApp format: 234XXXXXXXXXX
 */
export function normalizeWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) {
    return '234' + digits.slice(1);
  }
  if (digits.startsWith('234')) {
    return digits;
  }
  return '234' + digits;
}

/**
 * Subscribes to active wanted posts in real-time from Firestore
 */
export function subscribeWantedPosts(
  callback: (posts: WantedPost[]) => void,
  onError?: (error: any) => void
): () => void {
  const postsRef = collection(db, 'wantedPosts');
  // Order by createdAt desc
  const q = query(postsRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const posts: WantedPost[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        posts.push({
          id: d.id,
          userId: data.userId || '',
          title: data.title || data.itemWanted || 'Wanted Item',
          description: data.description || '',
          budget: Number(data.budget || 0),
          location: data.location || 'FUWukari',
          whatsappNumber: data.whatsappNumber || data.phoneNumber || '',
          buyerName: data.buyerName || 'FUW Student',
          avatarUrl: data.avatarUrl || '',
          status: data.status || 'active',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
        });
      });

      // Filter only active posts or fallback to local storage
      callback(posts);
    },
    async (err) => {
      console.warn('Firestore wantedPosts listener error, falling back to local/wanted_items:', err);
      // Fallback: try reading from 'wanted_items' if 'wantedPosts' is empty
      try {
        const legacySnap = await getDocs(collection(db, 'wanted_items'));
        const legacyPosts: WantedPost[] = [];
        legacySnap.forEach((d) => {
          const data = d.data();
          legacyPosts.push({
            id: d.id,
            userId: data.buyerId || '',
            title: data.itemWanted || 'Wanted Item',
            description: data.description || '',
            budget: Number(data.budget || 0),
            location: data.location || 'FUWukari',
            whatsappNumber: data.whatsappNumber || data.phoneNumber || '',
            buyerName: data.buyerName || 'FUW Student',
            avatarUrl: data.avatarUrl || '',
            status: data.status === 'fulfilled' ? 'closed' : 'active',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
          });
        });
        callback(legacyPosts);
      } catch (legacyErr) {
        if (onError) onError(legacyErr);
      }
    }
  );

  return unsubscribe;
}

/**
 * Creates a new wanted post in Firestore
 */
export async function createWantedPost(params: {
  title: string;
  description: string;
  budget: number;
  location: string;
  whatsappNumber: string;
  buyerName?: string;
  userId?: string;
}): Promise<WantedPost> {
  const currentUid = params.userId || auth.currentUser?.uid || 'guest_' + Math.random().toString(36).substring(2, 8);
  const cleanWhatsapp = normalizeWhatsAppNumber(params.whatsappNumber);

  const payload = {
    userId: currentUid,
    title: params.title.trim(),
    description: params.description.trim(),
    budget: Math.round(Number(params.budget) || 0),
    location: params.location.trim() || 'Rafin Kada',
    whatsappNumber: cleanWhatsapp,
    buyerName: params.buyerName?.trim() || auth.currentUser?.displayName || 'FUW Student',
    status: 'active' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'wantedPosts'), payload);

  // Track post ID locally so guest/student can edit/delete their own post
  try {
    const myIds = JSON.parse(localStorage.getItem('fuw_my_wanted_post_ids') || '[]');
    if (!myIds.includes(docRef.id)) {
      myIds.push(docRef.id);
      localStorage.setItem('fuw_my_wanted_post_ids', JSON.stringify(myIds));
    }
  } catch {}

  return {
    id: docRef.id,
    ...payload,
    createdAt: new Date()
  };
}

/**
 * Deletes a wanted post
 */
export async function deleteWantedPost(postId: string): Promise<void> {
  if (!postId) return;
  await deleteDoc(doc(db, 'wantedPosts', postId));
}

/**
 * Closes or marks a wanted post as fulfilled
 */
export async function closeWantedPost(postId: string): Promise<void> {
  if (!postId) return;
  await updateDoc(doc(db, 'wantedPosts', postId), {
    status: 'closed',
    updatedAt: serverTimestamp()
  });
}
