import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Send, Share2, Camera, CameraOff, Users, Flame, Heart, 
  Zap, Crown, MessageSquare, Trophy, Shield, Clock, TreePine, AlertTriangle, 
  Smile, Lock, Plus, Eye, Key, LogOut, Trash2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { useTimer } from '../hooks/useTimer';
import { db } from '../services/firebase';
import { 
  collection, addDoc, onSnapshot, deleteDoc, doc, setDoc, query, orderBy, limit, serverTimestamp 
} from 'firebase/firestore';
import { initFaceTracker } from '../utils/faceDetection';

// Standard Quests
const DAILY_QUESTS = [
  { id: 'q1', title: 'Deep Work Sprint', desc: 'Focus for 30 minutes total', target: 1800, type: 'time', icon: Clock, color: 'text-brand bg-brand/10' },
  { id: 'q2', title: 'Perfect Pomodoro', desc: 'Complete 2 Focus sessions', target: 2, type: 'sessions', icon: Zap, color: 'text-yellow-400 bg-yellow-400/10' },
  { id: 'q3', title: 'Forest Builder', desc: 'Plant 3 Trees today', target: 3, type: 'trees', icon: TreePine, color: 'text-emerald-400 bg-emerald-400/10' }
];

const Community = () => {
  const { user } = useAuth();
  const showToast = useToast();
  const {
    mode,
    timeLeft,
    isRunning,
    totalFocusSeconds,
    switchMode,
    startTimer,
    stopTimer,
    resetTimer,
    settings,
    MODES
  } = useTimer();

  // Lobby & Room States
  const [rooms, setRooms] = useState([]);
  const [localRooms, setLocalRooms] = useState(() => {
    try {
      const saved = localStorage.getItem('local_rooms');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [currentRoom, setCurrentRoom] = useState(null);
  const [allActiveFocusers, setAllActiveFocusers] = useState([]);
  
  // Modals & Creation Forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPrivacy, setNewRoomPrivacy] = useState('public');
  const [newRoomPasscode, setNewRoomPasscode] = useState('');
  
  // Join Room verification
  const [unlockRoomId, setUnlockRoomId] = useState(null);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Chat States
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Camera & Face Tracking States
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [presenceVerified, setPresenceVerified] = useState(true);
  const [absenceTimeLeft, setAbsenceTimeLeft] = useState(15); // 15 seconds allowance
  const [isAway, setIsAway] = useState(false);
  
  // Camera Toggle Limit: Max 2 toggles OFF during a single focus session
  const [cameraOffCount, setCameraOffCount] = useState(0);

  // Live Streams & Audience Grid
  const [activeFocussers, setActiveFocussers] = useState([]);
  const [incomingReactions, setIncomingReactions] = useState([]);
  
  // Quests States
  const [questSignups, setQuestSignups] = useState({});
  const [todaysWinners, setTodaysWinners] = useState([]);

  // Refs for camera/canvas
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const trackerRef = useRef(null);
  const absenceTimerRef = useRef(null);
  const publishIntervalRef = useRef(null);
  const chatEndRef = useRef(null);

  const todayStr = new Date().toLocaleDateString('en-CA');

  const getRoomMillis = (room) => {
    if (!room?.createdAt) return Date.now();
    if (typeof room.createdAt.toDate === 'function') return room.createdAt.toDate().getTime();
    if (room.createdAt.seconds) return room.createdAt.seconds * 1000;
    if (typeof room.createdAt === 'string') return new Date(room.createdAt).getTime();
    return Date.now();
  };

  // Listen for active rooms in the lobby
  useEffect(() => {
    const q = query(collection(db, 'rooms'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const dbRooms = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const merged = [...localRooms, ...dbRooms];
      merged.sort((a, b) => getRoomMillis(b) - getRoomMillis(a));
      setRooms(merged);
    }, (err) => {
      console.error("Rooms sync failed: ", err);
      const merged = [...localRooms];
      merged.sort((a, b) => getRoomMillis(b) - getRoomMillis(a));
      setRooms(merged);
    });
    return () => unsub();
  }, [localRooms]);

  // Listen to all active focusers (to compute members inside each room for lobby preview)
  useEffect(() => {
    const q = collection(db, 'live_focusers');
    const unsub = onSnapshot(q, (snap) => {
      setAllActiveFocusers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Reset camera off limit count when a new focus session starts
  useEffect(() => {
    if (isRunning) {
      setCameraOffCount(0);
    }
  }, [isRunning]);

  // Load chat history filtered by current room
  useEffect(() => {
    if (!currentRoom) return;
    const q = query(
      collection(db, 'chats'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );
    const unsub = onSnapshot(q, (snap) => {
      const allMsgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const roomMsgs = allMsgs.filter(m => m.roomId === currentRoom.id);
      setMessages(roomMsgs);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (err) => {
      console.error("Chat sync failed: ", err);
    });
    return () => unsub();
  }, [currentRoom]);

  // Load quest signups & calculate live leaderboard/winners
  useEffect(() => {
    const q = collection(db, 'quest_signups');
    const unsub = onSnapshot(q, (snap) => {
      const allSignups = {};
      const winners = [];
      
      snap.docs.forEach(d => {
        const data = d.data();
        if (data.date === todayStr) {
          allSignups[data.userId] = data;
          if (data.completedCount >= 3) {
            winners.push(data.userName);
          }
        }
      });
      setQuestSignups(allSignups);
      setTodaysWinners(winners);
    });
    return () => unsub();
  }, [todayStr]);

  // Track Quest Progress locally and sync to Firebase
  useEffect(() => {
    if (!user?.uid) return;

    const localSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
    const todaySessions = localSessions.filter(s => s.date === todayStr);

    const treesPlanted = todaySessions.filter(s => s.mode === MODES.POMODORO || s.mode === MODES.STOPWATCH).length;
    const focusTimeToday = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const sessionsCompleted = todaySessions.length;

    const progress = {
      q1: focusTimeToday,
      q2: sessionsCompleted,
      q3: treesPlanted
    };

    let completedCount = 0;
    if (progress.q1 >= DAILY_QUESTS[0].target) completedCount++;
    if (progress.q2 >= DAILY_QUESTS[1].target) completedCount++;
    if (progress.q3 >= DAILY_QUESTS[2].target) completedCount++;

    const docId = `${todayStr}_${user.uid}`;
    setDoc(doc(db, 'quest_signups', docId), {
      userId: user.uid,
      userName: user.displayName || user.name || 'Anonymous',
      userPhoto: user.photoURL || '',
      date: todayStr,
      progress,
      completedCount,
      lastUpdated: serverTimestamp()
    }, { merge: true }).catch(err => console.error('Quest Sync Error:', err));

  }, [totalFocusSeconds, todayStr, user?.uid]);

  // Subscribe to reactions sent to current user
  useEffect(() => {
    if (!user?.uid) return;
    const q = collection(db, `reactions_${user.uid}`);
    const unsub = onSnapshot(q, (snap) => {
      snap.docs.forEach(d => {
        const data = d.data();
        triggerEmojiReaction(data.emoji);
        deleteDoc(doc(db, `reactions_${user.uid}`, d.id)).catch(() => {});
      });
    });
    return () => unsub();
  }, [user?.uid]);

  // Watch active focusers inside the current room
  useEffect(() => {
    if (!currentRoom) return;
    const q = collection(db, 'live_focusers');
    const unsub = onSnapshot(q, (snap) => {
      const raw = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const active = raw.filter(f => {
        const isActive = f.userId !== user?.uid && 
          f.roomId === currentRoom.id &&
          (Date.now() - (f.lastUpdated?.seconds * 1000 || Date.now())) < 30000;
        return isActive;
      });
      setActiveFocussers(active);
    }, (err) => {
      console.error("Live focusers sync failed: ", err);
    });
    return () => unsub();
  }, [currentRoom, user?.uid]);

  // Handle room creation
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim() || !user) return;

    const rCode = `FF-${Math.floor(100000 + Math.random() * 900000)}`;
    const newRoom = {
      name: newRoomName.trim(),
      isPrivate: newRoomPrivacy === 'private',
      passcode: newRoomPrivacy === 'private' ? newRoomPasscode.trim().toUpperCase() : '',
      roomCode: rCode,
      creatorId: user.uid,
      creatorName: user.displayName || user.name || 'Anonymous',
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, 'rooms'), newRoom);
      const createdRoom = { id: docRef.id, ...newRoom };
      setCurrentRoom(createdRoom);
      setShowCreateModal(false);
      setNewRoomName('');
      setNewRoomPasscode('');
    } catch (err) {
      console.error("Firebase Room Creation Error: ", err);
      const errorMsg = err.message || err;
      
      const useLocal = window.confirm(
        `Database Room Creation Failed:\n"${errorMsg}"\n\nWould you like to create a temporary Local Study Room in browser memory instead? (This lets you test the lobby and focus room interface immediately).`
      );
      
      if (useLocal) {
        const localId = `local-${Date.now()}`;
        const createdRoom = { 
          id: localId, 
          ...newRoom, 
          isLocal: true,
          createdAt: { toDate: () => new Date() }
        };
        const updatedLocalRooms = [createdRoom, ...localRooms];
        setLocalRooms(updatedLocalRooms);
        localStorage.setItem('local_rooms', JSON.stringify(updatedLocalRooms));
        setCurrentRoom(createdRoom);
        setShowCreateModal(false);
        setNewRoomName('');
        setNewRoomPasscode('');
      }
    }
  };

  // Handle local room deletion
  const handleDeleteLocalRoom = (roomId, e) => {
    e.stopPropagation();
    const updated = localRooms.filter(r => r.id !== roomId);
    setLocalRooms(updated);
    localStorage.setItem('local_rooms', JSON.stringify(updated));
  };

  // Handle entering a room (handles passcode prompt for private)
  const handleSelectRoom = (room) => {
    if (room.isPrivate && room.creatorId !== user?.uid) {
      setUnlockRoomId(room.id);
      setPasscodeInput('');
      setPasscodeError('');
    } else {
      setCurrentRoom(room);
    }
  };

  const handleVerifyPasscode = (e) => {
    e.preventDefault();
    const targetRoom = rooms.find(r => r.id === unlockRoomId);
    if (!targetRoom) return;

    if (passcodeInput.trim().toUpperCase() === targetRoom.passcode) {
      setCurrentRoom(targetRoom);
      setUnlockRoomId(null);
      setPasscodeInput('');
    } else {
      setPasscodeError('Incorrect room passcode. Please check and try again.');
    }
  };

  const handleLeaveRoom = () => {
    cleanupTracker();
    setIsCameraOn(false);
    setPresenceVerified(true);
    setIsAway(false);
    setCurrentRoom(null);
  };

  // Handle message sending
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !currentRoom) return;
    
    if (currentRoom.isLocal) {
      const mockMsg = {
        id: `msg-${Date.now()}`,
        userId: user.uid,
        userName: user.displayName || user.name || 'Anonymous',
        userPhoto: user.photoURL || '',
        text: newMessage,
        type: 'text',
        roomId: currentRoom.id,
        timestamp: null
      };
      setMessages(prev => [...prev, mockMsg]);
      setNewMessage('');
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      return;
    }

    try {
      await addDoc(collection(db, 'chats'), {
        userId: user.uid,
        userName: user.displayName || user.name || 'Anonymous',
        userPhoto: user.photoURL || '',
        text: newMessage,
        type: 'text',
        roomId: currentRoom.id,
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  // Share Focus progress card to chat
  const shareProgress = async () => {
    if (!user || !currentRoom) return;
    
    const h = Math.floor(totalFocusSeconds / 3600);
    const m = Math.floor((totalFocusSeconds % 3600) / 60);
    const timeFormatted = `${h}h ${m}m`;

    const localSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
    const trees = localSessions.filter(s => s.mode === MODES.POMODORO || s.mode === MODES.STOPWATCH).length;

    if (currentRoom.isLocal) {
      const mockMsg = {
        id: `msg-share-${Date.now()}`,
        userId: user.uid,
        userName: user.displayName || user.name || 'Anonymous',
        userPhoto: user.photoURL || '',
        text: `🌳 shared focus progress: studied for ${timeFormatted} and planted ${trees} trees! Join me in the Arena!`,
        type: 'progress_share',
        roomId: currentRoom.id,
        timestamp: null,
        progressData: {
          time: timeFormatted,
          trees
        }
      };
      setMessages(prev => [...prev, mockMsg]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      return;
    }

    try {
      await addDoc(collection(db, 'chats'), {
        userId: user.uid,
        userName: user.displayName || user.name || 'Anonymous',
        userPhoto: user.photoURL || '',
        text: `🌳 shared focus progress: studied for ${timeFormatted} and planted ${trees} trees! Join me in the Arena!`,
        type: 'progress_share',
        roomId: currentRoom.id,
        timestamp: serverTimestamp(),
        progressData: {
          time: timeFormatted,
          trees
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Capture low-res webcam image and save to live grid bound to current room
  const publishStreamFrame = () => {
    if (!videoRef.current || !canvasRef.current || !user?.uid || !currentRoom) return;
    if (currentRoom.isLocal) return; // Skip online live syncing for local mock rooms

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Draw video at extremely low resolution
    canvas.width = 120;
    canvas.height = 90;
    ctx.drawImage(video, 0, 0, 120, 90);
    
    const base64Frame = canvas.toDataURL('image/jpeg', 0.4);

    setDoc(doc(db, 'live_focusers', user.uid), {
      userId: user.uid,
      userName: user.displayName || user.name || 'Anonymous',
      userPhoto: user.photoURL || '',
      timeLeft,
      isRunning,
      mode,
      presenceVerified,
      lastFrame: base64Frame,
      isPrivate: currentRoom.isPrivate,
      roomCode: currentRoom.roomCode,
      roomId: currentRoom.id,
      lastUpdated: serverTimestamp()
    }, { merge: true }).catch((err) => {
      console.error("Failed to publish webcam frame: ", err);
    });
  };

  const publishStreamFrameRef = useRef();
  publishStreamFrameRef.current = publishStreamFrame;

  // Instantly publish state updates when key states change
  useEffect(() => {
    if (isCameraOn && currentRoom && !currentRoom.isLocal) {
      publishStreamFrameRef.current?.();
    }
  }, [isRunning, mode, presenceVerified]);

  // Camera logic + Face Tracking setup
  useEffect(() => {
    if (isCameraOn && videoRef.current) {
      initFaceTracker(videoRef.current, (isPresent, data) => {
        setPresenceVerified(isPresent);
        if (isPresent) {
          setIsAway(false);
          setAbsenceTimeLeft(15);
          clearInterval(absenceTimerRef.current);
          absenceTimerRef.current = null;
        } else {
          if (!absenceTimerRef.current) {
            absenceTimerRef.current = setInterval(() => {
              setAbsenceTimeLeft(prev => {
                if (prev <= 1) {
                  clearInterval(absenceTimerRef.current);
                  absenceTimerRef.current = null;
                  setIsAway(true);
                  stopTimer(); // Pause session!
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          }
        }
      }).then(controlObj => {
        trackerRef.current = controlObj;
        // Trigger initial frame immediately
        publishStreamFrameRef.current?.();
      }).catch(err => {
        setIsCameraOn(false);
        showToast('Could not access camera. Please check permissions.', 'error');
      });

      publishIntervalRef.current = setInterval(() => {
        publishStreamFrameRef.current?.();
      }, 10000); // every 10 seconds

    } else {
      cleanupTracker();
    }

    return () => cleanupTracker();
  }, [isCameraOn]);

  const cleanupTracker = () => {
    if (trackerRef.current) {
      trackerRef.current.stop();
      trackerRef.current = null;
    }
    clearInterval(absenceTimerRef.current);
    absenceTimerRef.current = null;
    clearInterval(publishIntervalRef.current);
    publishIntervalRef.current = null;
    
    // Remove doc from live grid
    if (user?.uid) {
      deleteDoc(doc(db, 'live_focusers', user.uid)).catch(() => {});
    }
  };

  // Camera toggle control with maximum 2 toggle-offs per focus session
  const handleToggleCamera = () => {
    if (isCameraOn) {
      // User is attempting to turn camera OFF
      if (isRunning) {
        if (cameraOffCount >= 2) {
          showToast('Emergency camera toggle limit reached (Max 2 times per active study session). Keep camera on to continue focusing!', 'warning');
          return;
        }
        setCameraOffCount(prev => prev + 1);
        stopTimer(); // Pause session!
      }
      setIsCameraOn(false);
    } else {
      setIsCameraOn(true);
    }
  };

  // Spectator emoji reactions
  const sendEmojiReaction = async (recipientId, emoji) => {
    if (recipientId?.startsWith('local')) return; // Skip local users
    try {
      await addDoc(collection(db, `reactions_${recipientId}`), {
        emoji,
        senderName: user?.displayName || 'Spectator',
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Display floating emoji reactions on screen
  const triggerEmojiReaction = (emoji) => {
    const reaction = {
      id: Date.now() + Math.random(),
      emoji,
      x: Math.random() * 80 + 10
    };
    setIncomingReactions(prev => [...prev, reaction]);
    setTimeout(() => {
      setIncomingReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 3000);
  };

  const fmtTime = (s) => {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Quest Arena & Study Room In Development Phase
  return (
    <div className="min-h-screen bg-bg-dark text-white p-4 sm:p-8 max-w-[1500px] mx-auto w-full flex flex-col items-center justify-center relative">
      
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Glassmorphic Bento Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass max-w-2xl w-full p-8 sm:p-12 rounded-[2.5rem] border border-white/10 relative overflow-hidden text-center flex flex-col items-center gap-6"
      >
        {/* Animated Construction / Lock badge */}
        <div className="p-5 bg-brand/10 text-brand rounded-[2rem] border border-brand/20 shadow-inner relative group animate-pulse">
          <Lock size={48} className="text-brand relative z-10" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-brand rounded-[2rem] blur-lg"
          />
        </div>

        <div className="space-y-2">
          <span className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
            Development Phase
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-brand tracking-tight mt-4">
            Quest Arena & <span className="text-brand">Live Study Rooms</span>
          </h1>
          <p className="text-slate-400 text-sm font-semibold max-w-md mx-auto leading-relaxed pt-2">
            We are building a highly collaborative, real-time multiplayer workspace with face-tracking presence validation, shared progress channels, and interactive gamified study events.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-4 mt-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">Construction Progress</span>
            <span className="text-xs font-black text-brand">87% Done</span>
          </div>
          <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '87%' }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-brand to-purple-500 rounded-full"
            />
          </div>
        </div>

        {/* Interactive Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-md pt-2">
          <div className="bg-white/3 border border-white/5 p-4 rounded-2xl text-center">
            <p className="text-[9px] font-black uppercase text-text-muted tracking-widest mb-1">Target Version</p>
            <p className="text-base font-black text-white">v3.0.0-beta</p>
          </div>
          <div className="bg-white/3 border border-white/5 p-4 rounded-2xl text-center">
            <p className="text-[9px] font-black uppercase text-text-muted tracking-widest mb-1">Access Mode</p>
            <p className="text-base font-black text-yellow-400 flex items-center justify-center gap-1">
              Developer Only
            </p>
          </div>
        </div>

        <Link 
          to="/" 
          className="mt-4 px-8 py-4 bg-brand text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-brand/20 hover:scale-105 hover:bg-brand/95 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-dark text-white p-4 sm:p-8 max-w-[1500px] mx-auto w-full relative">
      
      {/* Floating Reactions overlay */}
      <div className="fixed inset-0 pointer-events-none z-[999] overflow-hidden">
        <AnimatePresence>
          {incomingReactions.map(r => (
            <motion.div
              key={r.id}
              initial={{ y: '100vh', x: `${r.x}vw`, opacity: 1, scale: 0.8 }}
              animate={{ y: '-10vh', opacity: 0, scale: 1.5, rotate: [-10, 10, -10, 10] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: 'easeOut' }}
              className="absolute text-4xl"
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main layout routing: Lobby vs Study Room */}
      {!currentRoom ? (
        // ================= LOBBY VIEW =================
        <div className="space-y-8">
          <header className="glass p-6 sm:p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left w-full md:w-auto">
              <div className="flex justify-between items-center w-full sm:w-auto">
                <Link to="/" className="p-3 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-white border border-white/5">
                  <ArrowLeft size={22} />
                </Link>
                <div className="p-3 bg-brand/10 rounded-2xl text-brand shadow-lg shadow-brand/10 sm:hidden">
                  <Users size={20} />
                </div>
              </div>
              
              <div className="hidden sm:block p-3.5 bg-brand/10 rounded-2xl text-brand shadow-lg shadow-brand/10">
                <Users size={24} />
              </div>
              
              <div>
                <h1 className="text-xl sm:text-2xl font-black font-brand">Focus Rooms <span className="text-brand">Lobby</span></h1>
                <p className="text-text-muted text-[10px] uppercase tracking-widest font-black opacity-60 mt-1 max-w-[280px] sm:max-w-none">Join a public study room or create a private study arena</p>
              </div>
            </div>

            <button 
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-brand hover:bg-brand-hover text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
            >
              <Plus size={16} /> Create Room
            </button>
          </header>

          <div className="grid grid-cols-12 gap-6">
            {/* Lobby Rooms Grid */}
            <div className="col-span-12 lg:col-span-8 space-y-4">
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2 text-white/90">
                <Eye size={18} className="text-brand" /> Browse Active Rooms
              </h2>

              {rooms.length === 0 ? (
                <div className="glass rounded-[2rem] p-16 text-center border border-white/5 flex flex-col items-center gap-4">
                  <Users size={48} className="text-text-muted/20" />
                  <h3 className="font-black text-slate-300">No rooms active right now</h3>
                  <p className="text-xs text-text-muted/70 max-w-sm">Be the pioneer! Create a study room, invite your peers, and kickstart a collaborative study session.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rooms.map(r => {
                    // Filter focusers active in this room
                    const members = allActiveFocusers.filter(f => 
                      f.roomId === r.id && 
                      (Date.now() - (f.lastUpdated?.seconds * 1000 || Date.now())) < 30000
                    );

                    return (
                      <div 
                        key={r.id} 
                        onClick={() => handleSelectRoom(r)}
                        className="glass border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-brand/40 hover:bg-white/5 transition-all cursor-pointer group hover:scale-[1.01]"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                                r.isPrivate 
                                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                                  : 'bg-brand/10 border-brand/20 text-brand'
                              }`}>
                                {r.isPrivate ? <Lock size={10} /> : <Users size={10} />}
                                {r.isPrivate ? 'Private' : 'Public'}
                              </span>
                              {r.isLocal && (
                                <span className="px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                  Local
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-text-muted font-bold">Created by {r.creatorName}</span>
                              {r.isLocal && (
                                <button 
                                  onClick={(e) => handleDeleteLocalRoom(r.id, e)}
                                  className="p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-text-muted transition-colors"
                                  title="Delete Local Room"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-black text-base text-white group-hover:text-brand transition-colors">{r.name}</h3>
                          </div>
                        </div>

                        {/* Members preview */}
                        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2 overflow-hidden">
                              {members.slice(0, 3).map(m => (
                                <div key={m.userId} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-[#090d16] flex items-center justify-center text-[9px] font-black overflow-hidden">
                                  {m.userPhoto ? (
                                    <img src={m.userPhoto} alt={m.userName} className="w-full h-full object-cover" />
                                  ) : (
                                    m.userName[0].toUpperCase()
                                  )}
                                </div>
                              ))}
                              {members.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-brand/20 border-2 border-[#090d16] flex items-center justify-center text-[9px] font-black text-brand">
                                  +{members.length - 3}
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] text-text-muted font-bold">
                              {members.length === 0 ? 'Empty' : `${members.length} studier${members.length > 1 ? 's' : ''} active`}
                            </span>
                          </div>

                          <span className="text-[10px] font-black text-brand group-hover:translate-x-1 transition-transform uppercase tracking-wider flex items-center gap-1">
                            Join Room &rarr;
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quests Sidebar in Lobby */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              {todaysWinners.length > 0 && (
                <div className="bg-gradient-to-r from-yellow-500/20 to-brand/20 border border-yellow-500/30 rounded-3xl p-5 flex items-center gap-4">
                  <Trophy size={28} className="text-yellow-400 shrink-0" />
                  <div>
                    <p className="text-[9px] font-black uppercase text-yellow-400 tracking-wider">Today's Elite Achievers</p>
                    <p className="text-xs font-bold leading-relaxed">{todaysWinners.join(', ')}</p>
                  </div>
                </div>
              )}

              <div className="glass rounded-[2rem] p-6 border border-white/10">
                <h3 className="font-black text-sm flex items-center gap-2 mb-4">
                  <Trophy size={16} className="text-yellow-400" /> Today's Quests
                </h3>
                
                <div className="space-y-3">
                  {DAILY_QUESTS.map(q => {
                    const userSignup = questSignups[user?.uid];
                    const currentVal = userSignup?.progress?.[q.id] || 0;
                    const completed = currentVal >= q.target;
                    const progressPct = Math.min((currentVal / q.target) * 100, 100);

                    return (
                      <div key={q.id} className="p-4 bg-white/3 border border-white/5 rounded-2xl">
                        <div className="flex items-center gap-3 justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${q.color}`}><q.icon size={16} /></div>
                            <div>
                              <p className="text-xs font-black">{q.title}</p>
                              <p className="text-[10px] text-text-muted font-bold">{q.desc}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs font-black text-brand">
                              {q.type === 'time' ? `${Math.floor(currentVal/60)}m` : currentVal} / {q.type === 'time' ? `${q.target/60}m` : q.target}
                            </p>
                          </div>
                        </div>

                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${completed ? 'bg-emerald-500' : 'bg-brand'}`} 
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Creation Modal Backdrop */}
          <AnimatePresence>
            {showCreateModal && (
              <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full space-y-6 relative overflow-hidden"
                >
                  <div>
                    <h3 className="text-xl font-black font-brand">Create Study Room</h3>
                    <p className="text-text-muted text-xs font-semibold mt-1">Configure your new study space</p>
                  </div>

                  <form onSubmit={handleCreateRoom} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">Room Name</label>
                      <input 
                        type="text" 
                        required
                        value={newRoomName}
                        onChange={e => setNewRoomName(e.target.value)}
                        placeholder="e.g. Silent Library, Lofi Cafe"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-brand/40 text-white placeholder-slate-500 font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">Room Type</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNewRoomPrivacy('public')}
                          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                            newRoomPrivacy === 'public'
                              ? 'bg-brand/20 border-brand/40 text-brand'
                              : 'bg-transparent border-white/10 text-text-muted hover:text-white'
                          }`}
                        >
                          Public
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewRoomPrivacy('private')}
                          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                            newRoomPrivacy === 'private'
                              ? 'bg-purple-500/20 border-purple-500/35 text-purple-400'
                              : 'bg-transparent border-white/10 text-text-muted hover:text-white'
                          }`}
                        >
                          Private
                        </button>
                      </div>
                    </div>

                    {newRoomPrivacy === 'private' && (
                      <div className="space-y-1.5 animate-fade-in">
                        <label className="text-[10px] font-black uppercase tracking-wider text-text-muted flex justify-between">
                          <span>Set Passcode</span>
                          <span className="text-purple-400 lowercase">friends use this to enter</span>
                        </label>
                        <input 
                          type="text" 
                          required
                          value={newRoomPasscode}
                          onChange={e => setNewRoomPasscode(e.target.value.toUpperCase())}
                          placeholder="e.g. STUDY99"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-mono tracking-widest focus:outline-none focus:border-purple-500/40 text-white placeholder-slate-500"
                        />
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button 
                        type="button" 
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 py-3.5 bg-white/5 border border-white/10 text-text-muted hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-3.5 bg-brand hover:bg-brand-hover text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand/20 transition-all"
                      >
                        Create Room
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Passcode Unlock Modal Backdrop */}
          <AnimatePresence>
            {unlockRoomId && (
              <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full space-y-6"
                >
                  <div className="text-center space-y-2">
                    <div className="p-3 bg-purple-500/10 text-purple-400 rounded-full inline-block"><Key size={24} /></div>
                    <h3 className="text-xl font-black font-brand">Enter Private Room</h3>
                    <p className="text-text-muted text-xs font-semibold">Please type the room passcode to study here</p>
                  </div>

                  <form onSubmit={handleVerifyPasscode} className="space-y-4">
                    <div className="space-y-1.5">
                      <input 
                        type="text" 
                        required
                        autoFocus
                        value={passcodeInput}
                        onChange={e => {
                          setPasscodeInput(e.target.value);
                          setPasscodeError('');
                        }}
                        placeholder="ENTER PASSCODE"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center text-sm font-mono tracking-widest focus:outline-none focus:border-purple-500/40 text-white placeholder-slate-500 uppercase"
                      />
                      {passcodeError && <p className="text-red-400 text-[10px] font-bold text-center mt-1.5">{passcodeError}</p>}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setUnlockRoomId(null)}
                        className="flex-1 py-3 bg-white/5 border border-white/10 text-text-muted hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-3 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand/20 transition-all"
                      >
                        Verify & Join
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        // ================= ACTIVE STUDY ROOM VIEW =================
        <div className="space-y-6">
          <header className="glass p-6 sm:p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left w-full md:w-auto">
              <div className="flex justify-between items-center w-full sm:w-auto">
                <button 
                  onClick={handleLeaveRoom}
                  className="p-3 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-white border border-white/5"
                  title="Back to Lobby"
                >
                  <ArrowLeft size={22} />
                </button>
                <div className="p-3 bg-brand/10 rounded-2xl text-brand shadow-lg shadow-brand/10 sm:hidden">
                  <Users size={20} />
                </div>
              </div>

              <div className="hidden sm:block p-3.5 bg-brand/10 rounded-2xl text-brand shadow-lg shadow-brand/10">
                <Users size={24} />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black font-brand flex items-center justify-center sm:justify-start gap-2">
                  {currentRoom.name}
                  {currentRoom.isPrivate && <Lock size={16} className="text-purple-400" />}
                </h1>
                <p className="text-text-muted text-[10px] uppercase tracking-widest font-black opacity-60 mt-1 max-w-[280px] sm:max-w-none">
                  {currentRoom.isPrivate ? `Private study space • CODE: ${currentRoom.passcode}` : 'Public study space'}
                </p>
              </div>
            </div>

            <button 
              onClick={handleLeaveRoom}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-red-500/20 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shrink-0"
            >
              <LogOut size={16} /> Leave Room
            </button>
          </header>

          <div className="grid grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Focus Chat (3 columns) */}
            <div className="col-span-12 lg:col-span-3 flex flex-col h-[70vh] min-h-[400px] order-2 lg:order-1">
              <div className="glass rounded-[2rem] p-5 flex flex-col h-full border border-white/10 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-sm flex items-center gap-2">
                    <MessageSquare size={16} className="text-brand" /> Room Chat
                  </h3>
                  <button 
                    onClick={shareProgress}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-xl text-[10px] font-black text-brand uppercase hover:bg-brand hover:text-white transition-all shadow-md"
                  >
                    <Share2 size={12} /> Share Stats
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 mb-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-20 text-text-muted/50 flex flex-col items-center gap-2">
                      <MessageSquare size={24} className="opacity-40" />
                      <p className="text-[10px] font-bold uppercase tracking-wider">No messages yet</p>
                      <p className="text-[9px] leading-relaxed max-w-[150px]">Send the first greeting to your study partners!</p>
                    </div>
                  ) : (
                    messages.map(m => (
                      <div key={m.id} className={`p-3 rounded-2xl ${m.type === 'progress_share' ? 'bg-gradient-to-r from-emerald-500/10 to-brand/10 border border-emerald-500/20' : 'bg-white/5'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {m.userPhoto ? (
                            <img src={m.userPhoto} alt={m.userName} className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center text-[9px] font-black">{m.userName[0].toUpperCase()}</div>
                          )}
                          <span className="text-[11px] font-black text-white truncate max-w-[120px]">{m.userName}</span>
                          <span className="text-[8px] text-text-muted ml-auto font-bold">
                            {m.timestamp?.toDate ? m.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">{m.text}</p>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={sendMessage} className="flex gap-2 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs focus:outline-none focus:border-brand/40 text-white placeholder-slate-500 font-semibold"
                  />
                  <button type="submit" className="p-3 bg-brand rounded-2xl text-white hover:scale-105 transition-all">
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </div>

            {/* CENTER COLUMN: Quest Tracker & Cam Stream (5 columns) */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 order-1 lg:order-2">
              
              {/* Quests Display */}
              <div className="glass rounded-[2rem] p-6 border border-white/10 relative overflow-hidden">
                <h3 className="font-black text-sm flex items-center gap-2 mb-4">
                  <Trophy size={16} className="text-yellow-400" /> Today's Quests
                </h3>
                
                <div className="space-y-3">
                  {DAILY_QUESTS.map(q => {
                    const userSignup = questSignups[user?.uid];
                    const currentVal = userSignup?.progress?.[q.id] || 0;
                    const completed = currentVal >= q.target;
                    const progressPct = Math.min((currentVal / q.target) * 100, 100);

                    return (
                      <div key={q.id} className="p-4 bg-white/3 border border-white/5 rounded-2xl relative overflow-hidden">
                        <div className="flex items-center gap-3 justify-between relative z-10 mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${q.color}`}><q.icon size={16} /></div>
                            <div>
                              <p className="text-xs font-black">{q.title}</p>
                              <p className="text-[10px] text-text-muted font-bold">{q.desc}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className={`text-xs font-black ${completed ? 'text-emerald-400' : 'text-brand'}`}>
                              {q.type === 'time' ? `${Math.floor(currentVal/60)}m` : currentVal} / {q.type === 'time' ? `${q.target/60}m` : q.target}
                            </p>
                            <p className="text-[8px] text-text-muted uppercase tracking-wider font-black">{completed ? 'Complete ✅' : 'Active'}</p>
                          </div>
                        </div>

                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${completed ? 'bg-emerald-500' : 'bg-brand'}`} 
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Workstation (Camera feed & Local Pomodoro Timer) */}
              <div className="glass rounded-[2.5rem] p-8 border border-white/10 flex flex-col items-center relative overflow-hidden flex-1 justify-center">
                
                {/* Away Warning Overlay */}
                <AnimatePresence>
                  {isCameraOn && !presenceVerified && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-red-950/90 backdrop-blur-md z-45 flex flex-col items-center justify-center p-6 text-center"
                    >
                      <div className="p-4 bg-red-500/20 text-red-500 rounded-full animate-bounce mb-4">
                        <AlertTriangle size={48} />
                      </div>
                      <h3 className="text-2xl font-black text-white">No Face Detected!</h3>
                      <p className="text-red-300 text-sm max-w-sm font-semibold mt-2 mb-6">
                        Sit in front of the camera to continue focusing. The timer will pause in:
                      </p>
                      <span className="text-6xl font-black text-red-500 animate-pulse">{absenceTimeLeft}s</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Local Video Stream Container */}
                <div className="relative w-full aspect-video rounded-3xl bg-black/40 overflow-hidden mb-6 border border-white/10 flex items-center justify-center">
                  {isCameraOn ? (
                    <>
                      <video 
                        ref={videoRef} 
                        className="w-full h-full object-cover scale-x-[-1]" 
                        playsInline 
                        muted
                      />
                      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${presenceVerified ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          {presenceVerified ? 'Presence Verified' : 'Face Missing'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6">
                      <CameraOff size={36} className="text-text-muted/40 mb-3" />
                      <p className="text-xs font-black text-text-muted uppercase tracking-wider mb-2">Camera is Off</p>
                      <p className="text-[10px] text-text-muted/60 max-w-[200px]">Turn on your camera to verify your presence and secure your quest progress!</p>
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Combined Camera / Timer Actions */}
                <div className="flex gap-4 items-center justify-center w-full max-w-sm mb-6">
                  <div className="flex flex-col items-center gap-1">
                    <button 
                      onClick={handleToggleCamera}
                      className={`p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs transition-all border ${
                        isCameraOn 
                        ? 'bg-red-500/20 border-red-500/30 text-red-400' 
                        : 'bg-brand/20 border-brand/30 text-brand'
                      }`}
                    >
                      {isCameraOn ? <CameraOff size={16} /> : <Camera size={16} />}
                      {isCameraOn ? 'Close Stream' : 'Open Camera'}
                    </button>
                    {isRunning && (
                      <span className="text-[9px] text-text-muted font-bold">
                        Toggles used: {cameraOffCount}/2
                      </span>
                    )}
                  </div>

                  <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center">
                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">My Pomodoro Timer</p>
                    <p className="text-2xl font-black font-mono text-brand mt-0.5">{fmtTime(timeLeft)}</p>
                  </div>
                </div>

                {/* Quick Timer Triggers */}
                <div className="flex gap-3 w-full max-w-sm">
                  <button 
                    onClick={() => isRunning ? stopTimer() : startTimer()} 
                    className={`flex-1 py-4 rounded-2xl font-black text-sm tracking-widest transition-all active:scale-95 ${
                      isRunning 
                      ? 'bg-red-500/25 text-red-400 border border-red-500/30' 
                      : 'bg-brand text-white shadow-lg'
                    }`}
                  >
                    {isRunning ? 'PAUSE' : 'START'}
                  </button>
                  <button 
                    onClick={resetTimer} 
                    className="px-6 py-4 bg-white/5 border border-white/10 text-text-muted hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95"
                  >
                    Reset
                  </button>
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN: Spectator Arena & Active Users (4 columns) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col h-[70vh] min-h-[400px] order-3 lg:order-3">
              <div className="glass rounded-[2rem] p-6 flex flex-col h-full border border-white/10 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-brand/10 text-brand rounded-xl shadow-inner"><Users size={18} /></div>
                  <div>
                    <h3 className="font-black text-sm">Active Room Partners</h3>
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Live stream spectating grid</p>
                  </div>
                  <span className="ml-auto bg-brand/10 text-brand px-3 py-1 rounded-xl text-[10px] font-black uppercase">
                    {activeFocussers.length} active
                  </span>
                </div>

                {/* Active Focusers Spectator Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                  {activeFocussers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center h-full gap-3 py-20">
                      <Users size={32} className="text-text-muted/30" />
                      <p className="text-text-muted text-xs font-bold uppercase tracking-widest">Studying alone right now</p>
                      <p className="text-[9px] text-text-muted/60">Invite your friends using the room code!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeFocussers.map(f => (
                        <div key={f.id} className="bg-white/3 border border-white/5 rounded-3xl p-4 flex flex-col relative overflow-hidden group">
                          
                          {/* Image Stream */}
                          <div className="w-full aspect-video bg-black/40 rounded-2xl overflow-hidden mb-3 border border-white/5 relative">
                            {f.lastFrame ? (
                              <img src={f.lastFrame} alt={f.userName} className="w-full h-full object-cover scale-x-[-1]" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-brand/5 text-[9px] font-black">Connecting Feed...</div>
                            )}
                            <span className="absolute top-2 left-2 bg-brand text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" /> Live
                            </span>
                            
                            <span className={`absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                              f.presenceVerified 
                              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                              : 'bg-red-500/20 border-red-500/30 text-red-400 animate-pulse'
                            }`}>
                              {f.presenceVerified ? 'Present' : 'Away'}
                            </span>
                          </div>

                          {/* User Info */}
                          <div className="flex items-center gap-2 mb-3">
                            {f.userPhoto ? (
                              <img src={f.userPhoto} alt={f.userName} className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-[10px] font-black">{f.userName[0].toUpperCase()}</div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-black truncate">{f.userName}</p>
                              <p className="text-[9px] text-text-muted flex items-center gap-1">
                                <Clock size={10} /> {fmtTime(f.timeLeft)} ({f.mode})
                              </p>
                            </div>
                          </div>

                          {/* Cheer Reactions */}
                          <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-2 gap-1 opacity-80 hover:opacity-100 transition-opacity">
                            {[
                              { emoji: '👏', label: 'Clap' },
                              { emoji: '❤️', label: 'Love' },
                              { emoji: '🔥', label: 'Fire' },
                              { emoji: '👑', label: 'Crown' }
                            ].map(r => (
                              <button
                                key={r.emoji}
                                onClick={() => sendEmojiReaction(f.userId, r.emoji)}
                                className="flex-1 py-1 hover:bg-white/10 rounded-lg text-sm transition-transform active:scale-125"
                                title={r.label}
                              >
                                {r.emoji}
                              </button>
                            ))}
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Community;
