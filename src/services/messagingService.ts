import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import { Conversation, DirectMessage, ParticipantProfile, UserPresence } from '../types/messaging';
import { compressImage, fileToDataUrl } from '../utils/compress';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

function handleMessagingFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
    },
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

function sanitizeIdPart(val: string): string {
  return String(val || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 60);
}

/**
 * Deterministic conversation ID scoped strictly to (buyerId, sellerId, productId)
 * Prevents duplicate conversations for the exact same buyer, seller, and product.
 */
export function buildConversationId(buyerId: string, sellerId: string, productId: string): string {
  const b = sanitizeIdPart(buyerId);
  const s = sanitizeIdPart(sellerId);
  const p = sanitizeIdPart(productId);
  return `conv_${b}__${s}__${p}`.slice(0, 128);
}

/**
 * Resolves the exact seller identity from any product document cleanly.
 */
export function resolveProductSeller(product: any): ParticipantProfile {
  const rawSellerId =
    product?.sellerId ||
    product?.ownerUid ||
    product?.userId ||
    (product?.sellerName
      ? `seller_${sanitizeIdPart(product.sellerName.toLowerCase())}`
      : 'seller_fumarket');

  const sellerName =
    product?.sellerName ||
    product?.username ||
    'FU Market Seller';

  const phone =
    product?.phoneNumber ||
    product?.ownerPhone ||
    product?.whatsappNumber ||
    product?.phone ||
    '';

  return {
    uid: String(rawSellerId),
    name: String(sellerName),
    avatarUrl: product?.sellerAvatar || '',
    email: product?.sellerEmail || '',
    phone: String(phone),
  };
}

/**
 * Converts Firestore Timestamp / ISO / numeric timestamp to milliseconds.
 */
