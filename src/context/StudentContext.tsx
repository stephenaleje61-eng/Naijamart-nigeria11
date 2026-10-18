import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  where, 
  serverTimestamp, 
  updateDoc, 
  addDoc,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { StudentProfile, FriendRequest, ChatConversation } from '../types';
import { useToast } from './ToastContext';

interface StudentContextType {
  profile: StudentProfile | null;
  updateProfile: (data: Partial<StudentProfile>) => Promise<void>;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  incomingRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  acceptedFriends: FriendRequest[];
  allStudents: StudentProfile[];
  conversations: ChatConversation[];
  sendFriendRequest: (target: {
    id: string;
    name: string;
    campus: string;
    avatar?: string;
    phone?: string;
    department?: string;
  }) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  reportFakeStudent: (studentId: string, reason: string) => Promise<void>;
  activeChatPartner: {
    id: string;
    fullName: string;
    campus: string;
    avatarUrl?: string;
    phone?: string;
  } | null;
  activeProductContext: any;
  openPrivateChatWith: (
    partner: {
      id: string;
      fullName: string;
      campus: string;
      avatarUrl?: string;
      phone?: string;
    },
    productContext?: any
  ) => void;
  closePrivateChat: () => void;
  isFriendsModalOpen: boolean;
  setIsFriendsModalOpen: (open: boolean) => void;
  pendingRequestsCount: number;
  unreadChatsCount: number;
  latestIncomingMessage: {
    senderName: string;
    text: string;
    partnerId: string;
    partnerName: string;
    partnerCampus: string;
    partnerPhone?: string;
  } | null;
  clearLatestIncomingMessage: () => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

// Blacklist for filtering out fake / bot test names
const FAKE_PATTERNS = [
  /test/i,
  /fake/i,
  /dummy/i,
  /bot\b/i,
  /asdf/i,
  /scam/i,
  /hacker/i,
  /admin123/i,
  /xxx/i,
  /qwerty/i,
];

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  // 1. Student profile state
  const [profile, setProfile] = useState<StudentProfile | null>(() => {
    try {
      const saved = localStorage.getItem('naijamart_student_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    
    // Auto-generate a clean student identifier if none exists
    const randomId = 'std_' + Math.random().toString(36).substring(2, 9);
    const initialProfile: StudentProfile = {
      id: randomId,
      fullName: '',
      campus: 'Federal University Wukari (FU Wukari)',
      department: '',
      level: '200L',
      hostelArea: 'FUW Campus',
      phoneNumber: '',
      whatsappNumber: '',
      isVerified: true,
      bio: 'Verified Nigerian Student on NaijaMarket Hub',
    };
    try {
      localStorage.setItem('naijamart_student_profile', JSON.stringify(initialProfile));
    } catch (e) {}
    return initialProfile;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);

  // 2. Friend requests & friends lists
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [acceptedFriends, setAcceptedFriends] = useState<FriendRequest[]>([]);
  const [allStudents, setAllStudents] = useState<StudentProfile[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);

  // 3. Active Private Chat state
  const [activeChatPartner, setActiveChatPartner] = useState<{
    id: string;
    fullName: string;
    campus: string;
    avatarUrl?: string;
    phone?: string;
  } | null>(null);
  const [activeProductContext, setActiveProductContext] = useState<any>(null);
  const [unreadChatsCount, setUnreadChatsCount] = useState<number>(0);

  // 4. In-App Notification for incoming message
  const [latestIncomingMessage, setLatestIncomingMessage] = useState<{
    senderName: string;
    text: string;
    partnerId: string;
    partnerName: string;
    partnerCampus: string;
    partnerPhone?: string;
  } | null>(null);

  // Local list of reported student IDs (blocked by this user)
  const [reportedIds, setReportedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('naijamart_reported_students');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const clearLatestIncomingMessage = () => {
    setLatestIncomingMessage(null);
  };

  // Sync profile to Firestore doc 'students/{profile.id}' whenever it has a name
  const updateProfile = async (data: Partial<StudentProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...data, updatedAt: serverTimestamp() };
    setProfile(updated);
    try {
      localStorage.setItem('naijamart_student_profile', JSON.stringify(updated));
    } catch (e) {}

    try {
      await setDoc(doc(db, 'students', profile.id), {
        ...updated,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      showToast('Student profile saved & verified!', 'success');
    } catch (err: any) {
      console.warn('Could not sync student profile to cloud:', err);
    }
  };

  // Sync profile from Firestore if it exists
  useEffect(() => {
    if (!profile?.id) return;
    const studentDocRef = doc(db, 'students', profile.id);
    const unsub = onSnapshot(studentDocRef, (snap) => {
      if (snap.exists()) {
        const cloudData = snap.data() as StudentProfile;
        setProfile((prev) => ({ ...prev, ...cloudData }));
      }
    });
    return () => unsub();
  }, [profile?.id]);

  // Real-time listener for incoming friend requests where toId == profile.id
  useEffect(() => {
    if (!profile?.id) return;

    const q = query(
      collection(db, 'friend_requests'),
      where('toId', '==', profile.id),
      where('status', '==', 'pending')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const requests: FriendRequest[] = [];
      snapshot.forEach((d) => {
        requests.push({ id: d.id, ...d.data() } as FriendRequest);
      });
      setIncomingRequests(requests);
    });

    return () => unsub();
  }, [profile?.id]);

  // Real-time listener for sent friend requests where fromId == profile.id
  useEffect(() => {
    if (!profile?.id) return;

    const q = query(
      collection(db, 'friend_requests'),
      where('fromId', '==', profile.id)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list: FriendRequest[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as FriendRequest);
      });
      setSentRequests(list);
    });

    return () => unsub();
  }, [profile?.id]);

  // Real-time listener for accepted friends (where either fromId or toId == profile.id and status == 'accepted')
  useEffect(() => {
    if (!profile?.id) return;

    const q1 = query(
      collection(db, 'friend_requests'),
      where('toId', '==', profile.id),
      where('status', '==', 'accepted')
    );

    const q2 = query(
      collection(db, 'friend_requests'),
      where('fromId', '==', profile.id),
      where('status', '==', 'accepted')
    );

    let list1: FriendRequest[] = [];
    let list2: FriendRequest[] = [];

    const unsub1 = onSnapshot(q1, (snap) => {
      list1 = [];
      snap.forEach((d) => list1.push({ id: d.id, ...d.data() } as FriendRequest));
      setAcceptedFriends([...list1, ...list2]);
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      list2 = [];
      snap.forEach((d) => list2.push({ id: d.id, ...d.data() } as FriendRequest));
      setAcceptedFriends([...list1, ...list2]);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [profile?.id]);

  // Real-time listener for registered real students in the community with anti-fake filtering
  useEffect(() => {
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef);

    const unsub = onSnapshot(q, (snapshot) => {
      const list: StudentProfile[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as StudentProfile;
        const studentId = d.id;

        // 1. Remove reported / fake flagged users
        if (data.isReported || data.isFake || (data.reportCount && data.reportCount >= 2)) {
          return;
        }

        // 2. Remove locally reported / blocked users
        if (reportedIds.includes(studentId)) {
          return;
        }

        // 3. Must have a real name (not empty, min 2 chars)
        const name = (data.fullName || '').trim();
        if (!name || name.length < 2) {
          return;
        }

        // 4. Remove obvious fake/bot test strings
        const isSuspicious = FAKE_PATTERNS.some((pattern) => pattern.test(name));
        if (isSuspicious) {
          return;
        }

        list.push({ ...data, id: studentId });
      });

      setAllStudents(list);
    });

    return () => unsub();
  }, [reportedIds]);

  // Track initial load for conversations to avoid firing toast for old messages
  const isFirstLoadConversationsRef = useRef(true);

  // Real-time listener for conversations & unread count
  useEffect(() => {
    if (!profile?.id) return;

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', profile.id));

    const unsub = onSnapshot(q, (snapshot) => {
      let unread = 0;
      const convList: ChatConversation[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ChatConversation;
        const conv: ChatConversation = { ...data, id: docSnap.id };
        convList.push(conv);

        // Check if unread for current user
        if (data.unreadBy && data.unreadBy.includes(profile.id)) {
          unread += 1;

          // Check if this is a newly arrived message from someone else
          if (
            !isFirstLoadConversationsRef.current &&
            data.lastSenderId &&
            data.lastSenderId !== profile.id &&
            activeChatPartner?.id !== data.lastSenderId
          ) {
            const partnerData = data.participantData?.[data.lastSenderId];
            setLatestIncomingMessage({
              senderName: partnerData?.name || 'A student',
              text: data.lastMessage || 'Sent you a private message',
              partnerId: data.lastSenderId,
              partnerName: partnerData?.name || 'Student',
              partnerCampus: partnerData?.campus || 'FU Wukari',
              partnerPhone: partnerData?.phone,
            });
          }
        }
      });

      isFirstLoadConversationsRef.current = false;

      // Sort conversations by lastMessageTime descending (most recent first)
      convList.sort((a, b) => {
        const tA = a.lastMessageTime?.toDate ? a.lastMessageTime.toDate().getTime() : 0;
        const tB = b.lastMessageTime?.toDate ? b.lastMessageTime.toDate().getTime() : 0;
        return tB - tA;
      });

      setConversations(convList);
      setUnreadChatsCount(unread);
    });

    return () => unsub();
  }, [profile?.id, activeChatPartner?.id]);

  // Report fake profile / scammer
  const reportFakeStudent = async (studentId: string, reason: string) => {
    if (!studentId) return;

    try {
      // 1. Save to local reported list
      const updatedList = Array.from(new Set([...reportedIds, studentId]));
      setReportedIds(updatedList);
      try {
        localStorage.setItem('naijamart_reported_students', JSON.stringify(updatedList));
      } catch (e) {}

      // 2. Update Firestore
      const studentDoc = doc(db, 'students', studentId);
      await updateDoc(studentDoc, {
        isReported: true,
        reportCount: increment(1),
        lastReportedAt: serverTimestamp(),
      });

      // 3. Remove immediately from local student list
      setAllStudents((prev) => prev.filter((s) => s.id !== studentId));

      showToast('Thank you! This account has been reported and removed from your view.', 'success');
    } catch (err: any) {
      console.warn('Report error:', err);
      // Even if Firestore update fails, locally filter it out
      setAllStudents((prev) => prev.filter((s) => s.id !== studentId));
      showToast('Profile blocked and removed from your view.', 'info');
    }
  };

  // Function to send a friend request
  const sendFriendRequest = async (target: {
    id: string;
    name: string;
    campus: string;
    avatar?: string;
    phone?: string;
    department?: string;
  }): Promise<boolean> => {
    if (!profile) return false;

    // Check if user has set their name
    if (!profile.fullName || profile.fullName.trim() === '') {
      setIsProfileModalOpen(true);
      showToast('Please set your student name first before sending friend requests', 'info');
      return false;
    }

    if (profile.id === target.id) {
      showToast('You cannot send a friend request to yourself', 'error');
      return false;
    }

    // Check if already sent or already friends
    const isAlreadyRequested = sentRequests.some((r) => r.toId === target.id && r.status === 'pending');
    if (isAlreadyRequested) {
      showToast(`You already sent a friend request to ${target.name}. Awaiting acceptance!`, 'info');
      return true;
    }

    const isAlreadyFriend = acceptedFriends.some(
      (r) => (r.fromId === target.id || r.toId === target.id) && r.status === 'accepted'
    );
    if (isAlreadyFriend) {
      showToast(`You and ${target.name} are already connected friends!`, 'info');
      return true;
    }

    try {
      const payload: Omit<FriendRequest, 'id'> = {
        fromId: profile.id,
        fromName: profile.fullName,
        fromCampus: profile.campus || 'FU Wukari',
        fromDepartment: profile.department || 'Student',
        fromAvatar: profile.avatarUrl || '',
        fromPhone: profile.phoneNumber || '',
        toId: target.id,
        toName: target.name,
        toCampus: target.campus || 'FU Wukari',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'friend_requests'), payload);
      showToast(`Friend request sent to ${target.name}! They will see it immediately.`, 'success');
      return true;
    } catch (err: any) {
      console.error('Send friend request error:', err);
      showToast('Could not send friend request: ' + (err.message || 'Check connection'), 'error');
      return false;
    }
  };

