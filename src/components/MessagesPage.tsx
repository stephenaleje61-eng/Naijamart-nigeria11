import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  ImagePlus,
  ArrowLeft,
  Trash2,
  Check,
  CheckCheck,
  ShoppingBag,
  Loader2,
  AlertCircle,
  X,
  LogIn,
  ShieldCheck,
  Circle,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMessaging } from '../context/MessagingContext';
import { useToast } from '../context/ToastContext';
import { Conversation, DirectMessage, UserPresence } from '../types/messaging';
import {
  subscribeConversationMessages,
  sendDirectMessage,
  markConversationRead,
  setTypingIndicator,
  subscribeUserPresence,
  toMillis,
} from '../services/messagingService';
import { formatNaira } from '../utils/formatters';
import { SafeImage } from './SafeImage';

interface MessagesPageProps {
  onNavigate?: (route: string) => void;
}

function formatMessageTime(ts: any, fallbackMs?: number): string {
  const ms = toMillis(ts) || fallbackMs || 0;
  if (!ms) return 'Just now';
  const date = new Date(ms);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatInboxTime(ts: any): string {
  const ms = toMillis(ts);
  if (!ms) return '';
  const diff = Date.now() - ms;
  if (diff < 60 * 1000) return 'Just now';
  const date = new Date(ms);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatLastSeen(presence: UserPresence | null): { online: boolean; label: string } {
  if (!presence) return { online: false, label: 'Offline' };
  const lastMs = toMillis(presence.lastSeen);
  const recentlyActive = lastMs > 0 && Date.now() - lastMs < 5 * 60 * 1000;
  if (presence.isOnline && (recentlyActive || lastMs === 0)) {
    return { online: true, label: 'Online' };
  }
  if (!lastMs) return { online: false, label: 'Offline' };
  const diffMins = Math.floor((Date.now() - lastMs) / 60000);
  if (diffMins < 60) return { online: false, label: `Last seen ${Math.max(1, diffMins)}m ago` };
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return { online: false, label: `Last seen ${diffHours}h ago` };
  return {
    online: false,
    label: `Last seen ${new Date(lastMs).toLocaleDateString([], { month: 'short', day: 'numeric' })}`,
  };
}

export const MessagesPage: React.FC<MessagesPageProps> = ({ onNavigate }) => {
  const { user, openAuthModal } = useAuth();
  const {
    conversations,
    loadingConversations,
    totalUnreadCount,
    activeConversationId,
    activeConversation,
    setActiveConversationId,
    deleteConversation,
  } = useMessaging();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  const [textInput, setTextInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSending, setIsSending] = useState(false);

  const [partnerPresence, setPartnerPresence] = useState<UserPresence | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentUid = user?.uid || '';

  // Helper to get the other participant in a conversation
  const getPartner = (conv: Conversation) => {
    const partnerUid =
      conv.participants.find((id) => id !== currentUid) ||
      (conv.buyerId === currentUid ? conv.sellerId : conv.buyerId);
    const info = conv.participantInfo?.[partnerUid];
    return {
      uid: partnerUid,
      name: info?.name || (partnerUid === conv.sellerId ? 'Seller' : 'Buyer'),
      avatarUrl: info?.avatarUrl || '',
      role: partnerUid === conv.sellerId ? 'Seller' : 'Buyer',
    };
  };

  // Security check: ensure user is strictly a participant of activeConversation
  const isAuthorizedParticipant =
    Boolean(activeConversation && currentUid && activeConversation.participants?.includes(currentUid));

  const activePartner = activeConversation ? getPartner(activeConversation) : null;

  // Check if partner is currently typing (within last 5 seconds)
  const partnerTypingTs =
    activeConversation && activePartner
      ? Number(activeConversation.typing?.[activePartner.uid] || 0)
      : 0;
  const isPartnerTyping = partnerTypingTs > 0 && Date.now() - partnerTypingTs < 5000;

  // Subscribe to messages for active conversation
  useEffect(() => {
    if (!currentUid || !activeConversationId || !activeConversation) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    if (!activeConversation.participants?.includes(currentUid)) {
      setMessageError('Access denied: You are not a participant of this conversation.');
      setMessages([]);
      return;
    }

    setMessageError(null);
    setLoadingMessages(true);
    const clearedBeforeMs = Number(activeConversation.clearedBefore?.[currentUid] || 0);

    const unsub = subscribeConversationMessages(
      currentUid,
      activeConversationId,
      clearedBeforeMs,
      (list) => {
        setMessages(list);
        setLoadingMessages(false);
        markConversationRead(activeConversation, currentUid, list);
      },
      (err) => {
        setMessageError(err.message || 'Unable to load messages.');
        setLoadingMessages(false);
      }
    );

    return () => unsub();
  }, [currentUid, activeConversationId, activeConversation?.clearedBefore?.[currentUid]]);

  // Subscribe to partner online/offline presence
  useEffect(() => {
    if (!activePartner?.uid) {
      setPartnerPresence(null);
      return;
    }

    const unsub = subscribeUserPresence(activePartner.uid, (presence) => {
      setPartnerPresence(presence);
    });

    return () => unsub();
  }, [activePartner?.uid]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isPartnerTyping, activeConversationId]);

  // Cleanup image preview URL
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Handle typing indicator debounce
  const handleInputChange = (val: string) => {
    setTextInput(val);
    if (!activeConversationId || !currentUid) return;

    setTypingIndicator(activeConversationId, currentUid, val.trim().length > 0);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (val.trim().length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setTypingIndicator(activeConversationId, currentUid, false);
      }, 2500);
    }
  };

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    e.target.value = '';
  };

  const clearSelectedImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImage(null);
    setImagePreviewUrl(null);
    setUploadProgress(0);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConversation || !currentUid || isSending) return;

    const trimmed = textInput.trim();
    if (!trimmed && !selectedImage) return;

    const imageToSend = selectedImage;
    setTextInput('');
    clearSelectedImage();
    setMessageError(null);
    setIsSending(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    try {
      await sendDirectMessage({
        conversation: activeConversation,
        senderId: currentUid,
        text: trimmed,
        imageFile: imageToSend,
        onImageProgress: (pct) => setUploadProgress(pct),
      });
    } catch (err: any) {
      console.error('Send message failed:', err);
      setMessageError(err?.message || 'Failed to send message. Please check your connection.');
      setTextInput(trimmed);
    } finally {
      setIsSending(false);
      setUploadProgress(0);
    }
  };

  // Unauthenticated gate for private Messages
  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-[#151515] rounded-3xl p-8 border border-[#2A2A2A] shadow-xl">
          <div className="w-16 h-16 bg-[#0A0A0A] border border-[#2A2A2A] text-[#10B981] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">FU MARKET Messages 💬</h2>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">
            Sign in to chat in real time with buyers and sellers, share product photos, and keep your conversations synced across devices.
          </p>
          <button
            onClick={() => openAuthModal('signin')}
            className="w-full bg-[#008751] hover:bg-[#007043] text-white py-3.5 px-6 rounded-2xl font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            <span>Sign In to Open Messages</span>
          </button>
        </div>
      </div>
    );
  }

  // Filter inbox conversations by search query
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const partner = getPartner(conv);
    return (
      partner.name.toLowerCase().includes(q) ||
      (conv.productTitle || '').toLowerCase().includes(q) ||
      (conv.lastMessage || '').toLowerCase().includes(q)
    );
  });

  const presenceInfo = formatLastSeen(partnerPresence);

  return (
    <div className="max-w-6xl mx-auto pb-8">
      <div className="bg-[#151515] border border-[#2A2A2A] rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-155px)] min-h-[540px]">
        {/* LEFT PANEL: Conversations Inbox */}
        <div
          className={`md:col-span-4 lg:col-span-4 border-r border-[#2A2A2A] flex flex-col bg-[#121212] ${
            activeConversationId ? 'hidden md:flex' : 'flex'
          } h-full overflow-hidden`}
        >
          {/* Inbox Header */}
          <div className="p-4 border-b border-[#2A2A2A] bg-[#151515]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>Messages</span>
                  <span className="text-base">💬</span>
                </h1>
                {totalUnreadCount > 0 && (
                  <span className="bg-[#25D366] text-gray-950 text-[11px] font-black px-2 py-0.5 rounded-full">
                    {totalUnreadCount} new
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Private</span>
              </span>
            </div>

            {/* Search Conversations */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats or products..."
                className="w-full pl-9 pr-8 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#008751]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#222]">
            {loadingConversations ? (
              <div className="p-8 text-center">
                <Loader2 className="w-7 h-7 animate-spin text-[#10B981] mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-medium">Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl flex items-center justify-center mx-auto text-[#10B981]">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {searchQuery ? 'No matching conversations' : 'Your inbox is empty'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                    {searchQuery
                      ? 'Try searching for another seller name or product.'
                      : 'Click "💬 Chat with Seller" on any product listing to start a real-time chat.'}
                  </p>
                </div>
                {!searchQuery && onNavigate && (
                  <button
                    onClick={() => onNavigate('market')}
                    className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white text-xs font-black rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Explore FU MARKET</span>
                  </button>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const partner = getPartner(conv);
                const unread = Number(conv.unreadCounts?.[currentUid] || 0);
                const isSelected = activeConversationId === conv.conversationId;
                const typingTs = Number(conv.typing?.[partner.uid] || 0);
                const typingNow = typingTs > 0 && Date.now() - typingTs < 5000;

                return (
                  <div
                    key={conv.conversationId}
                    onClick={() => {
                      setConfirmDeleteId(null);
                      setActiveConversationId(conv.conversationId);
                    }}
                    className={`p-3.5 cursor-pointer transition-colors relative group ${
                      isSelected
                        ? 'bg-[#008751]/20 border-l-4 border-l-[#10B981]'
                        : 'hover:bg-[#1A1A1A]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Partner Avatar + Product Thumbnail */}
                      <div className="relative shrink-0">
                        {partner.avatarUrl ? (
                          <SafeImage
                            src={partner.avatarUrl}
                            alt={partner.name}
                            fallbackCategory="avatar"
                            className="w-11 h-11 rounded-full object-cover border border-[#2A2A2A]"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-[#008751] text-white font-black flex items-center justify-center text-sm border border-emerald-400/30">
                            {partner.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>

                      {/* Main Conversation Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-black text-xs sm:text-sm text-white truncate">
                              {partner.name}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#222] text-gray-300 border border-[#333] shrink-0">
                              {partner.role}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                            {formatInboxTime(conv.lastMessageAt)}
                          </span>
                        </div>

                        {/* Product title pill */}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold text-[#10B981] truncate">
                            {conv.productTitle}
                          </span>
                        </div>

                        {/* Last Message + Unread Badge */}
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p
                            className={`text-xs truncate ${
                              typingNow
                                ? 'text-[#25D366] font-bold italic'
                                : unread > 0
                                ? 'text-white font-bold'
                                : 'text-gray-400'
                            }`}
                          >
                            {typingNow
                              ? 'Typing...'
                              : conv.lastMessage || 'Conversation started — tap to message'}
                          </p>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {unread > 0 && (
                              <span className="min-w-[18px] h-[18px] px-1 bg-[#25D366] text-gray-950 text-[10px] font-black rounded-full flex items-center justify-center">
                                {unread}
                              </span>
                            )}

                            {/* Delete from own inbox button */}
                            {confirmDeleteId === conv.conversationId ? (
                              <div
                                className="flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteConversation(conv.conversationId);
                                    setConfirmDeleteId(null);
                                  }}
                                  className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded cursor-pointer"
                                >
                                  Remove
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-1.5 py-0.5 bg-[#2A2A2A] text-gray-300 text-[10px] font-bold rounded cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(conv.conversationId);
                                }}
                                title="Delete conversation from your inbox"
                                className="p-1 text-gray-500 hover:text-red-400 rounded-lg opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Active Chat Thread */}
        <div
          className={`md:col-span-8 lg:col-span-8 flex flex-col bg-[#0B0F0D] ${
            !activeConversationId ? 'hidden md:flex' : 'flex'
          } h-full overflow-hidden`}
        >
          {!activeConversation || !activePartner ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#151515] border border-[#2A2A2A] flex items-center justify-center mb-4 text-[#10B981] shadow-lg">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-black text-white mb-2">
                FU MARKET Real-Time Messaging
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 max-w-md leading-relaxed">
                Select a conversation on the left to continue chatting, or open any product on FU MARKET and tap{' '}
                <strong className="text-[#10B981]">💬 Chat with Seller</strong>.
              </p>
            </div>
          ) : !isAuthorizedParticipant ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
              <h3 className="text-lg font-black text-white">Conversation Restricted</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                You cannot access conversations that you are not a participant of.
              </p>
            </div>
          ) : (
            <>
              {/* Active Chat Header */}
              <div className="bg-[#151515] border-b border-[#2A2A2A] px-3 sm:px-4 py-3 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Back button on mobile */}
                  <button
                    type="button"
                    onClick={() => setActiveConversationId(null)}
                    className="md:hidden p-1.5 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] text-gray-300 hover:text-white cursor-pointer"
                    aria-label="Back to inbox"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="relative shrink-0">
                    {activePartner.avatarUrl ? (
                      <SafeImage
                        src={activePartner.avatarUrl}
                        alt={activePartner.name}
                        fallbackCategory="avatar"
                        className="w-10 h-10 rounded-full object-cover border border-[#2A2A2A]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#008751] text-white font-black flex items-center justify-center text-sm border border-emerald-400/30">
                        {activePartner.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#151515] ${
                        presenceInfo.online ? 'bg-[#25D366]' : 'bg-gray-500'
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-black text-sm text-white truncate">
                        {activePartner.name}
                      </h2>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    </div>
                    <p className="text-[11px] font-medium flex items-center gap-1.5">
                      {isPartnerTyping ? (
                        <span className="text-[#25D366] font-bold animate-pulse">typing...</span>
                      ) : (
                        <>
                          <Circle
                            className={`w-2 h-2 fill-current ${
                              presenceInfo.online ? 'text-[#25D366]' : 'text-gray-500'
                            }`}
                          />
                          <span className={presenceInfo.online ? 'text-emerald-400' : 'text-gray-400'}>
                            {presenceInfo.label}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Inbox soft-delete button */}
                <button
                  type="button"
                  onClick={() => deleteConversation(activeConversation.conversationId)}
                  title="Delete conversation from your inbox"
                  className="p-2 rounded-xl bg-[#0A0A0A] hover:bg-red-950/40 text-gray-400 hover:text-red-400 border border-[#2A2A2A] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Pinned Product Context Banner (Always identifies the exact product being discussed) */}
              <div className="bg-[#121916] border-b border-[#24322B] px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#2A2A2A] shrink-0">
                    <SafeImage
                      src={activeConversation.productImage}
                      alt={activeConversation.productTitle}
                      fallbackCategory="product"
                      aspectRatio="aspect-square"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#10B981] block">
                      Product Inquiry
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-white truncate">
                      {activeConversation.productTitle}
                    </p>
                  </div>
                </div>

                {Number(activeConversation.productPrice || 0) > 0 && (
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black text-[#25D366]">
                      {formatNaira(Number(activeConversation.productPrice))}
                    </span>
                  </div>
                )}
              </div>

              {/* Error Banner */}
              {messageError && (
                <div className="bg-red-950/60 border-b border-red-800/60 px-4 py-2 flex items-center justify-between text-xs text-red-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{messageError}</span>
                  </div>
                  <button onClick={() => setMessageError(null)} className="text-red-300 hover:text-white cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
                {loadingMessages ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Loader2 className="w-7 h-7 animate-spin text-[#10B981] mb-2" />
                    <span className="text-xs font-medium">Loading messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#151515] border border-[#2A2A2A] flex items-center justify-center text-[#10B981] mb-3">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-black text-white">
                      Start chatting with {activePartner.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
                      Ask about "{activeConversation.productTitle}", negotiate price, or arrange a safe campus meetup.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === currentUid;
                    return (
                      <div
                        key={msg.messageId}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 shadow-sm text-xs sm:text-sm ${
                            isMine
                              ? 'bg-[#005C4B] text-white rounded-tr-xs border border-emerald-700/40'
                              : 'bg-[#1D1F21] text-gray-100 rounded-tl-xs border border-[#2A2A2A]'
                          }`}
                        >
                          {/* Image attachment */}
                          {msg.imageUrl && (
                            <div
                              onClick={() => setLightboxImage(msg.imageUrl || null)}
                              className="mb-1.5 rounded-xl overflow-hidden bg-black/40 border border-white/10 cursor-pointer max-w-[260px]"
                            >
                              <img
                                src={msg.imageUrl}
                                alt="Shared attachment"
                                className="w-full max-h-64 object-cover"
                              />
                            </div>
                          )}

                          {/* Text content */}
                          {msg.text && (
                            <p className="whitespace-pre-wrap break-words leading-relaxed">
                              {msg.text}
                            </p>
                          )}

                          {/* Timestamp & Delivery / Read Status */}
                          <div className="flex items-center justify-end gap-1 mt-1 text-[10px]">
                            <span className={isMine ? 'text-emerald-200/80' : 'text-gray-400'}>
                              {formatMessageTime(msg.createdAt, msg.clientTimestamp)}
                            </span>
                            {isMine && (
                              msg.readAt ? (
                                <span title="Read" className="inline-flex">
                                  <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                                </span>
                              ) : msg.deliveredAt ? (
                                <span title="Delivered" className="inline-flex">
                                  <CheckCheck className="w-3.5 h-3.5 text-gray-300" />
                                </span>
                              ) : (
                                <span title="Sent" className="inline-flex">
                                  <Check className="w-3.5 h-3.5 text-gray-300" />
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Live Typing Bubble */}
                {isPartnerTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#1D1F21] border border-[#2A2A2A] rounded-2xl rounded-tl-xs px-3.5 py-2 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span>{activePartner.name} is typing</span>
                      <span className="inline-flex gap-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Pending Image Preview Strip */}
              {imagePreviewUrl && (
                <div className="bg-[#151515] border-t border-[#2A2A2A] px-4 py-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={imagePreviewUrl}
                      alt="Attachment preview"
                      className="w-12 h-12 rounded-xl object-cover border border-[#2A2A2A]"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">Photo ready to send</p>
                      {isSending && uploadProgress > 0 && (
                        <p className="text-[11px] text-[#10B981]">Uploading: {uploadProgress}%</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelectedImage}
                    className="p-1.5 rounded-full bg-[#222] text-gray-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Message Composer Bar */}
              <form
                onSubmit={handleSend}
                className="bg-[#151515] border-t border-[#2A2A2A] p-2.5 sm:p-3 flex items-center gap-2 shrink-0"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSelectImage}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending}
                  title="Attach photo"
                  className="w-10 h-10 rounded-full bg-[#0A0A0A] hover:bg-[#222] border border-[#2A2A2A] text-gray-300 hover:text-[#10B981] flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ImagePlus className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={`Message ${activePartner.name}...`}
                  className="flex-1 px-4 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                />

                <button
                  type="submit"
                  disabled={isSending || (!textInput.trim() && !selectedImage)}
                  aria-label="Send message"
                  className="w-10 h-10 rounded-full bg-[#008751] hover:bg-[#007043] disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 ml-0.5" />
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Fullscreen Image Preview Lightbox */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Full view"
            className="max-w-full max-h-[90vh] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
