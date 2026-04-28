import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, TreePine, Clock, Zap, Flame, Target,
    Edit3, Check, X, Camera, LogOut, Trophy, Calendar
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';

// Coloured avatar
const BigAvatar = ({ photoURL, name, size = 96 }) => {
    const initials = (name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['#5865F2', '#ED4245', '#57F287', '#FEE75C', '#EB459E', '#3BA55D'];
    const color = colors[initials.charCodeAt(0) % colors.length];

    if (photoURL) return (
        <img src={photoURL} alt={name} referrerPolicy="no-referrer"
            style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
            className="ring-4 ring-brand/30 shadow-2xl shadow-brand/20"
        />
    );
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.35, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em'
        }} className="ring-4 ring-brand/30 shadow-2xl shadow-brand/20">
            {initials}
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <motion.div whileHover={{ scale: 1.03, y: -2 }} className="glass p-5 rounded-3xl border border-white/5 flex flex-col gap-3">
        <div className={`p-2.5 ${bg} rounded-xl w-fit`}><Icon size={18} className={color} /></div>
        <p className="text-text-muted text-[10px] uppercase tracking-widest font-black">{label}</p>
        <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
    </motion.div>
);

const Profile = () => {
    const { user, logout } = useAuth();
    const [firestoreData, setFirestoreData] = useState(null);
    const [myRank, setMyRank] = useState(null);
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    const sessions = (() => {
        try { return JSON.parse(localStorage.getItem('focusSessions') || '[]'); }
        catch { return []; }
    })();
    const totalFocusSeconds = parseInt(localStorage.getItem('focusSeconds') || '0');

    // Fetch Firestore doc
    useEffect(() => {
        if (!user?.uid) return;
        getDoc(doc(db, 'users', user.uid)).then(snap => {
            if (snap.exists()) setFirestoreData(snap.data());
        }).catch(() => {});
    }, [user?.uid]);

    // Compute rank from all users
    useEffect(() => {
        if (!user?.uid) return;
        const q = query(collection(db, 'users'), orderBy('treesPlanted', 'desc'));
        getDocs(q).then(snap => {
            const all = snap.docs.map(d => d.id);
            const idx = all.indexOf(user.uid);
            setMyRank(idx >= 0 ? idx + 1 : null);
        }).catch(() => {});
    }, [user?.uid]);

    const treesPlanted = firestoreData?.treesPlanted ?? 0;
    const sessionsCount = firestoreData?.sessionsCount ?? sessions.filter(s => s.mode === 'pomodoro').length;
    const totalHours = ((firestoreData?.totalFocusTime ?? totalFocusSeconds) / 3600).toFixed(1);

    // Today's streak
    const streak = (() => {
        let count = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const d = new Date(today); d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-CA');
            if (sessions.some(s => s.date === dateStr && s.mode === 'pomodoro')) count++;
            else if (i > 0) break;
        }
        return count;
    })();

    const displayName = user?.displayName || firestoreData?.name || 'Anonymous';
    const photoURL = user?.photoURL || firestoreData?.photoURL || '';
    const email = user?.email || firestoreData?.email || '';
    const joinedDate = firestoreData?.createdAt
        ? new Date(firestoreData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Unknown';

    const handleSaveName = async () => {
        if (!nameInput.trim()) return;
        setSaving(true);
        try {
            if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: nameInput.trim() });
            if (user?.uid) await updateDoc(doc(db, 'users', user.uid), { name: nameInput.trim() });
            setSaveMsg('Name updated!');
            setEditingName(false);
        } catch (e) {
            setSaveMsg('Failed to update. Try again.');
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMsg(''), 3000);
        }
    };

    const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };

    return (
        <motion.div variants={container} initial="hidden" animate="show"
            className="min-h-screen p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-6">

            {/* Header */}
            <motion.header variants={item} className="glass p-6 rounded-[2rem] flex items-center gap-4">
                <Link to="/" className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-white">
                    <ArrowLeft size={22} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black font-brand">My <span className="text-brand">Profile</span></h1>
                    <p className="text-text-muted text-xs uppercase tracking-widest font-bold">Account & Stats</p>
                </div>
                <button onClick={logout}
                    className="ml-auto p-3 rounded-2xl bg-white/5 text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Sign Out">
                    <LogOut size={18} />
                </button>
            </motion.header>

            {/* Profile Card */}
            <motion.div variants={item}
                className="glass p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <BigAvatar photoURL={photoURL} name={displayName} size={96} />
                        {/* Only show camera hint for Google users (they have photoURL) */}
                        {!photoURL && (
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand rounded-full flex items-center justify-center shadow-lg cursor-default" title="Avatar from initials">
                                <Camera size={14} className="text-white" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left w-full">
                        {/* Name */}
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                            {editingName ? (
                                <div className="flex items-center gap-2 w-full max-w-xs">
                                    <input
                                        autoFocus
                                        value={nameInput}
                                        onChange={e => setNameInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                                        className="flex-1 bg-white/5 border border-brand/30 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:ring-2 focus:ring-brand/40 text-base"
                                    />
                                    <button onClick={handleSaveName} disabled={saving}
                                        className="p-2 bg-brand rounded-xl text-white hover:bg-brand/80 transition-all">
                                        {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={16} />}
                                    </button>
                                    <button onClick={() => setEditingName(false)}
                                        className="p-2 bg-white/10 rounded-xl text-text-muted hover:text-white transition-all">
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-black">{displayName}</h2>
                                    <button onClick={() => { setNameInput(displayName); setEditingName(true); }}
                                        className="p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition-all">
                                        <Edit3 size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                        {saveMsg && <p className="text-xs text-brand font-bold mb-1 animate-pulse">{saveMsg}</p>}
                        <p className="text-text-muted text-sm font-medium mb-1">{email}</p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                            <span className="flex items-center gap-1.5 text-[10px] text-text-muted bg-white/5 px-3 py-1.5 rounded-full border border-white/5 font-bold uppercase tracking-wider">
                                <Calendar size={10} /> Member since {joinedDate}
                            </span>
                            {myRank && (
                                <span className="flex items-center gap-1.5 text-[10px] text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20 font-bold uppercase tracking-wider">
                                    <Trophy size={10} /> Global Rank #{myRank}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard icon={Clock} label="Total Focus" value={`${totalHours}h`} color="text-brand" bg="bg-brand/10" />
                <StatCard icon={TreePine} label="Trees Planted" value={treesPlanted} color="text-emerald-400" bg="bg-emerald-400/10" />
                <StatCard icon={Zap} label="Sessions" value={sessionsCount} color="text-yellow-400" bg="bg-yellow-400/10" />
                <StatCard icon={Flame} label="Day Streak" value={`${streak}d`} color="text-orange-400" bg="bg-orange-400/10" />
            </motion.div>

            {/* Recent Sessions */}
            <motion.div variants={item} className="glass p-6 rounded-3xl border border-white/5">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-brand/10 rounded-xl"><Zap size={18} className="text-brand" /></div>
                    <h3 className="font-black text-base">Recent Sessions</h3>
                </div>
                {sessions.filter(s => s.mode === 'pomodoro').length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-text-muted text-xs font-bold uppercase tracking-widest">No sessions yet</p>
                        <p className="text-[10px] text-text-muted/50 mt-2">Complete your first Pomodoro to see stats here!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {[...sessions].filter(s => s.mode === 'pomodoro').reverse().slice(0, 6).map((s, i) => {
                            const d = new Date(s.timestamp);
                            const isToday = s.date === new Date().toLocaleDateString('en-CA');
                            return (
                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="flex items-center justify-between p-3 bg-white/3 hover:bg-white/5 rounded-2xl border border-white/5 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                            <TreePine size={14} className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{s.task || 'Focus Session'}</p>
                                            <p className="text-[10px] text-text-muted">
                                                {isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="bg-brand/10 text-brand px-3 py-1 rounded-xl text-xs font-black border border-brand/20">
                                        {Math.round((s.duration || 0) / 60)} min
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Profile;
