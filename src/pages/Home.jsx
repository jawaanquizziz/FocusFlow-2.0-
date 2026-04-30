import React, { useState } from 'react';
import { Settings as SettingsIcon, Clock, Calendar, Bell, Palette, LogOut, TreePine, Shield, UserPlus, X, Share2, Link as LinkIcon, Check } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';
import TimerDisplay from '../components/TimerDisplay';
import TodoList from '../components/TodoList';
import AmbientSounds from '../components/AmbientSounds';
import SettingsModal from '../components/SettingsModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import ThemeGallery from '../components/ThemeGallery';
import Leaderboard from '../components/Leaderboard';
import ForestGrove from '../components/ForestGrove';
import SpotifyPlayer from '../components/SpotifyPlayer';
import { useAuth } from '../hooks/useAuth';

// ── ADMIN ACCESS CONFIGURATION ───────────────────────────────────
// This MUST match the list in src/pages/Home.jsx
const ADMIN_EMAILS = ['jawaan25fcrit@gmail.com']; 
// ─────────────────────────────────────────────────────────────────

/* ─── Invite Friends Modal ────────────────────────────────────────────── */
const InviteModal = ({ onClose, user }) => {
    const [copied, setCopied] = useState(false);
    const shareText = `🌳 Join me on FocusFlow to plant trees and boost your productivity! Let's crush our goals together 🚀 #FocusFlow #DeepWork #Pomodoro`;
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://focusflow.app';

    const copyText = async () => {
        try {
            await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#0f172a] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand/10 rounded-2xl"><UserPlus size={20} className="text-brand" /></div>
                        <div>
                            <h3 className="font-black text-base">Invite Friends</h3>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Grow together 🌳</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-text-muted hover:text-white transition-all">
                        <X size={18} />
                    </button>
                </div>
                <div className="bg-gradient-to-br from-brand/10 to-emerald-500/10 border border-brand/20 rounded-2xl p-4 mb-6">
                    <p className="text-sm font-medium text-white mb-2">{shareText}</p>
                    <p className="text-[10px] text-text-muted font-mono">{shareUrl}</p>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={copyText}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border font-bold text-sm transition-all relative ${copied ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-text-muted hover:text-white'}`}>
                    {copied ? <Check size={16} /> : <LinkIcon size={16} />}
                    {copied ? 'Copied!' : 'Copy Link & Text'}
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

const Home = () => {
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
    updateSettings,
    MODES,
    currentTask
  } = useTimer();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isGroveMode, setIsGroveMode] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [rewardMsg, setRewardMsg] = useState(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  
  const { user, logout } = useAuth();

  const getActiveTodos = () => {
    try {
      const saved = localStorage.getItem('todos');
      if (saved) return JSON.parse(saved).filter(t => !t.done).slice(0, 5); // Take top 5
    } catch(e) {}
    return [];
  };

  const MILESTONES = [
    { target: 3600, label: '1 Hour' },
    { target: 7200, label: '2 Hours' },
    { target: 10800, label: '3 Hours' },
    { target: 18000, label: '5 Hours' },
  ];

  React.useEffect(() => {
    const achieved = JSON.parse(localStorage.getItem('achievedRewards') || '[]');
    const nextMilestone = MILESTONES.find(m => totalFocusSeconds >= m.target && !achieved.includes(m.target));
    
    if (nextMilestone) {
      setRewardMsg(`🎉 Awesome! You've reached ${nextMilestone.label} of focus!`);
      achieved.push(nextMilestone.target);
      localStorage.setItem('achievedRewards', JSON.stringify(achieved));
      setTimeout(() => setRewardMsg(null), 5000);
    }
  }, [totalFocusSeconds]);

  const { permission, requestPermission, sendNotification } = useNotifications();

  const lastTimeRef = React.useRef(timeLeft);
  React.useEffect(() => {
    if (lastTimeRef.current > 0 && timeLeft === 0 && !isRunning) {
        const isFocus = mode === MODES.POMODORO;
        const modeLabel = isFocus ? 'Focus session' : 'Break';
        let bodyText = isFocus ? 'Time to take a break.' : 'Time to get back to work!';
        if (isFocus && currentTask) {
             bodyText = `Tree Planted! 🌳 You grew a tree for: ${currentTask}`;
        }
        sendNotification(`${modeLabel} finished!`, {
            body: bodyText,
            requireInteraction: true
        });

        if (isFocus) {
            const newNotif = {
                id: Date.now(),
                title: 'Achievement Unlocked! 🌳',
                message: `You successfully planted a tree for "${currentTask || 'Focus Session'}"!`,
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };
            const existing = JSON.parse(localStorage.getItem('app_notifications') || '[]');
            const updated = [newNotif, ...existing].slice(0, 20); // Keep last 20
            localStorage.setItem('app_notifications', JSON.stringify(updated));
            setNotificationsList(updated);
        }
    }
    lastTimeRef.current = timeLeft;
  }, [timeLeft, isRunning, mode, MODES, sendNotification, currentTask]);

  React.useEffect(() => {
      // Load initial notifications
      try {
          const existing = JSON.parse(localStorage.getItem('app_notifications') || '[]');
          setNotificationsList(existing);
      } catch (e) {}
  }, []);

  const handleStartFlowClick = () => {
    if (isRunning) {
        stopTimer();
    } else {
        const isResuming = timeLeft < settings[mode];
        if (mode === MODES.POMODORO && !isResuming) {
            const activeTodos = getActiveTodos();
            const taskName = activeTodos.length > 0 ? activeTodos[0].text : 'Focus Session';
            startTimer(taskName);
        } else {
            startTimer();
        }
    }
  };

  const confirmStartSession = (taskName) => {
    setIsTaskModalOpen(false);
    setTaskInput('');
    startTimer(taskName || 'Focus Session');
  };

  const formatFocusTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen flex flex-col p-4 sm:p-8 space-y-6 max-w-[1400px] mx-auto w-full"
    >
      {/* Header Bento Card */}
      <motion.header 
        variants={itemVariants}
        className="glass p-6 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center gap-6 z-50"
      >
        <div className="flex items-center gap-4">
            <img src="/logo.png" alt="FocusFlow" className="w-12 h-12 rounded-xl shadow-lg" />
            <div className="flex flex-col items-center sm:items-start">
                <h1 className="text-2xl sm:text-3xl font-bold glow font-brand tracking-tight">
                {user?.displayName ? `Hello, ${user.displayName.split(' ')[0]}` : 'FocusFlow'}
                </h1>
                <p className="text-text-muted text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">Ready for your deep work?</p>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-white/5 px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/5 group hover:bg-white/10 transition-all cursor-default">
            <div className="p-2 bg-brand/10 rounded-lg text-brand group-hover:scale-110 transition-transform">
                <Clock size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Total Depth</span>
              <span className="text-sm font-bold text-white font-mono">{formatFocusTime(totalFocusSeconds)}</span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsThemeOpen(true)}
            className="p-3 rounded-2xl transition-all text-text-muted bg-white/5 hover:text-white hover:bg-brand/20"
            title="Themes & Wallpapers"
          >
            <Palette size={20} />
          </button>

          <div className="relative">
              <button 
                onClick={() => {
                    requestPermission();
                    setIsNotificationsOpen(!isNotificationsOpen);
                }}
                className={`p-3 rounded-2xl transition-all relative ${
                    permission === 'granted' || notificationsList.length > 0
                    ? 'text-brand bg-brand/10' 
                    : 'text-text-muted bg-white/5 hover:text-white'
                }`}
              >
                {permission === 'default' && (
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-brand rounded-2xl blur-md"
                    />
                )}
                <Bell size={20} className="relative z-10" />
                {(permission === 'default' || notificationsList.length > 0) && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3 relative z-20">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-brand"></span>
                    </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                  {isNotificationsOpen && (
                      <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-4 w-80 bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl z-[100] overflow-hidden"
                      >
                          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                              <h3 className="font-black text-sm text-white">Notifications</h3>
                              <button 
                                  onClick={() => {
                                      localStorage.removeItem('app_notifications');
                                      setNotificationsList([]);
                                  }}
                                  className="text-[10px] uppercase font-bold tracking-widest text-text-muted hover:text-brand transition-colors"
                              >
                                  Clear All
                              </button>
                          </div>
                          <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                              {notificationsList.length === 0 ? (
                                  <div className="p-6 text-center text-text-muted">
                                      <Bell size={24} className="mx-auto mb-2 opacity-50" />
                                      <p className="text-xs font-bold uppercase tracking-widest">All caught up!</p>
                                  </div>
                              ) : (
                                  <div className="space-y-1">
                                      {notificationsList.map(n => (
                                          <div key={n.id} className="p-3 rounded-2xl hover:bg-white/5 transition-colors group cursor-default">
                                              <div className="flex justify-between items-start mb-1">
                                                  <p className="text-xs font-black text-white">{n.title}</p>
                                                  <span className="text-[9px] font-bold text-text-muted">{n.time}</span>
                                              </div>
                                              <p className="text-[10px] text-slate-400 leading-relaxed">{n.message}</p>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      </motion.div>
                  )}
              </AnimatePresence>
          </div>

          {/* Invite button */}
          <button 
            onClick={() => setIsInviteOpen(true)}
            className="p-3 rounded-2xl transition-all text-brand bg-brand/10 hover:bg-brand/20 hover:scale-105"
            title="Invite Friends"
          >
            <UserPlus size={20} />
          </button>

          {/* Profile button */}
          <Link
            to="/profile"
            className="relative rounded-2xl overflow-hidden transition-all hover:ring-2 hover:ring-brand/40 shrink-0"
            title="My Profile"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-2xl object-cover"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center text-white font-black text-sm"
              >
                {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
              </div>
            )}
          </Link>

          <button 
            onClick={logout}
            className="p-3 rounded-2xl transition-all text-text-muted bg-white/5 hover:text-red-500 hover:bg-red-500/10"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </motion.header>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-12 gap-6 flex-1">
        
        {/* Hero Timer Card - Takes 8 columns on large, full on small */}
        <motion.section 
          variants={itemVariants}
          className="col-span-12 lg:col-span-8 glass flex flex-col items-center justify-center py-12 px-6 rounded-[2.5rem] relative group border border-white/10"
        >
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="absolute top-8 right-8 text-text-muted hover:text-white transition-all p-3 hover:bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100"
            >
                <SettingsIcon size={24} />
            </button>

            <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
                { id: MODES.POMODORO, label: 'Focus' },
                { id: MODES.SHORT_BREAK, label: 'Short Break' },
                { id: MODES.LONG_BREAK, label: 'Long Break' },
                { id: MODES.STOPWATCH, label: 'Stopwatch' }
            ].map((m) => (
                <button
                key={m.id}
                onClick={() => switchMode(m.id)}
                className={`px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border ${
                    mode === m.id 
                    ? 'bg-brand text-white border-brand shadow-[0_8px_30px_rgba(88,101,242,0.4)] scale-105' 
                    : 'text-text-muted border-transparent hover:border-white/10 hover:text-white'
                }`}
                >
                {m.label}
                </button>
            ))}
            </div>

            {isGroveMode && mode !== MODES.STOPWATCH && (
                <div className="w-full mb-8">
                    <ForestGrove 
                        progress={mode === MODES.STOPWATCH ? 0 : 1 - (timeLeft / settings[mode])} 
                        isRunning={isRunning}
                        mode={mode}
                    />
                </div>
            )}

            <TimerDisplay timeLeft={timeLeft} />

            <div className="absolute bottom-8 left-8">
                <button 
                    onClick={() => setIsGroveMode(!isGroveMode)}
                    className={`p-3 rounded-2xl transition-all ${isGroveMode ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white/5 text-text-muted hover:text-white'}`}
                    title="Toggle Forest Grove"
                >
                    <TreePine size={20} />
                </button>
            </div>

            <div className="mt-12 flex gap-4 w-full max-w-sm justify-center">
            <button
                onClick={handleStartFlowClick}
                className={`flex-[2] ${isRunning ? 'bg-white/10 hover:bg-white/20' : 'bg-brand shadow-[0_12px_40px_rgba(88,101,242,0.4)]'} text-white font-bold py-5 rounded-3xl text-xl transition-all active:scale-95 group relative overflow-hidden`}
            >
                <span className="relative z-10">{isRunning ? 'PAUSE' : 'START FLOW'}</span>
                {!isRunning && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />}
            </button>
            <button
                onClick={resetTimer}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-3xl text-text-muted hover:text-white transition-all flex items-center justify-center active:scale-95"
            >
                <Clock size={24} />
            </button>
            </div>
        </motion.section>

        {/* Leaderboard Card - 4 columns */}
        <motion.div variants={itemVariants} className="col-span-12 sm:col-span-6 lg:col-span-4 h-full">
            <Leaderboard />
        </motion.div>

        {/* Todo List Card - 6 columns */}
        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-7">
            <TodoList />
        </motion.div>

        {/* Right Column — Ambient + Spotify + Planner */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            <motion.div variants={itemVariants}>
                <AmbientSounds />
            </motion.div>

            <motion.div variants={itemVariants} className="flex-1">
                <SpotifyPlayer />
            </motion.div>

            <motion.div variants={itemVariants}>
                <Link to="/planner" className="glass p-6 rounded-[2.5rem] flex items-center justify-between hover:border-brand/40 transition-all group relative">
                    <div className="flex items-center gap-5">
                        <div className="p-3.5 bg-brand/10 rounded-2xl text-brand group-hover:rotate-12 transition-transform duration-500">
                            <Calendar size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Planner</h3>
                            <p className="text-text-muted text-sm">Schedule your daily rhythm</p>
                        </div>
                    </div>
                    <div className="text-brand opacity-0 group-hover:opacity-100 transition-all duration-500 font-bold text-2xl pr-2">→</div>
                </Link>
            </motion.div>
        </div>

      </div>

      <motion.footer 
        variants={itemVariants}
        className="w-full text-center py-6 text-text-muted text-[10px] tracking-[0.3em] uppercase font-bold opacity-60"
      >
        FocusFlow Productivity Suite &nbsp;·&nbsp;
        <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
        &nbsp;·&nbsp;
        <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
      </motion.footer>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={updateSettings}
      />

      <ThemeGallery
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
      />
      
      {/* Invite Modal */}
      <AnimatePresence>
          {isInviteOpen && (
              <InviteModal onClose={() => setIsInviteOpen(false)} user={user} />
          )}
      </AnimatePresence>

      {/* Reward Popup */}
      <AnimatePresence>
        {rewardMsg && (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-brand text-white px-10 py-5 rounded-3xl shadow-[0_20px_50px_rgba(88,101,242,0.4)] font-bold flex items-center gap-4 backdrop-blur-xl border border-white/20"
          >
            <div className="p-2 bg-white/20 rounded-full">✨</div>
            <span>{rewardMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Task Modal */}
      <AnimatePresence>
        {isTaskModalOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-[#0f172a] border border-emerald-500/30 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl shadow-emerald-900/20 relative"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                                <TreePine size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-white">Plant a Tree</h2>
                        </div>
                    </div>
                    
                    <p className="text-sm text-text-muted mb-6">What task will this tree represent?</p>
                    
                    <input
                        autoFocus
                        value={taskInput}
                        onChange={(e) => setTaskInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && confirmStartSession(taskInput)}
                        placeholder="e.g. Read Chapter 1"
                        className="w-full bg-[#1e293b] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500/50 text-white mb-6"
                    />

                    {getActiveTodos().length > 0 && (
                        <div className="mb-6">
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Active Tasks</p>
                            <div className="flex flex-wrap gap-2">
                                {getActiveTodos().map((todo, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => confirmStartSession(todo.text)}
                                        className="bg-white/5 hover:bg-emerald-500/20 text-sm text-emerald-100/70 hover:text-emerald-300 border border-white/5 hover:border-emerald-500/30 px-4 py-2 rounded-xl transition-all"
                                    >
                                        {todo.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsTaskModalOpen(false)}
                            className="flex-1 px-6 py-4 rounded-2xl text-text-muted hover:bg-white/5 transition-all font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => confirmStartSession(taskInput)}
                            className="flex-1 px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-[0_8px_20px_rgba(16,185,129,0.3)]"
                        >
                            Start Flow
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Home;
