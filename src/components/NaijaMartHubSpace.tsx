import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  where,
  updateDoc,
  doc,
  setDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  Users, 
  MessageSquare, 
  UserPlus, 
  Check, 
  X, 
  MessageCircle, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Smile,
  AlertCircle,
  Home
} from 'lucide-react';
import { HousesView } from './housing/HousesView';

interface ChatMessage {
  id: string;
  senderUid: string;
  displayName: string;
  photoURL?: string;
  text: string;
  createdAt?: any;
}

interface AppUser {
  id: string;
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  isOnline?: boolean;
  lastSeen?: any;
}

interface FriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  fromName?: string;
  toName?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: any;
}

export const NaijaMartHubSpace: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Community members
  const [members, setMembers] = useState<AppUser[]>([]);
  const [activeTab, setActiveTab] = useState<'chats' | 'users' | 'houses'>('chats');
  const [chatSubView, setChatSubView] = useState<'messages' | 'requests'>('messages');

  // Friend requests
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [pendingSent, setPendingSent] = useState<string[]>([]);
  const [friendsList, setFriendsList] = useState<string[]>([]);

  // 1-on-1 Private Chat Modal
  const [privateRecipient, setPrivateRecipient] = useState<AppUser | null>(null);
  const [privateMessages, setPrivateMessages] = useState<ChatMessage[]>([]);
  const [privateInput, setPrivateInput] = useState('');
  const [isSendingPrivate, setIsSendingPrivate] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const privateEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Subscribe to real-time space messages: spaces/naijamart-hub/messages
  useEffect(() => {
    const messagesRef = collection(db, 'spaces', 'naijamart-hub', 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
        });
        setMessages(msgs);
        setTimeout(scrollToBottom, 100);
      },
      (err) => {
        console.warn('Realtime chat query note:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Subscribe to members list from users collection
  useEffect(() => {
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const userList: AppUser[] = [];
        snapshot.forEach((doc) => {
          userList.push({ id: doc.id, ...doc.data() } as AppUser);
        });
        setMembers(userList);
      },
      (err) => {
        console.warn('Users query note:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Subscribe to friend requests & friends
  useEffect(() => {
    if (!user?.uid) return;

    // Incoming requests
    const reqRef = collection(db, 'friendRequests');
    const qReq = query(reqRef, where('toUid', '==', user.uid), where('status', '==', 'pending'));
    const unsubReq = onSnapshot(qReq, (snap) => {
      const list: FriendRequest[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as FriendRequest));
      setRequests(list);
    });

    // Outgoing pending requests
    const qSent = query(reqRef, where('fromUid', '==', user.uid), where('status', '==', 'pending'));
    const unsubSent = onSnapshot(qSent, (snap) => {
      const uids: string[] = [];
      snap.forEach((d) => uids.push(d.data().toUid));
      setPendingSent(uids);
    });

    // Friends collection check
    const friendsRef = collection(db, 'friends');
    const qFriends = query(friendsRef, where('users', 'array-contains', user.uid));
    const unsubFriends = onSnapshot(qFriends, (snap) => {
      const fList: string[] = [];
      snap.forEach((d) => {
        const data = d.data();
        const other = data.users?.find((u: string) => u !== user.uid);
        if (other) fList.push(other);
      });
      setFriendsList(fList);
    });

    return () => {
      unsubReq();
      unsubSent();
      unsubFriends();
    };
  }, [user?.uid]);

  // 4. Subscribe to private chat messages when privateRecipient is selected
  useEffect(() => {
    if (!user?.uid || !privateRecipient?.uid) return;

    const roomId = [user.uid, privateRecipient.uid].sort().join('_');
    const privateRef = collection(db, 'privateChats', roomId, 'messages');
    const q = query(privateRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const pMsgs: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          pMsgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
        });
        setPrivateMessages(pMsgs);
        setTimeout(() => privateEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      },
      (err) => {
        console.warn('Private chat query note:', err);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, privateRecipient?.uid]);

  // Send Space Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!user) {
      openAuthModal();
      return;
    }

    setIsSending(true);
    try {
      const messagesRef = collection(db, 'spaces', 'naijamart-hub', 'messages');
      await addDoc(messagesRef, {
        senderUid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Community Member',
        photoURL: user.photoURL || '',
        text: inputText.trim(),
        createdAt: serverTimestamp(),
      });
      setInputText('');
    } catch (err) {
      console.error('Failed to post message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Send Private Message
  const handleSendPrivateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privateInput.trim() || !user || !privateRecipient) return;

    setIsSendingPrivate(true);
    try {
      const roomId = [user.uid, privateRecipient.uid].sort().join('_');
      const pRef = collection(db, 'privateChats', roomId, 'messages');
      await addDoc(pRef, {
        senderUid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Member',
        photoURL: user.photoURL || '',
        text: privateInput.trim(),
        createdAt: serverTimestamp(),
      });
      setPrivateInput('');
    } catch (err) {
      console.error('Failed to send private message:', err);
    } finally {
      setIsSendingPrivate(false);
    }
  };

  // Send Friend Request
  const sendFriendRequest = async (targetUser: AppUser) => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (user.uid === targetUser.uid) return;

    try {
      await addDoc(collection(db, 'friendRequests'), {
        fromUid: user.uid,
        toUid: targetUser.uid,
        fromName: user.displayName || user.email?.split('@')[0] || 'Member',
        toName: targetUser.displayName || targetUser.email?.split('@')[0] || 'Member',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error sending friend request:', err);
    }
  };

  // Accept Friend Request
  const acceptFriendRequest = async (req: FriendRequest) => {
    try {
      // 1. Update request status to accepted
      await updateDoc(doc(db, 'friendRequests', req.id), {
        status: 'accepted',
      });

      // 2. Add to friends collection
      const docId = [req.fromUid, req.toUid].sort().join('_');
      await setDoc(doc(db, 'friends', docId), {
        users: [req.fromUid, req.toUid],
        acceptedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to accept friend request:', err);
    }
  };

  // Reject Friend Request
  const rejectFriendRequest = async (reqId: string) => {
    try {
      await updateDoc(doc(db, 'friendRequests', reqId), {
        status: 'rejected',
      });
    } catch (err) {
      console.error('Failed to reject friend request:', err);
    }
  };

  return (
    <div className={`bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs flex flex-col ${activeTab === 'houses' ? 'min-h-[750px]' : 'h-[750px] max-h-[85vh]'}`}>
      {/* Space Header with 3 Tabs: CHATS | USERS | HOUSES */}
      <div className="bg-[#075E54] text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center font-black text-xl shadow-xs">
            💬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight">Africa Chat & Hub</h2>
              <span className="bg-emerald-400 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                LIVE
              </span>
            </div>
            <p className="text-xs text-emerald-100">
              Community messaging, verified members & real housing
            </p>
          </div>
        </div>

        {/* 3 Main Header Tabs: CHATS | USERS | HOUSES */}
        <div className="flex bg-black/25 p-1 rounded-2xl gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('chats')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'chats' ? 'bg-white text-[#075E54] shadow-xs' : 'text-emerald-100 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>CHATS</span>
            {requests.length > 0 && (
              <span className="bg-amber-400 text-gray-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center -ml-0.5">
                {requests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'users' ? 'bg-white text-[#075E54] shadow-xs' : 'text-emerald-100 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>USERS ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('houses')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'houses' ? 'bg-white text-[#075E54] shadow-xs' : 'text-emerald-100 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>HOUSES</span>
          </button>
        </div>
      </div>

      {/* Main Space Body */}
      {activeTab === 'chats' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#FBFBFA]">
          {/* Sub-bar inside Chats: Messages vs Requests */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
              <button
                onClick={() => setChatSubView('messages')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chatSubView === 'messages' ? 'bg-white text-[#075E54] shadow-xs' : 'text-gray-600'
                }`}
              >
                Community Chat
              </button>
              <button
                onClick={() => setChatSubView('requests')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  chatSubView === 'requests' ? 'bg-white text-[#075E54] shadow-xs' : 'text-gray-600'
                }`}
              >
                <span>Friend Requests</span>
                {requests.length > 0 && (
                  <span className="bg-amber-400 text-gray-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {requests.length}
                  </span>
                )}
              </button>
            </div>
            <span className="text-[11px] text-gray-400 hidden sm:inline">
              100% Real-Time Firestore
            </span>
          </div>

          {chatSubView === 'messages' ? (
            <>
              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#075E54] mb-3">
                      <MessageSquare className="w-7 h-7" />
                    </div>
                    <h4 className="text-gray-900 font-bold text-sm mb-1">No messages yet</h4>
                    <p className="text-xs text-gray-500 max-w-xs">
                      Say hello to the community! Connect, discuss properties, or make friends.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = user?.uid && msg.senderUid === user.uid;
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%] ${
                          isMe ? 'ml-auto flex-row-reverse' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#075E54] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                          {msg.displayName ? msg.displayName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div
                          className={`p-3.5 rounded-2xl text-xs ${
                            isMe
                              ? 'bg-[#075E54] text-white rounded-tr-xs shadow-xs'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-tl-xs shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <span className={`font-black text-[11px] ${isMe ? 'text-emerald-100' : 'text-gray-900'}`}>
                              {isMe ? 'You' : msg.displayName}
                            </span>
                            {msg.createdAt?.seconds && (
                              <span className={`text-[10px] ${isMe ? 'text-emerald-200' : 'text-gray-400'}`}>
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
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-gray-200 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={user ? "Type a message in Africa Chat..." : "Sign in to send a message..."}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#075E54] focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={isSending || !inputText.trim()}
                  className="px-4 py-3 bg-[#075E54] hover:bg-[#064e46] disabled:opacity-50 text-white rounded-2xl text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </>
          ) : (
            /* Friend Requests view */
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-black text-sm text-gray-900">Incoming Friend Requests</h3>
                <span className="text-xs text-gray-500 font-medium">{requests.length} Pending</span>
              </div>

              {!user ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-xs mb-3">Please sign in to view and manage your friend requests.</p>
                  <button
                    onClick={() => openAuthModal()}
                    className="px-4 py-2 bg-[#075E54] text-white text-xs font-bold rounded-xl"
                  >
                    Sign In
                  </button>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <UserPlus className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">No pending requests at the moment.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-2xl border border-gray-200 flex items-center justify-between bg-emerald-50/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-[#075E54] text-white font-black flex items-center justify-center text-xs">
                          {req.fromName ? req.fromName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <h4 className="font-black text-xs text-gray-900">{req.fromName || 'Community Member'}</h4>
                          <p className="text-[10px] text-gray-500">Wants to connect with you</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => acceptFriendRequest(req)}
                          className="px-3 py-1.5 bg-[#075E54] hover:bg-[#064e46] text-white text-xs font-black rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => rejectFriendRequest(req.id)}
                          className="p-1.5 hover:bg-gray-200 text-gray-500 rounded-xl transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Users / Members Directory */}
      {activeTab === 'users' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-black text-sm text-gray-900">Verified Community Members</h3>
            <span className="text-xs text-gray-500 font-medium">{members.length} Registered</span>
          </div>

          {members.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">No registered members found yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {members.map((m) => {
                const isMe = user?.uid === m.uid;
                const isFriend = friendsList.includes(m.uid);
                const isPending = pendingSent.includes(m.uid);

                return (
                  <div
                    key={m.id || m.uid}
                    className="p-3.5 rounded-2xl border border-gray-200 hover:border-[#075E54] transition-all flex items-center justify-between bg-gray-50/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#075E54] font-black flex items-center justify-center text-sm shadow-xs">
                          {m.displayName ? m.displayName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-xs text-gray-900 truncate flex items-center gap-1">
                          {m.displayName || m.email?.split('@')[0] || 'Naija User'}
                          {isMe && <span className="text-[10px] text-[#075E54] font-black">(You)</span>}
                        </h4>
                        <p className="text-[11px] text-gray-500 truncate">{m.email || 'Verified User'}</p>
                      </div>
                    </div>

                    {!isMe && (
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {/* 1-on-1 Chat Button */}
                        <button
                          onClick={() => {
                            if (!user) {
                              openAuthModal();
                              return;
                            }
                            setPrivateRecipient(m);
                          }}
                          title="Start 1-on-1 Chat"
                          className="p-2 bg-white border border-gray-200 hover:bg-emerald-50 hover:text-[#075E54] text-gray-700 rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        {/* Friend Request Action */}
                        {isFriend ? (
                          <span className="px-2.5 py-1.5 bg-emerald-50 text-[#075E54] font-black text-[11px] rounded-xl flex items-center gap-1">
                            <Check className="w-3 h-3" /> Friends
                          </span>
                        ) : isPending ? (
                          <span className="px-2.5 py-1.5 bg-gray-100 text-gray-500 font-bold text-[11px] rounded-xl">
                            Pending
                          </span>
                        ) : (
                          <button
                            onClick={() => sendFriendRequest(m)}
                            className="px-2.5 py-1.5 bg-[#075E54] hover:bg-[#064e46] text-white font-bold text-[11px] rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5" /> Add
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Houses Tab: Real House Listings + Roommate Finder */}
      {activeTab === 'houses' && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-[#F9FAF9]">
          <HousesView
            onStartChat={(agent) => {
              if (!user) {
                openAuthModal();
                return;
              }
              setPrivateRecipient({
                id: agent.uid,
                uid: agent.uid,
                displayName: agent.name,
                photoURL: agent.photo,
                email: agent.phone,
              });
            }}
          />
        </div>
      )}

      {/* 1-on-1 Private Chat Modal */}
      {privateRecipient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full h-[600px] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-[#0B8751] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 font-black text-sm flex items-center justify-center">
                  {privateRecipient.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-black text-sm">{privateRecipient.displayName || 'Direct Message'}</h3>
                  <p className="text-[10px] text-emerald-100">Private 1-on-1 Encrypted Room</p>
                </div>
              </div>
              <button
                onClick={() => setPrivateRecipient(null)}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Private Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FBFBFA]">
              {privateMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                  <MessageCircle className="w-10 h-10 text-emerald-600 mb-2" />
                  <p className="text-xs font-bold text-gray-800">No private messages yet</p>
                  <p className="text-[11px] text-gray-500">Send a greeting to start your conversation.</p>
                </div>
              ) : (
                privateMessages.map((pm) => {
                  const isMe = user?.uid && pm.senderUid === user.uid;
                  return (
                    <div
                      key={pm.id}
                      className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'items-start'}`}
                    >
                      <div
                        className={`p-3 rounded-2xl text-xs ${
                          isMe
                            ? 'bg-[#0B8751] text-white rounded-tr-xs shadow-xs'
                            : 'bg-white text-gray-900 border border-gray-200 rounded-tl-xs shadow-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{pm.text}</p>
                      </div>
                      {pm.createdAt?.seconds && (
                        <span className="text-[9px] text-gray-400 mt-0.5 px-1">
                          {new Date(pm.createdAt.seconds * 1000).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={privateEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSendPrivateMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
              <input
                type="text"
                value={privateInput}
                onChange={(e) => setPrivateInput(e.target.value)}
                placeholder="Type a private message..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B8751]"
              />
              <button
                type="submit"
                disabled={isSendingPrivate || !privateInput.trim()}
                className="px-4 py-2.5 bg-[#0B8751] hover:bg-[#096e42] disabled:opacity-50 text-white rounded-2xl text-xs font-black cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
