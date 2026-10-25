import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  UserPlus, 
  Check, 
  Phone, 
  GraduationCap, 
  ShieldCheck, 
  Search, 
  Sparkles, 
  Clock, 
  Send, 
  Flag, 
  Edit3, 
  ArrowRight,
  UserCheck,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { useToast } from '../context/ToastContext';
import { formatTimeAgo } from '../utils/formatters';

interface ChatViewProps {
  onNavigateHome?: () => void;
  isModal?: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({ 
  onNavigateHome,
  isModal = false 
}) => {
  const { 
    incomingRequests, 
    sentRequests,
    acceptedFriends, 
    allStudents, 
    conversations,
    profile, 
    acceptFriendRequest, 
    declineFriendRequest, 
    sendFriendRequest, 
    simulateIncomingFriendRequest,
    openPrivateChatWith,
    setIsProfileModalOpen,
    reportFakeStudent
  } = useStudent();

  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'chats' | 'requests' | 'friends' | 'directory'>(
    incomingRequests.length > 0 ? 'requests' : conversations.length > 0 ? 'chats' : 'directory'
  );
  const [searchQuery, setSearchQuery] = useState('');

  if (!profile) return null;

  // Map accepted friends list
  const myFriendList = acceptedFriends.map((req) => {
    const isSender = req.fromId === profile.id;
    return {
      friendId: isSender ? req.toId : req.fromId,
      name: isSender ? req.toName : req.fromName,
      campus: isSender ? req.toCampus : req.fromCampus,
      department: isSender ? undefined : req.fromDepartment,
      avatar: isSender ? undefined : req.fromAvatar,
      phone: req.fromPhone,
    };
  });

  // Filter students in campus directory
  const filteredDirectory = allStudents.filter((s) => {
    if (s.id === profile.id) return false;
    if (!s.fullName || !s.fullName.trim()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchCampus = s.campus?.toLowerCase().includes(q);
      const matchDept = s.department?.toLowerCase().includes(q);
      return matchName || matchCampus || matchDept;
    }
    return true;
  });

  const isAlreadyFriend = (studentId: string) => {
    return myFriendList.some((f) => f.friendId === studentId);
  };

  const isPendingSent = (studentId: string) => {
    return sentRequests.some((r) => r.toId === studentId && r.status === 'pending');
  };

  return (
    <div className={`w-full ${isModal ? '' : 'max-w-4xl mx-auto py-2 sm:py-4'}`}>
      {/* Top Hero Banner (Shown when full page) */}
      {!isModal && (
        <div className="bg-gradient-to-r from-[#008751] via-emerald-700 to-[#008751] rounded-3xl p-6 sm:p-8 text-white shadow-md mb-6 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Real Student Chat Space</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-2">
              Campus Chat & Student Friends
            </h1>
            <p className="text-sm sm:text-base text-emerald-100 font-medium leading-relaxed">
              Real-time messaging, instant friend requests, and verified peer networking across Nigerian university campuses.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Check className="w-4 h-4 text-yellow-300 stroke-[3]" />
                <span>Live Firestore Sync</span>
              </span>
              <span className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-yellow-300" />
                <span>One-Click Friend Accept</span>
              </span>
              <span className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-yellow-300" />
                <span>Instant 1-on-1 Chats</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
        {/* Profile Status Strip */}
        <div className="bg-emerald-50/80 px-4 sm:px-6 py-3 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#008751] text-white flex items-center justify-center font-black text-sm shadow-2xs">
              {profile.fullName?.[0]?.toUpperCase() || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-gray-900 text-sm">
                  {profile.fullName}
                </span>
                <span className="bg-emerald-100 text-[#008751] text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" /> Real Student ID
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {profile.campus} • {profile.department} • {profile.level}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="text-xs bg-white hover:bg-emerald-100 text-[#008751] font-bold px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit My Profile</span>
            </button>
          </div>
        </div>

        {/* 4 Clean Tabs */}
        <div className="flex items-center border-b border-gray-200 bg-gray-50/70 text-xs sm:text-sm font-bold overflow-x-auto no-scrollbar">
          {/* Tab 1: Requests */}
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3.5 px-3 text-center transition-colors whitespace-nowrap cursor-pointer relative ${
              activeTab === 'requests'
                ? 'text-[#008751] border-b-2 border-[#008751] bg-white font-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <UserPlus className="w-4 h-4" />
              <span>Friend Requests</span>
            </span>
            {incomingRequests.length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                {incomingRequests.length}
              </span>
            )}
          </button>

          {/* Tab 2: Chats */}
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 py-3.5 px-3 text-center transition-colors whitespace-nowrap cursor-pointer relative ${
              activeTab === 'chats'
                ? 'text-[#008751] border-b-2 border-[#008751] bg-white font-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>Active Chats</span>
            </span>
            {conversations.length > 0 && (
              <span className="ml-1.5 bg-emerald-100 text-[#008751] px-2 py-0.5 rounded-full text-[10px] font-black">
                {conversations.length}
              </span>
            )}
          </button>

          {/* Tab 3: Friends */}
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3.5 px-3 text-center transition-colors whitespace-nowrap cursor-pointer relative ${
              activeTab === 'friends'
                ? 'text-[#008751] border-b-2 border-[#008751] bg-white font-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>My Friends</span>
            </span>
            {myFriendList.length > 0 && (
              <span className="ml-1.5 bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {myFriendList.length}
              </span>
            )}
          </button>

          {/* Tab 4: Directory */}
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex-1 py-3.5 px-3 text-center transition-colors whitespace-nowrap cursor-pointer relative ${
              activeTab === 'directory'
                ? 'text-[#008751] border-b-2 border-[#008751] bg-white font-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              <span>Find Students</span>
            </span>
            <span className="ml-1.5 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {filteredDirectory.length}
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 space-y-4 min-h-[380px]">
          
          {/* ========================================================================= */}
          {/* TAB 1: FRIEND REQUESTS (INCOMING & SENT) */}
          {/* ========================================================================= */}
          {activeTab === 'requests' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Incoming Requests Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[#008751]" />
                    <span>Incoming Requests Awaiting Your Acceptance ({incomingRequests.length})</span>
                  </h3>

                  <button
                    onClick={simulateIncomingFriendRequest}
                    className="text-xs bg-emerald-50 hover:bg-emerald-100 text-[#008751] font-bold px-3 py-1 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                  >
                    + Receive Test Request
                  </button>
                </div>

                {incomingRequests.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <h4 className="font-bold text-gray-800 text-sm">No Pending Requests</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      When other students or buyers send you a friend request, they will appear here with an instant "Accept" button.
                    </p>
                    <button
                      onClick={simulateIncomingFriendRequest}
                      className="mt-4 bg-[#008751] hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Receive Sample Request
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {incomingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#008751] to-emerald-400 text-white font-black flex items-center justify-center text-base shadow-xs flex-shrink-0">
                            {req.fromName?.[0]?.toUpperCase() || 'S'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-gray-900 text-sm sm:text-base truncate">
                                {req.fromName}
                              </h4>
                              <span className="bg-emerald-100 text-[#008751] text-[10px] px-2 py-0.5 rounded-full font-bold">
                                Wants to connect
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 truncate flex items-center gap-1.5 mt-0.5">
                              <GraduationCap className="w-3.5 h-3.5 text-[#008751]" />
                              <span>{req.fromCampus || 'FU Wukari'} • {req.fromDepartment || 'Student'}</span>
                            </p>
                            {req.fromPhone && (
                              <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                                Phone: {req.fromPhone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Accept and Decline Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                          <button
                            onClick={() => acceptFriendRequest(req.id)}
                            className="bg-[#008751] hover:bg-emerald-700 active:scale-95 text-white py-2 px-4 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>ACCEPT FRIEND</span>
                          </button>

                          <button
                            onClick={() => declineFriendRequest(req.id)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Requests Section */}
              {sentRequests.filter((r) => r.status === 'pending').length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-gray-400" />
                    <span>Sent Requests Awaiting Their Acceptance ({sentRequests.filter((r) => r.status === 'pending').length})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sentRequests
                      .filter((r) => r.status === 'pending')
                      .map((req) => (
                        <div
                          key={req.id}
                          className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-gray-900 block">{req.toName}</span>
                            <span className="text-[11px] text-gray-500">{req.toCampus}</span>
                          </div>
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            Pending
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ACTIVE CHATS (INBOX) */}
          {/* ========================================================================= */}
          {activeTab === 'chats' && (
            <div className="space-y-3 animate-fadeIn">
              {conversations.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#008751] flex items-center justify-center mx-auto mb-2">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-gray-900 text-sm">No Private Chats Yet</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Start a real chat from any marketplace listing, accept a friend request, or message a student from your campus directory.
                  </p>
                  <button
                    onClick={() => setActiveTab('directory')}
                    className="mt-4 bg-[#008751] hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer"
                  >
                    Find Students to Chat
                  </button>
                </div>
              ) : (
                conversations.map((conv) => {
                  const partnerId = conv.participants.find((p) => p !== profile.id) || '';
                  const partnerData = conv.participantData?.[partnerId] || {
                    name: 'Student',
                    campus: 'FU Wukari',
                  };
                  const isUnread = conv.unreadBy && conv.unreadBy.includes(profile.id);

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        openPrivateChatWith(
                          {
                            id: partnerId,
                            fullName: partnerData.name,
                            campus: partnerData.campus,
                            avatarUrl: partnerData.avatarUrl,
                            phone: partnerData.phone,
                          },
                          conv.productContext
                        );
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isUnread
                          ? 'bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-300 shadow-xs'
                          : 'bg-white border-gray-200 hover:border-emerald-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {partnerData.avatarUrl ? (
                            <img
                              src={partnerData.avatarUrl}
                              alt={partnerData.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 shadow-xs"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#008751] to-emerald-400 text-white font-black flex items-center justify-center text-sm shadow-xs border-2 border-white">
                              {partnerData.name?.[0]?.toUpperCase() || 'S'}
                            </div>
                          )}
                          {isUnread && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"></span>
                          )}
                        </div>

                        {/* Partner & Message Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-gray-900 text-sm sm:text-base truncate">
                              {partnerData.name}
                            </h4>
                            <span className="text-[10px] text-gray-500 truncate">
                              • {partnerData.campus}
                            </span>
                          </div>

                          <p className={`text-xs truncate mt-0.5 ${isUnread ? 'font-black text-emerald-900' : 'text-gray-600'}`}>
                            {conv.lastMessage || 'Connected. Tap to chat.'}
                          </p>

                          {conv.productContext && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md font-bold mt-1">
                              <span>Item:</span>
                              <span className="truncate max-w-[140px]">{conv.productContext.title}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openPrivateChatWith(
                              {
                                id: partnerId,
                                fullName: partnerData.name,
                                campus: partnerData.campus,
                                avatarUrl: partnerData.avatarUrl,
                                phone: partnerData.phone,
                              },
                              conv.productContext
                            );
                          }}
                          className="bg-[#008751] hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: MY FRIENDS (CONNECTED STUDENTS) */}
          {/* ========================================================================= */}
          {activeTab === 'friends' && (
            <div className="space-y-3 animate-fadeIn">
              {myFriendList.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <h4 className="font-black text-gray-900 text-sm">No Connected Friends Yet</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Accept incoming friend requests or send requests in the "Find Students" tab to grow your campus network!
                  </p>
                  <button
                    onClick={() => setActiveTab('directory')}
                    className="mt-4 bg-[#008751] hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Browse Student Directory
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {myFriendList.map((f, idx) => (
                    <div
                      key={f.friendId || idx}
                      className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-emerald-300 shadow-2xs flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-[#008751] text-white font-black flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                          {f.name?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-gray-900 text-sm truncate">
                              {f.name}
                            </h4>
                            <span className="bg-emerald-100 text-[#008751] text-[9px] px-1.5 py-0.2 rounded font-black flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" /> Friend
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate">
                            {f.campus}
                          </p>
                          {f.phone && (
                            <p className="text-[10px] text-gray-400 font-mono">
                              {f.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => {
                            openPrivateChatWith({
                              id: f.friendId,
                              fullName: f.name,
                              campus: f.campus,
                              phone: f.phone,
                            });
                          }}
                          className="bg-[#008751] hover:bg-emerald-700 active:scale-95 text-white py-1.5 px-3 rounded-xl text-xs font-black flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>

                        {f.phone && (
                          <a
                            href={`tel:${f.phone.replace(/[^0-9+]/g, '')}`}
                            title="Call friend"
                            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: FIND STUDENTS (CAMPUS DIRECTORY) */}
          {/* ========================================================================= */}
          {activeTab === 'directory' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students by name, department, campus, hostel..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#008751] focus:bg-white transition-all font-medium"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>

              {/* Student Cards List */}
              {filteredDirectory.length === 0 ? (
                <div className="text-center py-10 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">
                    {searchQuery ? `No students found matching "${searchQuery}".` : 'No other students registered yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredDirectory.map((student) => {
                    const alreadyFriend = isAlreadyFriend(student.id);
                    const pendingSent = isPendingSent(student.id);

                    return (
                      <div
                        key={student.id}
                        className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-emerald-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#008751] to-emerald-400 text-white font-black flex items-center justify-center text-base shadow-xs flex-shrink-0">
                            {student.fullName?.[0]?.toUpperCase() || 'S'}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-black text-gray-900 text-sm truncate">
                                {student.fullName}
                              </h4>
                              <span className="bg-emerald-50 text-[#008751] text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-0.5 border border-emerald-100">
                                <ShieldCheck className="w-3 h-3" /> ID Verified
                              </span>
                            </div>

                            <p className="text-xs text-gray-500 truncate flex items-center gap-1.5 mt-0.5">
                              <GraduationCap className="w-3.5 h-3.5 text-[#008751]" />
                              <span>{student.campus} • {student.department} ({student.level})</span>
                            </p>

                            {student.bio && (
                              <p className="text-xs text-gray-600 line-clamp-1 italic mt-0.5">
                                "{student.bio}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                          {/* Private Chat Button */}
                          <button
                            onClick={() => {
                              openPrivateChatWith({
                                id: student.id,
                                fullName: student.fullName,
                                campus: student.campus,
                                avatarUrl: student.avatarUrl,
                                phone: student.phoneNumber,
                              });
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-[#008751] py-2 px-3.5 rounded-xl text-xs font-black flex items-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat</span>
                          </button>

                          {/* Add Friend Button */}
                          {alreadyFriend ? (
                            <span className="bg-emerald-100 text-[#008751] py-2 px-3.5 rounded-xl text-xs font-black flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Friends</span>
                            </span>
                          ) : pendingSent ? (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Request Sent</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                sendFriendRequest({
                                  id: student.id,
                                  name: student.fullName,
                                  campus: student.campus,
                                  phone: student.phoneNumber,
                                  department: student.department,
                                });
                              }}
                              className="bg-[#008751] hover:bg-emerald-700 active:scale-95 text-white py-2 px-4 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Add Friend</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Safety Disclaimer Footer */}
        <div className="bg-emerald-50/70 border-t border-emerald-100 px-6 py-2.5 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#008751] flex-shrink-0" />
            <span>Real Student Protection: Direct encrypted peer connections.</span>
          </div>
          <span className="font-bold text-[#008751]">NaijaMart Network</span>
        </div>
      </div>
    </div>
  );
};
