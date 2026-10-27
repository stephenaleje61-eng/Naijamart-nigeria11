import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  serverTimestamp, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';
import { createClient } from '@supabase/supabase-js';
import { SquatterItem } from '../types';
import { INITIAL_SQUATTER_ITEMS } from '../data/constants';

// Optional Supabase client initialization if environment credentials are supplied
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Real-time listener for Squatter Board listings.
 * Reads from Firestore collection 'squatter_board' and syncs with Supabase if connected.
 */
export const subscribeToSquatterBoard = (
  onData: (items: SquatterItem[]) => void
): (() => void) => {
  const collectionRef = collection(db, 'squatter_board');
  const q = query(collectionRef);

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const liveList: SquatterItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        liveList.push({
          id: docSnap.id,
          type: data.type || 'have_space',
          location: data.location || 'Hostel A',
          price: Number(data.price) || 0,
          gender: data.gender || 'any',
          people_in_room: data.people_in_room || '1 person',
          whatsapp: data.whatsapp || '',
          images: Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []),
          description: data.description || '',
          is_verified: data.is_verified ?? true,
          created_at: data.created_at || new Date().toISOString(),
        });
      });

      // Real listings only
      liveList.sort((a, b) => {
        const tA = a.created_at?.toDate ? a.created_at.toDate().getTime() : new Date(a.created_at).getTime() || 0;
        const tB = b.created_at?.toDate ? b.created_at.toDate().getTime() : new Date(b.created_at).getTime() || 0;
        return tB - tA;
      });

      onData(liveList);
    },
    (err) => {
      console.warn('Squatter board Firestore listener error:', err);
      onData([]);
    }
  );

  return unsubscribe;
};

/**
 * Creates a new bedspace / squatter post.
 * Saves to Supabase (if configured) and Firestore, plus localStorage.
 */
export const createSquatterPost = async (
  payload: Omit<SquatterItem, 'id' | 'created_at'>
): Promise<SquatterItem> => {
  const postPayload = {
    type: payload.type,
    location: payload.location,
    price: Number(payload.price) || 0,
    gender: payload.gender,
    people_in_room: payload.people_in_room,
    whatsapp: payload.whatsapp.trim(),
    images: payload.images,
    description: payload.description.trim(),
    is_verified: true,
    created_at: serverTimestamp(),
  };

  // 1. Save to Supabase table `squatter_board` if connected
  if (supabase) {
    try {
      await supabase.from('squatter_board').insert([
        {
          type: payload.type,
          location: payload.location,
          price: Number(payload.price) || 0,
          gender: payload.gender,
          people_in_room: payload.people_in_room,
          whatsapp: payload.whatsapp.trim(),
          images: payload.images,
          description: payload.description.trim(),
          is_verified: true,
          created_at: new Date().toISOString(),
        }
      ]);
    } catch (supaErr) {
      console.warn('Supabase insert warning:', supaErr);
    }
  }

  // 2. Save to Firestore collection `squatter_board`
  const docRef = await addDoc(collection(db, 'squatter_board'), postPayload);

  // 3. Save to localStorage for user tracking
  try {
    const saved = JSON.parse(localStorage.getItem('naijamart_my_squatter_ids') || '[]');
    saved.push(docRef.id);
    localStorage.setItem('naijamart_my_squatter_ids', JSON.stringify(saved));
  } catch (e) {}

  return {
    id: docRef.id,
    ...payload,
    is_verified: true,
    created_at: new Date().toISOString(),
  };
};
