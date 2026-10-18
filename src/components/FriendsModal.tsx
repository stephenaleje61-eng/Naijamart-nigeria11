import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Check, 
  MessageSquare, 
  Phone, 
  GraduationCap, 
  ShieldCheck, 
  MapPin, 
  Search, 
  UserCheck, 
  AlertCircle,
  Sparkles,
  Edit3,
  Flag,
  Clock,
  Send
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { useToast } from '../context/ToastContext';
import { formatTimeAgo } from '../utils/formatters';

export const FriendsModal: React.FC = () => {
  const { 
    isFriendsModalOpen, 
    setIsFriendsModalOpen, 
    incomingRequests, 
    sentRequests,
    acceptedFriends, 
    allStudents, 
    conversations,
    profile, 
    acceptFriendRequest, 
    declineFriendRequest, 
    sendFriendRequest, 
    openPrivateChatWith,
    setIsProfileModalOpen,
    reportFakeStudent
  } = useStudent();

  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'chats' | 'friends' | 'requests' | 'directory'>(
    conversations.length > 0 ? 'chats' : incomingRequests.length > 0 ? 'requests' : 'directory'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [reportingStudentId, setReportingStudentId] = useState<string | null>(null);

  if (!isFriendsModalOpen || !profile) return null;

  // Filter friends
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

  // Filter real students in campus directory
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

  const handleReport = async (studentId: string) => {
    await reportFakeStudent(studentId, 'Reported by campus user as fake profile');
    setReportingStudentId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#008751] via-emerald-600 to-[#049b5d] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-black">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg">Student Network & Chats</h2>
                <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 font-medium">
                Connect & private chat with real students across Nigerian campuses
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFriendsModalOpen(false)}
            className="p-1 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Student Profile Bar */}
        <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#008751] text-white flex items-center justify-center font-black text-xs shadow-2xs">
              {profile.fullName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-900 block leading-tight">
                  {profile.fullName || 'Tap Edit to Set Student Name'}
                </span>
                <span className="bg-emerald-100 text-[#008751] text-[10px] px-1.5 rounded font-black flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" /> ID Verified
                </span>
              </div>
              <span className="text-[10px] text-gray-500 font-medium">
                {profile.campus || 'FU Wukari'} • {profile.department || 'Student'} • {profile.level || '200L'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsProfileModalOpen(true);
            }}
            className="text-[11px] bg-white hover:bg-emerald-100 text-[#008751] font-bold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors shadow-2xs"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Tab Navigation - 4 Clean Tabs */}
        <div className="flex items-center border-b border-gray-200 bg-gray-50/70 text-xs font-bold overflow-x-auto no-scrollbar">
          {/* Tab 1: Active Chats */}
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 py-3 px-2 text-center transition-colors whitespace-nowrap relative ${
              activeTab === 'chats'
                ? 'text-[#008751] border-b-2 border-[#008751] bg-white font-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>💬 Chats</span>
            {conversations.length > 0 && (
              <span className="ml-1 bg-emerald-100 text-[#008751] px-1.5 py-0.2 rounded-full text-[10px]">
                {conversations.length}
              </span>
            )}
          </button>

          {/* Tab 2: Friends */}
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 px-2 text-center transition-colors whitespace-nowrap relative ${
              activeTab === 'friends'
                ? 'text-[#008751] border-b-2 border-[#008751] bg-white font-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>👥 Friends</span>
            {myFriendList.length > 0 && (
              <span className="ml-1 bg-gray-100 text-gray-700 px-1.5 py-0.2 rounded-full text-[10px]">
                {myFriendList.length}
              </span>
            )}
          </button>

          {/* Tab 3: Requests */}
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 px-2 text-center transition-colors whitespace-nowrap relative ${
              activeTab === 'requests'
                ? 'text-[#008751] border-b-2 border-[#008751] bg-white font-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>🔔 Requests</span>
            {incomingRequests.length > 0 && (
              <span className="ml-1 bg-red-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-black animate-pulse">
                {incomingRequests.length}
              </span>
            )}
          </button>

          {/* Tab 4: Directory */}
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex-1 py-3 px-2 text-center transition-colors whitespace-nowrap relative ${
              activeTab === 'directory'
                ? 'text-[#008751] border-b-2 border-[#008751] bg-white font-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>🎓 Find Students</span>
            <span className="ml-1 bg-gray-100 text-gray-700 px-1.5 py-0.2 rounded-full text-[10px]">
              {filteredDirectory.length}
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          
          {/* TAB 1: ACTIVE CHATS (INBOX) */}
          {activeTab === 'chats' && (
            <div className="space-y-2">
              {conversations.length === 0 ? (
                <div className="text-center py-10 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#008751] flex items-center justify-center mx-auto mb-2">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-gray-900 text-sm">No private chats yet</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                    Start a private chat from any marketplace product or wanted card, or message a student from your campus directory.
                  </p>
                  <button
                    onClick={() => setActiveTab('directory')}
                    className="mt-3 bg-[#008751] hover:bg-[#007043] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
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
                        setIsFriendsModalOpen(false);
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
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
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
                              className="w-11 h-11 rounded-full object-cover border-2 border-emerald-400 shadow-xs"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#008751] to-emerald-400 text-white font-black flex items-center justify-center text-sm shadow-xs border-2 border-white">
                              {partnerData.name?.[0]?.toUpperCase() || 'S'}
                            </div>
                          )}
                          {isUnread && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"></span>
                          )}
                        </div>

                        {/* Partner & Message Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-gray-900 text-sm truncate">
                              {partnerData.name}
                            </h4>
                            <span className="bg-emerald-50 text-[#008751] text-[10px] px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" /> Verified
                            </span>
                          </div>

                          <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-gray-400" />
                            <span>{partnerData.campus || 'FU Wukari'}</span>
                          </p>

                          <p className={`text-xs mt-0.5 truncate ${
                            isUnread ? 'font-black text-gray-900' : 'text-gray-600'
                          }`}>
                            {conv.lastSenderId === profile.id ? 'You: ' : ''}
                            {conv.lastMessage || 'Open private conversation'}
                          </p>
                        </div>
                      </div>

                      {/* Right Meta: Time & Action */}
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {formatTimeAgo(conv.lastMessageTime)}
                        </span>
                        <button className="bg-[#008751] hover:bg-[#007043] text-white px-3 py-1 rounded-xl text-xs font-black shadow-xs flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: MY FRIENDS */}
          {activeTab === 'friends' && (
            <div className="space-y-2.5">
              {myFriendList.length === 0 ? (
                <div className="text-center py-10 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#008751] flex items-center justify-center mx-auto mb-2">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-gray-900 text-sm">No friends added yet</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                    Connect with fellow students to keep a trusted list of campus buyers and sellers.
                  </p>
                  <button
                    onClick={() => setActiveTab('directory')}
                    className="mt-3 bg-[#008751] hover:bg-[#007043] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    Find Students on Campus
                  </button>
                </div>
              ) : (
                myFriendList.map((f, i) => (
                  <div
                    key={i}
                    className="bg-white p-3.5 rounded-2xl border border-gray-200 hover:border-emerald-300 shadow-2xs flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#008751] to-emerald-400 text-white font-black flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                        {f.name?.[0]?.toUpperCase() || 'S'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-gray-900 text-sm truncate">{f.name}</h4>
                          <span className="text-[10px] bg-emerald-50 text-[#008751] px-1.5 py-0.2 rounded font-bold">
                            Friend
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-gray-400" />
                          <span>{f.campus || 'FU Wukari'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Actions: Start Private Chat & Call */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setIsFriendsModalOpen(false);
                          openPrivateChatWith({
                            id: f.friendId,
                            fullName: f.name,
                            campus: f.campus,
                            phone: f.phone,
                          });
                        }}
                        className="bg-[#008751] hover:bg-[#007043] active:scale-95 text-white py-1.5 px-3 rounded-xl text-xs font-black flex items-center gap-1 shadow-xs transition-all"
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
                ))
              )}
            </div>
          )}

          {/* TAB 3: REQUESTS (INCOMING & SENT) */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {/* Incoming Requests */}
              <div>
                <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-[#008751]" />
                  <span>Incoming Friend Requests ({incomingRequests.length})</span>
                </h3>

                {incomingRequests.length === 0 ? (
                  <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-xl border border-gray-100">
                    No pending incoming requests right now.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {incomingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                            {req.fromName?.[0]?.toUpperCase() || 'S'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-gray-900 text-sm truncate">
                              {req.fromName}
                            </h4>
                            <p className="text-[11px] text-gray-600 truncate flex items-center gap-1">
                              <GraduationCap className="w-3 h-3 text-[#008751]" />
                              <span>{req.fromCampus || 'FU Wukari'} • {req.fromDepartment || 'Student'}</span>
                            </p>
                          </div>
                        </div>

                        {/* Accept / Decline */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => acceptFriendRequest(req.id)}
                            className="bg-[#008751] hover:bg-[#007043] active:scale-95 text-white py-1.5 px-3 rounded-xl text-xs font-black flex items-center gap-1 shadow-xs transition-all"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Accept</span>
                          </button>

                          <button
                            onClick={() => declineFriendRequest(req.id)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Pending Requests */}
              {sentRequests.filter((r) => r.status === 'pending').length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Send className="w-3 h-3 text-gray-400" />
                    <span>Sent Requests Awaiting Acceptance</span>
                  </h3>
                  <div className="space-y-1.5">
                    {sentRequests
                      .filter((r) => r.status === 'pending')
                      .map((req) => (
                        <div
                          key={req.id}
                          className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-gray-800">{req.toName} ({req.toCampus})</span>
                          <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            Pending
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CAMPUS STUDENT DIRECTORY */}
          {activeTab === 'directory' && (
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students by name, department, campus..."
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#008751]"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
              </div>

              {/* Student Cards List */}
              {filteredDirectory.length === 0 ? (
                <div className="text-center py-8 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">
                    {searchQuery ? 'No student found matching query.' : 'Be the first student to register on your campus network!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDirectory.map((student) => {
                    const alreadyFriend = isAlreadyFriend(student.id);
                    const pendingSent = isPendingSent(student.id);

                    return (
                      <div
                        key={student.id}
                        className="bg-white p-3.5 rounded-2xl border border-gray-200 hover:border-emerald-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Student Avatar */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#008751] to-emerald-400 text-white font-black flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                            {student.fullName?.[0]?.toUpperCase() || 'S'}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-black text-gray-900 text-sm truncate">
                                {student.fullName}
                              </h4>
                              <span className="bg-emerald-50 text-[#008751] text-[10px] px-1.5 py-0.2 rounded font-black flex items-center gap-0.5 border border-emerald-100">
                                <ShieldCheck className="w-2.5 h-2.5" /> ID Verified
                              </span>
                            </div>

                            <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                              <GraduationCap className="w-3 h-3 text-gray-400" />
                              <span>{student.campus || 'FU Wukari'} • {student.department || 'Student'}</span>
                            </p>

                            {student.bio && (
                              <p className="text-[11px] text-gray-600 line-clamp-1 italic mt-0.5">
                                "{student.bio}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
                          {/* Private Chat Button */}
                          <button
                            onClick={() => {
                              setIsFriendsModalOpen(false);
                              openPrivateChatWith({
                                id: student.id,
                                fullName: student.fullName,
                                campus: student.campus,
                                avatarUrl: student.avatarUrl,
                                phone: student.phoneNumber,
                              });
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-[#008751] py-1.5 px-2.5 rounded-xl text-xs font-black flex items-center gap-1 border border-emerald-200 transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Chat</span>
                          </button>

                          {/* Add Friend Button */}
                          {alreadyFriend ? (
                            <span className="bg-emerald-100 text-[#008751] py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Friends</span>
                            </span>
                          ) : pendingSent ? (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Sent</span>
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
                              className="bg-[#008751] hover:bg-[#007043] active:scale-95 text-white py-1.5 px-3 rounded-xl text-xs font-black flex items-center gap-1 shadow-xs transition-all"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>Add Friend</span>
                            </button>
                          )}

                          {/* Report fake profile button */}
                          <button
                            onClick={() => handleReport(student.id)}
                            title="Report fake student or scam profile"
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Flag className="w-3.5 h-3.5" />
                          </button>
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
        <div className="bg-emerald-50/70 border-t border-emerald-100 px-4 py-2 text-[11px] text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#008751] flex-shrink-0" />
            <span className="truncate">Campus Anti-Scam Protection: Only deal with verified students.</span>
          </div>
          <span className="font-bold text-[#008751] hidden sm:inline">NaijaMarket Hub</span>
        </div>
      </div>
    </div>
  );
};
