import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from './ToastContext';
import { useTimer } from '../hooks/useTimer';
import { 
  collection, query, where, orderBy, limit, onSnapshot, addDoc, 
  updateDoc, doc, serverTimestamp, getDocs, writeBatch, setDoc, deleteDoc 
} from 'firebase/firestore';

const DirectChatContext = createContext(null);

const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'sine';
    // Warm E5-G5 chime
    osc.frequency.setValueAtTime(659.25, audioContext.currentTime); 
    osc.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.12); 
    
    gain.gain.setValueAtTime(0.15, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.35);
  } catch (e) {
    console.error("Audio chime failed: ", e);
  }
};

export const DirectChatProvider = ({ children }) => {
  const { user } = useAuth();
  const showToast = useToast();
  const { isRunning } = useTimer();
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadMsgs, setUnreadMsgs] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [friendships, setFriendships] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  // 1. Update user's lastActive status in Firestore
  useEffect(() => {
    if (!user?.uid) return;

    const updateStatus = async () => {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          lastActive: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.error("Failed to update active status: ", err);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // every 1 min
    return () => clearInterval(interval);
  }, [user?.uid]);

  // 2. Listen to all registered users + filter online ones (active in past 15 mins)
  useEffect(() => {
    if (!user?.uid) return;

    const q = collection(db, 'users');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs
        .map(d => ({ uid: d.id, ...d.data() }))
        .filter(u => u.uid !== user.uid);
      
      setAllUsers(usersList);

      // Online if active in the last 15 minutes
      const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
      const online = usersList.filter(u => {
        if (!u.lastActive) return false;
        const lastActiveMs = u.lastActive.seconds 
          ? u.lastActive.seconds * 1000 
          : new Date(u.lastActive).getTime();
        return lastActiveMs > fifteenMinsAgo;
      });
      setOnlineUsers(online);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 3. Listen to friendships (real-time)
  useEffect(() => {
    if (!user?.uid) {
      setFriendships([]);
      return;
    }

    const q = query(
      collection(db, 'friendships'),
      where('users', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setFriendships(list);
    }, (err) => {
      console.error("Friendship sync failed: ", err);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 4. Listen to friend requests (both incoming and outgoing)
  useEffect(() => {
    if (!user?.uid) {
      setFriendRequests([]);
      return;
    }

    const qIncoming = query(
      collection(db, 'friend_requests'),
      where('receiverId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribeIncoming = onSnapshot(qIncoming, (snap) => {
      setFriendRequests(prev => {
        const incoming = snap.docs.map(d => ({ id: d.id, ...d.data(), isIncoming: true }));
        const outgoing = prev.filter(r => !r.isIncoming);
        return [...incoming, ...outgoing];
      });
    });

    const qOutgoing = query(
      collection(db, 'friend_requests'),
      where('senderId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribeOutgoing = onSnapshot(qOutgoing, (snap) => {
      setFriendRequests(prev => {
        const outgoing = snap.docs.map(d => ({ id: d.id, ...d.data(), isIncoming: false }));
        const incoming = prev.filter(r => r.isIncoming);
        return [...incoming, ...outgoing];
      });
    });

    return () => {
      unsubscribeIncoming();
      unsubscribeOutgoing();
    };
  }, [user?.uid]);

  // Helper getters
  const isFriend = (otherUserId) => {
    return friendships.some(f => f.users.includes(otherUserId));
  };

  const getFriendshipStatus = (otherUserId) => {
    if (isFriend(otherUserId)) return 'friend';
    const req = friendRequests.find(r => r.senderId === otherUserId || r.receiverId === otherUserId);
    if (req) {
      return req.isIncoming ? 'pending_incoming' : 'pending_outgoing';
    }
    return 'none';
  };

  // Friend actions
  const sendFriendRequest = async (receiverId, receiverName) => {
    if (!user?.uid || !receiverId) return;
    const reqId = [user.uid, receiverId].sort().join('_');
    try {
      await setDoc(doc(db, 'friend_requests', reqId), {
        senderId: user.uid,
        senderName: user.displayName || 'User',
        receiverId,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      showToast(`Friend request sent to ${receiverName}!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to send friend request.', 'error');
    }
  };

  const acceptFriendRequest = async (senderId, senderName) => {
    if (!user?.uid || !senderId) return;
    const reqId = [user.uid, senderId].sort().join('_');
    const friendshipId = [user.uid, senderId].sort().join('_');
    
    const batch = writeBatch(db);
    batch.delete(doc(db, 'friend_requests', reqId));
    batch.set(doc(db, 'friendships', friendshipId), {
      users: [user.uid, senderId],
      timestamp: serverTimestamp()
    });
    
    try {
      await batch.commit();
      showToast(`You are now friends with ${senderName}!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to accept friend request.', 'error');
    }
  };

  const declineFriendRequest = async (senderId) => {
    if (!user?.uid || !senderId) return;
    const reqId = [user.uid, senderId].sort().join('_');
    try {
      await deleteDoc(doc(db, 'friend_requests', reqId));
      showToast('Friend request declined.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const unfriendUser = async (friendId, friendName) => {
    if (!user?.uid || !friendId) return;
    const friendshipId = [user.uid, friendId].sort().join('_');
    
    const batch = writeBatch(db);
    batch.delete(doc(db, 'friendships', friendshipId));
    batch.delete(doc(db, 'friend_requests', friendshipId));
    
    try {
      await batch.commit();
      showToast(`Removed ${friendName} from friends.`, 'info');
      if (activeChatUser?.uid === friendId) {
        setActiveChatUser(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to remove friend.', 'error');
    }
  };

  // 5. Listen to messages for the active chat room (only if they are friends)
  useEffect(() => {
    if (!user?.uid || !activeChatUser || !isFriend(activeChatUser.uid)) {
      setMessages([]);
      return;
    }

    const chatRoomId = [user.uid, activeChatUser.uid].sort().join('_');
    const q = query(
      collection(db, 'direct_messages'),
      where('chatRoomId', '==', chatRoomId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      
      // Mark as read
      markMessagesAsRead(activeChatUser.uid);
    });

    return () => unsubscribe();
  }, [user?.uid, activeChatUser, friendships]);

  // 6. Global listener for unread messages (ignores messages from non-friends, and respects focus mode)
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'direct_messages'),
      where('receiverId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unreads = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Only keep unreads from actual friends
      const friendIds = friendships.map(f => f.users.find(id => id !== user.uid));
      const validUnreads = unreads.filter(m => friendIds.includes(m.senderId));

      setUnreadMsgs(prev => {
        const prevIds = new Set(prev.map(m => m.id));
        const newMessages = validUnreads.filter(m => !prevIds.has(m.id));
        
        if (newMessages.length > 0) {
          // NOTIFY ONLY IF NOT RUNNING A FOCUS SESSION
          if (!isRunning) {
            playNotificationSound();
            
            newMessages.forEach(msg => {
              if (!isChatDrawerOpen || !activeChatUser || activeChatUser.uid !== msg.senderId) {
                showToast(`📩 Message from ${msg.senderName}: "${msg.text.slice(0, 40)}${msg.text.length > 40 ? '...' : ''}"`, 'info');
              }
            });
          }
        }
        return validUnreads;
      });
    }, (err) => {
      console.error("Unread DMs sync failed: ", err);
    });

    return () => unsubscribe();
  }, [user?.uid, activeChatUser, isChatDrawerOpen, isRunning, friendships]);

  // 7. Send message function (only allowed if they are friends)
  const sendDirectMessage = async (text) => {
    if (!user || !activeChatUser || !text.trim()) return;
    if (!isFriend(activeChatUser.uid)) {
      showToast("You can only message registered friends.", "warning");
      return;
    }

    const chatRoomId = [user.uid, activeChatUser.uid].sort().join('_');
    try {
      await addDoc(collection(db, 'direct_messages'), {
        chatRoomId,
        senderId: user.uid,
        senderName: user.displayName || 'User',
        senderPhoto: user.photoURL || '',
        receiverId: activeChatUser.uid,
        text: text.trim(),
        timestamp: serverTimestamp(),
        read: false
      });
    } catch (err) {
      console.error("Failed to send direct message: ", err);
      showToast("Could not send message. Please try again.", "error");
    }
  };

  const markMessagesAsRead = async (senderId) => {
    if (!user?.uid || !senderId) return;
    const chatRoomId = [user.uid, senderId].sort().join('_');
    
    const q = query(
      collection(db, 'direct_messages'),
      where('chatRoomId', '==', chatRoomId),
      where('receiverId', '==', user.uid),
      where('read', '==', false)
    );

    try {
      const snap = await getDocs(q);
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.docs.forEach(d => {
          batch.update(d.ref, { read: true });
        });
        await batch.commit();
      }
    } catch (err) {
      console.error("Failed to mark messages as read: ", err);
    }
  };

  return (
    <DirectChatContext.Provider value={{
      isChatDrawerOpen,
      setIsChatDrawerOpen,
      activeChatUser,
      setActiveChatUser,
      messages,
      unreadMsgs,
      onlineUsers,
      allUsers,
      friendRequests,
      sendDirectMessage,
      markMessagesAsRead,
      sendFriendRequest,
      acceptFriendRequest,
      declineFriendRequest,
      unfriendUser,
      isFriend,
      getFriendshipStatus
    }}>
      {children}
    </DirectChatContext.Provider>
  );
};

export const useDirectChat = () => {
  const ctx = useContext(DirectChatContext);
  if (!ctx) throw new Error('useDirectChat must be used inside <DirectChatProvider>');
  return ctx;
};
