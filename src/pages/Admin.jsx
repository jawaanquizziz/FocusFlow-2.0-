import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Users, Search, Shield, Trash2, Crown, TreePine,
    Clock, Zap, ChevronUp, ChevronDown, RefreshCw, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/firebase';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';

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
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState('treesPlanted');
    const [sortDir, setSortDir] = useState('desc');
    const [deleting, setDeleting] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const isAdmin = user && (
        ADMIN_EMAILS.includes(user.email) ||
        user.uid === 'admin' // or hardcode your own UID here
    );

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, 'users'));
            const userList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            // Sort by createdAt descending locally to avoid omitting users without the field
            userList.sort((a, b) => {
                const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return bTime - aTime;
            });
            setUsers(userList);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const handleDelete = async (uid) => {
        setDeleting(uid);
        try {
            await deleteDoc(doc(db, 'users', uid));
            setUsers(prev => prev.filter(u => u.id !== uid));
        } catch (e) { console.error(e); }
        finally { setDeleting(null); setConfirmDelete(null); }
    };

    const filtered = users
        .filter(u => {
            if (!search) return true;
            const s = search.toLowerCase();
            return (u.name || '').toLowerCase().includes(s) || (u.email || '').toLowerCase().includes(s);
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
                    <button onClick={fetchUsers} disabled={loading}
                        className="p-3 bg-white/5 hover:bg-brand/20 text-text-muted hover:text-brand rounded-2xl transition-all">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </motion.header>

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

            {/* Search */}
            <motion.div variants={item} className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                <Search size={16} className="text-text-muted shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="flex-1 bg-transparent focus:outline-none text-sm font-medium placeholder:text-text-muted/50" />
                {search && (
                    <button onClick={() => setSearch('')} className="text-text-muted hover:text-white transition-colors">
                        <Zap size={14} />
                    </button>
                )}
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
                                            <p className="text-sm font-bold truncate flex items-center gap-1.5">
                                                {u.name || 'Anonymous'}
                                                {u.treesPlanted >= 10 && <Crown size={10} className="text-yellow-400 shrink-0" />}
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

            <motion.footer variants={item} className="text-center text-[10px] text-text-muted/40 font-bold uppercase tracking-widest py-4">
                FocusFlow Admin Panel · Data from Firestore
            </motion.footer>
        </motion.div>
    );
};

export default Admin;