  // Function to accept friend request
  const acceptFriendRequest = async (requestId: string) => {
    try {
      const reqRef = doc(db, 'friend_requests', requestId);
      await updateDoc(reqRef, {
        status: 'accepted',
        updatedAt: serverTimestamp(),
      });
      showToast('Friend request accepted! You can now start private chats.', 'success');
    } catch (err: any) {
      console.error('Accept friend error:', err);
      showToast('Error accepting request: ' + err.message, 'error');
    }
  };

  // Function to decline friend request
  const declineFriendRequest = async (requestId: string) => {
    try {
      const reqRef = doc(db, 'friend_requests', requestId);
      await updateDoc(reqRef, {
        status: 'declined',
        updatedAt: serverTimestamp(),
      });
      showToast('Friend request declined.', 'info');
    } catch (err: any) {
      console.error('Decline friend error:', err);
    }
  };

  // Open private chat with another student
  const openPrivateChatWith = (
    partner: {
      id: string;
      fullName: string;
      campus: string;
      avatarUrl?: string;
      phone?: string;
    },
    productContext?: any
  ) => {
    if (!profile?.fullName || profile.fullName.trim() === '') {
      setIsProfileModalOpen(true);
      showToast('Please enter your student name first to start private chat', 'info');
      return;
    }

    setActiveChatPartner(partner);
    setActiveProductContext(productContext || null);
    clearLatestIncomingMessage();
  };

  const closePrivateChat = () => {
    setActiveChatPartner(null);
    setActiveProductContext(null);
  };

  return (
    <StudentContext.Provider
      value={{
        profile,
        updateProfile,
        isProfileModalOpen,
        setIsProfileModalOpen,
        incomingRequests,
        sentRequests,
        acceptedFriends,
        allStudents,
        conversations,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        reportFakeStudent,
        activeChatPartner,
        activeProductContext,
        openPrivateChatWith,
        closePrivateChat,
        isFriendsModalOpen,
        setIsFriendsModalOpen,
        pendingRequestsCount: incomingRequests.length,
        unreadChatsCount,
        latestIncomingMessage,
        clearLatestIncomingMessage,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