export function toMillis(ts: any): number {
  if (!ts) return 0;
  if (typeof ts === 'number') return ts;
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (typeof ts.toDate === 'function') return ts.toDate().getTime();
  if (typeof ts.seconds === 'number') return ts.seconds * 1000;
  const parsed = Date.parse(String(ts));
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Upload a chat image to Firebase Storage under chat_images/{conversationId}/...
 * Compresses image first; falls back gracefully to compressed data URL only if Storage fails.
 */
export async function uploadChatImage(
  file: File,
  conversationId: string,
  senderId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const compressed = await compressImage(file);
  const safeName = `${sanitizeIdPart(senderId)}_${Date.now()}.jpg`;
  const storagePath = `chat_images/${sanitizeIdPart(conversationId)}/${safeName}`;
  const storageRef = ref(storage, storagePath);

  return new Promise<string>((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(async () => {
      if (!settled) {
        settled = true;
        try {
          const dataUrl = await fileToDataUrl(compressed);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      }
    }, 10000);

    try {
      const task = uploadBytesResumable(storageRef, compressed, {
        contentType: 'image/jpeg',
        cacheControl: 'public,max-age=31536000',
      });

      task.on(
        'state_changed',
        (snap) => {
          if (snap.totalBytes > 0 && onProgress) {
            onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
          }
        },
        async () => {
          clearTimeout(timer);
          if (!settled) {
            settled = true;
            try {
              const dataUrl = await fileToDataUrl(compressed);
              resolve(dataUrl);
            } catch (err) {
              reject(err);
            }
          }
        },
        async () => {
          clearTimeout(timer);
          if (!settled) {
            settled = true;
            try {
              const url = await getDownloadURL(task.snapshot.ref);
              resolve(url);
            } catch {
              const dataUrl = await fileToDataUrl(compressed);
              resolve(dataUrl);
            }
          }
        }
      );
    } catch {
      clearTimeout(timer);
      if (!settled) {
        settled = true;
        fileToDataUrl(compressed).then(resolve).catch(reject);
      }
    }
  });
}

/**
 * Opens or creates a single deterministic conversation between a buyer and a seller for a specific product.
 */
export async function getOrCreateProductConversation(
  buyer: ParticipantProfile,
  product: any
): Promise<Conversation> {
  const seller = resolveProductSeller(product);
  const productId = String(product?.id || 'item');

  if (!buyer?.uid) {
    throw new Error('Authentication required to open chat.');
  }

  if (seller.uid === buyer.uid) {
    throw new Error('You cannot start a buyer chat on your own listing.');
  }

  // Always check if the product already has a buyer-seller conversation
  const conversationId = buildConversationId(buyer.uid, seller.uid, productId);
  const convRef = doc(db, 'conversations', conversationId);

  let existingSnap;
  try {
    existingSnap = await getDoc(convRef);
  } catch (err) {
    handleMessagingFirestoreError(err, OperationType.GET, `conversations/${conversationId}`);
    throw err;
  }

  const productImage =
    product?.images?.[0] || product?.imageUrl || product?.coverImage || '';
  const productTitle = String(product?.title || 'Marketplace Product').slice(0, 140);
  const productPrice = Number(product?.price || 0);

  if (existingSnap.exists()) {
    const data = existingSnap.data() as Conversation;
    // Verify current user is a participant
    if (!data.participants?.includes(buyer.uid)) {
      throw new Error('You do not have permission to access this conversation.');
    }
    // If buyer previously soft-deleted this conversation from their inbox, un-hide it
    if (data.deletedFor?.includes(buyer.uid)) {
      const updatedDeletedFor = data.deletedFor.filter((id) => id !== buyer.uid);
      await updateDoc(convRef, { deletedFor: updatedDeletedFor }).catch(() => {});
      return { ...data, deletedFor: updatedDeletedFor };
    }
    return data;
  }

  // Try to fetch seller's latest profile from users/{seller.uid} if available
  let latestSellerName = seller.name;
  let latestSellerAvatar = seller.avatarUrl || '';
  try {
    const sellerDoc = await getDoc(doc(db, 'users', seller.uid));
    if (sellerDoc.exists()) {
      const sData = sellerDoc.data();
      if (sData?.displayName) latestSellerName = sData.displayName;
      if (sData?.photoURL) latestSellerAvatar = sData.photoURL;
    }
  } catch {
    // Use product's embedded seller metadata if users/{uid} not yet populated
  }

  const newConversation: Conversation = {
    conversationId,
    participants: [buyer.uid, seller.uid],
    participantInfo: {
      [buyer.uid]: {
        uid: buyer.uid,
        name: buyer.name || 'Buyer',
        avatarUrl: buyer.avatarUrl || '',
        email: buyer.email || '',
        phone: buyer.phone || '',
      },
      [seller.uid]: {
        uid: seller.uid,
        name: latestSellerName,
        avatarUrl: latestSellerAvatar,
        email: seller.email || '',
        phone: seller.phone || '',
      },
    },
    productId,
    productTitle,
    productPrice,
    productImage,
    buyerId: buyer.uid,
    sellerId: seller.uid,
    lastMessage: '',
    lastMessageType: 'text',
    lastSenderId: '',
    lastMessageAt: serverTimestamp(),
    unreadCounts: {
      [buyer.uid]: 0,
      [seller.uid]: 0,
    },
    typing: {},
    deletedFor: [],
    clearedBefore: {},
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(convRef, newConversation);
  } catch (err) {
    handleMessagingFirestoreError(err, OperationType.CREATE, `conversations/${conversationId}`);
    throw err;
  }

  return {
    ...newConversation,
    lastMessageAt: Date.now(),
    createdAt: Date.now(),
  };
}

/**
 * Subscribe in real time to all conversations the authenticated user participates in.
 */
export function subscribeUserConversations(
  uid: string,
  onUpdate: (conversations: Conversation[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!uid) {
    onUpdate([]);
    return () => {};
  }

  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', uid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Conversation[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Conversation;
        // Double-check participation & soft-deletion for current user's inbox
        if (
          data.participants?.includes(uid) &&
          !data.deletedFor?.includes(uid)
        ) {
          items.push({
            ...data,
            conversationId: data.conversationId || docSnap.id,
          });
        }
      });

      items.sort((a, b) => {
        const tA = toMillis(a.lastMessageAt) || toMillis(a.createdAt);
        const tB = toMillis(b.lastMessageAt) || toMillis(b.createdAt);
        return tB - tA;
      });

      onUpdate(items);
    },
    (error) => {
      handleMessagingFirestoreError(error, OperationType.LIST, 'conversations');
      if (onError) onError(error);
    }
  );
}

