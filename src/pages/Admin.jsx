import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Users, Search, Shield, Trash2, Crown, TreePine,
    Clock, Zap, ChevronUp, ChevronDown, RefreshCw, AlertTriangle,
    MessageSquare, Star, Mail, Pin, PinOff
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { db } from '../services/firebase';
import { collection, onSnapshot, deleteDoc, doc, setDoc, serverTimestamp, query, orderBy, updateDoc } from 'firebase/firestore';

// Coloured avatar (same helper as Profile / Leaderboard)
const Avatar = ({ photoURL, name, size = 32 }) => {
    const initials = (name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['#5865F2', '#ED4245', '#57F287', '#FEE75C', '#EB459E', '#3BA55D'];
    const color = colors[initials.charCodeAt(0) % colors.length];
    if (photoURL) return (
        <img src={photoURL} alt={name} referrerPolicy="no-referrer"
            style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    );
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.38, fontWeight: 900, color: '#fff', flexShrink: 0,
        }}>{initials}</div>
    );
};

// ── ADMIN ACCESS CONFIGURATION ───────────────────────────────────
const ADMIN_EMAILS = ['jawaan25fcrit@gmail.com']; 
// ─────────────────────────────────────────────────────────────────

// How many seconds → human readable
const fmtTime = (s) => {
    if (!s) return '0m';
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const Admin = () => {
    const { user, loading: authLoading } = useAuth();
    const showToast = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState('treesPlanted');
    const [sortDir, setSortDir] = useState('desc');
    const [deleting, setDeleting] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [error, setError] = useState(null);
    const [notifTitle, setNotifTitle] = useState('');
    const [notifMessage, setNotifMessage] = useState('');
    const [sendingNotif, setSendingNotif] = useState(false);
    const [feedbackList, setFeedbackList] = useState([]);
    const [feedbackLoading, setFeedbackLoading] = useState(true);
    
    // Inactive User States
    const [inactiveFilter, setInactiveFilter] = useState('all'); // 'all', '0time', '7days', '30days'
    const [pruning, setPruning] = useState(false);

    const isAdmin = user && (
        ADMIN_EMAILS.includes(user.email) ||
        user.uid === 'admin'
    );

    useEffect(() => {
        if (authLoading) return; // Wait for auth to load

        if (!isAdmin) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = collection(db, 'users');
        
        const unsubscribe = onSnapshot(q, (snap) => {
            console.log(`Admin: Received ${snap.docs.length} users from Firestore`);
            const userList = snap.docs.map(d => {
                const data = d.data();
                return {
                    id: d.id,
                    ...data,
                    // Ensure these are numbers and exist
                    treesPlanted: Number(data.treesPlanted || 0),
                    sessionsCount: Number(data.sessionsCount || 0),
                    totalFocusTime: Number(data.totalFocusTime || 0),
                    name: data.name || data.displayName || 'Anonymous User'
                };
            });
            
            // Sort by activity/creation
            userList.sort((a, b) => {
                const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return bTime - aTime;
            });
            
            setUsers(userList);
            setLoading(false);
        }, (e) => {
            console.error('Admin Panel Sync Error:', e);
            setError(e.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [isAdmin]);

    // Feedback Listener
    useEffect(() => {
        if (!isAdmin) return;
        const q = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            setFeedbackList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setFeedbackLoading(false);
        }, () => setFeedbackLoading(false));
        return () => unsub();
    }, [isAdmin]);

    const handleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const handleSendNotif = async (e) => {
        e.preventDefault();
        if (!notifTitle || !notifMessage) return;
        setSendingNotif(true);
        try {
            await setDoc(doc(db, 'settings', 'notifications'), {
                title: notifTitle,
                message: notifMessage,
                timestamp: serverTimestamp(),
                active: true
            });
            setNotifTitle('');
            setNotifMessage('');
            showToast('Global notification sent successfully!', 'success');
        } catch (e) {
            console.error(e);
            showToast('Failed to send notification.', 'error');
        } finally {
            setSendingNotif(false);
        }
    };

    const handleClearNotif = async () => {
        try {
            await setDoc(doc(db, 'settings', 'notifications'), { active: false }, { merge: true });
            showToast('Global notification cleared.', 'success');
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (uid) => {
        setDeleting(uid);
        try {
            await deleteDoc(doc(db, 'users', uid));
            setUsers(prev => prev.filter(u => u.id !== uid));
        } catch (e) { console.error(e); }
        finally { setDeleting(null); setConfirmDelete(null); }
    };

    const getMillis = (ts) => {
        if (!ts) return 0;
        if (typeof ts === 'string') return new Date(ts).getTime();
        if (typeof ts.toMillis === 'function') return ts.toMillis();
        if (ts.seconds) return ts.seconds * 1000;
        const parsed = new Date(ts).getTime();
        return isNaN(parsed) ? 0 : parsed;
    };

    const handlePruneInactive = async () => {
        let label = '';
        let targetUsers = [];

        if (inactiveFilter === '0time') {
            label = 'inactive users with 0 focus time';
            targetUsers = users.filter(u => u.totalFocusTime === 0);
        } else if (inactiveFilter === '7days') {
            label = 'users inactive for more than 7 days';
            targetUsers = users.filter(u => {
                const act = getMillis(u.lastActive || u.createdAt);
                return act === 0 || (Date.now() - act) > 7 * 24 * 60 * 60 * 1000;
            });
        } else if (inactiveFilter === '30days') {
            label = 'users inactive for more than 30 days';
            targetUsers = users.filter(u => {
                const act = getMillis(u.lastActive || u.createdAt);
                return act === 0 || (Date.now() - act) > 30 * 24 * 60 * 60 * 1000;
            });
        } else {
            showToast('Please select an inactivity filter (e.g. 0-Time, 7 Days, or 30 Days) before pruning.', 'warning');
            return;
        }

        if (targetUsers.length === 0) {
            showToast(`No ${label} found to delete.`, 'info');
            return;
        }

        if (!window.confirm(`Are you sure you want to permanently delete all ${targetUsers.length} ${label}? This action is irreversible.`)) {
            return;
        }

        setPruning(true);
        try {
            let count = 0;
            for (const u of targetUsers) {
                await deleteDoc(doc(db, 'users', u.id));
                count++;
            }
            showToast(`Successfully deleted ${count} accounts.`, 'success');
        } catch (e) {
            console.error('Failed to prune users:', e);
            showToast('Failed to prune some inactive users.', 'error');
        } finally {
            setPruning(false);
        }
    };

    const filtered = users
        .filter(u => {
            const matchesSearch = !search || 
                (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
                (u.email || '').toLowerCase().includes(search.toLowerCase());
            
            let matchesInactive = true;
            if (inactiveFilter === '0time') {
                matchesInactive = u.totalFocusTime === 0;
            } else if (inactiveFilter === '7days') {
                const act = getMillis(u.lastActive || u.createdAt);
                matchesInactive = act === 0 || (Date.now() - act) > 7 * 24 * 60 * 60 * 1000;
            } else if (inactiveFilter === '30days') {
                const act = getMillis(u.lastActive || u.createdAt);
                matchesInactive = act === 0 || (Date.now() - act) > 30 * 24 * 60 * 60 * 1000;
            }
            
            return matchesSearch && matchesInactive;
        })
        .sort((a, b) => {
            const av = a[sortKey] ?? 0, bv = b[sortKey] ?? 0;
            if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
            return sortDir === 'asc' ? av - bv : bv - av;
        });

    const SortIcon = ({ k }) => sortKey !== k ? null :
        sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;

    const col = 'cursor-pointer select-none hover:text-white transition-colors flex items-center gap-1 font-black uppercase tracking-widest text-[10px]';

    const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };

    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!isAdmin) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
            <div className="p-5 bg-red-500/10 rounded-3xl"><AlertTriangle size={40} className="text-red-400" /></div>
            <h2 className="text-2xl font-black text-white">Access Denied</h2>
            <p className="text-text-muted text-sm font-medium text-center max-w-sm">
                This page is only accessible to FocusFlow administrators.
            </p>
            <Link to="/" className="mt-4 px-6 py-3 bg-brand rounded-2xl font-bold text-white hover:bg-brand/80 transition-all">
                Go Home
            </Link>
        </div>
    );

    return (
        <motion.div variants={container} initial="hidden" animate="show"
            className="min-h-screen p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">

            {/* Header */}
            <motion.header variants={item} className="glass p-6 rounded-[2rem] flex items-center gap-4">
                <Link to="/" className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-white">
                    <ArrowLeft size={22} />
                </Link>
                <div className="p-3 bg-red-500/10 rounded-2xl"><Shield size={22} className="text-red-400" /></div>
                <div>
                    <h1 className="text-2xl font-black font-brand">Admin <span className="text-red-400">Panel</span></h1>
                    <p className="text-text-muted text-xs uppercase tracking-widest font-bold">Registered Users · Firestore</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <span className="bg-white/5 px-4 py-2 rounded-2xl text-xs font-black text-text-muted border border-white/5">
                        {users.length} users
                    </span>
                    <button onClick={() => window.location.reload()} disabled={loading}
                        className="p-3 bg-white/5 hover:bg-brand/20 text-text-muted hover:text-brand rounded-2xl transition-all">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </motion.header>

            {/* Global Notification Section */}
            <motion.div variants={item} className="glass p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-brand/10 rounded-2xl text-brand"><Zap size={22} /></div>
                    <div>
                        <h3 className="text-xl font-black">Global <span className="text-brand">Notification</span></h3>
                        <p className="text-text-muted text-[10px] uppercase tracking-widest font-bold">Broadcast message to all users</p>
                    </div>
                </div>

                <form onSubmit={handleSendNotif} className="space-y-4 max-w-2xl relative z-10">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Notification Title</label>
                        <input 
                            value={notifTitle}
                            onChange={e => setNotifTitle(e.target.value)}
                            placeholder="e.g. System Maintenance or New Feature!"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-brand/50 transition-all outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Message Body</label>
                        <textarea 
                            value={notifMessage}
                            onChange={e => setNotifMessage(e.target.value)}
                            placeholder="Write your broadcast message here..."
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-white focus:border-brand/50 transition-all outline-none resize-none"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button 
                            type="submit"
                            disabled={sendingNotif}
                            className="flex-1 bg-brand text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand/90 transition-all shadow-xl shadow-brand/20 active:scale-95 disabled:opacity-50"
                        >
                            {sendingNotif ? 'Sending...' : 'Broadcast to Everyone'}
                        </button>
                        <button 
                            type="button"
                            onClick={handleClearNotif}
                            className="px-6 py-4 bg-white/5 border border-white/10 text-text-muted hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                        >
                            Clear Active Notif
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* Summary Stats */}
            <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: users.length, icon: Users, color: 'text-brand', bg: 'bg-brand/10' },
                    { label: 'Total Trees', value: users.reduce((a, u) => a + (u.treesPlanted || 0), 0), icon: TreePine, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'Total Sessions', value: users.reduce((a, u) => a + (u.sessionsCount || 0), 0), icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                    { label: 'Avg Focus', value: fmtTime(Math.round(users.reduce((a, u) => a + (u.totalFocusTime || 0), 0) / Math.max(users.length, 1))), icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                ].map(s => (
                    <div key={s.label} className="glass p-5 rounded-3xl border border-white/5">
                        <div className={`p-2.5 ${s.bg} rounded-xl w-fit mb-3`}><s.icon size={16} className={s.color} /></div>
                        <p className="text-text-muted text-[10px] uppercase tracking-widest font-black mb-1">{s.label}</p>
                        <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </motion.div>

            {/* Search & Filters */}
            <motion.div variants={item} className="flex flex-col md:flex-row gap-4">
                <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3 flex-1">
                    <Search size={16} className="text-text-muted shrink-0" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="flex-1 bg-transparent focus:outline-none text-sm font-medium placeholder:text-text-muted/50" />
                    {search && (
                        <button onClick={() => setSearch('')} className="text-text-muted hover:text-white transition-colors">
                            <Zap size={14} />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/60">Inactivity Filter:</span>
                    <select
                        value={inactiveFilter}
                        onChange={e => setInactiveFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-3.5 text-xs font-bold focus:outline-none focus:border-brand/40"
                    >
                        <option value="all" className="bg-[#0f172a] text-white">All Users</option>
                        <option value="0time" className="bg-[#0f172a] text-white">0 Focus Time</option>
                        <option value="7days" className="bg-[#0f172a] text-white">Inactive &gt; 7 Days</option>
                        <option value="30days" className="bg-[#0f172a] text-white">Inactive &gt; 30 Days</option>
                    </select>

                    <button
                        onClick={handlePruneInactive}
                        disabled={pruning || inactiveFilter === 'all'}
                        className="px-5 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        title={inactiveFilter === 'all' ? 'Please select an inactivity filter to prune' : ''}
                    >
                        <Trash2 size={14} />
                        {pruning ? 'Pruning...' : 'Prune Filtered Accounts'}
                    </button>
                </div>
            </motion.div>

            {/* Table */}
            <motion.div variants={item} className="glass rounded-[2rem] border border-white/10 overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-white/5 bg-white/2">
                    <button className={col} onClick={() => handleSort('name')}>
                        Name <SortIcon k="name" />
                    </button>
                    <span className={col + ' cursor-default'}>Email</span>
                    <button className={col} onClick={() => handleSort('treesPlanted')}>
                        Trees <SortIcon k="treesPlanted" />
                    </button>
                    <button className={col} onClick={() => handleSort('sessionsCount')}>
                        Sessions <SortIcon k="sessionsCount" />
                    </button>
                    <button className={col} onClick={() => handleSort('totalFocusTime')}>
                        Focus <SortIcon k="totalFocusTime" />
                    </button>
                    <span className={col + ' cursor-default'}>Actions</span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 gap-3">
                        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                        <p className="text-text-muted text-xs font-bold uppercase tracking-widest">Loading users...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-16 px-6">
                        <AlertTriangle size={32} className="text-red-400/50 mx-auto mb-3" />
                        <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">Error Loading Users</p>
                        <p className="text-text-muted text-xs bg-red-500/10 p-3 rounded-xl max-w-lg mx-auto border border-red-500/20">{error}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Users size={32} className="text-text-muted/30 mx-auto mb-3" />
                        <p className="text-text-muted text-xs font-bold uppercase tracking-widest">No users found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        <AnimatePresence>
                            {filtered.map((u, i) => (
                                <motion.div key={u.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-white/3 transition-all">

                                    {/* Name + avatar */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar photoURL={u.photoURL} name={u.name} size={32} />
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold truncate flex items-center gap-1.5 flex-wrap">
                                                {u.name || 'Anonymous'}
                                                {u.treesPlanted >= 10 && <Crown size={10} className="text-yellow-400 shrink-0" />}
                                                {u.totalFocusTime === 0 && (
                                                    <span className="text-[7px] bg-red-500/25 border border-red-500/40 text-red-400 px-1.5 py-0.5 rounded-full uppercase font-black tracking-wider shrink-0">Inactive</span>
                                                )}
                                            </p>
                                            <p className="text-[10px] text-text-muted truncate">{u.id}</p>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <p className="text-xs text-text-muted font-medium truncate">{u.email || '—'}</p>

                                    {/* Trees */}
                                    <p className="text-sm font-bold text-emerald-400">{u.treesPlanted || 0} 🌳</p>

                                    {/* Sessions */}
                                    <p className="text-sm font-bold text-yellow-400">{u.sessionsCount || 0}</p>

                                    {/* Focus time */}
                                    <p className="text-sm font-bold text-brand">{fmtTime(u.totalFocusTime)}</p>

                                    {/* Delete */}
                                    <div>
                                        {confirmDelete === u.id ? (
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleDelete(u.id)} disabled={deleting === u.id}
                                                    className="px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded-xl text-[10px] font-black uppercase transition-all">
                                                    {deleting === u.id ? '...' : 'Confirm'}
                                                </button>
                                                <button onClick={() => setConfirmDelete(null)}
                                                    className="px-2 py-1 bg-white/5 text-text-muted hover:text-white rounded-xl text-[10px] font-black uppercase transition-all">
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setConfirmDelete(u.id)}
                                                className="p-2 rounded-xl text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>

            {/* Feedback Inbox */}
            <motion.div variants={item} className="glass p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
                        <MessageSquare size={22} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-black">User <span className="text-purple-400">Feedback</span></h3>
                        <p className="text-text-muted text-[10px] uppercase tracking-widest font-bold">Suggestions &amp; reports from users</p>
                    </div>
                    <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-2 rounded-2xl text-xs font-black">
                        {feedbackList.length} total
                    </span>
                </div>

                {feedbackLoading ? (
                    <div className="flex items-center justify-center py-12 gap-3">
                        <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-text-muted text-xs font-bold uppercase tracking-widest">Loading feedback...</p>
                    </div>
                ) : feedbackList.length === 0 ? (
                    <div className="text-center py-12">
                        <Mail size={32} className="text-text-muted/30 mx-auto mb-3" />
                        <p className="text-text-muted text-xs font-bold uppercase tracking-widest">No feedback yet</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                        {feedbackList.map(fb => (
                            <motion.div
                                key={fb.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`border rounded-3xl p-5 transition-all group ${
                                    fb.featured
                                        ? 'bg-yellow-500/5 border-yellow-500/25 shadow-lg shadow-yellow-500/5'
                                        : 'bg-white/3 border-white/8 hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <Avatar photoURL={fb.photoURL} name={fb.name} size={36} />

                                    <div className="flex-1 min-w-0">
                                        {/* Top row */}
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="text-sm font-black text-white truncate">{fb.name || 'Anonymous'}</span>
                                            {fb.email && <span className="text-[10px] text-text-muted font-medium">{fb.email}</span>}
                                            <span className={`ml-auto text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                                fb.category === 'feature' ? 'bg-brand/15 text-brand' :
                                                fb.category === 'bug' ? 'bg-red-500/15 text-red-400' :
                                                fb.category === 'design' ? 'bg-pink-500/15 text-pink-400' :
                                                'bg-white/8 text-text-muted'
                                            }`}>
                                                {fb.category === 'feature' ? '✨ Feature' :
                                                 fb.category === 'bug' ? '🐛 Bug' :
                                                 fb.category === 'design' ? '🎨 Design' : '💬 General'}
                                            </span>
                                        </div>

                                        {/* Stars */}
                                        {fb.rating > 0 && (
                                            <div className="flex gap-0.5 mb-2">
                                                {[1,2,3,4,5].map(s => (
                                                    <Star key={s} size={12}
                                                        className={s <= fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* Message */}
                                        <p className="text-sm text-white/80 font-medium leading-relaxed">{fb.message}</p>

                                        {/* Timestamp */}
                                        <p className="text-[10px] text-text-muted/50 font-bold mt-2 uppercase tracking-widest">
                                            {fb.timestamp?.toDate?.()?.toLocaleString() || 'Just now'}
                                        </p>
                                    </div>

                                    {/* Actions: Feature + Delete */}
                                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        {/* Feature toggle */}
                                        <button
                                            onClick={() => updateDoc(doc(db, 'feedback', fb.id), { featured: !fb.featured })}
                                            className={`p-2 rounded-xl transition-all ${
                                                fb.featured
                                                    ? 'text-yellow-400 bg-yellow-500/15 hover:bg-yellow-500/25'
                                                    : 'text-text-muted hover:text-yellow-400 hover:bg-yellow-500/10'
                                            }`}
                                            title={fb.featured ? 'Remove from homepage' : 'Feature on homepage'}
                                        >
                                            {fb.featured ? <PinOff size={14} /> : <Pin size={14} />}
                                        </button>
                                        {/* Delete */}
                                        <button
                                            onClick={() => deleteDoc(doc(db, 'feedback', fb.id))}
                                            className="p-2 rounded-xl text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            <motion.footer variants={item} className="text-center text-[10px] text-text-muted/40 font-bold uppercase tracking-widest py-4">
                FocusFlow Admin Panel · Data from Firestore
            </motion.footer>
        </motion.div>
    );
};

export default Admin;
