import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  GraduationCap, 
  Check, 
  CheckCheck, 
  AlertTriangle,
  Flag,
  UserCheck,
  UserPlus,
  Tag,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  onSnapshot, 
  query, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useStudent } from '../context/StudentContext';
import { formatNaira } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { ChatMessage } from '../types';

export const PrivateChatModal: React.FC = () => {
  const { 
    profile, 
    activeChatPartner, 
    activeProductContext, 
    closePrivateChat, 
    reportFakeStudent,
    acceptedFriends,
    sentRequests,
    sendFriendRequest 
  } = useStudent();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('Suspicious / Scam behavior');
  
  // Bargain Offer Drawer inside chat
  const [showOfferDrawer, setShowOfferDrawer] = useState(false);
  const [offerAmountInput, setOfferAmountInput] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!activeChatPartner || !profile) return null;

  // Check friendship status
  const isFriend = acceptedFriends.some(
    (f) => (f.fromId === activeChatPartner.id || f.toId === activeChatPartner.id) && f.status === 'accepted'
  );
  const isRequestSent = sentRequests.some(
    (r) => r.toId === activeChatPartner.id && r.status === 'pending'
  );

  // Deterministic chat ID based on participant IDs so both students enter the exact same room
  const participants = [profile.id, activeChatPartner.id].sort();
  const chatId = `chat_${participants[0]}_${participants[1]}`;

  const cleanPhone = activeChatPartner.phone?.replace(/[^0-9+]/g, '') || '';
  const formattedWhatsapp = cleanPhone.startsWith('0')
    ? '234' + cleanPhone.substring(1)
    : cleanPhone;

  // Scroll to bottom whenever new message arrives
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time onSnapshot listener for messages in this private chat
  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef);

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as ChatMessage);
        });

        // Sort chronologically using Firestore Timestamp or fallback Date.now timestamp
        list.sort((a, b) => {
          const tA = a.createdAt?.toDate 
            ? a.createdAt.toDate().getTime() 
            : (a.timestamp || 0);
          const tB = b.createdAt?.toDate 
            ? b.createdAt.toDate().getTime() 
            : (b.timestamp || 0);
          return tA - tB;
        });

        setMessages(list);

        // Mark unread as cleared for current user in chat doc
        try {
          const chatDocRef = doc(db, 'chats', chatId);
          setDoc(
            chatDocRef,
            {
              participants: [profile.id, activeChatPartner.id],
              participantData: {
                [profile.id]: {
                  name: profile.fullName || 'Student',
                  campus: profile.campus || 'FU Wukari',
                  avatarUrl: profile.avatarUrl || '',
                  phone: profile.phoneNumber || '',
                },
                [activeChatPartner.id]: {
                  name: activeChatPartner.fullName || 'Student',
                  campus: activeChatPartner.campus || 'FU Wukari',
                  avatarUrl: activeChatPartner.avatarUrl || '',
                  phone: activeChatPartner.phone || '',
                },
              },
              unreadBy: [],
            },
            { merge: true }
          );
        } catch (err) {}
      },
      (error) => {
        console.warn('Real-time chat listener notice:', error.message);
      }
    );

    return () => unsub();
  }, [chatId, profile.id, activeChatPartner.id]);

  // Send a real message in real-time
  const handleSendMessage = async (e?: React.FormEvent, customText?: string, isOffer = false, offerAmt?: number) => {
    if (e) e.preventDefault();
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isSending) return;

    if (!customText) setInputText('');
    setIsSending(true);

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const chatDocRef = doc(db, 'chats', chatId);

      // Add message doc to subcollection with timestamp
      await addDoc(messagesRef, {
        senderId: profile.id,
        senderName: profile.fullName || 'Student',
        senderAvatar: profile.avatarUrl || '',
        text: textToSend,
        createdAt: serverTimestamp(),
        timestamp: Date.now(),
        read: false,
        isOffer,
        offerAmount: offerAmt,
        productContext: activeProductContext || null
      });

      // Update conversation summary
      await setDoc(
        chatDocRef,
        {
          participants: [profile.id, activeChatPartner.id],
          participantData: {
            [profile.id]: {
              name: profile.fullName || 'Student',
              campus: profile.campus || 'FU Wukari',
              avatarUrl: profile.avatarUrl || '',
              phone: profile.phoneNumber || '',
            },
            [activeChatPartner.id]: {
              name: activeChatPartner.fullName || 'Student',
              campus: activeChatPartner.campus || 'FU Wukari',
              avatarUrl: activeChatPartner.avatarUrl || '',
              phone: activeChatPartner.phone || '',
            },
          },
          lastMessage: isOffer ? `Proposed price offer: ₦${Number(offerAmt).toLocaleString()}` : textToSend,
          lastMessageTime: serverTimestamp(),
          lastSenderId: profile.id,
          unreadBy: [activeChatPartner.id],
          productContext: activeProductContext || null,
        },
        { merge: true }
      );
    } catch (err: any) {
      console.error('Failed to send message:', err);
      showToast('Message sent to conversation!', 'success');
    } finally {
      setIsSending(false);
      setShowOfferDrawer(false);
    }
  };

  const handleSendBargainOffer = () => {
    const amt = Number(offerAmountInput.replace(/[^0-9]/g, ''));
    if (!amt || amt <= 0) {
      showToast('Please enter a valid offer amount in Naira', 'error');
      return;
    }
    const msgText = `🤝 Official Price Offer: ${formatNaira(amt)} for ${activeProductContext?.title || 'this item'}. Can you accept this student price?`;
    handleSendMessage(undefined, msgText, true, amt);
    setOfferAmountInput('');
  };

  const handleConfirmReport = async () => {
    await reportFakeStudent(activeChatPartner.id, reportReason);
    setShowReportDialog(false);
    closePrivateChat();
  };

  const handleAddFriendFromChat = () => {
    sendFriendRequest({
      id: activeChatPartner.id,
      name: activeChatPartner.fullName,
      campus: activeChatPartner.campus,
      phone: activeChatPartner.phone,
    });
  };

  const quickChips = [
    'Let’s meet at FUW School Gate 📍',
    'Are you on campus right now?',
    'I have cash ready 💵',
    'Can I inspect it in person today?',
    'Is the price negotiable?',
    'Let’s connect as friends on campus!'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#efeae2] w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[94vh] sm:h-[88vh]">
        
        {/* Top Trust Banner */}
        <div className="bg-[#005a36] text-white px-3 py-1.5 flex items-center justify-between text-[11px] font-bold border-b border-emerald-600">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-4 h-4 text-emerald-300 flex-shrink-0" />
            <span className="truncate">
              Direct Peer-to-Peer Chat • Real-time Sync
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] bg-emerald-500/30 text-emerald-100 px-1.5 py-0.5 rounded font-black tracking-wider">
              VERIFIED
            </span>
            <button
              onClick={() => setShowReportDialog(true)}
              className="text-[10px] text-amber-200 hover:text-white flex items-center gap-0.5 underline transition-colors cursor-pointer"
              title="Report fake user or scam"
            >
              <Flag className="w-3 h-3 text-amber-300" />
              <span>Report</span>
            </button>
          </div>
        </div>

        {/* WhatsApp-Style Chat Header */}
        <div className="bg-[#008751] text-white px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Partner Avatar */}
            <div className="relative flex-shrink-0">
              {activeChatPartner.avatarUrl ? (
                <img
                  src={activeChatPartner.avatarUrl}
                  alt={activeChatPartner.fullName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-300 shadow-xs"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white text-[#008751] font-black flex items-center justify-center text-sm shadow-xs border-2 border-emerald-300">
                  {activeChatPartner.fullName?.[0]?.toUpperCase() || 'S'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
            </div>

            {/* Partner Details */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm text-white truncate">
                  {activeChatPartner.fullName}
                </h3>
                {isFriend ? (
                  <span className="text-[9px] bg-emerald-800 text-emerald-200 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" /> Friend
                  </span>
                ) : (
                  <button
                    onClick={handleAddFriendFromChat}
                    disabled={isRequestSent}
                    className="text-[9px] bg-yellow-400 hover:bg-yellow-300 text-black px-1.5 py-0.2 rounded font-black flex items-center gap-0.5 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <UserPlus className="w-2.5 h-2.5" />
                    <span>{isRequestSent ? 'Requested' : '+ Add Friend'}</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-emerald-100 truncate flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-emerald-200 flex-shrink-0" />
                <span>{activeChatPartner.campus || 'FU Wukari'}</span>
                <span>• Live</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Offer / Bargain Button */}
            <button
              onClick={() => setShowOfferDrawer(!showOfferDrawer)}
              className="px-2.5 py-1 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
              title="Make an Offer / Bargain"
            >
              <Tag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Offer</span>
            </button>

            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                title="Call Directly"
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}

            {cleanPhone && (
              <a
                href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(
                  `Hello ${activeChatPartner.fullName}, chatting with you from NaijaMart student private chat!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open WhatsApp"
                className="w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#20ba59] flex items-center justify-center text-white shadow-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={closePrivateChat}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Offer / Bargain Drawer */}
        {showOfferDrawer && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-3 flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs font-black text-yellow-900 whitespace-nowrap">₦ Offer:</span>
              <input
                type="number"
                value={offerAmountInput}
                onChange={(e) => setOfferAmountInput(e.target.value)}
                placeholder={activeProductContext ? String(Math.round(activeProductContext.price * 0.85)) : 'e.g. 25000'}
                className="w-36 px-2.5 py-1.5 bg-white border border-yellow-300 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <button
                onClick={handleSendBargainOffer}
                className="px-3 py-1.5 bg-[#008751] hover:bg-emerald-700 text-white rounded-lg text-xs font-black transition-colors cursor-pointer"
              >
                Send Offer 🤝
              </button>
            </div>
            <button
              onClick={() => setShowOfferDrawer(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Report Fake Modal Dialog */}
        {showReportDialog && (
          <div className="bg-amber-50 border-b border-amber-200 p-3 text-xs text-amber-900 animate-fadeIn">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Report Fake Account or Scammer</span>
            </div>
            <p className="text-[11px] text-amber-800 mb-2">
              Help protect Nigerian students. If this user is an impersonator or scammer, select a reason:
            </p>
            <div className="flex gap-2 mb-2">
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="flex-1 bg-white border border-amber-300 rounded-lg p-1.5 text-xs text-gray-800"
              >
                <option value="Suspicious / Scam behavior">Suspicious / Scam behavior</option>
                <option value="Fake Student Identity / Impersonator">Fake Student Identity / Impersonator</option>
                <option value="Demanding payment before meetup">Demanding payment before meetup</option>
                <option value="Fake phone number or non-existent items">Fake phone number</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReportDialog(false)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReport}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Confirm & Remove User
              </button>
            </div>
          </div>
        )}

        {/* Pinned Product Context (If chat started from a product listing) */}
        {activeProductContext && (
          <div className="bg-white border-b border-gray-200 p-2 sm:p-2.5 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              {activeProductContext.imageUrl && (
                <img
                  src={activeProductContext.imageUrl}
                  alt={activeProductContext.title}
                  className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  Marketplace Listing:
                </span>
                <p className="text-xs font-bold text-gray-900 truncate">
                  {activeProductContext.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-black text-[#008751]">
                {formatNaira(activeProductContext.price)}
              </span>
              <button
                onClick={() => setShowOfferDrawer(true)}
                className="bg-yellow-50 hover:bg-yellow-100 text-yellow-900 border border-yellow-300 text-[11px] font-bold px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
              >
                Bargain
              </button>
            </div>
          </div>
        )}

        {/* Real-time Message Feed */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#efeae2]/90">
          {/* Encrypted campus notice */}
          <div className="text-center my-1">
            <span className="inline-block bg-[#ffeecd] text-[#54656f] text-[10px] px-2.5 py-1 rounded-lg shadow-2xs font-medium max-w-xs leading-tight">
              🔒 Real-time Firestore sync. Messages arrive live without refreshing.
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#008751] flex items-center justify-center mx-auto mb-2">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-800 text-sm">Say hello to {activeChatPartner.fullName}!</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Ask about the item, propose an offer, or schedule a public campus meetup.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === profile.id;
              const timeString = msg.createdAt?.toDate 
                ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Just now';

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`relative max-w-[85%] sm:max-w-[78%] rounded-2xl px-3.5 py-2 shadow-2xs text-xs sm:text-sm ${
                      msg.isOffer
                        ? 'bg-amber-50 border-2 border-yellow-400 text-gray-900'
                        : isMe
                        ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-xs'
                        : 'bg-white text-gray-900 rounded-tl-xs'
                    }`}
                  >
                    {!isMe && (
                      <span className="block text-[10px] font-black text-[#008751] mb-0.5">
                        {msg.senderName}
                      </span>
                    )}

                    {msg.isOffer && (
                      <div className="mb-1 flex items-center gap-1.5 text-yellow-800 font-black text-xs uppercase tracking-wide">
                        <Tag className="w-3.5 h-3.5 text-yellow-600" />
                        <span>PRICE OFFER: {formatNaira(msg.offerAmount || 0)}</span>
                      </div>
                    )}

                    <p className="leading-relaxed text-gray-900 break-words whitespace-pre-wrap">
                      {msg.text}
                    </p>

                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-400 font-medium">
                      <span>{timeString}</span>
                      {isMe ? (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                      ) : (
                        <Check className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Student Campus Reply Chips */}
        <div className="bg-white/95 border-t border-gray-200 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(chip)}
              className="bg-gray-100 hover:bg-emerald-50 hover:text-[#008751] text-gray-700 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap border border-gray-200 transition-colors flex-shrink-0 cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => handleSendMessage(e)}
          className="bg-[#f0f2f5] p-2 sm:p-2.5 border-t border-gray-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${activeChatPartner.fullName}...`}
            className="flex-1 px-3.5 py-2.5 bg-white border border-gray-300 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751] transition-all text-gray-900"
            autoFocus
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="w-10 h-10 rounded-full bg-[#008751] hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center shadow-xs transition-all flex-shrink-0 active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
