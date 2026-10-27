import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  where 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { 
  Bike, 
  Send, 
  MapPin, 
  Phone, 
  MessageSquare, 
  PlusCircle, 
  Navigation, 
  Clock, 
  CheckCircle, 
  X, 
  DollarSign,
  Share2
} from 'lucide-react';

interface RideRequest {
  id: string;
  from: string;
  to: string;
  price: number | string;
  phone: string;
  uid: string;
  passengerName?: string;
  status: 'open' | 'assigned' | 'completed';
  createdAt?: any;
}

interface ChatMessage {
  id: string;
  senderUid: string;
  displayName: string;
  photoURL?: string;
  text: string;
  createdAt?: any;
}

const WUKARI_LOCATIONS = [
  'FUWukari Main Gate',
  'FUWukari Hostel A & B',
  'FUWukari Off-Campus / Staff Quarters',
  'New Market Wukari',
  'Old Market / Yam Market',
  'Hospital Road Junction',
  'Kwararafa University / Junction',
  'Township / Central Motor Park',
  'Mission Ward',
  'Police Station Roundabout',
  'Ibi Road Roundabout'
];

export const WukariOkadaSpace: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'rides' | 'chat'>('rides');

  // Ride Requests
  const [rides, setRides] = useState<RideRequest[]>([]);
  const [isPostingRide, setIsPostingRide] = useState(false);
  const [fromLocation, setFromLocation] = useState(WUKARI_LOCATIONS[0]);
  const [toLocation, setToLocation] = useState(WUKARI_LOCATIONS[3]);
  const [offerPrice, setOfferPrice] = useState('300');
  const [passengerPhone, setPassengerPhone] = useState(user?.phoneNumber || '');
  const [isSubmittingRide, setIsSubmittingRide] = useState(false);

  // Group Okada Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. Subscribe to ride requests from Firestore 'rideRequests'
  useEffect(() => {
    const ridesRef = collection(db, 'rideRequests');
    const q = query(ridesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: RideRequest[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as RideRequest);
        });
        setRides(list);
      },
      (err) => {
        console.warn('Realtime rideRequests query note:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Subscribe to Okada space messages: spaces/wukari-okada/messages
  useEffect(() => {
    const okadaChatRef = collection(db, 'spaces', 'wukari-okada', 'messages');
    const q = query(okadaChatRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
        });
        setChatMessages(msgs);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      },
      (err) => {
        console.warn('Realtime okada chat query note:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // Post a new ride request
  const handlePostRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    if (!fromLocation.trim() || !toLocation.trim() || !passengerPhone.trim()) {
      return;
    }

    setIsSubmittingRide(true);
    try {
      await addDoc(collection(db, 'rideRequests'), {
        from: fromLocation.trim(),
        to: toLocation.trim(),
        price: Number(offerPrice) || offerPrice,
        phone: passengerPhone.trim(),
        uid: user.uid,
        passengerName: user.displayName || user.email?.split('@')[0] || 'Passenger',
        status: 'open',
        createdAt: serverTimestamp(),
      });

      setIsPostingRide(false);
    } catch (err) {
      console.error('Error posting ride request:', err);
    } finally {
      setIsSubmittingRide(false);
    }
  };

  // Send group chat message
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (!user) {
      openAuthModal();
      return;
    }

    setIsSendingChat(true);
    try {
      const chatRef = collection(db, 'spaces', 'wukari-okada', 'messages');
      await addDoc(chatRef, {
        senderUid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Okada User',
        photoURL: user.photoURL || '',
        text: chatInput.trim(),
        createdAt: serverTimestamp(),
      });
      setChatInput('');
    } catch (err) {
      console.error('Failed to post okada chat message:', err);
    } finally {
      setIsSendingChat(false);
    }
  };

  const formatWhatsAppUrl = (phone: string, from: string, to: string, price: any) => {
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    const intl = cleanDigits.startsWith('0') 
      ? '234' + cleanDigits.slice(1) 
      : cleanDigits.startsWith('234') 
      ? cleanDigits 
      : '234' + cleanDigits;
    const msg = encodeURIComponent(`Hello! I saw your Okada ride request on NaijaMart (From: ${from} to ${to} for ₦${price}). I am available to pick you up!`);
    return `https://wa.me/${intl}?text=${msg}`;
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs flex flex-col h-[750px] max-h-[85vh]">
      {/* Okada Space Header */}
      <div className="bg-[#17231F] text-white p-4 sm:p-5 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-gray-950 flex items-center justify-center font-black text-xl shadow-xs">
            🏍️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight">Wukari Okada Space</h2>
              <span className="bg-amber-400 text-gray-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                RIDES & BOOKINGS
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Campus bike booking, price negotiation & rider dispatch
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/10 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('rides')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'rides' ? 'bg-amber-400 text-gray-950 shadow-xs' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Ride Board ({rides.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'chat' ? 'bg-amber-400 text-gray-950 shadow-xs' : 'text-gray-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Riders Chat</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'rides' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FBFBFA] space-y-4">
          {/* Post Ride Action Bar */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 text-gray-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h3 className="font-black text-sm">Need a bike right now?</h3>
              <p className="text-xs font-medium opacity-90">
                Post your pickup and drop-off to instantly reach verified Okada riders.
              </p>
            </div>
            <button
              onClick={() => {
                if (!user) {
                  openAuthModal();
                  return;
                }
                setIsPostingRide(true);
              }}
              className="px-4 py-2.5 bg-gray-950 text-white rounded-xl text-xs font-black hover:bg-gray-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Request Okada</span>
            </button>
          </div>

          {/* Ride Request Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 px-1">
              Active Ride Requests ({rides.length})
            </h4>

            {rides.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
                <Bike className="w-10 h-10 mx-auto mb-2 text-amber-500 opacity-60" />
                <h5 className="font-bold text-gray-800 text-xs mb-1">No active ride requests</h5>
                <p className="text-[11px] text-gray-500">
                  Be the first to request a ride across FUWukari campus and town!
                </p>
              </div>
            ) : (
              rides.map((r) => {
                const isMyRide = user?.uid === r.uid;
                const waLink = formatWhatsAppUrl(r.phone, r.from, r.to, r.price);

                return (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-amber-400 transition-all shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                            {r.status || 'Active'}
                          </span>
                          <span className="text-xs font-bold text-gray-900">
                            {r.passengerName || 'Passenger'} {isMyRide && '(You)'}
                          </span>
                        </div>

                        {/* Route points */}
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                          <span className="flex items-center gap-1 text-emerald-700 font-bold">
                            <MapPin className="w-3.5 h-3.5" /> {r.from}
                          </span>
                          <span className="text-gray-400">➔</span>
                          <span className="flex items-center gap-1 text-gray-900 font-bold">
                            <Navigation className="w-3.5 h-3.5 text-amber-600" /> {r.to}
                          </span>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-3 text-[11px] text-gray-500">
                          <span className="font-black text-gray-900 text-sm">
                            ₦{Number(r.price).toLocaleString()}
                          </span>
                          {r.createdAt?.seconds && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(r.createdAt.seconds * 1000).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Contact & Negotiate Actions */}
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${r.phone}`}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-[#0B8751] hover:bg-[#096e42] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Okada Community Live Chat */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#FBFBFA]">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <Bike className="w-12 h-12 text-amber-500 mb-2" />
                <h4 className="text-gray-900 font-bold text-sm mb-1">Okada Lounge is Live</h4>
                <p className="text-xs text-gray-500 max-w-xs">
                  Ask which gate has bikes, negotiate fares, or connect with riders directly.
                </p>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isMe = user?.uid && msg.senderUid === user.uid;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%] ${
                      isMe ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-400 text-gray-950 flex items-center justify-center text-xs font-black shrink-0">
                      {msg.displayName ? msg.displayName.charAt(0).toUpperCase() : 'O'}
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl text-xs ${
                        isMe
                          ? 'bg-[#17231F] text-white rounded-tr-xs shadow-xs'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className={`font-black text-[11px] ${isMe ? 'text-amber-400' : 'text-gray-900'}`}>
                          {isMe ? 'You' : msg.displayName}
                        </span>
                        {msg.createdAt?.seconds && (
                          <span className="text-[10px] text-gray-400">
                            {new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendChat} className="p-3 sm:p-4 bg-white border-t border-gray-200 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={user ? "Message Wukari riders and passengers..." : "Sign in to join Okada discussion..."}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={isSendingChat || !chatInput.trim()}
              className="px-4 py-3 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-gray-950 rounded-2xl text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      )}

      {/* Post Ride Modal */}
      {isPostingRide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-base text-gray-900">Post Ride Request</h3>
              </div>
              <button
                onClick={() => setIsPostingRide(false)}
                className="p-1 hover:bg-gray-100 rounded-xl text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostRide} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pickup Location</label>
                <input
                  type="text"
                  list="locations-list"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  required
                  placeholder="e.g. FUWukari Main Gate"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Destination</label>
                <input
                  type="text"
                  list="locations-list"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  required
                  placeholder="e.g. New Market Wukari"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <datalist id="locations-list">
                {WUKARI_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Offer Price (₦)</label>
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    required
                    min="100"
                    step="50"
                    placeholder="300"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    required
                    placeholder="08167258121"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPostingRide(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRide}
                  className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-gray-950 rounded-xl text-xs font-black shadow-xs cursor-pointer"
                >
                  {isSubmittingRide ? 'Broadcasting...' : 'Broadcast Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
