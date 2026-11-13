export interface ParticipantProfile {
  uid: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
}

export interface Conversation {
  conversationId: string;
  participants: string[];
  participantInfo: Record<string, ParticipantProfile>;
  productId: string;
  productTitle: string;
  productPrice?: number;
  productImage?: string;
  buyerId: string;
  sellerId: string;
  lastMessage: string;
  lastMessageType?: 'text' | 'image';
  lastSenderId?: string;
  lastMessageAt: any;
  unreadCounts: Record<string, number>;
  typing?: Record<string, number | null>;
  deletedFor?: string[];
  clearedBefore?: Record<string, number>;
  createdAt: any;
}

export interface DirectMessage {
  messageId: string;
  conversationId: string;
  participants: string[];
  senderId: string;
  receiverId: string;
  text: string;
  imageUrl?: string | null;
  createdAt: any;
  clientTimestamp?: number;
  deliveredAt?: any;
  readAt?: any;
  messageType: 'text' | 'image';
}

export interface UserPresence {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  isOnline: boolean;
  lastSeen?: any;
}
