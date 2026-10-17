import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  Check, 
  CheckCheck, 
  RefreshCw, 
  Send, 
  Sparkles, 
  Handshake, 
  Tag, 
  MapPin, 
  GraduationCap, 
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types';
import { formatNaira, formatTimeAgo } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

interface BargainMessage {
  id: string;
  sender: 'buyer' | 'seller' | 'system';
  text: string;
  time: string;
  isOffer?: boolean;
  offerAmount?: number;
  offerStatus?: 'pending' | 'accepted' | 'declined' | 'countered';
}

interface BargainChatModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  buyerName?: string;
}

export const BargainChatModal: React.FC<BargainChatModalProps> = ({
  product,
  isOpen,
  onClose,
  buyerName = 'You (Student Buyer)',
}) => {
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !product) return null;

  const originalPrice = product.price || 0;
  // Default first suggested offer: 15% discount
  const defaultInitialOffer = Math.max(500, Math.round((originalPrice * 0.85) / 500) * 500);

  // Negotiation states
  const [currentOffer, setCurrentOffer] = useState<number>(defaultInitialOffer);
  const [offerStatus, setOfferStatus] = useState<'pending' | 'accepted' | 'declined' | 'countered'>('pending');
  const [customOfferInput, setCustomOfferInput] = useState<string>('');
  const [showCounterInput, setShowCounterInput] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');

  // Initial WhatsApp-style messages tailored to Nigerian student campus marketplace
  const [messages, setMessages] = useState<BargainMessage[]>([
    {
      id: 'm-1',
      sender: 'seller',
      text: `Hello! Yes, the "${product.title}" is still available in ${product.location || 'Wukari'}. Listed for ${formatNaira(originalPrice)}. You can inspect in person today.`,
      time: '10:14 AM',
    },
    {
      id: 'm-2',
      sender: 'buyer',
      text: `Good day bro! I'm interested and ready to buy. Can you consider this offer?`,
      time: '10:15 AM',
    },
    {
      id: 'm-3',
      sender: 'system',
      text: `Buyer proposed an offer of ${formatNaira(defaultInitialOffer)} for "${product.title}".`,
      time: '10:15 AM',
      isOffer: true,
      offerAmount: defaultInitialOffer,
      offerStatus: 'pending',
    },
  ]);

  // Clean phone and WhatsApp
  const rawPhone = product.phoneNumber || '';
  const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');

  const rawWhatsapp = product.whatsappNumber || product.phoneNumber || '';
  const cleanDigits = rawWhatsapp.replace(/[^0-9]/g, '');
  const formattedWhatsapp = cleanDigits.startsWith('0')
    ? '234' + cleanDigits.substring(1)
    : cleanDigits.startsWith('234')
    ? cleanDigits
    : '234' + cleanDigits;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Quick reply student chips
  const quickChips = [
    'Last price bro?',
    'I have cash ready at School Gate 💵',
    'Can I inspect it at your hostel today?',
    'Is battery health still good?',
    'Complete receipt & papers available?',
  ];

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 1. Action: Accept Offer
  const handleAcceptOffer = (amount?: number) => {
    const acceptedAmt = amount || currentOffer;
    setOfferStatus('accepted');

    const newMsg: BargainMessage = {
      id: `m-${Date.now()}`,
      sender: 'seller',
      text: `🤝 DEAL ACCEPTED! I accept your offer of ${formatNaira(acceptedAmt)}. Let's meet at a safe spot on campus for inspection.`,
      time: getCurrentTime(),
    };

    const sysMsg: BargainMessage = {
      id: `sys-${Date.now()}`,
      sender: 'system',
      text: `🎉 Offer of ${formatNaira(acceptedAmt)} has been ACCEPTED! You both reached an agreement. Click below to confirm pickup via WhatsApp.`,
      time: getCurrentTime(),
    };

    setMessages((prev) => [...prev, newMsg, sysMsg]);
    showToast(`Offer of ${formatNaira(acceptedAmt)} Accepted! Deal sealed.`, 'success');
  };

  // 2. Action: Counter Offer
  const handleSendCounterOffer = (customAmount?: number) => {
    const counterAmt = customAmount || parseFloat(customOfferInput.replace(/[^0-9.]/g, ''));
    if (!counterAmt || isNaN(counterAmt) || counterAmt <= 0) {
      showToast('Please enter a valid counter offer amount in Naira', 'error');
      return;
    }

    setCurrentOffer(counterAmt);
    setOfferStatus('countered');
    setShowCounterInput(false);
    setCustomOfferInput('');

    const newMsg: BargainMessage = {
      id: `m-${Date.now()}`,
      sender: 'seller',
      text: `I cannot do ${formatNaira(currentOffer)}, but my best student counter price is ${formatNaira(counterAmt)}. Can you meet me there?`,
      time: getCurrentTime(),
    };

    const offerMsg: BargainMessage = {
      id: `offer-${Date.now()}`,
      sender: 'system',
      text: `Counter-Offer of ${formatNaira(counterAmt)} proposed.`,
      time: getCurrentTime(),
      isOffer: true,
      offerAmount: counterAmt,
      offerStatus: 'pending',
    };

    setMessages((prev) => [...prev, newMsg, offerMsg]);
    showToast(`Counter offer of ${formatNaira(counterAmt)} sent!`, 'info');
  };

  // 3. Action: Decline Offer
  const handleDeclineOffer = () => {
    setOfferStatus('declined');

    const newMsg: BargainMessage = {
      id: `m-${Date.now()}`,
      sender: 'seller',
      text: `Sorry bro, ${formatNaira(currentOffer)} is too low for this condition. Please make a closer offer or keep to the original price.`,
      time: getCurrentTime(),
    };

    setMessages((prev) => [...prev, newMsg]);
    showToast('Offer declined. Propose a counter offer to keep bargaining.', 'info');
  };

  // Send regular text message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: BargainMessage = {
      id: `m-${Date.now()}`,
      sender: 'buyer',
      text: inputText.trim(),
      time: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const sentText = inputText.trim();
    setInputText('');

    // Realistic Nigerian seller automated reply for student campus interaction
    setTimeout(() => {
      let sellerReply = "Noted bro! Check my price offer above. Let's make it work.";
      if (sentText.toLowerCase().includes('last price') || sentText.toLowerCase().includes('last')) {
        sellerReply = `The original price is ${formatNaira(originalPrice)}. Best I can do is ${formatNaira(Math.round(originalPrice * 0.9))}. Deal?`;
      } else if (sentText.toLowerCase().includes('gate') || sentText.toLowerCase().includes('school')) {
        sellerReply = `Yes, FUW School Gate or Hostel B is perfect for meetup. Inspect everything properly before cash.`;
      } else if (sentText.toLowerCase().includes('battery') || sentText.toLowerCase().includes('condition')) {
        sellerReply = `Condition is very clean, exactly as described! Bring your charger or test SIM card to check it.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m-reply-${Date.now()}`,
          sender: 'seller',
          text: sellerReply,
          time: getCurrentTime(),
        },
      ]);
    }, 900);
  };

  const discountSavings = Math.max(0, originalPrice - currentOffer);
  const discountPercent = originalPrice > 0 
    ? Math.round((discountSavings / originalPrice) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#efeae2] w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[94vh] sm:h-[88vh]">
        
        {/* TRUST BADGE AT THE TOP (Required by User) */}
        <div className="bg-[#005a36] text-white px-3 py-1.5 flex items-center justify-between text-[11px] font-bold border-b border-emerald-600 shadow-xs">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-4 h-4 text-emerald-300 flex-shrink-0" />
            <span className="truncate">
              Secured by NaijaMarket Hub - Don't pay outside
            </span>
          </div>
          <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-black tracking-wider flex-shrink-0 ml-2">
            SAFE DEAL
          </span>
        </div>

        {/* WHATSAPP-STYLE CHAT HEADER */}
        <div className="bg-[#008751] text-white px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Seller Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-white text-[#008751] font-black flex items-center justify-center text-sm shadow-xs border-2 border-emerald-300">
                {product.sellerName?.[0]?.toUpperCase() || 'S'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
            </div>

            {/* Seller & Product Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="font-black text-sm text-white truncate">
                  {product.sellerName || 'Marketplace Seller'}
                </h3>
                <span className="text-[10px] bg-emerald-700/80 text-emerald-200 px-1 rounded font-bold">
                  Seller
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-200 flex-shrink-0" />
                <span>{product.location || 'Wukari, Taraba'}</span>
                <span>• Online</span>
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                title="Call Seller Directly"
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}

            <a
              href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(
                `Hello ${product.sellerName || 'Seller'}, I am chatting with you from NaijaMarket Hub Bargain Chat for "${product.title}". My offer is ${formatNaira(currentOffer)}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in WhatsApp"
              className="w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#20ba59] flex items-center justify-center text-white shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BARGAIN PRICE STICKY PANEL: Shows Original Strikethrough, Buyer Offer, and the 3 Quick Buttons */}
        <div className="bg-white border-b border-gray-200 p-2.5 sm:p-3 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            {/* Product Thumbnail & Price Comparison */}
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-11 h-11 rounded-xl object-cover border border-gray-200 flex-shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-gray-900 truncate max-w-[170px] sm:max-w-xs">
                  {product.title}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  {/* Original Price Strikethrough */}
                  <span className="text-xs text-gray-400 line-through font-semibold">
                    {formatNaira(originalPrice)}
                  </span>
                  
                  {/* Buyer Offer Price */}
                  <div className="flex items-center gap-1">
                    <span className="text-sm sm:text-base font-black text-[#008751]">
                      {formatNaira(currentOffer)}
                    </span>
                    {discountPercent > 0 && (
                      <span className="text-[10px] bg-red-100 text-red-700 font-extrabold px-1 rounded">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Pill */}
            <div className="text-right flex-shrink-0">
              {offerStatus === 'accepted' ? (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-[#008751] font-black text-[11px] px-2 py-0.5 rounded-full border border-emerald-300">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Accepted 🎉</span>
                </span>
              ) : offerStatus === 'declined' ? (
                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 font-bold text-[11px] px-2 py-0.5 rounded-full">
                  <span>Declined</span>
                </span>
              ) : offerStatus === 'countered' ? (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-bold text-[11px] px-2 py-0.5 rounded-full border border-amber-300">
                  <span>Countered</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-900 font-bold text-[11px] px-2 py-0.5 rounded-full animate-pulse">
                  <span>Pending</span>
                </span>
              )}
            </div>
          </div>

          {/* THE 3 QUICK BUTTONS: "Accept Offer", "Counter Offer", "Decline" (Required by User) */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-2.5 pt-2 border-t border-gray-100">
            {/* Button 1: Accept Offer */}
            <button
              onClick={() => handleAcceptOffer(currentOffer)}
              className="bg-[#008751] hover:bg-[#007043] active:scale-95 text-white py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-xs transition-all"
            >
              <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-200" />
              <span>Accept Offer</span>
            </button>

            {/* Button 2: Counter Offer */}
            <button
              onClick={() => setShowCounterInput(!showCounterInput)}
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-xs transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Counter Offer</span>
            </button>

            {/* Button 3: Decline */}
            <button
              onClick={handleDeclineOffer}
              className="bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border border-gray-300 hover:border-red-300 transition-all active:scale-95"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
              <span>Decline</span>
            </button>
          </div>

          {/* Counter Offer Input Popover */}
          {showCounterInput && (
            <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-xl animate-fade-in text-xs">
              <div className="flex items-center justify-between mb-1.5 font-bold text-amber-900">
                <span>Enter Your Counter Price (₦):</span>
                <button
                  onClick={() => setShowCounterInput(false)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-gray-400 font-bold">₦</span>
                  <input
                    type="number"
                    value={customOfferInput}
                    onChange={(e) => setCustomOfferInput(e.target.value)}
                    placeholder={currentOffer.toString()}
                    className="w-full pl-6 pr-2 py-1.5 bg-white border border-amber-300 rounded-lg font-bold text-gray-900 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                    autoFocus
                  />
                </div>

                <button
                  onClick={() => handleSendCounterOffer()}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-black px-3 py-1.5 rounded-lg text-xs"
                >
                  Send Counter
                </button>
              </div>

              {/* Quick +/- chips */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                <span className="text-gray-500 font-medium">Quick add:</span>
                {[1000, 2000, 5000].map((step) => (
                  <button
                    key={step}
                    onClick={() => {
                      const next = currentOffer + step;
                      setCustomOfferInput(next.toString());
                    }}
                    className="bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold"
                  >
                    +{formatNaira(step)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CHAT MESSAGES STREAM (WHATSAPP LOOK) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#efeae2]/90">
          
          {/* WhatsApp Encrypted-style Notice */}
          <div className="text-center my-1">
            <span className="inline-block bg-[#ffeecd] text-[#54656f] text-[10px] px-2.5 py-1 rounded-lg shadow-2xs font-medium max-w-xs leading-tight">
              🔒 Chat secured. Agree on price and meet in a public campus venue (School Gate / Library) for physical inspection.
            </span>
          </div>

          {messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="bg-white border border-emerald-300 shadow-xs rounded-2xl p-3 max-w-xs sm:max-w-sm text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] font-black text-[#008751] uppercase tracking-wider mb-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Price Bargain Proposal</span>
                    </div>

                    <div className="bg-emerald-50 rounded-xl p-2 my-1 border border-emerald-100">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs text-gray-400 line-through">
                          {formatNaira(originalPrice)}
                        </span>
                        <ArrowRight className="w-3 h-3 text-emerald-600" />
                        <span className="text-base font-black text-[#008751]">
                          {formatNaira(msg.offerAmount || currentOffer)}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-800 font-bold block mt-0.5">
                        {msg.offerStatus === 'accepted' ? '🎉 Deal Agreed' : 'Buyer Proposed Deal'}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-600 mt-1">{msg.text}</p>

                    {/* Quick actions directly on offer bubble */}
                    {msg.offerStatus === 'pending' && (
                      <div className="grid grid-cols-2 gap-1.5 mt-2">
                        <button
                          onClick={() => handleAcceptOffer(msg.offerAmount)}
                          className="bg-[#008751] hover:bg-[#007043] text-white py-1 px-2 rounded-lg text-[11px] font-bold"
                        >
                          ✓ Accept {formatNaira(msg.offerAmount || currentOffer)}
                        </button>
                        <button
                          onClick={() => setShowCounterInput(true)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded-lg text-[11px] font-bold"
                        >
                          Counter Offer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            const isBuyer = msg.sender === 'buyer';

            return (
              <div
                key={msg.id}
                className={`flex ${isBuyer ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative max-w-[82%] sm:max-w-[75%] rounded-2xl px-3.5 py-2 shadow-2xs text-xs sm:text-sm ${
                    isBuyer
                      ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-xs'
                      : 'bg-white text-gray-900 rounded-tl-xs'
                  }`}
                >
                  {/* Sender label */}
                  {!isBuyer && (
                    <span className="block text-[10px] font-black text-[#008751] mb-0.5">
                      {product.sellerName || 'Seller'}
                    </span>
                  )}

                  {/* Message body */}
                  <p className="leading-relaxed text-gray-900 break-words whitespace-pre-wrap">
                    {msg.text}
                  </p>

                  {/* Message timestamp + double check */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-400 font-medium">
                    <span>{msg.time}</span>
                    {isBuyer && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* SEAL ON WHATSAPP BANNER IF ACCEPTED */}
        {offerStatus === 'accepted' && (
          <div className="bg-emerald-100 border-t border-emerald-300 p-2.5 flex items-center justify-between text-xs text-emerald-950 animate-bounce">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-[#008751]" />
              <span>Offer Accepted at {formatNaira(currentOffer)}!</span>
            </div>
            <a
              href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(
                `Hello ${product.sellerName || 'Seller'}, we agreed on ${formatNaira(
                  currentOffer
                )} for "${product.title}" on NaijaMarket Hub Bargain Chat! When and where can we meet on campus for inspection?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba59] text-white px-3 py-1 rounded-xl font-black text-xs shadow-xs flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Seal on WhatsApp</span>
            </a>
          </div>
        )}

        {/* QUICK STUDENT BARGAIN CHIPS */}
        <div className="bg-white/90 border-t border-gray-200 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(chip);
              }}
              className="bg-gray-100 hover:bg-emerald-50 hover:text-[#008751] text-gray-700 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap border border-gray-200 transition-colors flex-shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* CHAT INPUT BAR */}
        <form
          onSubmit={handleSendMessage}
          className="bg-[#f0f2f5] p-2 sm:p-2.5 border-t border-gray-200 flex items-center gap-2"
        >
          {/* Quick Offer Button */}
          <button
            type="button"
            onClick={() => setShowCounterInput(true)}
            className="bg-emerald-50 hover:bg-emerald-100 text-[#008751] font-black text-xs px-2.5 py-2 rounded-xl border border-emerald-300 flex items-center gap-1 flex-shrink-0 shadow-2xs"
            title="Make a new price offer"
          >
            <Tag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Make</span> Offer
          </button>

          {/* Text input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message or negotiate..."
            className="flex-1 px-3.5 py-2.5 bg-white border border-gray-300 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751] transition-all text-gray-900"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-[#008751] hover:bg-[#007043] disabled:opacity-40 text-white flex items-center justify-center shadow-xs transition-all flex-shrink-0 active:scale-95"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
