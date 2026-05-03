import React, { useState, useRef } from 'react';
import { Settings as SettingsIcon, Clock, Calendar, Bell, Palette, LogOut, TreePine, Shield, UserPlus, X, Share2, Link as LinkIcon, Check, BarChart2, TrendingUp, Zap, Monitor, ExternalLink, MessageSquare } from 'lucide-react';
import { useTimer } from '../hooks/useTimer.jsx';
import TimerDisplay from '../components/TimerDisplay';
import TodoList from '../components/TodoList';
import AmbientSounds from '../components/AmbientSounds';
import SettingsModal from '../components/SettingsModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import html2canvas from 'html2canvas';
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
    const [isCapturing, setIsCapturing] = useState(false);
    const captureRef = useRef(null);
    const shareText = `🌳 Join me on FocusFlow! I'm using it to plant trees while I work. It's a game-changer for deep focus! 🚀`;
    const shareUrl = `https://focusflow.app`;

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

    const shareOnSocial = (platform) => {
        const text = encodeURIComponent(shareText);
        const url = encodeURIComponent(shareUrl);
        const platforms = {
            whatsapp: `https://wa.me/?text=${text}%20${url}`,
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            instagram: `https://www.instagram.com/`, // Instagram doesn't support direct text sharing via URL like others
            reddit: `https://www.reddit.com/submit?title=${text}&url=${url}`
        };
        window.open(platforms[platform], '_blank');
    };

    const shareAsImage = async () => {
        if (!captureRef.current) return;
        setIsCapturing(true);
        
        try {
            // Small delay to ensure all animations/gradients are rendered
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(captureRef.current, {
                backgroundColor: '#0f172a',
                scale: 3,
                useCORS: true,
                logging: false,
                borderRadius: 40
            });
            
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    setIsCapturing(false);
                    return;
                }
                
                try {
                    const file = new File([blob], 'focusflow-invite.png', { type: 'image/png' });
                    
                    // 1. ALWAYS Copy to Clipboard first (Reliable for Laptops/PCs)
                    let clipboardSuccess = false;
                    try {
                        if (navigator.clipboard && window.ClipboardItem) {
                            await navigator.clipboard.write([
                                new ClipboardItem({ 'image/png': blob })
                            ]);
                            clipboardSuccess = true;
                        }
                    } catch (err) {
                        console.log('Direct clipboard write failed');
                    }

                    // 2. Try Native Share (Best for Mobile)
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                files: [file],
                                title: 'Join me on FocusFlow 🌳',
                                text: `Join me and grow your forest while crushing goals on FocusFlow! 🚀\nhttps://focusflow.app`
                            });
                            setIsCapturing(false);
                            return;
                        } catch (shareErr) {
                            console.log('Native share cancelled or failed');
                        }
                    }

                    // 3. Final Feedback / Fallback
                    if (clipboardSuccess) {
                        alert('✨ Image Card Ready! It has been copied to your clipboard. Just PASTE (Ctrl+V) it into your chat!');
                    } else {
                        // DOWNLOAD FALLBACK
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `focusflow-invite-${Date.now()}.png`;
                        a.click();
                        URL.revokeObjectURL(url);
                        alert('✨ Image Card Downloaded! You can now send it to your friends.');
                    }
                } catch (e) {
                    console.error('Sharing process failed', e);
                }
                setIsCapturing(false);
            }, 'image/png');
        } catch (e) {
            console.error('Canvas capture failed', e);
            setIsCapturing(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl"
            onClick={onClose}
        >
            <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#0f172a] border border-white/10 w-full max-w-xl rounded-[3.5rem] p-8 sm:p-12 shadow-[0_64px_128px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden"
            >
                {/* Animated Background Orbs */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-brand/20 blur-[120px] rounded-full pointer-events-none -mr-40 -mt-40 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none -ml-40 -mb-40" />

                <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-brand to-brand-dark rounded-2xl text-white shadow-xl shadow-brand/20"><UserPlus size={24} /></div>
                        <div>
                            <h3 className="font-black text-2xl tracking-tight">Invite to <span className="text-brand">Grove</span></h3>
                            <p className="text-[10px] text-text-muted uppercase tracking-[0.3em] font-black opacity-60">Building focus together</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-2xl bg-white/5 text-text-muted hover:text-white hover:bg-white/10 transition-all border border-white/5">
                        <X size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left side: The Card Preview */}
                    <div className="relative group flex flex-col items-center">
                        <div className="absolute -inset-2 bg-gradient-to-r from-brand to-emerald-500 rounded-[3.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div ref={captureRef} className="relative w-full bg-[#0f172a] border border-white/5 rounded-[3rem] p-10 overflow-hidden shadow-2xl flex flex-col items-center text-center">
                            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `radial-gradient(var(--brand-color) 1px, transparent 1px)`, backgroundSize: '16px 16px' }} />
                            
                            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="mb-6 relative z-10">
                                <div className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl shadow-inner">
                                    <TreePine size={64} className="text-brand" />
                                </div>
                            </motion.div>
                            
                            <h2 className="text-4xl font-black mb-1 tracking-tighter relative z-10">Focus<span className="text-brand">Flow</span></h2>
                            <div className="px-4 py-1.5 bg-brand/10 border border-brand/20 rounded-full mb-8 relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand">Deep Work Revolution</p>
                            </div>
                            
                            <p className="text-xl font-bold text-white mb-10 leading-tight relative z-10">
                                "Join me and grow your forest while crushing goals."
                            </p>

                            <div className="w-full flex flex-col gap-2 relative z-10">
                                <div className="px-6 py-4 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-brand/20">
                                    JOIN THE GROVE
                                </div>
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.5em]">FF-{user?.uid?.slice(0,4).toUpperCase() || 'FLOW'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right side: Social & Actions */}
                    <div className="flex flex-col justify-center gap-10 relative z-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-6 opacity-60">Share via Socials</p>
                            <div className="grid grid-cols-3 gap-5">
                                {[
                                    { id: 'whatsapp', icon: (props) => <svg viewBox="0 0 24 24" {...props}><path fill="white" d="M12.012 2c-5.508 0-9.987 4.479-9.987 9.987 0 1.763.459 3.421 1.264 4.868L2 22l5.316-1.393c1.401.763 3.003 1.201 4.696 1.201 5.508 0 9.987-4.479 9.987-9.987 0-5.508-4.479-9.987-9.987-9.987zm5.541 14.152c-.23.649-1.319 1.203-1.815 1.282-.496.079-1.127.118-3.053-.642-2.455-.968-4.041-3.468-4.161-3.626-.12-.158-1.026-1.365-1.026-2.603 0-1.238.649-1.848.88-2.094.231-.246.505-.307.674-.307.169 0 .338 0 .484.007.152.007.359-.058.562.433.203.491.694 1.691.754 1.815.061.123.101.267.021.433-.081.165-.121.267-.241.407-.12.14-.253.313-.362.422-.119.119-.244.249-.105.487.14.238.62 1.024 1.332 1.657.917.817 1.691 1.07 1.929 1.189.238.119.378.1.518-.06.14-.16.6-0.7.759-.938.16-.238.319-.203.539-.12.22.083 1.393.657 1.632.776.24.12.399.179.459.282.06.103.06.598-.17 1.247z"/></svg>, color: 'bg-[#25D366]' },
                                    { id: 'twitter', icon: (props) => <svg viewBox="0 0 24 24" {...props}><path fill="white" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/></svg>, color: 'bg-black' },
                                    { id: 'facebook', icon: (props) => <svg viewBox="0 0 24 24" {...props}><path fill="white" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>, color: 'bg-[#1877F2]' },
                                    { id: 'linkedin', icon: (props) => <svg viewBox="0 0 24 24" {...props}><path fill="white" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg>, color: 'bg-[#0077b5]' },
                                    { id: 'instagram', icon: (props) => <svg viewBox="0 0 24 24" {...props}><path fill="white" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>, color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]' },
                                    { id: 'reddit', icon: (props) => <svg viewBox="0 0 24 24" {...props}><path fill="white" d="M24 11.5c0-1.654-1.346-3-3-3-.674 0-1.294.232-1.794.613-2.022-1.416-4.756-2.316-7.739-2.433l1.373-6.442 4.49.954c.045.845.741 1.513 1.595 1.513 1.05 0 1.904-.855 1.904-1.905 0-1.05-.854-1.904-1.904-1.904-.772 0-1.439.462-1.737 1.121l-4.981-1.058c-.143-.031-.289.043-.342.181l-1.579 7.414c-3.07.098-5.888.995-7.986 2.449-.496-.395-1.125-.636-1.805-.636-1.654 0-3 1.346-3 3 0 1.157.662 2.155 1.624 2.65-.015.115-.024.232-.024.35 0 3.859 4.709 7 10.5 7s10.5-3.141 10.5-7c0-.114-.009-.228-.023-.341.97-.492 1.637-1.492 1.637-2.659zm-16.142 3.39c-.773 0-1.4-.627-1.4-1.4s.627-1.4 1.4-1.4 1.4.627 1.4 1.4-.627 1.4-1.4 1.4zm10.742 4.444c-1.391 1.391-3.957 1.503-4.6 1.503-.644 0-3.21-.112-4.601-1.503-.138-.138-.138-.362 0-.5.137-.138.361-.138.499 0 1.096 1.096 3.197 1.253 4.102 1.253.903 0 3.004-.157 4.101-1.253.138-.138.361-.138.499 0 .138.138.138.362 0 .5zm-.101-4.444c-.773 0-1.4-.627-1.4-1.4s.627-1.4 1.4-1.4 1.4.627 1.4 1.4-.627 1.4-1.4 1.4z"/></svg>, color: 'bg-[#FF4500]' }
                                ].map((p) => (
                                    <button key={p.id} onClick={() => shareOnSocial(p.id)} className={`${p.color} p-5 rounded-2xl text-white hover:scale-110 active:scale-95 transition-all shadow-xl flex items-center justify-center border border-white/10 group/btn`}>
                                        <p.icon className="w-8 h-8 group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted opacity-60">Actions</p>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={shareAsImage} disabled={isCapturing}
                                className={`w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-sm transition-all text-white shadow-2xl
                                    ${isCapturing ? 'bg-brand/50 cursor-not-allowed' : 'bg-brand hover:bg-brand/90 hover:shadow-brand/40'}`}>
                                {isCapturing ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <Share2 size={20} />}
                                {isCapturing ? 'GENERATING CARD...' : 'SAVE INVITE CARD'}
                            </motion.button>
                            
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={copyText}
                                className={`w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl border-2 font-black text-sm transition-all relative ${copied ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-text-muted hover:text-white hover:bg-white/10'}`}>
                                {copied ? <Check size={20} /> : <LinkIcon size={20} />}
                                {copied ? 'LINK COPIED' : 'COPY INVITE LINK'}
                            </motion.button>
                        </div>
                    </div>
                </div>
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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const pipWindowRef = useRef(null);

  const getActiveTodos = () => {
    try {
      const saved = localStorage.getItem('todos');
      if (saved) return JSON.parse(saved).filter(t => !t.done).slice(0, 5); // Take top 5
    } catch(e) {}
    return [];
  };

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

  // Keep PIP window in sync with main state
  React.useEffect(() => {
      const pip = pipWindowRef.current;
      if (pip && pip.document) {
          const doc = pip.document;
          const timeDiv = doc.querySelector('.time');
          const controlBtn = doc.querySelector('.btn');
          const taskDiv = doc.querySelector('.task');

          // Update Time
          if (timeDiv) {
              const m = Math.floor(timeLeft / 60);
              const s = timeLeft % 60;
              timeDiv.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
          }

          // Update Button State & Click Handler (CRITICAL: Use identical logic as website)
          if (controlBtn) {
              controlBtn.onclick = () => {
                  handleStartFlowClick();
              };
              
              if (isRunning) {
                  controlBtn.innerText = 'PAUSE';
                  controlBtn.className = 'btn btn-pause';
              } else {
                  controlBtn.innerText = 'START';
                  controlBtn.className = 'btn btn-play';
              }
          }

          if (taskDiv) {
              taskDiv.innerText = currentTask || 'Focus Session';
          }
      }
  }, [timeLeft, isRunning, currentTask, handleStartFlowClick]);

  // PIP (Floating Timer) Feature
  const handlePip = async () => {
    if (!document.pictureInPictureEnabled && !window.documentPictureInPicture) {
      alert('Your browser does not support Picture-in-Picture mode. Please use Chrome or Edge.');
      return;
    }

    if (pipWindowRef.current) {
        pipWindowRef.current.close();
        pipWindowRef.current = null;
        return;
    }

    try {
      if (window.documentPictureInPicture) {
        const pipWindow = await window.documentPictureInPicture.requestWindow({
          width: 320,
          height: 220,
        });

        pipWindowRef.current = pipWindow;
        pipWindow.onpagehide = () => { pipWindowRef.current = null; };

        const style = document.createElement('style');
        style.textContent = `
          body { 
            margin: 0; 
            background: #0f172a; 
            color: white; 
            font-family: system-ui, sans-serif; 
            display: flex; 
            flex-direction: column;
            align-items: center; 
            justify-content: center; 
            height: 100vh;
            overflow: hidden;
            border: 2px solid #5865F2;
          }
          .time { font-size: 3.5rem; font-weight: 900; font-family: monospace; color: #5865F2; line-height: 1; }
          .task { font-size: 0.7rem; font-weight: 800; color: rgba(255,255,255,0.4); text-transform: uppercase; margin-top: 8px; letter-spacing: 0.1em; text-align: center; max-width: 90%; margin-bottom: 15px; }
          .btn { 
            padding: 8px 24px; 
            border-radius: 12px; 
            border: none; 
            font-weight: 900; 
            font-size: 0.8rem; 
            cursor: pointer; 
            transition: all 0.2s;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            width: 160px;
          }
          .btn-play { background: #10b981; color: white; }
          .btn-pause { background: #ef4444; color: white; }
          .btn-back { background: rgba(255,255,255,0.1); color: white; margin-top: 8px; border: 1px solid rgba(255,255,255,0.1); width: 160px; }
          .pip-close { position: absolute; top: 10px; right: 10px; background: none; border: none; color: white; cursor: pointer; opacity: 0.5; }
        `;
        pipWindow.document.head.append(style);

        const closeBtn = pipWindow.document.createElement('button');
        closeBtn.className = 'pip-close';
        closeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        closeBtn.onclick = () => pipWindow.close();
        pipWindow.document.body.append(closeBtn);

        const timeDiv = pipWindow.document.createElement('div');
        timeDiv.className = 'time';
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        timeDiv.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        pipWindow.document.body.append(timeDiv);

        const taskDiv = pipWindow.document.createElement('div');
        taskDiv.className = 'task';
        taskDiv.innerText = currentTask || 'Focus Session';
        pipWindow.document.body.append(taskDiv);

        const controlBtn = pipWindow.document.createElement('button');
        controlBtn.className = `btn ${isRunning ? 'btn-pause' : 'btn-play'}`;
        controlBtn.innerText = isRunning ? 'PAUSE' : 'START';
        controlBtn.onclick = () => handleStartFlowClick();
        pipWindow.document.body.append(controlBtn);

        const backBtn = pipWindow.document.createElement('button');
        backBtn.className = 'btn btn-back';
        backBtn.innerText = 'BACK TO APP';
        backBtn.onclick = () => {
            pipWindow.close();
            window.focus();
        };
        pipWindow.document.body.append(backBtn);
        return;
      }

      // Fallback: Canvas to Video PiP
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      const video = document.createElement('video');
      video.muted = true;
      video.srcObject = canvas.captureStream();
      video.play();

      const draw = () => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 300, 200);
        ctx.fillStyle = '#5865F2';
        ctx.font = 'bold 60px monospace';
        ctx.textAlign = 'center';
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        ctx.fillText(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`, 150, 110);
        
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(currentTask || 'FOCUSING...', 150, 150);

        if (video.srcObject) requestAnimationFrame(draw);
      };
      requestAnimationFrame(draw);

      await video.requestPictureInPicture();
    } catch (err) {
      console.error('PIP failed', err);
    }
  };
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [rewardMsg, setRewardMsg] = useState(null);
  const [notificationsList, setNotificationsList] = useState([]);
  
  const { user, logout } = useAuth();


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
            <div className="absolute top-8 left-8 flex gap-2">
                <button 
                    onClick={handlePip}
                    className="p-3 rounded-2xl bg-white/5 text-text-muted hover:text-brand hover:bg-brand/10 transition-all shadow-lg"
                    title="Pop-out Floating Timer"
                >
                    <ExternalLink size={24} />
                </button>
            </div>

            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="absolute top-8 right-8 text-text-muted hover:text-white transition-all p-3 hover:bg-white/5 rounded-2xl shadow-lg"
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
                    className={`flex-[2] py-5 rounded-3xl text-xl font-black tracking-[0.2em] transition-all active:scale-95 group relative overflow-hidden ${
                        isRunning 
                        ? 'bg-red-500/20 text-red-400 border-2 border-red-500/30 shadow-red-500/10' 
                        : 'bg-brand shadow-[0_12px_40px_rgba(88,101,242,0.4)] text-white'
                    }`}
                >
                    <span className="relative z-10">{isRunning ? 'PAUSE' : 'START'}</span>
                    {!isRunning && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />}
                </button>
                <button
                    onClick={resetTimer}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl text-text-muted hover:text-white transition-all font-black text-xs tracking-widest active:scale-95"
                >
                    RESET
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
                <Link to="/reports" className="glass p-8 rounded-[2.5rem] flex flex-col gap-6 hover:border-brand/40 transition-all group relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-brand/20 transition-colors" />
                    
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-brand/10 rounded-2xl text-brand group-hover:scale-110 transition-transform duration-500">
                                <BarChart2 size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black">Performance <span className="text-brand">Report</span></h3>
                                <p className="text-text-muted text-sm font-bold uppercase tracking-widest opacity-60">Your Productivity Hub</p>
                            </div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-full text-brand opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
                            <TrendingUp size={20} />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 relative z-10">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                            <Clock size={16} className="text-brand mb-2" />
                            <p className="text-[10px] font-black uppercase text-text-muted mb-1">Total</p>
                            <p className="text-sm font-black text-white">{formatFocusTime(totalFocusSeconds).split(' ')[0]}</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                            <TreePine size={16} className="text-emerald-400 mb-2" />
                            <p className="text-[10px] font-black uppercase text-text-muted mb-1">Trees</p>
                            <p className="text-sm font-black text-white">
                                {JSON.parse(localStorage.getItem('focusSessions') || '[]').filter(s => s.mode === 'pomodoro').length}
                            </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                            <Zap size={16} className="text-yellow-400 mb-2" />
                            <p className="text-[10px] font-black uppercase text-text-muted mb-1">Rank</p>
                            <p className="text-sm font-black text-white">Elite</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-brand text-xs font-black uppercase tracking-[0.2em] relative z-10">
                        View Detailed Insights <span className="text-lg group-hover:translate-x-2 transition-transform">→</span>
                    </div>
                </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Link to="/planner" className="glass p-6 rounded-[2.5rem] flex items-center justify-between hover:border-emerald-500/40 transition-all group relative">
                    <div className="flex items-center gap-5">
                        <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:rotate-12 transition-transform duration-500">
                            <Calendar size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Planner</h3>
                            <p className="text-text-muted text-sm font-medium">Schedule your daily rhythm</p>
                        </div>
                    </div>
                    <div className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-500 font-black text-2xl pr-2">→</div>
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
