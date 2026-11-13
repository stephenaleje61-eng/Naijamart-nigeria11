import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { Conversation } from '../types/messaging';
import {
  subscribeUserConversations,
  getOrCreateProductConversation,
  deleteConversationFromInbox,
  resolveProductSeller,
} from '../services/messagingService';

interface MessagingContextType {
  conversations: Conversation[];
  loadingConversations: boolean;
  totalUnreadCount: number;
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  setActiveConversationId: (id: string | null) => void;
  openingChat: boolean;
  openChatWithSeller: (product: any, navigateToMessages?: () => void) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  registerNavigateCallback: (cb: () => void) => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState<boolean>(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [openingChat, setOpeningChat] = useState<boolean>(false);
  const [pendingProduct, setPendingProduct] = useState<{
    product: any;
    navigate?: () => void;
  } | null>(null);
  const [navigateToMessagesFn, setNavigateToMessagesFn] = useState<(() => void) | null>(null);

  const registerNavigateCallback = useCallback((cb: () => void) => {
    setNavigateToMessagesFn(() => cb);
  }, []);

  // Subscribe in real-time to user's conversations when authenticated
  useEffect(() => {
    if (!user?.uid) {
      setConversations([]);
      setActiveConversationId(null);
      setLoadingConversations(false);
      return;
    }

    setLoadingConversations(true);
    const unsub = subscribeUserConversations(
      user.uid,
      (list) => {
        setConversations(list);
        setLoadingConversations(false);
      },
      (err) => {
        console.warn('Conversations listener warning:', err.message);
        setLoadingConversations(false);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  const totalUnreadCount = useMemo(() => {
    if (!user?.uid) return 0;
    return conversations.reduce((sum, conv) => {
      return sum + (Number(conv.unreadCounts?.[user.uid]) || 0);
    }, 0);
  }, [conversations, user?.uid]);

  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    return conversations.find((c) => c.conversationId === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  const openChatWithSeller = useCallback(
    async (product: any, navigateToMessages?: () => void) => {
      if (!product) return;

      const navFn = navigateToMessages || navigateToMessagesFn || undefined;

      if (!user?.uid) {
        setPendingProduct({ product, navigate: navFn });
        showToast('Please sign in to chat with the seller', 'info');
        openAuthModal('signin');
        return;
      }

      const seller = resolveProductSeller(product);

      // If current user IS the seller of this item
      if (seller.uid === user.uid) {
        const existingForProduct = conversations.find(
          (c) => c.productId === product.id && c.sellerId === user.uid
        );
        if (existingForProduct) {
          setActiveConversationId(existingForProduct.conversationId);
          navFn?.();
        } else {
          showToast('This is your listing. Buyer messages for this item will appear in Messages.', 'info');
          navFn?.();
        }
        return;
      }

      setOpeningChat(true);
      try {
        const buyerProfile = {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'FU Market Buyer',
          avatarUrl: user.photoURL || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
        };

        const conv = await getOrCreateProductConversation(buyerProfile, product);
        setConversations((prev) => {
          const exists = prev.some((c) => c.conversationId === conv.conversationId);
          return exists ? prev : [conv, ...prev];
        });
        setActiveConversationId(conv.conversationId);
        navFn?.();
      } catch (err: any) {
        console.error('Failed to open seller chat:', err);
        showToast(err?.message || 'Could not open chat right now. Please try again.', 'error');
      } finally {
        setOpeningChat(false);
      }
    },
    [user, conversations, navigateToMessagesFn, openAuthModal, showToast]
  );

  // Resume pending chat action right after user completes login
  useEffect(() => {
    if (user?.uid && pendingProduct) {
      const { product, navigate } = pendingProduct;
      setPendingProduct(null);
      openChatWithSeller(product, navigate);
    }
  }, [user?.uid, pendingProduct, openChatWithSeller]);

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      if (!user?.uid) return;
      try {
        await deleteConversationFromInbox(conversationId, user.uid);
        if (activeConversationId === conversationId) {
          setActiveConversationId(null);
        }
        showToast('Conversation removed from your inbox', 'info');
      } catch (err: any) {
        showToast(err?.message || 'Could not delete conversation', 'error');
      }
    },
    [user?.uid, activeConversationId, showToast]
  );

  return (
    <MessagingContext.Provider
      value={{
        conversations,
        loadingConversations,
        totalUnreadCount,
        activeConversationId,
        activeConversation,
        setActiveConversationId,
        openingChat,
        openChatWithSeller,
        deleteConversation,
        registerNavigateCallback,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const ctx = useContext(MessagingContext);
  if (!ctx) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return ctx;
};