/**
 * Subscribe in real time to messages for a specific conversation.
 * Queries with `where('participants', 'array-contains', uid)` so Firestore rules
 * enforce participant privacy at the query boundary without needing a composite index.
 */
export function subscribeConversationMessages(
  uid: string,
  conversationId: string,
  clearedAfterMs: number,
  onUpdate: (messages: DirectMessage[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!uid || !conversationId) {
    onUpdate([]);
    return () => {};
  }

  const q = query(
    collection(db, 'messages'),
    where('participants', 'array-contains', uid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: DirectMessage[] = [];
      const undeliveredRefs: string[] = [];

      snapshot.forEach((docSnap) => {
        const msg = docSnap.data() as DirectMessage;
        if (msg.conversationId !== conversationId) return;
        if (!msg.participants?.includes(uid)) return;

        const msgTime = toMillis(msg.createdAt) || msg.clientTimestamp || 0;
        if (clearedAfterMs > 0 && msgTime > 0 && msgTime <= clearedAfterMs) {
          return;
        }

        list.push({
          ...msg,
          messageId: msg.messageId || docSnap.id,
        });

        if (msg.receiverId === uid && !msg.deliveredAt) {
          undeliveredRefs.push(docSnap.id);
        }
      });

      list.sort((a, b) => {
        const tA = toMillis(a.createdAt) || a.clientTimestamp || 0;
        const tB = toMillis(b.createdAt) || b.clientTimestamp || 0;
        return tA - tB;
      });

      onUpdate(list);

      // Mark newly received messages as delivered in background
      if (undeliveredRefs.length > 0) {
        undeliveredRefs.forEach((msgId) => {
          updateDoc(doc(db, 'messages', msgId), {
            deliveredAt: serverTimestamp(),
          }).catch(() => {});
        });
      }
    },
    (error) => {
      handleMessagingFirestoreError(error, OperationType.LIST, `messages/${conversationId}`);
      if (onError) onError(error);
    }
  );
}

/**
 * Sends a real-time message (text and/or image) and updates conversation summary + unread counts.
 */
export async function sendDirectMessage(params: {
  conversation: Conversation;
  senderId: string;
  text: string;
  imageFile?: File | null;
  onImageProgress?: (percent: number) => void;
}): Promise<void> {
  const { conversation, senderId, text, imageFile, onImageProgress } = params;

  if (!conversation.participants?.includes(senderId)) {
    throw new Error('Unauthorized: You are not a participant of this conversation.');
  }

  const receiverId =
    conversation.participants.find((id) => id !== senderId) ||
    (conversation.buyerId === senderId ? conversation.sellerId : conversation.buyerId);

  const trimmedText = text.trim();
  if (!trimmedText && !imageFile) {
    return;
  }

  let uploadedImageUrl: string | null = null;
  if (imageFile) {
    uploadedImageUrl = await uploadChatImage(
      imageFile,
      conversation.conversationId,
      senderId,
      onImageProgress
    );
  }

  const msgRef = doc(collection(db, 'messages'));
  const messageType: 'text' | 'image' = uploadedImageUrl ? 'image' : 'text';
  const clientTs = Date.now();

  const messagePayload: DirectMessage = {
    messageId: msgRef.id,
    conversationId: conversation.conversationId,
    participants: conversation.participants,
    senderId,
    receiverId,
    text: trimmedText,
    imageUrl: uploadedImageUrl,
    createdAt: serverTimestamp(),
    clientTimestamp: clientTs,
    deliveredAt: null,
    readAt: null,
    messageType,
  };

  try {
    await setDoc(msgRef, messagePayload);
  } catch (err) {
    handleMessagingFirestoreError(err, OperationType.CREATE, `messages/${msgRef.id}`);
    throw err;
  }

  const convRef = doc(db, 'conversations', conversation.conversationId);
  const lastPreview = uploadedImageUrl
    ? trimmedText
      ? `📷 ${trimmedText}`
      : '📷 Photo'
    : trimmedText;

  try {
    await updateDoc(convRef, {
      lastMessage: lastPreview.slice(0, 200),
      lastMessageType: messageType,
      lastSenderId: senderId,
      lastMessageAt: serverTimestamp(),
      [`unreadCounts.${receiverId}`]: increment(1),
      [`typing.${senderId}`]: null,
      deletedFor: [],
    });
  } catch (err) {
    handleMessagingFirestoreError(
      err,
      OperationType.UPDATE,
      `conversations/${conversation.conversationId}`
    );
    throw err;
  }
}

/**
 * Marks all unread incoming messages in a conversation as read and resets the user's unread count.
 */
export async function markConversationRead(
  conversation: Conversation,
  currentUid: string,
  messages: DirectMessage[]
): Promise<void> {
  if (!conversation?.conversationId || !currentUid) return;
  if (!conversation.participants?.includes(currentUid)) return;

  const currentUnread = conversation.unreadCounts?.[currentUid] || 0;
  if (currentUnread > 0) {
    updateDoc(doc(db, 'conversations', conversation.conversationId), {
      [`unreadCounts.${currentUid}`]: 0,
    }).catch(() => {});
  }

  const unreadMsgs = messages.filter(
    (m) => m.receiverId === currentUid && !m.readAt
  );

  for (const m of unreadMsgs) {
    updateDoc(doc(db, 'messages', m.messageId), {
      readAt: serverTimestamp(),
      deliveredAt: m.deliveredAt || serverTimestamp(),
    }).catch(() => {});
  }
}

/**
 * Updates typing indicator on conversation doc.
 */
export async function setTypingIndicator(
  conversationId: string,
  uid: string,
  isTyping: boolean
): Promise<void> {
  if (!conversationId || !uid) return;
  try {
    await updateDoc(doc(db, 'conversations', conversationId), {
      [`typing.${uid}`]: isTyping ? Date.now() : null,
    });
  } catch {
    // Non-critical typing telemetry error
  }
}

/**
 * Soft-deletes a conversation from the current user's inbox WITHOUT deleting
 * the conversation or messages for the other participant.
 */
export async function deleteConversationFromInbox(
  conversationId: string,
  uid: string
): Promise<void> {
  if (!conversationId || !uid) return;
  const convRef = doc(db, 'conversations', conversationId);
  try {
    await updateDoc(convRef, {
      deletedFor: arrayUnion(uid),
      [`clearedBefore.${uid}`]: Date.now(),
      [`unreadCounts.${uid}`]: 0,
    });
  } catch (err) {
    handleMessagingFirestoreError(err, OperationType.UPDATE, `conversations/${conversationId}`);
    throw err;
  }
}

/**
 * Real-time presence listener for a conversation partner.
 */
export function subscribeUserPresence(
  targetUid: string,
  onUpdate: (presence: UserPresence | null) => void
): () => void {
  if (!targetUid) {
    onUpdate(null);
    return () => {};
  }

  return onSnapshot(
    doc(db, 'users', targetUid),
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      onUpdate(snap.data() as UserPresence);
    },
    () => {
      onUpdate(null);
    }
  );
}
